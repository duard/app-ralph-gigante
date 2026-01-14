import { Injectable, Logger } from '@nestjs/common';
import { SankhyaApiService } from '../shared/sankhya-api.service';
import {
  PermissionDto,
  UserPermissionsDto,
  AccessCheckDto,
} from './dto/permission.dto';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly sankhyaApiService: SankhyaApiService) {}

  /**
   * Busca todas as permissões de um usuário específico
   */
  async getUserPermissions(
    codUsu: number,
    username?: string,
  ): Promise<UserPermissionsDto> {
    this.logger.log(
      `Buscando permissões do usuário ${codUsu}...`,
    );

    // Para usuários sem permissão administrativa, assumimos informações básicas
    const user = {
      CODUSU: codUsu,
      NOMEUSU: username || `Usuario_${codUsu}`,
      CODGRU: 0,
    };

    let groupDesc = null;

    // 2. Buscar permissões diretas do usuário
    const userPermissionsQuery = `SELECT IDACESSO, ACESSO, CODUSU, CODGRUPO, VERSAO FROM TDDPER WHERE CODUSU = ${codUsu}`;
    const userPerms = await this.sankhyaApiService.executeQuery(userPermissionsQuery);

    // 3. Buscar permissões do grupo
    const groupPermissionsQuery = `SELECT IDACESSO, ACESSO, CODUSU, CODGRUPO, VERSAO FROM TDDPER WHERE CODGRUPO = ${user.CODGRU} AND CODUSU = 0`;
    const groupPerms = await this.sankhyaApiService.executeQuery(groupPermissionsQuery);

    // 4. Buscar informações dos acessos (TDDIAC)
    const allIdAcessos = [
      ...userPerms.map(p => p.IDACESSO),
      ...groupPerms.map(p => p.IDACESSO)
    ];

    const uniqueIdAcessos = [...new Set(allIdAcessos)];
    const acessosQuery = `SELECT IDACESSO, DESCRICAO, SIGLA FROM TDDIAC`;
    const acessos = await this.sankhyaApiService.executeQuery(acessosQuery);

    const acessoMap = new Map(acessos.map(a => [a.IDACESSO, a]));

    // 5. Combinar dados
    const userPermissions = userPerms.map(p => ({
      ...p,
      ORIGEM: 'USUARIO' as const,
      DESCRICAO: acessoMap.get(p.IDACESSO)?.DESCRICAO || null,
      SIGLA: acessoMap.get(p.IDACESSO)?.SIGLA || null,
    }));

    const groupPermissions = groupPerms.map(p => ({
      ...p,
      ORIGEM: 'GRUPO' as const,
      DESCRICAO: acessoMap.get(p.IDACESSO)?.DESCRICAO || null,
      SIGLA: acessoMap.get(p.IDACESSO)?.SIGLA || null,
    }));

    // 6. Combinar permissões (usuário sobrescreve grupo)
    const allPermissions: PermissionDto[] = [
      ...(userPermissions || []),
      ...(groupPermissions || []),
    ];

    // Remove duplicatas, mantendo permissões de usuário
    const uniquePermissions = this.mergeDuplicatePermissions(allPermissions);

    return {
      CODUSU: user.CODUSU,
      NOMEUSU: user.NOMEUSU,
      CODGRU: user.CODGRU,
      DESCRGRU: groupDesc,
      permissions: uniquePermissions,
      totalPermissions: uniquePermissions.length,
    };
  }

  /**
   * Verifica se um usuário tem acesso a um recurso específico
   */
  async checkUserAccess(
    codUsu: number,
    idAcesso: string,
  ): Promise<AccessCheckDto> {
    this.logger.log(
      `Verificando acesso do usuário ${codUsu} ao recurso ${idAcesso}`,
    );

    // 1. Buscar informação sobre o recurso
    const resourceQuery = `SELECT IDACESSO, DESCRICAO, SIGLA FROM TDDIAC WHERE IDACESSO = '${idAcesso}'`;
    const resourceResult = await this.sankhyaApiService.executeQuery(resourceQuery);

    if (!resourceResult || resourceResult.length === 0) {
      throw new Error(`Recurso ${idAcesso} não encontrado`);
    }

    const resource = resourceResult[0];

    // 2. Verificar permissão direta do usuário
    const userPermQuery = `SELECT ACESSO, CODUSU, CODGRUPO, VERSAO FROM TDDPER WHERE IDACESSO = '${idAcesso}' AND CODUSU = ${codUsu}`;
    const userPermResult = await this.sankhyaApiService.executeQuery(userPermQuery);

    if (userPermResult && userPermResult.length > 0) {
      const userPerm = userPermResult[0];
      return {
        hasAccess: userPerm.ACESSO !== '0',
        accessLevel: userPerm.ACESSO,
        origem: 'USUARIO',
        details: {
          IDACESSO: idAcesso,
          DESCRICAO: resource.DESCRICAO,
          ACESSO: userPerm.ACESSO,
        },
      };
    }

    // 3. Verificar permissão do grupo
    // Primeiro buscar o grupo do usuário
    const userGroupQuery = `SELECT CODGRU FROM TSIUSU WHERE CODUSU = ${codUsu}`;
    const userGroupResult = await this.sankhyaApiService.executeQuery(userGroupQuery);

    if (!userGroupResult || userGroupResult.length === 0) {
      return {
        hasAccess: false,
        accessLevel: '0',
        origem: 'NONE',
        details: {
          IDACESSO: idAcesso,
          DESCRICAO: resource.DESCRICAO,
          ACESSO: '0',
        },
      };
    }

    const codGrupo = userGroupResult[0].CODGRU;
    const groupPermQuery = `SELECT ACESSO, CODGRUPO FROM TDDPER WHERE IDACESSO = '${idAcesso}' AND CODGRUPO = ${codGrupo} AND CODUSU = 0`;
    const groupPermResult = await this.sankhyaApiService.executeQuery(groupPermQuery);

    if (groupPermResult && groupPermResult.length > 0) {
      const groupPerm = groupPermResult[0];
      return {
        hasAccess: groupPerm.ACESSO !== '0',
        accessLevel: groupPerm.ACESSO,
        origem: 'GRUPO',
        details: {
          IDACESSO: idAcesso,
          DESCRICAO: resource.DESCRICAO,
          ACESSO: groupPerm.ACESSO,
        },
      };
    }

    // 4. Sem permissão
    return {
      hasAccess: false,
      accessLevel: '0',
      origem: 'NONE',
      details: {
        IDACESSO: idAcesso,
        DESCRICAO: resource.DESCRICAO,
        ACESSO: '0',
      },
    };
  }

  /**
   * Lista todos os recursos disponíveis (TDDIAC)
   */
  async listAvailableResources(): Promise<any[]> {
    const query = `SELECT IDACESSO, DESCRICAO, SIGLA, SEQUENCIA FROM TDDIAC ORDER BY DESCRICAO`;

    return this.sankhyaApiService.executeQuery(query);
  }

  /**
   * Lista todos os grupos de usuários
   */
  async listGroups(): Promise<any[]> {
    const query = `SELECT CODGRU, DESCRGRU FROM TSIGRU ORDER BY DESCRGRU`;

    return this.sankhyaApiService.executeQuery(query);
  }

  /**
   * Lista todos os usuários do sistema
   * Busca IDs únicos via TDDPER e busca dados de TSIUSU usando IN
   */
  async listUsers(): Promise<any[]> {
    try {
      this.logger.log('Buscando todos os usuários de TSIUSU...');

      // 1. Busca TODOS os usuários de TSIUSU
      // IMPORTANTE: Apenas CODUSU e NOMEUSU funcionam! CODGRU e ATIVO causam HTTP 500
      const usersQuery = `SELECT CODUSU, NOMEUSU FROM TSIUSU`;
      const users = await this.sankhyaApiService.executeQuery(usersQuery);

      this.logger.log(`Encontrados ${users.length} usuários em TSIUSU`);

      // 2. Retorna usuários ordenados
      // Não incluímos CODGRU/ATIVO pois a API Sankhya não permite consultar esses campos
      return users
        .map(user => ({
          CODUSU: user.CODUSU,
          NOMEUSU: user.NOMEUSU,
          CODGRU: null, // Não disponível via API externa
          ATIVO: 'S',   // Assumimos ativo por padrão
          DESCRGRU: null,
        }))
        .sort((a, b) => (a.NOMEUSU || '').localeCompare(b.NOMEUSU || ''));

    } catch (error) {
      this.logger.error('Erro ao listar usuários:', error);
      throw error;
    }
  }

  /**
   * Mescla permissões removendo duplicatas
   * Prioriza permissões de USUARIO sobre GRUPO
   */
  private mergeDuplicatePermissions(
    permissions: PermissionDto[],
  ): PermissionDto[] {
    const map = new Map<string, PermissionDto>();

    for (const perm of permissions) {
      const existing = map.get(perm.IDACESSO);

      if (!existing) {
        map.set(perm.IDACESSO, perm);
      } else if (perm.ORIGEM === 'USUARIO' && existing.ORIGEM === 'GRUPO') {
        // Substitui permissão de grupo por permissão de usuário
        map.set(perm.IDACESSO, perm);
      }
    }

    return Array.from(map.values());
  }
}

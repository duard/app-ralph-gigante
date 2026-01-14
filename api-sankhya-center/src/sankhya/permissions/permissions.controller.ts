import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { TokenAuthGuard } from '../auth/token-auth.guard';

@Controller('permissions')
@UseGuards(TokenAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  /**
   * GET /permissions/users
   * Lista todos os usuários ativos
   * Se falhar (sem permissão), retorna apenas o usuário atual
   */
  @Get('users')
  async listUsers(@Req() request: any) {
    try {
      return await this.permissionsService.listUsers();
    } catch (error) {
      // Se não tiver permissão para listar todos, retorna apenas o usuário atual
      const currentUser = request.user;
      return [{
        CODUSU: currentUser.sub || currentUser.codUsu,
        NOMEUSU: currentUser.username,
        CODGRU: null,
        DESCRGRU: null,
        ATIVO: 'S'
      }];
    }
  }

  /**
   * GET /permissions/groups
   * Lista todos os grupos
   * Se falhar (sem permissão), retorna array vazio
   */
  @Get('groups')
  async listGroups() {
    try {
      return await this.permissionsService.listGroups();
    } catch (error) {
      // Se não tiver permissão para listar grupos, retorna array vazio
      return [];
    }
  }

  /**
   * GET /permissions/resources
   * Lista todos os recursos disponíveis (TDDIAC)
   */
  @Get('resources')
  async listResources() {
    return this.permissionsService.listAvailableResources();
  }

  /**
   * GET /permissions/user/:codUsu
   * Retorna todas as permissões de um usuário específico
   */
  @Get('user/:codUsu')
  async getUserPermissions(
    @Param('codUsu', ParseIntPipe) codUsu: number,
    @Req() request: any,
  ) {
    // Se for o próprio usuário, passa o username do token
    const username = codUsu === request.user.codUsu ? request.user.username : undefined;
    return this.permissionsService.getUserPermissions(codUsu, username);
  }

  /**
   * GET /permissions/check/:codUsu/:idAcesso
   * Verifica se um usuário tem acesso a um recurso específico
   */
  @Get('check/:codUsu')
  async checkAccess(
    @Param('codUsu', ParseIntPipe) codUsu: number,
    @Query('idAcesso') idAcesso: string,
  ) {
    if (!idAcesso) {
      throw new Error('idAcesso é obrigatório');
    }

    return this.permissionsService.checkUserAccess(codUsu, idAcesso);
  }
}

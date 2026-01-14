export class PermissionDto {
  IDACESSO: string;
  DESCRICAO: string;
  SIGLA: string;
  ACESSO: string;
  ORIGEM: 'USUARIO' | 'GRUPO';
  CODUSU?: number;
  CODGRUPO?: number;
  VERSAO?: number;
}

export class UserPermissionsDto {
  CODUSU: number;
  NOMEUSU: string;
  CODGRU: number;
  DESCRGRU?: string;
  permissions: PermissionDto[];
  totalPermissions: number;
}

export class AccessCheckDto {
  hasAccess: boolean;
  accessLevel: string;
  origem: 'USUARIO' | 'GRUPO' | 'NONE';
  details?: {
    IDACESSO: string;
    DESCRICAO: string;
    ACESSO: string;
  };
}

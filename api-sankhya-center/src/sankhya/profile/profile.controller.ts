import { Controller, Get, UseGuards, Req } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { TokenAuthGuard } from '../auth/token-auth.guard'
import { ProfileService } from './profile.service'

@ApiBearerAuth('JWT-auth')
@ApiTags('E. Perfil do Usuário')
@Controller('profile')
@UseGuards(TokenAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Obter perfil completo do usuário logado',
    description:
      'Retorna dados detalhados do funcionário, usuário, estrutura organizacional, gestor e empresa.',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil retornado com sucesso',
    schema: {
      example: {
        funcionario: {
          CODFUNC: 393,
          CODEMP: 1,
          NOMEFUNC: 'LEVI CELIO ALVES TOSTA',
          funcionarioDataNascimento: '03/04/1989',
          funcionarioIdade: 36,
          funcionarioCPF: '104.544.696-32',
          CELULAR: '34 9 84217117',
          EMAIL: 'levi.tosta89@gmail.com',
          funcionarioDataAdmissao: '18/12/2025',
          funcionarioDiasEmpresa: 8,
          SITUACAO: '1',
          funcionarioSituacaoDescricao: 'Ativo',
        },
        usuario: {
          CODUSU: 446,
          NOMEUSU: 'LEVI.ALVES',
          usuarioEmail: null,
          FOTO: null,
          usuarioTelefoneCorp: null,
        },
        estruturaOrganizacional: {
          cargaHorariaDescricao:
            '07:00 - 11:00/12:00 - 16:00 E SABADOS 07:00 AS 11:00',
          departamentoDescricao: 'OPERAÇÃO',
          cargoDescricao: 'MOTORISTA DE CARRETA III',
          centroResultadoDescricao: 'OPERADORES',
        },
        gestor: {
          gestorCodigoUsuario: 10513,
          gestorNome: 'GESTOR EXEMPLO',
          gestorEmail: 'gestor@empresa.com',
          gestorFormatado: '010513 GESTOR EXEMPLO',
          gestorDataNascimento: '01/01/1980',
          gestorIdade: 45,
          gestorCPF: '123.456.789-00',
          gestorCelular: '34 9 99999999',
          gestorDepartamento: 'GESTÃO',
          gestorCargo: 'GERENTE',
          gestorCentroResultado: 'ADMINISTRATIVO',
          gestorDataAdmissao: '01/01/2020',
          gestorDiasEmpresa: 2100,
        },
        empresa: {
          CODEMP: 1,
          NOMEFANTASIA: 'GIGANTAO LOCADORA',
          empresaCNPJ: '23.981.517/0001-04',
          empresaFormatada: '001 GIGANTAO LOCADORA',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Perfil não encontrado' })
  async getProfile(@Req() req) {
    const userId = req.user.userId
    return this.profileService.getProfile(userId)
  }
}

import { Module } from '@nestjs/common'
import { AdGigLogModule } from './ad_gig_log/ad_gig_log.module'
import { AuthModule } from './auth/auth.module'
import { SharedModule } from './shared/shared.module'
import { TfpcarModule } from './tfpcar/tfpcar.module'
import { TfpdepModule } from './tfpdep/tfpdep.module'
import { TgfparModule } from './tgfpar/tgfpar.module'
import { TfpfunModule } from './tfpfun/tfpfun.module'
import { TgfcabModule } from './tgfcab/tgfcab.module'
import { TgftopModule } from './tgftop/tgftop.module'
import { TgfiteModule } from './tgfite/tgfite.module'
import { TgfproModule } from './tgfpro/tgfpro.module'
import { TgfgruModule } from './tgfgru/tgfgru.module'
import { TgfvenModule } from './tgfven/tgfven.module'
import { TgftabModule } from './tgftab/tgftab.module'
import { TgfestModule } from './tgfest/tgfest.module'
import { EstoqueModule } from './estoque/estoque.module'
import { ProfileModule } from './profile/profile.module'
import { TsiempModule } from './tsiemp/tsiemp.module'
import { TsiusuModule } from './tsiusu/tsiusu.module'
import { PessoasModule } from './pessoas/pessoas.module'
import { RhDashboardModule } from './dashboards/rh/rh-dashboard.module'
import { EstoquesDashboardModule } from './dashboards/estoques/estoques-dashboard.module'
import { ProdutosDashboardModule } from './dashboards/produtos/produtos-dashboard.module'
import { EstoqueGiroModule } from './estoque/estoque-giro/estoque-giro.module'
import { ProdutosV2Module } from './produtos-v2/produtos-v2.module'
import { ProdutosSimplesV2Module } from './produtos-simples-v2/produtos-simples-v2.module'
import { Products2Module } from './products2/products2.module'
import { Tgfpro2Module } from './tgfpro2/tgfpro2.module'

/**
 * Módulo principal do Sankhya, que agrupa todos os módulos relacionados ao ERP Sankhya.
 * Inclui TGFGRU and others.
 */
@Module({
  imports: [
    AdGigLogModule,
    AuthModule,
    SharedModule,
    ProfileModule,
    TsiempModule,
    TsiusuModule,
    TfpcarModule,
    TfpdepModule,
    TgfparModule,
    TfpfunModule,
    TgfcabModule,
    TgftopModule,
    TgfiteModule,
    TgfgruModule,
    TgfproModule,
    TgfestModule,
    EstoqueModule,
    TgfvenModule,
    TgftabModule,
    PessoasModule,
    RhDashboardModule,
    EstoquesDashboardModule,
    ProdutosDashboardModule,
    EstoqueGiroModule,
    ProdutosV2Module,
    ProdutosSimplesV2Module,
    Products2Module,
    Tgfpro2Module,
  ],
  exports: [AuthModule], // Export AuthModule to make JwtService available
})
export class SankhyaModule {}

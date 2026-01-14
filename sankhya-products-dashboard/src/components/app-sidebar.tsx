'use client';

import * as React from 'react';
import {
  Package,
  LayoutDashboard,
  BarChart3,
  Home,
  Settings,
  HelpCircle,
  FileText,
  TrendingUp,
  Filter,
  Download,
  CreditCard,
  Users,
  Building,
  Database,
  Zap,
  Activity,
  PackageOpen,
  Layers,
  MapPin,
  PieChart,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Shield,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const data = {
  user: {
    id: '1',
    name: 'Sankhya Center',
    username: 'usuario',
    email: 'usuario@sankhya.com',
    avatar: '',
    role: 'admin',
  },
  navGroups: [
    {
      label: 'Principal',
      items: [
        {
          title: 'Bem-Vindo',
          url: '/bem-vindo',
          icon: Home,
        },
        {
          title: 'Dashboard',
          url: '/dashboard',
          icon: LayoutDashboard,
        },
        {
          title: 'Dashboard 2',
          url: '/dashboard-2',
          icon: BarChart3,
        },
        {
          title: 'Dashboard 3',
          url: '/dashboard-3',
          icon: Activity,
        },
      ],
    },
    {
      label: 'Produtos',
      items: [
        {
          title: 'Lista de Produtos',
          url: '/produtos',
          icon: Package,
        },
        {
          title: 'Produto Simples V2',
          url: '/produtos-simples',
          icon: Zap,
        },
      ],
    },
    {
      label: 'Produtos V2',
      items: [
        {
          title: 'Dashboard V2',
          url: '/produtos-v2',
          icon: LayoutDashboard,
        },
        {
          title: 'Listagem Completa',
          url: '/produtos-v2/listagem',
          icon: PackageOpen,
        },
        {
          title: 'Por Grupo',
          url: '#',
          icon: Layers,
          items: [
            {
              title: 'Ver Todos Grupos',
              url: '/produtos-v2/grupos',
            },
            {
              title: 'MATERIAL ESCRITORIO',
              url: '/produtos-v2/grupo/20303',
            },
            {
              title: 'MECANICA',
              url: '/produtos-v2/grupo/20102',
            },
          ],
        },
        {
          title: 'Por Local',
          url: '#',
          icon: MapPin,
          items: [
            {
              title: 'Ver Todos Locais',
              url: '/produtos-v2/locais',
            },
            {
              title: 'ALMOX PECAS',
              url: '/produtos-v2/local/101001',
            },
            {
              title: 'MATERIAL ESCRITORIO',
              url: '/produtos-v2/local/105002',
            },
          ],
        },
        {
          title: 'Análise de Estoque',
          url: '#',
          icon: TrendingUp,
          items: [
            {
              title: 'Status Geral',
              url: '/produtos-v2/estoque/status',
            },
            {
              title: 'Crítico',
              url: '/produtos-v2/estoque/critico',
            },
            {
              title: 'Sem Estoque',
              url: '/produtos-v2/estoque/sem-estoque',
            },
            {
              title: 'Excesso',
              url: '/produtos-v2/estoque/excesso',
            },
          ],
        },
        {
          title: 'Consumo de Produtos',
          url: '#',
          icon: ShoppingCart,
          items: [
            {
              title: 'Consulta por Produto',
              url: '/produtos-v2/consumo/consulta-produto',
            },
            {
              title: 'Todas Movimentações',
              url: '/produtos-v2/consumo',
            },
            {
              title: 'Análise por Período',
              url: '/produtos-v2/consumo/analise',
            },
            {
              title: 'Por Departamento',
              url: '/produtos-v2/consumo/departamentos',
            },
            {
              title: 'Por Usuário',
              url: '/produtos-v2/consumo/usuarios',
            },
          ],
        },
        {
          title: 'Qualidade de Dados',
          url: '#',
          icon: AlertTriangle,
          items: [
            {
              title: 'Produtos Sem NCM',
              url: '/produtos-v2/qualidade/sem-ncm',
            },
            {
              title: 'Campos Incompletos',
              url: '/produtos-v2/qualidade/incompletos',
            },
            {
              title: 'Inativos com Estoque',
              url: '/produtos-v2/qualidade/inativos-estoque',
            },
          ],
        },
      ],
    },
    {
      label: 'Sistema',
      items: [
        {
          title: 'Relatórios',
          url: '/dashboard',
          icon: FileText,
        },
        {
          title: 'Usuários',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Segurança',
          url: '#',
          icon: Shield,
          items: [
            {
              title: 'Permissões',
              url: '/seguranca/permissoes',
            },
          ],
        },
        {
          title: 'Configurações',
          url: '#',
          icon: Settings,
          items: [
            {
              title: 'Perfil',
              url: '/settings/user',
            },
            {
              title: 'Conta',
              url: '/settings/account',
            },
            {
              title: 'Aparência',
              url: '/settings/appearance',
            },
            {
              title: 'Notificações',
              url: '/settings/notifications',
            },
          ],
        },
      ],
    },
    {
      label: 'Ferramentas',
      items: [
        {
          title: 'Inspect Query',
          url: '/inspect-query',
          icon: Database,
        },
      ],
    },
    {
      label: 'Ajuda',
      items: [
        {
          title: 'Documentação',
          url: '/faqs',
          icon: HelpCircle,
        },
        {
          title: 'Planos',
          url: '/pricing',
          icon: CreditCard,
        },
        {
          title: 'API',
          url: '#',
          icon: Database,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/bem-vindo">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Building size={24} className="text-current" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Sankhya Center</span>
                  <span className="truncate text-xs">Dashboard de Produtos</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        {/* <SidebarNotification /> */}
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

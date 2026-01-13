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
          title: 'Produtos V2 (Novo)',
          url: '/produtos-v2',
          icon: Package,
        },
        {
          title: 'Produtos (Rápido)',
          url: '/produtos-simples',
          icon: Zap,
        },
        {
          title: 'Análise de Produtos',
          url: '/dashboard',
          icon: TrendingUp,
        },
        {
          title: 'Filtros Avançados',
          url: '#',
          icon: Filter,
          items: [
            {
              title: 'Por Categoria',
              url: '/produtos?view=category',
            },
            {
              title: 'Por Preço',
              url: '/produtos?view=price',
            },
            {
              title: 'Por Status',
              url: '/produtos?view=status',
            },
          ],
        },
        {
          title: 'Exportação',
          url: '#',
          icon: Download,
          items: [
            {
              title: 'Exportar CSV',
              url: '#',
            },
            {
              title: 'Exportar Excel',
              url: '#',
            },
            {
              title: 'Exportar PDF',
              url: '#',
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

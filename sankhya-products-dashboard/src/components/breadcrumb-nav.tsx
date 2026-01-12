'use client';

import * as React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'dashboard-2': 'Dashboard 2',
  produtos: 'Produtos',
  mail: 'E-mail',
  tasks: 'Tarefas',
  chat: 'Chat',
  calendar: 'Calendário',
  users: 'Usuários',
  faqs: 'Perguntas Frequentes',
  pricing: 'Planos e Preços',
  settings: 'Configurações',
  user: 'Perfil',
  account: 'Conta',
  billing: 'Cobrança',
  appearance: 'Aparência',
  notifications: 'Notificações',
  connections: 'Conexões',
  auth: 'Autenticação',
  'sign-in': 'Entrar',
  'sign-up': 'Cadastrar',
  'forgot-password': 'Recuperar Senha',
  errors: 'Erros',
  unauthorized: 'Não Autorizado',
  forbidden: 'Proibido',
  'not-found': 'Não Encontrado',
  'internal-server-error': 'Erro Interno',
  'under-maintenance': 'Em Manutenção',
};

function formatSegment(segment: string): string {
  if (routeLabels[segment]) {
    return routeLabels[segment];
  }
  return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
}

export function BreadcrumbNav() {
  const location = useLocation();
  const pathname = location.pathname;

  const pathSegments = pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  const breadcrumbItems: BreadcrumbItem[] = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const isLast = index === pathSegments.length - 1;

    return {
      label: formatSegment(segment),
      path: isLast ? undefined : path,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">Início</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;

          if (isLast) {
            return (
              <BreadcrumbItem key={item.path || index}>
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              </BreadcrumbItem>
            );
          }

          return (
            <React.Fragment key={item.path || index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to={item.path!}>{item.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

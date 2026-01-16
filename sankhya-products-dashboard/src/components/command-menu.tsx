import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calculator,
  Calendar,
  CreditCard,
  Settings,
  Smile,
  User,
  Users,
  Package,
  LayoutDashboard,
  Mail,
  MessageSquare,
  ListTodo,
  HelpCircle,
  DollarSign,
  Search,
  FileText,
  Shield,
  Wrench,
  ClipboardList,
  BarChart3,
  PackageSearch,
  AlertTriangle,
  Home,
  Menu,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';

interface CommandMenuItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  shortcut?: string;
}

interface CommandMenuGroup {
  heading: string;
  items: CommandMenuItem[];
}

const commandGroups: CommandMenuGroup[] = [
  {
    heading: 'Dashboards',
    items: [
      { icon: Home, label: 'Bem-Vindo', path: '/bem-vindo' },
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: LayoutDashboard, label: 'Dashboard 2', path: '/dashboard-2' },
      { icon: LayoutDashboard, label: 'Dashboard 3', path: '/dashboard-3' },
    ],
  },
  {
    heading: 'Produtos',
    items: [
      { icon: Package, label: 'Produtos V7 (Gestão Completa)', path: '/produtos-v7' },
      { icon: PackageSearch, label: 'Produtos V6 (Pesquisa Avançada)', path: '/produtos-v6' },
      { icon: Package, label: 'Produtos V2', path: '/produtos-v2' },
      { icon: Package, label: 'Produtos V2 Listagem', path: '/produtos-v2/listagem' },
      { icon: Package, label: 'Produtos', path: '/produtos' },
      { icon: Package, label: 'Produtos Simples', path: '/produtos-simples' },
    ],
  },
  {
    heading: 'Consumo & Análises',
    items: [
      { icon: BarChart3, label: 'Consumo', path: '/produtos-v2/consumo' },
      {
        icon: BarChart3,
        label: 'Consumo Análise',
        path: '/produtos-v2/consumo/analise',
      },
      {
        icon: Search,
        label: 'Consumo Consulta',
        path: '/produtos-v2/consumo/consulta-produto',
      },
    ],
  },
  {
    heading: 'Qualidade',
    items: [
      {
        icon: AlertTriangle,
        label: 'Produtos sem NCM',
        path: '/produtos-v2/qualidade/sem-ncm',
      },
    ],
  },
  {
    heading: 'Ordens de Serviço',
    items: [
      { icon: Wrench, label: 'OS Manutenção', path: '/ordens-servico' },
      { icon: ClipboardList, label: 'OS Listagem', path: '/ordens-servico/listagem' },
    ],
  },
  {
    heading: 'Comunicação',
    items: [
      { icon: Mail, label: 'E-mail', path: '/mail' },
      { icon: MessageSquare, label: 'Chat', path: '/chat' },
      { icon: Calendar, label: 'Calendário', path: '/calendar' },
    ],
  },
  {
    heading: 'Ferramentas',
    items: [
      { icon: ListTodo, label: 'Tarefas', path: '/tasks' },
      { icon: FileText, label: 'Inspecionar Query', path: '/inspect-query' },
    ],
  },
  {
    heading: 'Administração',
    items: [
      { icon: Users, label: 'Usuários', path: '/users' },
      { icon: Shield, label: 'Permissões', path: '/seguranca/permissoes' },
    ],
  },
  {
    heading: 'Configurações',
    items: [
      { icon: User, label: 'Perfil do Usuário', path: '/settings/user' },
      { icon: Settings, label: 'Conta', path: '/settings/account' },
      { icon: CreditCard, label: 'Faturamento', path: '/settings/billing' },
      { icon: Smile, label: 'Aparência', path: '/settings/appearance' },
      { icon: Settings, label: 'Notificações', path: '/settings/notifications' },
      { icon: Settings, label: 'Conexões', path: '/settings/connections' },
    ],
  },
  {
    heading: 'Suporte',
    items: [
      { icon: HelpCircle, label: 'FAQs', path: '/faqs' },
      { icon: DollarSign, label: 'Preços', path: '/pricing' },
    ],
  },
];

// Context para compartilhar estado do menu
const CommandMenuContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export function CommandMenuProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <CommandMenuContext.Provider value={{ open, setOpen }}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </CommandMenuContext.Provider>
  );
}

export function useCommandMenuContext() {
  const context = React.useContext(CommandMenuContext);
  if (!context) {
    throw new Error('useCommandMenuContext must be used within CommandMenuProvider');
  }
  return context;
}

export function CommandMenu() {
  const { open, setOpen } = useCommandMenuContext();
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Menu de Navegação"
      description="Digite para abrir um módulo rapidamente"
    >
      <CommandInput placeholder="Digite para abrir... (ex: produtos v7, os manutenção, dashboard)" />
      <CommandList>
        <CommandEmpty>Nenhum módulo encontrado. Tente: produtos, ordens, dashboard...</CommandEmpty>
        {commandGroups.map((group, groupIndex) => (
          <React.Fragment key={group.heading}>
            {groupIndex > 0 && <CommandSeparator />}
            <CommandGroup heading={group.heading}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <CommandItem
                    key={item.path}
                    onSelect={() => handleSelect(item.path)}
                    className="cursor-pointer"
                  >
                    <Icon className="mr-2 size-4" />
                    <span>{item.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </React.Fragment>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

// Botão trigger para abrir o CommandMenu
export function CommandMenuTrigger() {
  const { setOpen } = useCommandMenuContext();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2 px-3"
        >
          <Menu className="h-4 w-4" />
          <span className="hidden sm:inline-flex">Navegação</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Abrir menu de navegação (⌘K)</p>
      </TooltipContent>
    </Tooltip>
  );
}

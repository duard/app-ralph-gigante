"use client"

import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Package,
    BarChart3,
    Settings,
    LogOut,
    ArrowRight,
    Building2,
    Clock,
    TrendingUp,
} from 'lucide-react';

export function BemVindoPage() {
    const { user, logout } = useAuthStore();

    const userName = user?.name || user?.username || 'Usuário';
    const userEmail = user?.email || '';

    const quickActions = [
        {
            title: 'Produtos',
            description: 'Gerenciar e consultar produtos',
            icon: Package,
            href: '/produtos',
            color: 'text-blue-600',
            bgColor: 'bg-blue-100',
        },
        {
            title: 'Dashboard',
            description: 'Visualizar métricas e relatórios',
            icon: BarChart3,
            href: '/dashboard',
            color: 'text-green-600',
            bgColor: 'bg-green-100',
        },
        {
            title: 'Estoque',
            description: 'Consultar níveis de estoque',
            icon: TrendingUp,
            href: '/dashboard-2',
            color: 'text-purple-600',
            bgColor: 'bg-purple-100',
        },
        {
            title: 'Configurações',
            description: 'Ajustar preferências do sistema',
            icon: Settings,
            href: '/settings/account',
            color: 'text-gray-600',
            bgColor: 'bg-gray-100',
        },
    ];

    const stats = [
        { label: 'Total Produtos', value: '1,234', icon: Package },
        { label: 'Tempo de Uso', value: 'Online', icon: Clock },
        { label: 'Empresa', value: 'GIGANTÃO', icon: Building2 },
    ];

    return (
        <div className="container mx-auto py-10 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Bem-vindo, {userName}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    {userEmail ? `Conectado como ${userEmail}` : 'É um prazer tê-lo conosco'}
                </p>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <stat.icon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="h-5 w-5" />
                            Ações Rápidas
                        </CardTitle>
                        <CardDescription>
                            Acesse rapidamente as principais funcionalidades
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-3">
                        {quickActions.map((action, index) => (
                            <Link key={index} to={action.href}>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start h-auto py-3 px-4"
                                >
                                    <div className={`p-2 rounded-lg ${action.bgColor} mr-3`}>
                                        <action.icon className={`h-5 w-5 ${action.color}`} />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium">{action.title}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {action.description}
                                        </p>
                                    </div>
                                </Button>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* System Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Informações do Sistema</CardTitle>
                        <CardDescription>
                            Status e detalhes da sua sessão
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Status</span>
                            <Badge variant="default" className="bg-green-500">
                                Online
                            </Badge>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Período de Acesso</span>
                            <span className="text-sm font-medium">Sessão Ativa</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Empresa</span>
                            <span className="text-sm font-medium">GIGANTÃO LOCADORA</span>
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Módulos</span>
                            <div className="flex gap-1">
                                <Badge variant="secondary">Produtos</Badge>
                                <Badge variant="secondary">Estoque</Badge>
                                <Badge variant="secondary">RH</Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Logout */}
            <div className="mt-8 flex justify-center">
                <Button
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => logout()}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair da Conta
                </Button>
            </div>
        </div>
    );
}

export default BemVindoPage;

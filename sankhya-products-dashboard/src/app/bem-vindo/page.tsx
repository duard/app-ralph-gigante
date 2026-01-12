"use client"

import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Package,
    BarChart3,
    Settings,
    LogOut,
    ArrowRight,
} from 'lucide-react';

export function BemVindoPage() {
    const { user, logout } = useAuthStore();

    const userName = user?.name || user?.username || 'Usuário';

    return (
        <div className="container mx-auto py-10 max-w-6xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Bem-vindo, {userName}!
                </h1>
                <p className="text-muted-foreground mt-2">
                    É um prazer tê-lo conosco.
                </p>
            </div>

            {/* Quick Actions */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ArrowRight className="h-5 w-5" />
                        Ações Rápidas
                    </CardTitle>
                    <CardDescription>
                        Acesse rapidamente as principais funcionalidades
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        <Link to="/produtos">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-3 px-4"
                            >
                                <div className="p-2 rounded-lg bg-blue-100 mr-3">
                                    <Package className="h-5 w-5 text-blue-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Produtos</p>
                                    <p className="text-sm text-muted-foreground">
                                        Gerenciar produtos
                                    </p>
                                </div>
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-3 px-4"
                            >
                                <div className="p-2 rounded-lg bg-green-100 mr-3">
                                    <BarChart3 className="h-5 w-5 text-green-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Dashboard</p>
                                    <p className="text-sm text-muted-foreground">
                                        Ver métricas
                                    </p>
                                </div>
                            </Button>
                        </Link>
                        <Link to="/settings/account">
                            <Button
                                variant="outline"
                                className="w-full justify-start h-auto py-3 px-4"
                            >
                                <div className="p-2 rounded-lg bg-gray-100 mr-3">
                                    <Settings className="h-5 w-5 text-gray-600" />
                                </div>
                                <div className="text-left">
                                    <p className="font-medium">Configurações</p>
                                    <p className="text-sm text-muted-foreground">
                                        Ajustar preferências
                                    </p>
                                </div>
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>

            {/* Logout */}
            <div className="flex justify-center">
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
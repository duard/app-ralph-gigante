"use client"

import { useState } from 'react';
import { Eye, EyeOff, LogIn, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

import { useAuth } from '@/hooks/use-auth';

interface LoginFormProps {
    onSuccess?: () => void;
}

interface FormErrors {
    username?: string;
    password?: string;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});
    const { login, isLoading } = useAuth();

    const validate = (): boolean => {
        const newErrors: FormErrors = {};

        if (!username) {
            newErrors.username = 'Usuário é obrigatório';
        } else if (username.length < 3) {
            newErrors.username = 'Usuário deve ter ao menos 3 caracteres';
        }

        if (!password) {
            newErrors.password = 'Senha é obrigatória';
        } else if (password.length < 6) {
            newErrors.password = 'Senha deve ter ao menos 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        const result = await login({
            username,
            password,
            rememberMe,
        });

        if (result.success && onSuccess) {
            onSuccess();
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Usuário</Label>
                <Input
                    id="username"
                    type="text"
                    placeholder="Digite seu usuário"
                    autoComplete="username"
                    disabled={isLoading}
                    className="h-11 px-4 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
                    value={username}
                    onChange={(e) => {
                        setUsername(e.target.value);
                        if (errors.username) setErrors(prev => ({ ...prev, username: undefined }));
                    }}
                />
                {errors.username && (
                    <p className="text-sm text-destructive">{errors.username}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
                <div className="relative">
                    <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        disabled={isLoading}
                        className="h-11 px-4 pr-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary/20"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value);
                            if (errors.password) setErrors(prev => ({ ...prev, password: undefined }));
                        }}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-11 w-11 hover:bg-transparent text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                    >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                        </span>
                    </Button>
                </div>
                {errors.password && (
                    <p className="text-sm text-destructive">{errors.password}</p>
                )}
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                        disabled={isLoading}
                    />
                    <Label
                        htmlFor="rememberMe"
                        className="text-sm font-normal cursor-pointer text-muted-foreground"
                    >
                        Lembrar-me
                    </Label>
                </div>

                <Link
                    to="/auth/forgot-password"
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Esqueceu a senha?
                </Link>
            </div>

            <Button
                type="submit"
                className="w-full h-11 text-base font-semibold shadow-md transition-all hover:shadow-lg"
                disabled={isLoading}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                    </>
                ) : (
                    <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Entrar
                    </>
                )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
                Não tem uma conta?{' '}
                <Link
                    to="/auth/sign-up"
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                >
                    Cadastre-se
                </Link>
            </div>
        </form>
    );
}

export default LoginForm;

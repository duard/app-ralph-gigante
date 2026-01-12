import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Page() {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <a href="/" className="flex items-center gap-3 mb-6">
            <div className="bg-primary text-primary-foreground flex size-12 items-center justify-center rounded-xl shadow-lg">
              <Logo size={28} />
            </div>
            <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Sankhya Center
            </span>
          </a>
        </div>
        <Card className="shadow-xl border-0 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold">Bem-vindo de volta</CardTitle>
            <CardDescription className="text-base">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <LoginForm />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-6">
          © 2024 Sankhya Center. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

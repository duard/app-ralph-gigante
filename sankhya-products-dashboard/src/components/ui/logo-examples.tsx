import { Logo } from './logo'

/**
 * Exemplos de uso do componente Logo
 * Este arquivo serve como documentação visual
 */
export function LogoExamples() {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Tamanhos (Sizes)</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">sm:</span>
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">md:</span>
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">lg:</span>
            <Logo size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-16 text-sm text-muted-foreground">xl:</span>
            <Logo size="xl" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Variantes (Variants)</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="w-32 text-sm text-muted-foreground">default:</span>
            <Logo variant="default" size="lg" />
          </div>
          <div className="flex items-center gap-4">
            <span className="w-32 text-sm text-muted-foreground">gradient:</span>
            <Logo variant="gradient" size="lg" />
          </div>
          <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg">
            <span className="w-32 text-sm text-slate-400">white:</span>
            <Logo variant="white" size="lg" />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Uso no Header</h2>
        <div className="border rounded-lg p-4 bg-background">
          <div className="flex items-center gap-3">
            <Logo variant="gradient" size="md" />
            <span className="text-sm text-muted-foreground">
              ← Logo usado no header principal
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

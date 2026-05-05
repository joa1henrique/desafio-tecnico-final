import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-md text-center space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">404</p>
          <h1 className="text-3xl font-bold tracking-tight">Página não encontrada</h1>
          <p className="text-muted-foreground">
            O endereço acessado não existe nesta base do frontend.
          </p>
        </div>

        <Link to="/dashboard">
          <Button>
            Voltar ao painel
          </Button>
        </Link>
      </div>
    </div>
  );
}
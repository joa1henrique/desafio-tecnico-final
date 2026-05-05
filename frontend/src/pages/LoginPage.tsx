import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/utils/error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const initialForm = {
  email: "",
  senha: "",
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    try {
      await login(form);
      navigate({ to: "/dashboard" });
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Falha ao fazer login"));
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-2">
          <div>
            <p className="text-sm font-medium text-primary">Acesso ao sistema</p>
            <CardTitle className="text-2xl">Entre no painel</CardTitle>
            <CardDescription>
              Use suas credenciais para acessar a área protegida e iniciar o fluxo de despesas.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <Separator />

          {error && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive text-sm p-3 rounded-md">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                placeholder="••••••••"
                value={form.senha}
                onChange={(event) =>
                  setForm((current) => ({ ...current, senha: event.target.value }))
                }
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
import { Link } from "@tanstack/react-router";
import { AppLayout } from "@/components/layout/AppLayout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getPermissionsByRole } from "@/constants/rolePermissions";

export function DashboardPage() {
  const { user, permissions } = useAuth();

  const quickActions = user
    ? getPermissionsByRole(user.perfil).filter((action) => permissions.includes(action.action))
    : [];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* seção de boas-vindas */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, {user?.nome}
          </h1>
          <p className="text-muted-foreground">
            Você está acessando como <span className="font-semibold text-foreground">{user?.perfil}</span>
          </p>
        </div>

        {/* ações rápidas */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => (
              <Card key={action.href} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link to={action.href}>
                    <Button variant="outline" className="w-full">
                      Acessar
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

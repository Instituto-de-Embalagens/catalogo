import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Package, MapPin, Users, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const devLoginMutation = trpc.auth.devLogin.useMutation({
    onSuccess: () => {
      toast.success("Login realizado com sucesso!");
      utils.auth.me.invalidate();
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`Erro ao fazer login: ${error.message}`);
    },
  });

  const handleDevLogin = () => {
    devLoginMutation.mutate();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-6xl">📦</div>
            <CardTitle className="text-3xl">Catálogo de Embalagens</CardTitle>
            <CardDescription>
              Faça login para acessar o sistema de catalogação e mapeamento logístico de embalagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={handleDevLogin} 
              className="w-full" 
              size="lg"
              disabled={devLoginMutation.isPending}
            >
              {devLoginMutation.isPending ? "Entrando..." : "Entrar (Modo Desenvolvimento)"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Login automático como Super Admin para desenvolvimento local
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Bem-vindo, {user?.name || "Usuário"}!</h1>
          <p className="text-muted-foreground mt-2">
            Sistema de catalogação e mapeamento logístico de embalagens
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Embalagens"
            icon={Package}
            href="/embalagens"
            description="Gerenciar catálogo"
          />
          <StatsCard
            title="Localizações"
            icon={MapPin}
            href="/localizacoes"
            description="Mapeamento logístico"
          />
          {(user?.role === "admin" || user?.role === "super_admin") && (
            <StatsCard
              title="Usuários"
              icon={Users}
              href="/usuarios"
              description="Gerenciar usuários"
            />
          )}
          <StatsCard
            title="Relatórios"
            icon={BarChart3}
            href="/relatorios"
            description="Análises e exportações"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Embalagens Recentes</CardTitle>
              <CardDescription>Últimas embalagens cadastradas no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentEmbalagens />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Acesso rápido às funcionalidades principais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href="/embalagens/nova">
                  <Package className="mr-2 h-4 w-4" />
                  Nova Embalagem
                </Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/localizacoes/nova">
                  <MapPin className="mr-2 h-4 w-4" />
                  Nova Localização
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({
  title,
  icon: Icon,
  href,
  description,
}: {
  title: string;
  icon: any;
  href: string;
  description: string;
}) {
  return (
    <Link href={href}>
      <Card className="hover:bg-accent transition-colors cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentEmbalagens() {
  const { data: embalagens, isLoading } = trpc.embalagens.list.useQuery({
    deletado: false,
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Carregando...</div>;
  }

  if (!embalagens || embalagens.length === 0) {
    return <div className="text-sm text-muted-foreground">Nenhuma embalagem cadastrada ainda.</div>;
  }

  return (
    <div className="space-y-3">
      {embalagens.slice(0, 5).map((embalagem) => (
        <Link key={embalagem.id} href={`/embalagens/${embalagem.id}`}>
          <div className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
            <div className="flex-1">
              <p className="font-medium">{embalagem.produto}</p>
              <p className="text-sm text-muted-foreground">
                {embalagem.marca} • {embalagem.material}
              </p>
            </div>
            <div className="text-xs text-muted-foreground">
              {new Date(embalagem.createdAt).toLocaleDateString("pt-BR")}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Usuarios() {
  const { data: usuarios, isLoading, error } = trpc.usuarios.list.useQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-screen text-muted-foreground">
          Carregando usuários...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    toast.error("Erro ao carregar usuários");
    return (
      <DashboardLayout>
        <div className="p-6 text-red-500">Erro ao carregar usuários</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Usuários</h1>
          <Button asChild>
            <Link href="/usuarios/novo">Novo Usuário</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Usuários</CardTitle>
          </CardHeader>
          <CardContent>
            {usuarios && usuarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <th className="p-2">Nome</th>
                      <th className="p-2">E-mail</th>
                      <th className="p-2">Função</th>
                      <th className="p-2">Último acesso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((u) => (
                      <tr
                        key={u.id}
                        className="border-b hover:bg-accent transition-colors"
                      >
                        <td className="p-2 font-medium">{u.name}</td>
                        <td className="p-2 text-muted-foreground">{u.email}</td>
                        <td className="p-2 capitalize">{u.role}</td>
                        <td className="p-2 text-muted-foreground">
                          {u.lastSignedIn
                            ? new Date(u.lastSignedIn).toLocaleDateString("pt-BR")
                            : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground">
                Nenhum usuário cadastrado ainda.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

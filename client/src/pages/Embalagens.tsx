import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Package, Plus, Search, Filter, Trash2, Eye } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Embalagens() {
  const { user } = useAuth();
  const [busca, setBusca] = useState("");
  const [material, setMaterial] = useState<string>("");
  const [pais, setPais] = useState<string>("");
  const [mostrarDeletados, setMostrarDeletados] = useState(false);

  const { data: embalagens, isLoading } = trpc.embalagens.list.useQuery({
    busca: busca || undefined,
    material: material || undefined,
    pais: pais || undefined,
    deletado: mostrarDeletados,
  });

  const podeGerenciar =
    user?.role === "super_admin" || user?.role === "admin" || user?.role === "gerente";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Embalagens
            </h1>
            <p className="text-muted-foreground mt-2">
              Catálogo completo de embalagens cadastradas no sistema
            </p>
          </div>
          {podeGerenciar && (
            <Button asChild>
              <Link href="/embalagens/nova">
                <Plus className="mr-2 h-4 w-4" />
                Nova Embalagem
              </Link>
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros e Pesquisa
            </CardTitle>
            <CardDescription>Refine sua busca por embalagens</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por produto, marca ou código..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger>
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os materiais</SelectItem>
                  <SelectItem value="Plástico Rígido">Plástico Rígido</SelectItem>
                  <SelectItem value="Papel">Papel</SelectItem>
                  <SelectItem value="Aço">Aço</SelectItem>
                  <SelectItem value="Vidro">Vidro</SelectItem>
                  <SelectItem value="Alumínio">Alumínio</SelectItem>
                </SelectContent>
              </Select>
              <Select value={pais} onValueChange={setPais}>
                <SelectTrigger>
                  <SelectValue placeholder="País" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os países</SelectItem>
                  <SelectItem value="Brasil">Brasil</SelectItem>
                  <SelectItem value="China">China</SelectItem>
                  <SelectItem value="EUA">EUA</SelectItem>
                  <SelectItem value="Alemanha">Alemanha</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Button
                variant={mostrarDeletados ? "default" : "outline"}
                size="sm"
                onClick={() => setMostrarDeletados(!mostrarDeletados)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {mostrarDeletados ? "Ocultando" : "Mostrar"} Deletados
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setBusca("");
                  setMaterial("");
                  setPais("");
                  setMostrarDeletados(false);
                }}
              >
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !embalagens || embalagens.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Nenhuma embalagem encontrada</p>
              <p className="text-sm text-muted-foreground mb-4">
                Tente ajustar os filtros ou cadastre uma nova embalagem
              </p>
              {podeGerenciar && (
                <Button asChild>
                  <Link href="/embalagens/nova">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Embalagem
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {embalagens.map((embalagem) => (
              <Card
                key={embalagem.id}
                className={`hover:shadow-lg transition-shadow ${
                  embalagem.deletado ? "opacity-60 border-destructive" : ""
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{embalagem.produto}</CardTitle>
                      <CardDescription>{embalagem.marca}</CardDescription>
                    </div>
                    {embalagem.deletado && (
                      <Badge variant="destructive" className="ml-2">
                        Deletado
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <>
                    {/* Placeholder para foto */}
                    <div className="aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      <Package className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-1 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Material:</span>
                      <Badge variant="secondary">{embalagem.material}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">País:</span>
                      <span className="font-medium">{embalagem.pais}</span>
                    </div>
                      {/* Localização será carregada posteriormente */}
                    </div>
                    {embalagem.deletado && embalagem.usuarioDelecaoId && embalagem.dataDelecao && (
                    <div className="text-xs text-destructive bg-destructive/10 p-2 rounded">
                      Deletado em {new Date(embalagem.dataDelecao).toLocaleDateString("pt-BR")}
                      {embalagem.motivoDelecao && (
                        <div className="mt-1">Motivo: {embalagem.motivoDelecao}</div>
                      )}
                      </div>
                    )}
                    <Button asChild className="w-full" variant="outline">
                    <Link href={`/embalagens/${embalagem.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalhes
                      </Link>
                    </Button>
                  </>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

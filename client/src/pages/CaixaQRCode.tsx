import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft,
  Box,
  QrCode,
  Package,
  Plus,
  Trash2,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type Produto = {
  id: string;
  nome: string;
  codigo: string;
  categoria?: string;
  quantidade?: number;
};

type Caixa = {
  sigla: string;
  descricao?: string;
  localizacao?: string;
  status: "Aberta" | "Fechada";
  produtos: Produto[];
  ultimaAtualizacao?: string;
};

export default function CaixaQRCode() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/caixa/:sigla");
  const [caixa, setCaixa] = useState<Caixa | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!match || !params?.sigla) {
      setCaixa(null);
      setLoading(false);
      return;
    }

    const sigla = params.sigla;

    async function fetchCaixa() {
      setLoading(true);
      try {
        // TODO: trocar por fetch real
        const mock: Caixa = {
          sigla,
          descricao: "Caixa destinada a produtos de linha Premium.",
          localizacao: "Depósito Principal / Área A1",
          status: "Aberta",
          ultimaAtualizacao: "2025-11-08T14:25:00Z",
          produtos: [
            {
              id: "p1",
              nome: "Garrafa 500ml PET Cristal",
              codigo: "GB-500CR",
              categoria: "Embalagem Primária",
              quantidade: 240,
            },
            {
              id: "p2",
              nome: "Tampa Plástica Azul 38mm",
              codigo: "TP-38AZ",
              categoria: "Acessório",
              quantidade: 240,
            },
          ],
        };

        setCaixa(mock);
      } catch (error) {
        console.error("Erro ao carregar caixa", error);
        setCaixa(null);
      } finally {
        setLoading(false);
      }
    }

    fetchCaixa();
  }, [match, params]);

  const handleVoltar = () => {
    navigate("/embalagens");
  };

  const handleAdicionarProduto = () => {
    console.log("Adicionar produto à caixa:", caixa?.sigla);
  };

  const handleRemoverProduto = (id: string) => {
    setCaixa((prev) =>
      prev
        ? {
            ...prev,
            produtos: prev.produtos.filter((p) => p.id !== id),
          }
        : prev
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="h-8 w-40 bg-muted rounded animate-pulse" />
          <Card>
            <CardContent className="p-6 flex flex-col gap-3">
              <div className="h-4 w-full bg-muted rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!caixa) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">Caixa não encontrada.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={handleVoltar}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-tight">
                Caixa {caixa.sigla}
              </h1>
              <p className="text-sm text-muted-foreground">
                {caixa.descricao || "Caixa sem descrição registrada."}
              </p>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Badge
              variant={caixa.status === "Aberta" ? "outline" : "secondary"}
              className={`${
                caixa.status === "Aberta"
                  ? "border-emerald-500/60 text-emerald-400 text-[10px]"
                  : "text-[10px]"
              } px-2`}
            >
              {caixa.status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleAdicionarProduto}
            >
              <Plus className="h-4 w-4" />
              Adicionar produto
            </Button>
          </div>
        </div>

        {/* Detalhes */}
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Box className="h-4 w-4 text-primary" />
              Informações da Caixa
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Localização atual
                </span>
                <span>{caixa.localizacao || "Não informada"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Última atualização
                </span>
                <span className="text-xs text-muted-foreground">
                  {caixa.ultimaAtualizacao
                    ? new Date(caixa.ultimaAtualizacao).toLocaleString("pt-BR")
                    : "-"}
                </span>
              </div>
            </div>

            <Separator className="my-3" />

            <div className="flex flex-col gap-2">
              <h2 className="text-sm font-semibold flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Produtos associados ({caixa.produtos.length})
              </h2>

              {caixa.produtos.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhum produto vinculado a esta caixa.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead className="text-right">Qtd</TableHead>
                      <TableHead className="w-[1%]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {caixa.produtos.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">
                          {p.nome}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {p.codigo}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {p.categoria || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          {p.quantidade ?? "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoverProduto(p.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive/70" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

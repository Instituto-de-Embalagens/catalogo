import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import {
  ArrowLeft,
  Package,
  Tag,
  QrCode,
  Boxes,
  Info,
  Pencil,
} from "lucide-react";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Embalagem = {
  id: string;
  nome: string;
  codigo: string;
  categoria?: string;
  material?: string;
  status: "Em estoque" | "Em uso" | "Indisponível";
  caixaSigla?: string;
  localizacao?: string;
  descricao?: string;
  ultimaAtualizacao?: string;
};

export default function EmbalagemDetalhes() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/embalagens/:id");
  const id = params?.id;

  const [embalagem, setEmbalagem] = useState<Embalagem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!match || !id) return;

    // Mock temporário — substitua por fetch real:
    async function fetchEmbalagem() {
      setLoading(true);
      try {
        // Exemplo real:
        // const res = await fetch(`/api/embalagens/${id}`);
        // const data = await res.json();
        // setEmbalagem(data);

        const mock: Embalagem = {
          id,
          nome: "Garrafa PET 500ml Transparente",
          codigo: "GB-500TR",
          categoria: "Embalagem Primária",
          material: "PET",
          status: "Em estoque",
          caixaSigla: "CX-A01",
          localizacao: "Depósito Principal",
          descricao:
            "Embalagem utilizada para linha premium de bebidas. Transparente, reciclável e de alta resistência.",
          ultimaAtualizacao: "2025-11-08T10:45:00Z",
        };

        setEmbalagem(mock);
      } catch (error) {
        console.error("Erro ao carregar embalagem", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEmbalagem();
  }, [match, id]);

  const handleVoltar = () => navigate("/embalagens");
  const handleEditar = () => console.log("Editar embalagem:", id);
  const handleVerCaixa = (sigla: string) => navigate(`/caixa/${sigla}`);

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

  if (!embalagem) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <p className="text-muted-foreground">Embalagem não encontrada.</p>
        </div>
      </DashboardLayout>
    );
  }

  const {
    nome,
    codigo,
    categoria,
    material,
    status,
    caixaSigla,
    localizacao,
    descricao,
    ultimaAtualizacao,
  } = embalagem;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
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
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-tight">
                {nome}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono px-1.5 py-0.5 rounded bg-muted/60">
                  {codigo}
                </span>
                {categoria && (
                  <span className="px-1.5 py-0.5 rounded bg-muted/40">
                    {categoria}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Badge
              variant="outline"
              className={
                status === "Em estoque"
                  ? "border-emerald-500/60 text-emerald-400 text-[10px] px-2"
                  : status === "Em uso"
                  ? "border-amber-500/60 text-amber-400 text-[10px] px-2"
                  : "border-destructive/60 text-destructive text-[10px] px-2"
              }
            >
              {status}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleEditar}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Detalhes */}
          <Card className="md:col-span-2 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Detalhes da embalagem
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                {material && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Material
                    </span>
                    <span>{material}</span>
                  </div>
                )}
                {localizacao && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Localização
                    </span>
                    <span>{localizacao}</span>
                  </div>
                )}
                {caixaSigla && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Caixa associada
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-fit gap-1 px-2 text-xs"
                      onClick={() => handleVerCaixa(caixaSigla)}
                    >
                      <QrCode className="h-4 w-4" />
                      {caixaSigla}
                    </Button>
                  </div>
                )}
                {ultimaAtualizacao && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Última atualização
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(ultimaAtualizacao).toLocaleString("pt-BR")}
                    </span>
                  </div>
                )}
              </div>

              {descricao && (
                <>
                  <Separator className="my-2" />
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Descrição
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {descricao}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Informações adicionais */}
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                Status e observações
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Info className="h-3.5 w-3.5 mt-0.5 text-primary" />
                <p>
                  As embalagens associadas a uma <strong>caixa</strong> podem
                  ser rastreadas fisicamente por QR Code.  
                  Se essa embalagem for movida para outra caixa, o vínculo deve
                  ser atualizado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

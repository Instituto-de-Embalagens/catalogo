// src/pages/LocalizacaoDetalhes.tsx

import { useEffect, useState } from "react";
import { useLocation, useRoute } from "wouter";
import {
  ArrowLeft,
  MapPin,
  MapPinned,
  Pencil,
  Boxes,
  BadgeInfo,
  QrCode,
  Package,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Caixa = {
  sigla: string;
  descricao?: string;
  totalProdutos?: number;
};

type Localizacao = {
  id: string;
  nome: string;
  sigla: string;
  tipo?: string;
  ativa: boolean;
  capacidade?: string;
  responsavel?: string;
  descricao?: string;
  ultimaAtualizacao?: string;
  totalEmbalagens?: number;
  caixas?: Caixa[];
};

export default function LocalizacaoDetalhes() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/localizacoes/:id");
  const id = params?.id;

  const [loading, setLoading] = useState(true);
  const [localizacao, setLocalizacao] = useState<Localizacao | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (!match || !id) {
      setErro("Localização não encontrada.");
      setLoading(false);
      return;
    }

    async function fetchData() {
      try {
        setLoading(true);
        setErro(null);

        // TODO: trocar pelo fetch real:
        // const res = await fetch(`/api/localizacoes/${id}`);
        // if (!res.ok) throw new Error("Erro ao carregar detalhes.");
        // const data = await res.json();
        // setLocalizacao(data);

        const mock: Localizacao = {
          id,
          nome:
            id === "1"
              ? "Depósito Principal"
              : id === "2"
              ? "Área de Picking"
              : "Localização Exemplo",
          sigla:
            id === "1"
              ? "DEP-PRINC"
              : id === "2"
              ? "PICK-01"
              : `LOC-${id}`,
          tipo: id === "2" ? "Picking" : "Depósito",
          ativa: id !== "3",
          capacidade: "200 pallets / 1.500 caixas",
          responsavel: "Equipe Logística",
          descricao:
            "Área destinada ao armazenamento e movimentação de embalagens com rastreio via QR Code.",
          ultimaAtualizacao: "2025-11-05T14:12:00Z",
          totalEmbalagens: id === "2" ? 180 : 420,
          caixas: [
            {
              sigla: "CX-A01",
              descricao: "Caixa de produtos premium",
              totalProdutos: 120,
            },
            {
              sigla: "CX-A02",
              descricao: "Linha regular - lote 24B",
              totalProdutos: 96,
            },
          ],
        };

        setLocalizacao(mock);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os detalhes da localização.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [match, id]);

  const handleVoltar = () => {
    navigate("/localizacoes");
  };

  const handleEditar = () => {
    // Futuro:
    // navigate(`/localizacoes/${id}/editar`);
    console.log("Editar localização", id);
  };

  const handleVerCaixa = (sigla: string) => {
    navigate(`/caixa/${sigla}`);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="flex flex-col gap-1">
              <div className="h-4 w-40 bg-muted rounded animate-pulse" />
              <div className="h-3 w-64 bg-muted rounded animate-pulse" />
            </div>
          </div>
          <Card className="border-border/70 bg-card/90">
            <CardContent className="p-6 flex flex-col gap-4">
              <div className="h-4 w-48 bg-muted rounded animate-pulse" />
              <div className="h-3 w-full bg-muted rounded animate-pulse" />
              <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (erro || !localizacao) {
    return (
      <DashboardLayout>
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            className="w-fit gap-2 px-2"
            onClick={handleVoltar}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para localizações
          </Button>
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-6">
              <p className="text-sm text-destructive">
                {erro || "Localização não encontrada."}
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const {
    nome,
    sigla,
    tipo,
    ativa,
    capacidade,
    responsavel,
    descricao,
    ultimaAtualizacao,
    totalEmbalagens,
    caixas = [],
  } = localizacao;

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
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-tight">
                {nome}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono px-1.5 py-0.5 rounded bg-muted/60">
                  {sigla}
                </span>
                {tipo && (
                  <span className="px-1.5 py-0.5 rounded bg-muted/40">
                    {tipo}
                  </span>
                )}
                <span className="text-[10px]">
                  ID: <span className="font-mono">{id}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 items-center">
            <Badge
              variant={ativa ? "outline" : "destructive"}
              className={
                ativa
                  ? "border-emerald-500/60 text-emerald-400 text-[10px] px-2"
                  : "text-[10px] px-2"
              }
            >
              {ativa ? "Ativa" : "Inativa"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleEditar}
            >
              <Pencil className="h-4 w-4" />
              Editar localização
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Detalhes principais */}
          <Card className="md:col-span-2 bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <MapPinned className="h-4 w-4 text-primary" />
                Detalhes da localização
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Nome
                  </span>
                  <span className="font-medium">{nome}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground">
                    Sigla
                  </span>
                  <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted/60 inline-flex w-fit">
                    {sigla}
                  </span>
                </div>
                {tipo && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Tipo
                    </span>
                    <span>{tipo}</span>
                  </div>
                )}
                {capacidade && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Capacidade estimada
                    </span>
                    <span>{capacidade}</span>
                  </div>
                )}
                {responsavel && (
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      Responsável
                    </span>
                    <span>{responsavel}</span>
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
                      Observações
                    </span>
                    <p className="text-sm text-muted-foreground">
                      {descricao}
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Resumo / métricas */}
          <Card className="bg-card/95 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Boxes className="h-4 w-4 text-primary" />
                Resumo
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Total de embalagens nesta localização
                </span>
                <span className="font-semibold text-base">
                  {totalEmbalagens ?? 0}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">
                  Caixas vinculadas
                </span>
                <span className="font-semibold text-base">
                  {caixas.length}
                </span>
              </div>

              <Separator className="my-1" />

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <BadgeInfo className="h-3.5 w-3.5 mt-0.5 text-primary" />
                <p>
                  Vincule caixas a esta localização para rastrear fisicamente
                  onde cada conjunto de produtos está armazenado.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Caixas vinculadas */}
        <Card className="bg-card/95 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" />
              Caixas vinculadas à localização
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {caixas.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                Nenhuma caixa vinculada a esta localização.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sigla</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">
                      Produtos
                    </TableHead>
                    <TableHead className="w-[1%]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {caixas.map((cx) => (
                    <TableRow key={cx.sigla}>
                      <TableCell className="font-mono text-xs">
                        {cx.sigla}
                      </TableCell>
                      <TableCell className="text-sm">
                        {cx.descricao || "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {cx.totalProdutos ?? 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="gap-1 text-xs"
                          onClick={() => handleVerCaixa(cx.sigla)}
                        >
                          <QrCode className="h-4 w-4" />
                          Ver caixa
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

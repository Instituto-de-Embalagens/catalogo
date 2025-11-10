// src/pages/Localizacoes.tsx

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";

import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus } from "lucide-react";

type Localizacao = {
  id: string;
  nome: string;
  sigla: string;
  tipo?: string; // Ex: "Depósito", "CD", "Loja", "Área"
  ativa: boolean;
  ultimaAtualizacao?: string;
};

export default function Localizacoes() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([
    // Mock inicial só pra layout.
    // Depois substitui por dados reais da API.
    {
      id: "1",
      nome: "Depósito Principal",
      sigla: "DEP-PRINC",
      tipo: "Depósito",
      ativa: true,
      ultimaAtualizacao: "2025-11-01T10:30:00Z",
    },
    {
      id: "2",
      nome: "Área de Picking",
      sigla: "PICK-01",
      tipo: "Picking",
      ativa: true,
      ultimaAtualizacao: "2025-11-05T14:12:00Z",
    },
    {
      id: "3",
      nome: "Quarentena",
      sigla: "QUAR",
      tipo: "Controle de qualidade",
      ativa: false,
      ultimaAtualizacao: "2025-10-22T09:00:00Z",
    },
  ]);

  // Exemplo para integrar com sua API depois
  // useEffect(() => {
  //   async function fetchLocalizacoes() {
  //     try {
  //       setLoading(true);
  //       const res = await fetch("/api/localizacoes");
  //       const data = await res.json();
  //       setLocalizacoes(data);
  //     } catch (error) {
  //       console.error("Erro ao carregar localizações", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchLocalizacoes();
  // }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return localizacoes;
    const term = search.toLowerCase();
    return localizacoes.filter(
      (loc) =>
        loc.nome.toLowerCase().includes(term) ||
        loc.sigla.toLowerCase().includes(term) ||
        (loc.tipo && loc.tipo.toLowerCase().includes(term))
    );
  }, [search, localizacoes]);

  const handleNovaLocalizacao = () => {
    navigate("/localizacoes/nova");
  };

  const handleVerDetalhes = (loc: Localizacao) => {
    navigate(`/localizacoes/${loc.id}`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-semibold tracking-tight">
                Localizações
              </h1>
              <p className="text-sm text-muted-foreground">
                Gerencie áreas físicas onde as embalagens são armazenadas,
                movimentadas ou inspecionadas.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Buscar por nome, sigla ou tipo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full md:w-64"
            />
            <Button
              onClick={handleNovaLocalizacao}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nova localização</span>
            </Button>
          </div>
        </div>

        {/* Conteúdo */}
        <Card className="border-border/70 bg-card/95 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Localizações cadastradas
            </CardTitle>
            {loading && (
              <span className="text-xs text-muted-foreground">
                Carregando...
              </span>
            )}
          </CardHeader>

          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="p-6 text-sm text-muted-foreground">
                Nenhuma localização encontrada com esse filtro.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%]">Ativa</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Sigla</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Última atualização
                    </TableHead>
                    <TableHead className="w-[1%] text-right">
                      Ações
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((loc) => (
                    <TableRow
                      key={loc.id}
                      className="cursor-pointer hover:bg-accent/40 transition-colors"
                      onClick={() => handleVerDetalhes(loc)}
                    >
                      <TableCell>
                        {loc.ativa ? (
                          <Badge
                            variant="outline"
                            className="border-emerald-500/60 text-emerald-400 text-[10px] px-2 py-0.5"
                          >
                            Ativa
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="border-zinc-500/50 text-zinc-400 text-[10px] px-2 py-0.5"
                          >
                            Inativa
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {loc.nome}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {loc.sigla}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {loc.tipo || "-"}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                        {loc.ultimaAtualizacao
                          ? new Date(
                              loc.ultimaAtualizacao
                            ).toLocaleString("pt-BR")
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVerDetalhes(loc);
                          }}
                        >
                          Ver detalhes
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

import { useEffect, useState } from "react";
import { Package, Loader2, AlertCircle } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

type ProdutoNaCaixa = {
  id: string;
  nome: string;
  codigo: string;
  categoria?: string;
  quantidade?: number;
};

type CaixaConteudoTableProps = {
  caixaSigla: string;
};

export function CaixaConteudoTable({ caixaSigla }: CaixaConteudoTableProps) {
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [produtos, setProdutos] = useState<ProdutoNaCaixa[]>([]);

  useEffect(() => {
    if (!caixaSigla) return;

    async function fetchProdutos() {
      try {
        setLoading(true);
        setErro(null);

        // TODO: trocar pelo endpoint real:
        // const res = await fetch(`/api/caixas/${caixaSigla}/produtos`);
        // if (!res.ok) throw new Error("Erro ao carregar produtos");
        // const data = await res.json();
        // setProdutos(data);

        // Mock temporário:
        const mock: ProdutoNaCaixa[] = [
          {
            id: "p1",
            nome: "Garrafa PET 500ml Transparente",
            codigo: "GB-500TR",
            categoria: "Embalagem Primária",
            quantidade: 120,
          },
          {
            id: "p2",
            nome: "Tampa Plástica Azul 38mm",
            codigo: "TP-38AZ",
            categoria: "Acessório",
            quantidade: 120,
          },
        ];

        setProdutos(mock);
      } catch (e) {
        console.error(e);
        setErro("Não foi possível carregar os produtos desta caixa.");
      } finally {
        setLoading(false);
      }
    }

    fetchProdutos();
  }, [caixaSigla]);

  return (
    <Card className="bg-card/95 backdrop-blur-sm border-border/70">
      <CardHeader className="pb-2 flex flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-semibold">
            Produtos na caixa <span className="font-mono">{caixaSigla}</span>
          </CardTitle>
        </div>
        <Badge variant="outline" className="text-[10px] px-2">
          {produtos.length} itens
        </Badge>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando produtos...
          </div>
        ) : erro ? (
          <div className="flex items-center gap-2 px-4 py-4 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {erro}
          </div>
        ) : produtos.length === 0 ? (
          <div className="px-4 py-4 text-sm text-muted-foreground">
            Nenhum produto vinculado a esta caixa.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Qtd</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {produtos.map((p) => (
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

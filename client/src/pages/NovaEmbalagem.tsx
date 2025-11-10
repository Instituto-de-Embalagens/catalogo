import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Package, ArrowLeft, Plus, X } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NovaEmbalagem() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();

  const [material, setMaterial] = useState("");
  const [produto, setProduto] = useState("");
  const [marca, setMarca] = useState("");
  const [pais, setPais] = useState("");
  const [codigoBarras, setCodigoBarras] = useState("");
  const [tipoEmbalagem, setTipoEmbalagem] = useState("");
  const [seraUtilizadoEm, setSeraUtilizadoEm] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [fotos, setFotos] = useState<Array<{ linkDrive: string; descricao: string; ordem: number }>>([]);
  const [novaFotoLink, setNovaFotoLink] = useState("");
  const [novaFotoDescricao, setNovaFotoDescricao] = useState("");

  const { data: localizacoes } = trpc.localizacoes.list.useQuery();
  const [localizacaoSelecionada, setLocalizacaoSelecionada] = useState("");
  const [quantidade, setQuantidade] = useState("1");

  const createMutation = trpc.embalagens.create.useMutation({
    onSuccess: () => {
      toast.success("Embalagem cadastrada com sucesso!");
      utils.embalagens.list.invalidate();
      setLocation("/embalagens");
    },
    onError: (error) => {
      toast.error(`Erro ao cadastrar embalagem: ${error.message}`);
    },
  });

  const handleAddFoto = () => {
    if (!novaFotoLink) {
      toast.error("Link do Drive é obrigatório");
      return;
    }
    setFotos([...fotos, { linkDrive: novaFotoLink, descricao: novaFotoDescricao, ordem: fotos.length + 1 }]);
    setNovaFotoLink("");
    setNovaFotoDescricao("");
  };

  const handleRemoveFoto = (index: number) => {
    setFotos(fotos.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!material || !produto || !marca || !pais) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const localizacoesData = localizacaoSelecionada
      ? [{ localizacaoId: parseInt(localizacaoSelecionada), quantidade: parseInt(quantidade) }]
      : undefined;

    createMutation.mutate({
      material,
      produto,
      marca,
      pais,
      codigoBarras: codigoBarras || undefined,
      tipoEmbalagem: tipoEmbalagem || undefined,
      seraUtilizadoEm: seraUtilizadoEm || undefined,
      observacoes: observacoes || undefined,
      fotos: fotos.length > 0 ? fotos : undefined,
      localizacoes: localizacoesData,
    });
  };

  const podeGerenciar =
    user?.role === "super_admin" || user?.role === "admin" || user?.role === "gerente";

  if (!podeGerenciar) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg text-muted-foreground">Você não tem permissão para cadastrar embalagens.</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/embalagens")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="h-8 w-8" />
              Nova Embalagem
            </h1>
            <p className="text-muted-foreground mt-2">Cadastre uma nova embalagem no sistema</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais da embalagem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material">Material *</Label>
                  <Select value={material} onValueChange={setMaterial} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o material" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Plástico Rígido">Plástico Rígido</SelectItem>
                      <SelectItem value="Papel">Papel</SelectItem>
                      <SelectItem value="Aço">Aço</SelectItem>
                      <SelectItem value="Vidro">Vidro</SelectItem>
                      <SelectItem value="Alumínio">Alumínio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="produto">Produto *</Label>
                  <Input
                    id="produto"
                    value={produto}
                    onChange={(e) => setProduto(e.target.value)}
                    placeholder="Nome do produto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
                  <Input
                    id="marca"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    placeholder="Marca do produto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pais">País *</Label>
                  <Input
                    id="pais"
                    value={pais}
                    onChange={(e) => setPais(e.target.value)}
                    placeholder="País de origem"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigoBarras">Código de Barras</Label>
                  <Input
                    id="codigoBarras"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    placeholder="EAN ou código"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tipoEmbalagem">Tipo de Embalagem</Label>
                  <Input
                    id="tipoEmbalagem"
                    value={tipoEmbalagem}
                    onChange={(e) => setTipoEmbalagem(e.target.value)}
                    placeholder="Ex: garrafa, pote, caixa"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="seraUtilizadoEm">Será Utilizado Em</Label>
                <Input
                  id="seraUtilizadoEm"
                  value={seraUtilizadoEm}
                  onChange={(e) => setSeraUtilizadoEm(e.target.value)}
                  placeholder="Nome do livro ou projeto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Observações adicionais"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fotos (Google Drive)</CardTitle>
              <CardDescription>Adicione links do Google Drive para as fotos da embalagem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="novaFotoLink">Link do Google Drive</Label>
                  <Input
                    id="novaFotoLink"
                    value={novaFotoLink}
                    onChange={(e) => setNovaFotoLink(e.target.value)}
                    placeholder="https://drive.google.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="novaFotoDescricao">Descrição</Label>
                  <Input
                    id="novaFotoDescricao"
                    value={novaFotoDescricao}
                    onChange={(e) => setNovaFotoDescricao(e.target.value)}
                    placeholder="Ex: Vista frontal"
                  />
                </div>
              </div>
              <Button type="button" variant="outline" onClick={handleAddFoto}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Foto
              </Button>

              {fotos.length > 0 && (
                <div className="space-y-2">
                  <Label>Fotos Adicionadas ({fotos.length})</Label>
                  <div className="space-y-2">
                    {fotos.map((foto, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                        <div className="flex-1">
                          <p className="text-sm font-medium truncate">{foto.linkDrive}</p>
                          {foto.descricao && <p className="text-xs text-muted-foreground">{foto.descricao}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveFoto(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Localização</CardTitle>
              <CardDescription>Onde a embalagem será armazenada</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="localizacao">Caixa</Label>
                  <Select value={localizacaoSelecionada} onValueChange={setLocalizacaoSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma caixa" />
                    </SelectTrigger>
                    <SelectContent>
                      {localizacoes?.map((loc) => (
                        <SelectItem key={loc.id} value={loc.id.toString()}>
                          {loc.caixaSigla} - {loc.galpao} / {loc.andar} / {loc.prateleira}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center gap-4">
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Cadastrando..." : "Cadastrar Embalagem"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/embalagens")}>
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

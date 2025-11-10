import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Embalagens from "./pages/Embalagens";
import EmbalagemDetalhes from "./pages/EmbalagemDetalhes";
import NovaEmbalagem from "./pages/NovaEmbalagem";
import Localizacoes from "./pages/Localizacoes";
import LocalizacaoDetalhes from "./pages/LocalizacaoDetalhes";
import NovaLocalizacao from "./pages/NovaLocalizacao";
import Usuarios from "./pages/Usuarios";
import NovoUsuario from "@/pages/NovoUsuario";
import CaixaQRCode from "./pages/CaixaQRCode";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/embalagens"} component={Embalagens} />
      <Route path={"/embalagens/nova"} component={NovaEmbalagem} />
      <Route path={"/embalagens/:id"} component={EmbalagemDetalhes} />
      <Route path={"/localizacoes"} component={Localizacoes} />
      <Route path={"/localizacoes/nova"} component={NovaLocalizacao} />
      <Route path={"/localizacoes/:id"} component={LocalizacaoDetalhes} />
      <Route path={"/usuarios"} component={Usuarios} />
      <Route path={"/usuarios/novo"} component={NovoUsuario} />
      <Route path={"/caixa/:sigla"} component={CaixaQRCode} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

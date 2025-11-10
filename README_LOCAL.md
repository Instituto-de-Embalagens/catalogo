# Sistema de Catálogo de Embalagens - Configuração Local

## Pré-requisitos

- Node.js 18+ instalado
- MySQL ou TiDB instalado e rodando
- pnpm instalado (`npm install -g pnpm`)

## Configuração do Ambiente Local

### 1. Instalar Dependências

```bash
pnpm install
```

### 2. Configurar Banco de Dados

Crie um banco de dados MySQL:

```sql
CREATE DATABASE packaging_catalog;
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database Configuration
DATABASE_URL=mysql://root:password@localhost:3306/packaging_catalog

# JWT Secret (gere uma string aleatória segura)
JWT_SECRET=sua-chave-secreta-aqui-minimo-32-caracteres

# Configuração de Autenticação (para desenvolvimento local, use valores mock)
VITE_APP_ID=local-dev
OAUTH_SERVER_URL=http://localhost:3000
VITE_OAUTH_PORTAL_URL=http://localhost:3000
OWNER_OPEN_ID=local-admin
OWNER_NAME=Admin Local

# App Configuration
VITE_APP_TITLE=Sistema de Catálogo de Embalagens
VITE_APP_LOGO=https://placehold.co/128x128/E1E7EF/1F2937?text=📦

# APIs (para desenvolvimento local, deixe vazios ou use valores mock)
BUILT_IN_FORGE_API_URL=http://localhost:3000
BUILT_IN_FORGE_API_KEY=mock-key
VITE_FRONTEND_FORGE_API_KEY=mock-key
VITE_FRONTEND_FORGE_API_URL=http://localhost:3000

# Analytics (opcional)
VITE_ANALYTICS_ENDPOINT=
VITE_ANALYTICS_WEBSITE_ID=
```

### 4. Executar Migrations

```bash
pnpm db:push
```

Isso criará todas as tabelas necessárias no banco de dados.

### 5. Iniciar o Servidor de Desenvolvimento

```bash
pnpm dev
```

O sistema estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
packaging_catalog/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas do sistema
│   │   ├── components/    # Componentes reutilizáveis
│   │   └── lib/           # Configurações (tRPC, etc.)
├── server/                # Backend Express + tRPC
│   ├── routers.ts         # Rotas da API
│   ├── db.ts              # Queries do banco de dados
│   └── _core/             # Configurações do servidor
├── drizzle/               # Schema e migrations do banco
└── shared/                # Tipos compartilhados
```

## Funcionalidades Implementadas

- ✅ Autenticação com controle de permissões (4 níveis)
- ✅ CRUD de embalagens com soft delete
- ✅ Upload de fotos via links do Google Drive
- ✅ Mapeamento logístico (Galpão > Andar > Prateleira > Caixa)
- ✅ Filtros avançados de pesquisa
- ✅ Auditoria de operações
- ✅ Dashboard com estatísticas

## Níveis de Permissão

1. **Super Admin** - Acesso total, incluindo deletar permanentemente
2. **Admin** - Gerenciar embalagens e usuários (exceto deletar permanentemente)
3. **Gerente** - CRUD de embalagens, criar usuários na sua equipe
4. **Visualizador** - Apenas visualizar embalagens

## Troubleshooting

### Erro: "Invalid URL" ao iniciar

Certifique-se de que todas as variáveis de ambiente estão configuradas corretamente no arquivo `.env`.

### Erro de conexão com o banco de dados

Verifique se o MySQL está rodando e se as credenciais no `DATABASE_URL` estão corretas.

### Erro ao executar migrations

Execute `pnpm db:push` novamente. Se o erro persistir, delete o banco de dados e crie novamente.

## Suporte

Para dúvidas ou problemas, consulte a documentação completa ou entre em contato com o administrador do sistema.

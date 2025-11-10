# TODO - Sistema de Catálogo de Embalagens

## Fase 1: Modelagem do Banco de Dados e Estrutura Inicial
- [x] Criar tabelas de usuários com papéis e equipes
- [x] Criar tabela de embalagens com soft delete
- [x] Criar tabela de fotos de embalagens
- [x] Criar tabela de localizações (mapeamento logístico)
- [x] Criar tabela de relação embalagem-localização
- [x] Criar tabela de auditoria
- [x] Executar migrations (pnpm db:push)

## Fase 2: Implementação da Autenticação e Sistema de Papéis/Equipes
- [x] Implementar sistema de papéis (Super Admin, Admin, Gerente, Visualizador)
- [x] Implementar sistema de equipes (Criativo, Logística, Administração)
- [x] Criar procedures protegidas por papel
- [x] Implementar CRUD de usuários
- [x] Implementar CRUD de equipes

## Fase 3: Desenvolvimento do Backend - CRUD de Embalagens e Localizações
- [x] Implementar listagem de embalagens com filtros
- [x] Implementar criação de embalagens
- [x] Implementar atualização de embalagens
- [x] Implementar soft delete de embalagens
- [x] Implementar recuperação de embalagens deletadas
- [x] Implementar CRUD de localizações
- [x] Implementar auditoria de operações

## Fase 4: Desenvolvimento do Frontend - Dashboard e Navegação
- [x] Criar layout do dashboard com sidebar
- [x] Implementar página inicial (Home)
- [x] Implementar listagem de embalagens
- [ ] Implementar formulário de cadastro de embalagens
- [ ] Implementar página de detalhes de embalagens
- [ ] Implementar gerenciamento de usuários
- [ ] Implementar gerenciamento de equipes

## Fase 5: Implementação de Fotos, QR Codes e Mapeamento Logístico
- [ ] Implementar adição de fotos (links do Drive)
- [ ] Implementar visualização de fotos
- [ ] Implementar geração de QR codes
- [ ] Implementar visualização de caixa via QR code
- [ ] Implementar mapeamento logístico (Galpão > Andar > Prateleira > Caixa)
- [ ] Implementar movimentação de embalagens entre caixas

## Fase 6: Implementação de Pesquisa, Filtros e Relatórios
- [ ] Implementar busca por texto livre
- [ ] Implementar filtros avançados (Material, País, Marca, Caixa, etc.)
- [ ] Implementar relatórios (por material, por localização, etc.)
- [ ] Implementar exportação de dados (CSV)

## Fase 7: Testes, Refinamentos e Entrega Final
- [ ] Testar fluxos principais
- [ ] Testar permissões e papéis
- [ ] Testar soft delete e recuperação
- [ ] Revisar UX/UI
- [ ] Otimizar performance
- [ ] Criar checkpoint final
- [ ] Documentar sistema


## Bugs e Correções
- [x] Corrigir erro de variáveis de ambiente ausentes ao rodar localmente
- [x] Criar arquivo README_LOCAL.md com instruções de configuração
- [x] Adicionar validação de variáveis de ambiente no código

## Modo de Desenvolvimento Local
- [x] Criar rota de login automático para desenvolvimento local
- [x] Adicionar usuário admin padrão no banco de dados
- [x] Atualizar página Home para usar login de desenvolvimento

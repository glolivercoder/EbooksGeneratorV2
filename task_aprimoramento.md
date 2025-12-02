# Aprimoramento Ebook Generator V2

## Checklist de Desenvolvimento

- [x] Revisar layout atual do gerador (PromptOptimizer, OutlineEditor, GenerationProgress, BookEditor)
- [x] Manter PromptOptimizer no topo e deixar editor de livro sempre visível abaixo
- [x] Criar sidebar fixa (visível após otimização do prompt e geração do outline) com:
  - [x] Lista de capítulos do livro (títulos e temas principais)
  - [x] Edição manual de tópicos/assuntos por capítulo
  - [x] Seção de "Links de pesquisa" usados pelo agente, com possibilidade de edição
- [ ] Detalhar e implementar fluxo de agentes:
  - [ ] Agente orquestrador analisa o prompt, otimiza e confirma com o usuário
  - [ ] Enviar prompt otimizado para agente de pesquisa
  - [ ] Agente de pesquisa consulta RAG e retorna links de pesquisa
  - [ ] Exibir links retornados na parte de baixo do sidebar (com edição manual)
- [x] Integrar configurações de OpenRouter, Gemini e Pixabay seguindo padrão do projeto Llinguaflow_bug
- [x] Priorizar implantação/correção dos LLM models usados pelo sistema (OpenRouter / Gemini) antes dos fluxos avançados
- [x] Reaproveitar/ajustar tela de configurações (API Keys + testes de conexão)
- [ ] Corrigir e padronizar chamadas HTTP/axios/fetch para testes de conexão
- [ ] Garantir mensagens de erro claras na UI quando testes falharem
- [ ] Criar e usar livro de teste com tema "Aprendendo usando a Tecnologia do Notebook LM" para validar fluxo (otimizador → pesquisa → RAG → sidebar)
- [ ] Testar fluxo completo: configurar chaves, otimizar prompt, gerar outline, editar capítulos, gerar livro
- [ ] Atualizar documentação rápida de uso se necessário

### Persistência local, backup e histórico

- [ ] Definir e implementar armazenamento local compatível com o projeto e com o RAG (ex.: IndexedDB/Dexie ou base no backend) para:
  - [ ] Configurações de agentes / RAG
  - [ ] Prompts originais usados pelo usuário
  - [ ] Prompts otimizados pelo otimizador
  - [ ] Outlines gerados
  - [ ] Conteúdo completo de cada livro gerado
- [ ] Criar mecanismo de backup dos dados locais (configurações + histórico de livros e prompts)
- [ ] Adicionar guia "Backup" nas Configurações com:
  - [ ] Opção para escolher a pasta/local de backup
  - [ ] Backup manual sob demanda
  - [ ] Opção de backup automático (intervalo configurável)

### Editor de texto avançado

- [x] Instalar e integrar o editor Tiptap no BookEditor (substituindo o `<pre>` atual por editor rich text)
- [ ] Manter o editor Tiptap sempre visível (mesmo sem livro criado) para testar configurações
- [ ] Adicionar extensões open source do Tiptap conforme necessário
  - [ ] Basear-se na lista oficial de extensões: https://tiptap.dev/docs/editor/extensions/overview?filter=opensource
  - [x] Habilitar pelo menos: headings, bold/italic, lists, code blocks, links

### Layout e Sidebar (URGENTE)

- [ ] **Verificar e corrigir a exibição do sidebar direito (escopo dos capítulos) após gerar outline**
  - [ ] Se necessário, criar aba separada no header para alternar entre etapas

### Seletor de Modelos LLM (CONCLUÍDO)

- [x] Criar botão "LLM Models" no header
- [x] Implementar pop-up modal para seleção de modelos com:
  - [x] Dropdown para selecionar provedor (OpenRouter, Gemini, OpenAI)
  - [x] Para OpenRouter:
    - [x] Dropdown com lista de modelos disponíveis
    - [x] Campo para filtrar por empresa
    - [x] Campo para filtrar por tipo (geração de texto, imagem, STT, etc)
    - [x] Checkboxes para filtrar modelos pagos/gratuitos
  - [x] Configuração separada para orquestrador e agentes
- [x] Adicionar suporte para OpenAI:
  - [x] Adicionar OPENAI_API_KEY no .env
  - [x] Adicionar configuração no backend/settings.py
  - [x] Adicionar campo na aba Configurações
  - [x] Integrar OpenAI no llm_client.py
  - [x] Testar conexão OpenAI

### Recursos Perdidos do Editor Tiptap (PRIORIDADE MÁXIMA)

- [ ] **Restaurar funcionalidades do editor Tiptap que desapareceram**
  - [ ] Editor deve aparecer após gerar outline
  - [ ] Recuperar barra de ferramentas completa (bold, italic, headers, lists, etc)
  - [ ] Habilitar modo de edição para cada capítulo
  - [ ] Salvar conteúdo automaticamente
  - [ ] Sincronizar com outline gerado

### Histórico de Outlines (PRIORIDADE MÁXIMA)

- [ ] **Criar sistema de histórico com backup automático**
  - [ ] Favicon/histórico no header para acessar outlines salvos
  - [ ] Backup automático de todos os outlines gerados
  - [ ] Visualização em lista com título, data e preview
  - [ ] Opção de restaurar outline anterior
  - [ ] Busca e filtros no histórico
  - [ ] Exportar/importar outlines

### Correções Críticas

- [ ] **Prompt inicial não está sendo obedecido**
  - [ ] Verificar se o prompt otimizado está sendo usado corretamente
  - [ ] Garantir que número de capítulos e páginas seja respeitado
  - [ ] Validar estrutura do outline gerado

- [ ] **Recuperar funcionalidades do outline original**
  - [ ] Buscar semântica nos arquivos para encontrar funcionalidades perdidas
  - [ ] Restaurar sidebar direito com escopo dos capítulos
  - [ ] Reimplementar navegação entre capítulos
  - [ ] Integrar no llm_client.py
  - [ ] Preferência: layout central com editor Tiptap entre sidebar esquerdo (escopo do livro) e sidebar direito (escopo dos capítulos)
- [ ] **Verificar e corrigir a exibição da aba “Backup” nas Configurações (frontend)**
- [ ] Ajustar layout para:
  - Sidebar esquerdo: escopo do livro
  - Centro: editor Tiptap (sempre visível)
  - Sidebar direito: escopo dos capítulos (visível após outline)

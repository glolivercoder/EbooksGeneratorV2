"""
Agente Orquestrador usando LangGraph
Gerencia geração contextual capítulo-por-capítulo
"""
from typing import Dict, Any, List, Optional, TypedDict
from langgraph.graph import StateGraph, END
from langchain.schema import HumanMessage, SystemMessage
import asyncio

from services.llm_client import llm_client, TaskType
from agents.deep_research import research_agent
from agents.dynamic_agent_manager import agent_manager, Domain
from rag.graph_rag import GraphRAG
from prompts.enhanced_prompt import build_chapter_prompt
import uuid
import json


class OrchestratorState(TypedDict):
    """Estado do orquestrador"""
    book_id: str
    topic: str
    target_audience: str
    current_chapter: int
    total_chapters: int
    chapter_title: str
    depth_level: int
    citation_style: str
    
    # Contexto acumulado
    previous_chapters: List[str]
    covered_concepts: List[str]
    knowledge_gaps: List[str]
    
    # Dados intermediários
    research_results: Optional[str]
    rag_context: Optional[str]
    mental_graph_insights: Optional[Dict[str, Any]]
    
    # Resultado final
    generated_content: Optional[str]
    metadata: Optional[Dict[str, Any]]
    
    # Controle de fluxo
    validation_passed: bool
    retry_count: int


class BookOrchestratorAgent:
    """
    Orquestrador principal para geração de ebooks
    Usa LangGraph para workflow contextual
    """
    
    def __init__(self):
        self.graph = self._build_graph()
        self.rag_systems: Dict[str, GraphRAG] = {}
        self.active_books: Dict[str, Dict[str, Any]] = {}  # book_id -> status
    
    def _build_graph(self) -> StateGraph:
        """Constrói o grafo de workflow"""
        
        workflow = StateGraph(OrchestratorState)
        
        # Definir nós
        workflow.add_node("retrieve_context", self._retrieve_context)
        workflow.add_node("analyze_mental_graph", self._analyze_mental_graph)
        workflow.add_node("identify_gaps", self._identify_gaps)
        workflow.add_node("deep_research", self._deep_research)
        workflow.add_node("generate_chapter", self._generate_chapter)
        workflow.add_node("validate_content", self._validate_content)
        workflow.add_node("index_to_rag", self._index_to_rag)
        
        # Definir fluxo
        workflow.set_entry_point("retrieve_context")
        
        workflow.add_edge("retrieve_context", "analyze_mental_graph")
        workflow.add_edge("analyze_mental_graph", "identify_gaps")
        workflow.add_edge("identify_gaps", "deep_research")
        workflow.add_edge("deep_research", "generate_chapter")
        workflow.add_edge("generate_chapter", "validate_content")
        
        # Decisão de validação
        workflow.add_conditional_edges(
            "validate_content",
            self._should_retry,
            {
                "retry": "generate_chapter",  # Tentar novamente
                "success": "index_to_rag",  # Sucesso
                "fail": END  # Falha total
            }
        )
        
        workflow.add_edge("index_to_rag", END)
        
        return workflow.compile()
    
    async def generate_chapter(
        self,
        book_id: str,
        chapter_number: int,
        chapter_title: str,
        topic: str,
        target_audience: str = "estudantes de graduação",
        total_chapters: int = 10,
        depth_level: int = 3,
        citation_style: str = "ABNT"
    ) -> Dict[str, Any]:
        """Gera um capítulo completo"""
        
        # Inicializar ou recuperar RAG para este livro
        if book_id not in self.rag_systems:
            self.rag_systems[book_id] = GraphRAG(book_id)
        
        # Estado inicial
        initial_state: OrchestratorState = {
            "book_id": book_id,
            "topic": topic,
            "target_audience": target_audience,
            "current_chapter": chapter_number,
            "total_chapters": total_chapters,
            "chapter_title": chapter_title,
            "depth_level": depth_level,
            "citation_style": citation_style,
            "previous_chapters": [],
            "covered_concepts": [],
            "knowledge_gaps": [],
            "research_results": None,
            "rag_context": None,
            "mental_graph_insights": None,
            "generated_content": None,
            "metadata": None,
            "validation_passed": False,
            "retry_count": 0
        }
        
        # Executar workflow
        final_state = await self.graph.ainvoke(initial_state)
        
        return {
            "chapter_number": chapter_number,
            "chapter_title": chapter_title,
            "content": final_state.get("generated_content"),
            "metadata": final_state.get("metadata"),
            "validation_passed": final_state.get("validation_passed")
        }
    
    async def _retrieve_context(self, state: OrchestratorState) -> OrchestratorState:
        """Recupera contexto de capítulos anteriores"""
        
        book_id = state["book_id"]
        current_chapter = state["current_chapter"]
        
        if current_chapter == 1:
            # Primeiro capítulo, sem contexto anterior
            state["rag_context"] = "Este é o primeiro capítulo do livro."
            return state
        
        # Recuperar capítulos anteriores do RAG
        rag = self.rag_systems[book_id]
        
        # Buscar capítulos
        previous_nodes = rag.retrieve_chapters(1, current_chapter - 1)
        state["previous_chapters"] = [node.content for node in previous_nodes]
        
        # Buscar contexto relevante via similarity search
        query = f"Contexto relevante para capítulo: {state['chapter_title']}"
        docs = rag.retrieve(query, k=5)
        state["rag_context"] = "\n\n".join([doc.page_content for doc in docs])
        
        return state
    
    async def _analyze_mental_graph(self, state: OrchestratorState) -> OrchestratorState:
        """Analisa fluxo narrativo do mental graph"""
        
        book_id = state["book_id"]
        rag = self.rag_systems[book_id]
        
        # Recuperar capítulos para análise
        chapters = rag.retrieve_chapters(1, state["current_chapter"] - 1)
        
        if chapters:
            # Analisar fluxo narrativo
            analysis = rag.analyze_narrative_flow(chapters)
            state["mental_graph_insights"] = analysis
            state["covered_concepts"] = analysis["covered_concepts"]
        else:
            state["mental_graph_insights"] = {
                "covered_concepts": [],
                "narrative_arc": "beginning"
            }
            state["covered_concepts"] = []
        
        return state
    
    async def _identify_gaps(self, state: OrchestratorState) -> OrchestratorState:
        """Identifica lacunas de conhecimento"""
        
        book_id = state["book_id"]
        rag = self.rag_systems[book_id]
        
        # Identificar gaps
        gaps = rag.mental_graph.identify_gaps()
        state["knowledge_gaps"] = gaps if gaps else []
        
        return state
    
    async def _deep_research(self, state: OrchestratorState) -> OrchestratorState:
        """Executa pesquisa profunda sobre o tema"""
        
        query = f"{state['topic']}: {state['chapter_title']}"
        
        # Pesquisar
        results = await research_agent.research(
            query=query,
            academic_only=True,
            max_results=10
        )
        
        state["research_results"] = results["synthesis"]
        
        return state
    
    async def _generate_chapter(self, state: OrchestratorState) -> OrchestratorState:
        """Gera conteúdo do capítulo usando LLM"""
        
        # Construir prompt contextual
        prompt = build_chapter_prompt(
            chapter_number=state["current_chapter"],
            chapter_title=state["chapter_title"],
            topic=state["topic"],
            target_audience=state["target_audience"],
            rag_context=state.get("rag_context", ""),
            research_results=state.get("research_results", ""),
            previous_chapters_summary="\n".join(state["previous_chapters"][:3]),
            covered_concepts=state.get("covered_concepts", []),
            knowledge_gaps=state.get("knowledge_gaps", []),
            depth_level=state["depth_level"],
            citation_style=state["citation_style"]
        )
        
        # Gerar com LLM
        try:
            result = await llm_client.generate(
                prompt=prompt,
                task_type=TaskType.GENERATION,
                max_tokens=4000,
                temperature=0.7
            )
            
            state["generated_content"] = result["content"]
            state["metadata"] = {
                "model": result["model"],
                "provider": result["provider"],
                "tokens": result.get("tokens", {}),
                "cost": result.get("cost", 0)
            }
            
        except Exception as e:
            state["generated_content"] = f"Erro na geração: {str(e)}"
            state["metadata"] = {"error": str(e)}
        
        return state
    
    async def _validate_content(self, state: OrchestratorState) -> OrchestratorState:
        """Valida conteúdo gerado"""
        
        content = state.get("generated_content", "")
        
        # Validações básicas
        if not content or len(content) < 500:
            state["validation_passed"] = False
            return state
        
        # TODO: Validações mais sofisticadas
        # - Verificar citações
        # - Checar contradições com capítulos anteriores
        # - Validar estrutura
        
        state["validation_passed"] = True
        return state
    
    def _should_retry(self, state: OrchestratorState) -> str:
        """Decide se deve tentar novamente"""
        
        if state["validation_passed"]:
            return "success"
        
        if state["retry_count"] >= 2:
            return "fail"
        
        state["retry_count"] += 1
        return "retry"
    
    async def _index_to_rag(self, state: OrchestratorState) -> OrchestratorState:
        """Indexa capítulo gerado no RAG"""
        
        book_id = state["book_id"]
        rag = self.rag_systems[book_id]
        
        # Adicionar capítulo ao RAG
        rag.add_chapter(
            chapter_number=state["current_chapter"],
            content=state["generated_content"],
            metadata={
                "title": state["chapter_title"],
                "topic": state["topic"],
                **state.get("metadata", {})
            }
        )
        
        return state


    async def optimize_prompt(self, user_prompt: str) -> Dict[str, Any]:
        """
        Otimiza o prompt do usuário usando LLM
        
        Args:
            user_prompt: Prompt inicial do usuário
            
        Returns:
            Dict com prompt otimizado e sugestões
        """
        optimization_prompt = f"""
Você é um especialista em criação de ebooks técnicos de alta qualidade.

O usuário forneceu este prompt inicial para um ebook:
"{user_prompt}"

Sua tarefa é otimizar e expandir este prompt para criar um ebook rico em detalhes. Retorne um JSON com:

{{
  "optimized_prompt": "<prompt melhorado e detalhado>",
  "suggested_title": "<título sugerido para o ebook>",
  "target_audience": "<público-alvo ideal>",
  "key_topics": ["tópico1", "tópico2", ...],
  "estimated_chapters": <número estimado de capítulos>,
  "suggestions": ["sugestão 1", "sugestão 2", ...]
}}

O prompt otimizado deve:
- Ser específico e detalhado
- Incluir o nível de profundidade desejado
- Mencionar áreas-chave a serem cobertas
- Especificar o estilo/abordagem (técnica, prática, teórica, etc)
"""
        
        try:
            result = await llm_client.generate(
                prompt=optimization_prompt,
                task_type=TaskType.ANALYSIS,
                max_tokens=1500,
                temperature=0.7
            )
            
            # Parse JSON response
            content = result["content"]
            # Remove markdown code blocks if present
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            # Remove caracteres de controle e limpa o conteúdo
            import re
            # Remove caracteres de controle exceto \n, \r, \t
            content = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', content)
            # Remove espaços em branco problemáticos
            content = content.strip()
            
            try:
                optimization = json.loads(content)
            except json.JSONDecodeError as e:
                # Tenta corrigir problemas comuns no JSON
                print(f"Erro no JSON: {e}")
                print(f"Conteúdo bruto: {repr(content)}")
                # Remove caracteres que não são ASCII
                content = content.encode('ascii', 'ignore').decode('ascii')
                # Tenta fazer parse novamente
                try:
                    optimization = json.loads(content)
                except json.JSONDecodeError as e2:
                    # Se ainda falhar, retorna um erro mais detalhado
                    return {
                        "status": "error",
                        "error": f"Invalid JSON response: {str(e2)}",
                        "raw_content": content[:500]  # Primeiros 500 chars para debug
                    }
            
            return {
                "status": "success",
                **optimization
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "optimized_prompt": user_prompt,  # Fallback
                "suggestions": ["Erro ao otimizar prompt. Use o prompt original."]
            }
    
    async def generate_book_outline(self, prompt: str, target_audience: str = "profissionais") -> Dict[str, Any]:
        """
        Gera o escopo completo do livro (outline) com todos os capítulos
        
        Args:
            prompt: Prompt (pode ser otimizado ou original)
            target_audience: Público-alvo
            
        Returns:
            Dict com outline estruturado do livro
        """
        # Detectar domínios para subagentes
        domains = agent_manager.detect_domain(prompt)
        
        outline_prompt = f"""
Crie um escopo completo e detalhado para um ebook técnico baseado neste prompt:

"{prompt}"

Público-alvo: {target_audience}
Domínios detectados: {[d.value for d in domains]}

Retorne um JSON com a seguinte estrutura:

{{
  "book_title": "<título do livro>",
  "refined_prompt": "<versão refinada do prompt>",
  "total_chapters": <número>,
  "chapters": [
    {{
      "number": 1,
      "title": "<título do capítulo>",
      "description": "<o que será abordado em 2-3 frases>",
      "key_topics": ["tópico1", "tópico2"],
      "dependencies": [],  // números dos capítulos anteriores necessários
      "estimated_pages": <número>
    }},
    // ... mais capítulos
  ],
  "research_areas": ["área 1", "área 2"],  // áreas para pesquisa profunda
  "required_libraries": ["lib1", "lib2"]  // bibliotecas Python que podem ser úteis
}}

Critérios:
- Entre 8-15 capítulos
- Progressão lógica (dos fundamentos ao avançado)
- Cada capítulo deve ter propósito claro
- Incluir capítulos práticos com exemplos
- Último capítulo deve ser conclusão/próximos passos
"""
        
        try:
            result = await llm_client.generate(
                prompt=outline_prompt,
                task_type=TaskType.ANALYSIS,
                max_tokens=3000,
                temperature=0.6
            )
            
            # Parse JSON
            content = result["content"]
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
            elif "```" in content:
                content = content.split("```")[1].split("```")[0].strip()
            
            outline = json.loads(content)
            
            # Adicionar metadata
            outline["detected_domains"] = [d.value for d in domains]
            outline["status"] = "success"
            
            return outline
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
                "book_title": "Ebook",
                "chapters": []
            }
    
    async def generate_full_book(
        self,
        outline: Dict[str, Any],
        book_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Gera o livro completo baseado no outline
        
        Este é o pipeline master que orquestra tudo:
        1. Cria subagentes para domínios detectados
        2. Executa pesquisa profunda
        3. Gera cada capítulo sequencialmente
        4. Estrutura tudo no RAG
        
        Args:
            outline: Outline gerado por generate_book_outline()
            book_id: ID opcional do livro (gerado se None)
            
        Returns:
            Dict com status e book_id para tracking
        """
        if book_id is None:
            book_id = str(uuid.uuid4())
        
        # Inicializar RAG para este livro
        if book_id not in self.rag_systems:
            self.rag_systems[book_id] = GraphRAG(book_id)
        
        # Registrar livro ativo
        self.active_books[book_id] = {
            "status": "generating",
            "outline": outline,
            "progress": {
                "current_chapter": 0,
                "total_chapters": outline["total_chapters"],
                "chapters_completed": [],
                "current_stage": "initializing"
            },
            "chapters": []
        }
        
        # Detectar e criar subagentes
        if "detected_domains" in outline:
            domains_str = outline["detected_domains"]
            domains = [Domain(d) for d in domains_str]
            
            # Obter bibliotecas recomendadas
            recommended_libs = agent_manager.get_recommended_libraries(domains)
            
            # Criar agentes especializados
            for domain in domains:
                domain_libs = [lib for lib in recommended_libs if agent_manager.is_library_safe(lib)]
                if domain_libs:
                    agent_manager.create_specialist_agent(
                        domain=domain,
                        libraries=domain_libs[:3],  # Top 3
                        research_query=outline.get("refined_prompt", "")
                    )
        
        # Gerar capítulos sequencialmente
        chapters = outline.get("chapters", [])
        
        for chapter_info in chapters:
            chapter_number = chapter_info["number"]
            
            # Atualizar progresso
            self.active_books[book_id]["progress"]["current_chapter"] = chapter_number
            self.active_books[book_id]["progress"]["current_stage"] = "generating"
            
            # Gerar capítulo usando workflow existente
            result = await self.generate_chapter(
                book_id=book_id,
                chapter_number=chapter_number,
                chapter_title=chapter_info["title"],
                topic=outline.get("book_title", "Ebook"),
                target_audience=outline.get("target_audience", "profissionais"),
                total_chapters=outline["total_chapters"]
            )
            
            # Salvar capítulo
            self.active_books[book_id]["chapters"].append(result)
            self.active_books[book_id]["progress"]["chapters_completed"].append(chapter_number)
        
        # Marcar como completo
        self.active_books[book_id]["status"] = "completed"
        self.active_books[book_id]["progress"]["current_stage"] = "completed"
        
        return {
            "status": "completed",
            "book_id": book_id,
            "message": f"Livro '{outline.get('book_title')}' gerado com sucesso!"
        }
    
    def get_book_status(self, book_id: str) -> Dict[str, Any]:
        """
        Retorna status atual da geração do livro
        """
        if book_id not in self.active_books:
            return {
                "status": "not_found",
                "error": f"Book ID {book_id} not found"
            }
        
        book = self.active_books[book_id]
        
        return {
            "status": book["status"],
            "progress": book["progress"],
            "outline": book["outline"],
            "chapters_count": len(book["chapters"])
        }
    
    def get_book(self, book_id: str) -> Dict[str, Any]:
        """
        Retorna livro completo gerado
        """
        if book_id not in self.active_books:
            return {
                "status": "not_found",
                "error": f"Book ID {book_id} not found"
            }
        
        book = self.active_books[book_id]
        
        return {
            "status": book["status"],
            "outline": book["outline"],
            "chapters": book["chapters"],
            "progress": book["progress"]
        }


# Instância global
orchestrator = BookOrchestratorAgent()

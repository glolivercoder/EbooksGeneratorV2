"""
Sistema RAG com Mental Graph usando LangGraph
Mantém contexto e estrutura do livro capítulo por capítulo
"""
from typing import List, Dict, Any, Optional
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document
from dataclasses import dataclass, field
import pickle
from pathlib import Path


@dataclass
class ConceptNode:
    """Nó representando um conceito no mental graph"""
    id: str
    type: str  # "chapter", "concept", "definition", "example", "citation"
    content: str
    chapter_number: Optional[int] = None
    section: Optional[str] = None
    importance: float = 0.5
    verified: bool = False
    sources: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ConceptEdge:
    """Aresta representando relação entre conceitos"""
    source_id: str
    target_id: str
    relation_type: str  # "prerequisite", "references", "contradicts", "elaborates", "exemplifies"
    strength: float = 1.0


class BookMentalGraph:
    """
    Mental Graph para manter estrutura e relações do livro
    Integrado com vector store FAISS para retrieval semântico
    """
    
    def __init__(self, book_id: str = "default"):
        self.book_id = book_id
        self.nodes: Dict[str, ConceptNode] = {}
        self.edges: List[ConceptEdge] = []
        
        # Inicializar embeddings
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        
        # Inicializar vector store
        self.vectorstore: Optional[FAISS] = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
    
    def add_concept(self, node: ConceptNode):
        """Adiciona um conceito ao grafo"""
        self.nodes[node.id] = node
    
    def add_relation(self, edge: ConceptEdge):
        """Adiciona uma relação entre conceitos"""
        self.edges.append(edge)
    
    def add_chapter(self, chapter_number: int, content: str, metadata: Dict[str, Any] = None):
        """
        Adiciona um capítulo completo ao RAG e Mental Graph
        """
        # 1. Criar nó do capítulo
        chapter_node = ConceptNode(
            id=f"chapter_{chapter_number}",
            type="chapter",
            content=content[:500],  # Summary
            chapter_number=chapter_number,
            importance=1.0,
            verified=True,
            metadata=metadata or {}
        )
        self.add_concept(chapter_node)
        
        # 2. Quebrar conteúdo em chunks
        chunks = self.text_splitter.split_text(content)
        
        # 3. Criar documentos para vector store
        documents = []
        for i, chunk in enumerate(chunks):
            doc = Document(
                page_content=chunk,
                metadata={
                    "chapter_number": chapter_number,
                    "chunk_index": i,
                    "book_id": self.book_id,
                    "type": "chapter_content",
                    **(metadata or {})
                }
            )
            documents.append(doc)
        
        # 4. Adicionar ao vector store
        if self.vectorstore is None:
            self.vectorstore = FAISS.from_documents(documents, self.embeddings)
        else:
            self.vectorstore.add_documents(documents)
        
        # 5. Relacionar com capítulo anterior
        if chapter_number > 1:
            previous_chapter_id = f"chapter_{chapter_number - 1}"
            if previous_chapter_id in self.nodes:
                self.add_relation(ConceptEdge(
                    source_id=previous_chapter_id,
                    target_id=chapter_node.id,
                    relation_type="references",
                    strength=0.8
                ))
    
    def retrieve_chapters(self, start: int, end: int) -> List[ConceptNode]:
        """Recupera capítulos anteriores"""
        chapters = []
        for i in range(start, end + 1):
            chapter_id = f"chapter_{i}"
            if chapter_id in self.nodes:
                chapters.append(self.nodes[chapter_id])
        return chapters
    
    def retrieve(
        self,
        query: str,
        k: int = 10,
        filters: Optional[Dict[str, Any]] = None,
        rerank: bool = True
    ) -> List[Document]:
        """
        Recuperação contextual do RAG
        """
        if self.vectorstore is None:
            return []
        
        # Busca semântica
        docs = self.vectorstore.similarity_search(
            query,
            k=k,
            filter=filters
        )
        
        # TODO: Implementar reranking com cross-encoder
        if rerank:
            pass  # Placeholder para reranking
        
        return docs
    
    def analyze_narrative_flow(self, chapters: List[ConceptNode]) -> Dict[str, Any]:
        """
        Analisa fluxo narrativo dos capítulos
        Detecta conceitos cobertos, lacunas, e progressão
        """
        covered_concepts = set()
        chapter_summaries = []
        
        for chapter in chapters:
            # Extrair conceitos do capítulo
            # TODO: Usar LLM para extrair conceitos-chave
            covered_concepts.add(chapter.id)
            chapter_summaries.append({
                "number": chapter.chapter_number,
                "summary": chapter.content
            })
        
        return {
            "covered_concepts": list(covered_concepts),
            "chapter_summaries": chapter_summaries,
            "narrative_arc": "linear",  # TODO: Detectar padrão narrativo
            "knowledge_gaps": self.identify_gaps(chapters)
        }
    
    def identify_gaps(self, chapters: List[ConceptNode] = None) -> List[str]:
        """Identifica lacunas de conhecimento"""
        # TODO: Implementar detecção de gaps
        # - Conceitos mencionados mas não explicados
        # - Pré-requisitos faltantes
        # - Transições abruptas
        return []
    
    def get_summaries(self) -> List[Dict[str, Any]]:
        """Retorna resumos de todos os capítulos"""
        summaries = []
        for node_id, node in self.nodes.items():
            if node.type == "chapter":
                summaries.append({
                    "chapter_number": node.chapter_number,
                    "summary": node.content,
                    "verified": node.verified
                })
        return sorted(summaries, key=lambda x: x["chapter_number"])
    
    def update_book_structure(self):
        """Atualiza estrutura global do livro após adicionar capítulo"""
        # TODO: Recalcular importâncias, detectar contradições, etc.
        pass
    
    def save(self, directory: str):
        """Salva mental graph e vector store"""
        path = Path(directory)
        path.mkdir(parents=True, exist_ok=True)
        
        # Salvar nodes e edges
        with open(path / f"{self.book_id}_graph.pkl", 'wb') as f:
            pickle.dump({
                "nodes": self.nodes,
                "edges": self.edges
            }, f)
        
        # Salvar vector store
        if self.vectorstore:
            self.vectorstore.save_local(str(path / f"{self.book_id}_vectorstore"))
    
    def load(self, directory: str):
        """Carrega mental graph e vector store"""
        path = Path(directory)
        
        # Carregar nodes e edges
        with open(path / f"{self.book_id}_graph.pkl", 'rb') as f:
            data = pickle.load(f)
            self.nodes = data["nodes"]
            self.edges = data["edges"]
        
        # Carregar vector store
        vectorstore_path = path / f"{self.book_id}_vectorstore"
        if vectorstore_path.exists():
            self.vectorstore = FAISS.load_local(
                str(vectorstore_path),
                self.embeddings
            )


class GraphRAG:
    """
    Wrapper principal do sistema RAG
    Facade para BookMentalGraph
    """
    
    def __init__(self, book_id: str = "default"):
        self.mental_graph = BookMentalGraph(book_id)
    
    def add_chapter(self, chapter_number: int, content: str, metadata: Dict[str, Any] = None):
        """Adiciona capítulo ao sistema"""
        self.mental_graph.add_chapter(chapter_number, content, metadata)
    
    def retrieve(self, query: str, filters: Dict[str, Any] = None, k: int = 10, rerank: bool = True):
        """Recupera contexto relevante"""
        return self.mental_graph.retrieve(query, k, filters, rerank)
    
    def retrieve_chapters(self, start: int, end: int):
        """Recupera capítulos"""
        return self.mental_graph.retrieve_chapters(start, end)
    
    def analyze_narrative_flow(self, chapters):
        """Analisa fluxo narrativo"""
        return self.mental_graph.analyze_narrative_flow(chapters)
    
    def get_summaries(self):
        """Retorna resumos"""
        return self.mental_graph.get_summaries()
    
    def save(self, directory: str):
        """Salva estado"""
        self.mental_graph.save(directory)
    
    def load(self, directory: str):
        """Carrega estado"""
        self.mental_graph.load(directory)

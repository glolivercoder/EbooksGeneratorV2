"""
Agente de Pesquisa Profunda
Busca em múltiplas fontes acadêmicas e web com validação
"""
from typing import List, Dict, Any, Optional
import asyncio
import os
from services.web_scraper import HybridWebScraper
from datetime import datetime
from config.reliable_sources import detect_theme_from_prompt, get_reliable_sources


class DeepResearchAgent:
    """
    Agente especializado em pesquisa profunda multi-fonte
    """
    
    def __init__(self):
        self.scraper = HybridWebScraper()
        self.sources_priority = [
            "arxiv",
            "semantic_scholar", 
            "pubmed",
            "google_scholar",
            "wikipedia",
            "researchgate",
            "jstor",
            "springer",
            "ieee_xplore",
            "science_direct",
            "nature",
            "pubmed_central",
            "biorxiv",
            "medrxiv"
        ]
        self.web_sources = [
            "medium",
            "dev_to",
            "github",
            "stack_overflow",
            "reddit",
            "quora"
        ]
    
    async def research(
        self,
        query: str,
        academic_only: bool = True,
        max_results: int = 10,
        min_year: Optional[int] = 2020
    ) -> Dict[str, Any]:
        """
        Executa pesquisa profunda sobre um tema usando fontes confiáveis
        """
        
        print(f"[Research Agent] Iniciando pesquisa: '{query}'")
        
        # 1. Detectar tema e obter fontes confiáveis
        theme = detect_theme_from_prompt(query)
        reliable_sources = get_reliable_sources(theme)
        
        print(f"[Research Agent] Tema detectado: {theme}")
        print(f"[Research Agent] Usando {len(reliable_sources)} fontes confiáveis")
        
        # 2. Construir queries otimizadas
        queries = self._build_research_queries(query)
        
        # 3. Buscar em fontes confiáveis primeiro
        search_tasks = []
        
        # Priorizar fontes confiáveis baseadas no tema
        for source in reliable_sources[:5]:  # Limitar às 5 melhores fontes
            if source["type"] == "academic" or source["reliability"] in ["very_high", "high"]:
                search_tasks.append(self._search_reliable_source(source, queries["general"]))
        
        # Adicionar fontes acadêmicas tradicionais se necessário
        if academic_only:
            search_tasks.extend([
                self._search_arxiv(queries["academic"]),
                self._search_semantic_scholar(queries["academic"]),
                self._search_pubmed(queries["academic"]),
                self._search_google_scholar(queries["academic"]),
                self._search_wikipedia(queries["general"])
            ])
        
        # Fontes web (se não for apenas acadêmico)
        if not academic_only:
            search_tasks.extend([
                self._search_medium(queries["general"]),
                self._search_github(queries["technical"]),
                self._search_stack_overflow(queries["technical"])
            ])
        
        # Executar buscas principais
        results = await asyncio.gather(*search_tasks, return_exceptions=True)
        
        # 4. Consolidar resultados
        all_sources = []
        for result in results:
            if isinstance(result, Exception):
                print(f"[Research Agent] Erro em fonte: {result}")
                continue
            all_sources.extend(result)
        
        # 5. Se não encontrou resultados suficientes, usar Perplexity AI
        if len(all_sources) < max_results // 2:
            print(f"[Research Agent] Resultados insuficientes ({len(all_sources)}), usando Perplexity AI")
            perplexity_results = await self._search_perplexity(query)
            all_sources.extend(perplexity_results)
        
        # 6. Validar e rankear fontes (priorizar fontes confiáveis)
        validated_sources = self._validate_sources(
            all_sources,
            min_year=min_year,
            reliable_sources=reliable_sources
        )
        
        # 7. Sintetizar resultados
        synthesis = self._synthesize_results(validated_sources[:max_results])
        
        return {
            "query": query,
            "theme": theme,
            "sources_count": len(validated_sources),
            "sources": validated_sources[:max_results],
            "synthesis": synthesis,
            "timestamp": datetime.now().isoformat()
        }
    
    def _build_research_queries(self, main_query: str) -> Dict[str, str]:
        """Constrói queries otimizadas para cada tipo de fonte"""
        
        # TODO: Usar LLM para expandir query
        return {
            "academic": main_query,
            "general": main_query,
            "technical": f"{main_query} tutorial documentation"
        }
    
    async def _search_arxiv(self, query: str) -> List[Dict[str, Any]]:
        """Busca no arXiv"""
        
        try:
            import arxiv
            
            # API do arXiv
            search = arxiv.Search(
                query=query,
                max_results=20,
                sort_by=arxiv.SortCriterion.Relevance
            )
            
            results = []
            for paper in search.results():
                results.append({
                    "source": "arxiv",
                    "title": paper.title,
                    "authors": [author.name for author in paper.authors],
                    "abstract": paper.summary,
                    "url": paper.entry_id,
                    "pdf_url": paper.pdf_url,
                    "published": paper.published.year if paper.published else None,
                    "categories": paper.categories,
                    "citations": None,  # arXiv não fornece contagem de citações
                    "verified": True  # arXiv é fonte confiável
                })
            
            print(f"[Research Agent] ArXiv: {len(results)} papers encontrados")
            return results
            
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar arXiv: {e}")
            return []
    
    async def _search_semantic_scholar(self, query: str) -> List[Dict[str, Any]]:
        """Busca no Semantic Scholar"""
        try:
            import aiohttp
            import json
            
            # API do Semantic Scholar
            url = "https://api.semanticscholar.org/graph/v1/paper/search"
            params = {
                "query": query,
                "limit": 20,
                "fields": "title,abstract,authors,year,citationCount,url,venue,journal"
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for paper in data.get("data", []):
                            results.append({
                                "source": "semantic_scholar",
                                "title": paper.get("title", ""),
                                "authors": [author.get("name", "") for author in paper.get("authors", [])],
                                "abstract": paper.get("abstract", ""),
                                "url": paper.get("url", ""),
                                "pdf_url": None,
                                "published": paper.get("year"),
                                "categories": [paper.get("venue", "")],
                                "citations": paper.get("citationCount", 0),
                                "verified": True
                            })
                        
                        print(f"[Research Agent] Semantic Scholar: {len(results)} papers encontrados")
                        return results
                    else:
                        print(f"[Research Agent] Erro Semantic Scholar: {response.status}")
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Semantic Scholar: {e}")
            return []
    
    async def _search_pubmed(self, query: str) -> List[Dict[str, Any]]:
        """Busca no PubMed"""
        try:
            import aiohttp
            import xml.etree.ElementTree as ET
            
            # API do PubMed (Entrez)
            base_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"
            
            # 1. Search for IDs
            search_url = f"{base_url}/esearch.fcgi"
            search_params = {
                "db": "pubmed",
                "term": query,
                "retmode": "json",
                "retmax": 20
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(search_url, params=search_params) as response:
                    if response.status != 200:
                        return []
                    
                    search_data = await response.json()
                    id_list = search_data.get("esearchresult", {}).get("idlist", [])
                    
                    if not id_list:
                        return []
                    
                    # 2. Fetch summaries
                    summary_url = f"{base_url}/esummary.fcgi"
                    summary_params = {
                        "db": "pubmed",
                        "id": ",".join(id_list),
                        "retmode": "json"
                    }
                    
                    async with session.get(summary_url, params=summary_params) as summary_response:
                        if summary_response.status != 200:
                            return []
                        
                        summary_data = await summary_response.json()
                        results = []
                        
                        for doc_id, doc_data in summary_data.get("result", {}).items():
                            if doc_id == "uids":
                                continue
                                
                            results.append({
                                "source": "pubmed",
                                "title": doc_data.get("title", ""),
                                "authors": [author for author in doc_data.get("authors", [])],
                                "abstract": doc_data.get("abstract", ""),
                                "url": f"https://pubmed.ncbi.nlm.nih.gov/{doc_id}/",
                                "pdf_url": None,
                                "published": int(doc_data.get("pubdate", "").split(" ")[0]) if doc_data.get("pubdate") else None,
                                "categories": [doc_data.get("source", "")],
                                "citations": None,
                                "verified": True
                            })
                        
                        print(f"[Research Agent] PubMed: {len(results)} artigos encontrados")
                        return results
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar PubMed: {e}")
            return []
    
    async def _search_google_scholar(self, query: str) -> List[Dict[str, Any]]:
        """Busca no Google Scholar (via scraping)"""
        try:
            # Usar scraper para Google Scholar
            results = await self.scraper.search_scholar(query, max_results=10)
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "source": "google_scholar",
                    "title": result.get("title", ""),
                    "authors": result.get("authors", []),
                    "abstract": result.get("abstract", ""),
                    "url": result.get("url", ""),
                    "pdf_url": result.get("pdf_url"),
                    "published": result.get("year"),
                    "categories": result.get("venue", []),
                    "citations": result.get("citations", 0),
                    "verified": True
                })
            
            print(f"[Research Agent] Google Scholar: {len(formatted_results)} papers encontrados")
            return formatted_results
            
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Google Scholar: {e}")
            return []
    
    async def _search_wikipedia(self, query: str) -> List[Dict[str, Any]]:
        """Busca na Wikipedia"""
        try:
            import aiohttp
            
            # API da Wikipedia
            url = "https://pt.wikipedia.org/api/rest_v1/page/summary/" + query.replace(" ", "_")
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        result = {
                            "source": "wikipedia",
                            "title": data.get("title", ""),
                            "authors": ["Wikipedia Contributors"],
                            "abstract": data.get("extract", ""),
                            "url": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
                            "pdf_url": None,
                            "published": None,
                            "categories": ["Encyclopedia"],
                            "citations": None,
                            "verified": True
                        }
                        
                        print(f"[Research Agent] Wikipedia: 1 artigo encontrado")
                        return [result]
                    else:
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Wikipedia: {e}")
            return []
    
    async def _search_perplexity(self, query: str) -> List[Dict[str, Any]]:
        """Busca usando Perplexity AI como fallback"""
        try:
            import aiohttp
            import os
            
            # Verificar se tem API key do Perplexity
            api_key = os.getenv("PERPLEXITY_API_KEY")
            if not api_key:
                print("[Research Agent] PERPLEXITY_API_KEY não encontrada")
                return []
            
            url = "https://api.perplexity.ai/chat/completions"
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "model": "llama-3.1-sonar-small-128k-online",
                "messages": [
                    {
                        "role": "system",
                        "content": "Você é um assistente de pesquisa. Forneça informações detalhadas e fontes confiáveis sobre o tema solicitado."
                    },
                    {
                        "role": "user", 
                        "content": f"Pesquise sobre: {query}. Forneça informações atualizadas e cite as fontes utilizadas."
                    }
                ],
                "max_tokens": 1000
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.post(url, headers=headers, json=payload) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["choices"][0]["message"]["content"]
                        
                        result = {
                            "source": "perplexity_ai",
                            "title": f"Research on: {query}",
                            "authors": ["Perplexity AI"],
                            "abstract": content,
                            "url": "https://www.perplexity.ai",
                            "pdf_url": None,
                            "published": None,
                            "categories": ["AI Research"],
                            "citations": None,
                            "verified": True
                        }
                        
                        print(f"[Research Agent] Perplexity AI: 1 resultado encontrado")
                        return [result]
                    else:
                        print(f"[Research Agent] Erro Perplexity AI: {response.status}")
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Perplexity AI: {e}")
            return []
    
    # Fontes acadêmicas secundárias
    async def _search_researchgate(self, query: str) -> List[Dict[str, Any]]:
        """Busca no ResearchGate"""
        try:
            # Usar scraper para ResearchGate
            results = await self.scraper.search_web(f"site:researchgate.net {query}", max_results=5)
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "source": "researchgate",
                    "title": result.get("title", ""),
                    "authors": [],  # ResearchGate não fornece autores via scraping
                    "abstract": result.get("description", ""),
                    "url": result.get("url", ""),
                    "pdf_url": None,
                    "published": None,
                    "categories": ["Research"],
                    "citations": None,
                    "verified": True
                })
            
            print(f"[Research Agent] ResearchGate: {len(formatted_results)} resultados encontrados")
            return formatted_results
            
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar ResearchGate: {e}")
            return []
    
    async def _search_springer(self, query: str) -> List[Dict[str, Any]]:
        """Busca na Springer"""
        try:
            import aiohttp
            
            # API da Springer
            url = "https://api.springernature.com/metadata/json"
            params = {
                "q": query,
                "p": 10,
                "api_key": os.getenv("SPRINGER_API_KEY", "")
            }
            
            if not params["api_key"]:
                return []
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for record in data.get("records", []):
                            results.append({
                                "source": "springer",
                                "title": record.get("title", ""),
                                "authors": record.get("creators", []),
                                "abstract": record.get("abstract", ""),
                                "url": record.get("url", []),
                                "pdf_url": record.get("url", [None])[0] if record.get("url") else None,
                                "published": int(record.get("publicationDate", "0000").split("-")[0]) if record.get("publicationDate") else None,
                                "categories": [record.get("publicationName", "")],
                                "citations": None,
                                "verified": True
                            })
                        
                        print(f"[Research Agent] Springer: {len(results)} artigos encontrados")
                        return results
                    else:
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Springer: {e}")
            return []
    
    async def _search_ieee_xplore(self, query: str) -> List[Dict[str, Any]]:
        """Busca no IEEE Xplore"""
        try:
            import aiohttp
            
            # API do IEEE Xplore
            api_key = os.getenv("IEEE_API_KEY")
            if not api_key:
                return []
            
            url = "https://ieeexploreapi.ieee.org/api/v1/search/articles"
            params = {
                "apikey": api_key,
                "querytext": query,
                "max_records": 10
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for article in data.get("articles", []):
                            results.append({
                                "source": "ieee_xplore",
                                "title": article.get("title", ""),
                                "authors": [author.get("full_name", "") for author in article.get("authors", {}).get("authors", [])],
                                "abstract": article.get("abstract", ""),
                                "url": article.get("html_url", ""),
                                "pdf_url": article.get("pdf_url", ""),
                                "published": int(article.get("publication_year", 0)) if article.get("publication_year") else None,
                                "categories": [article.get("publication_title", "")],
                                "citations": article.get("article_citation_count", 0),
                                "verified": True
                            })
                        
                        print(f"[Research Agent] IEEE Xplore: {len(results)} artigos encontrados")
                        return results
                    else:
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar IEEE Xplore: {e}")
            return []
    
    async def _search_nature(self, query: str) -> List[Dict[str, Any]]:
        """Busca na Nature"""
        try:
            # Usar scraper para Nature
            results = await self.scraper.search_web(f"site:nature.com {query}", max_results=5)
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "source": "nature",
                    "title": result.get("title", ""),
                    "authors": [],
                    "abstract": result.get("description", ""),
                    "url": result.get("url", ""),
                    "pdf_url": None,
                    "published": None,
                    "categories": ["Journal"],
                    "citations": None,
                    "verified": True
                })
            
            print(f"[Research Agent] Nature: {len(formatted_results)} artigos encontrados")
            return formatted_results
            
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Nature: {e}")
            return []
    
    # Fontes web
    async def _search_medium(self, query: str) -> List[Dict[str, Any]]:
        """Busca no Medium"""
        try:
            results = await self.scraper.search_web(f"site:medium.com {query}", max_results=5)
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "source": "medium",
                    "title": result.get("title", ""),
                    "authors": [],
                    "abstract": result.get("description", ""),
                    "url": result.get("url", ""),
                    "pdf_url": None,
                    "published": None,
                    "categories": ["Blog"],
                    "citations": None,
                    "verified": False  # Menos confiável que fontes acadêmicas
                })
            
            print(f"[Research Agent] Medium: {len(formatted_results)} artigos encontrados")
            return formatted_results
            
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Medium: {e}")
            return []
    
    async def _search_github(self, query: str) -> List[Dict[str, Any]]:
        """Busca no GitHub"""
        try:
            import aiohttp
            
            # API do GitHub
            url = "https://api.github.com/search/repositories"
            params = {
                "q": query,
                "sort": "stars",
                "order": "desc",
                "per_page": 10
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for repo in data.get("items", []):
                            results.append({
                                "source": "github",
                                "title": repo.get("full_name", ""),
                                "authors": [repo.get("owner", {}).get("login", "")],
                                "abstract": repo.get("description", ""),
                                "url": repo.get("html_url", ""),
                                "pdf_url": None,
                                "published": int(repo.get("created_at", "0000-01-01").split("-")[0]) if repo.get("created_at") else None,
                                "categories": ["Code", "Repository"],
                                "citations": repo.get("stargazers_count", 0),
                                "verified": False
                            })
                        
                        print(f"[Research Agent] GitHub: {len(results)} repositórios encontrados")
                        return results
                    else:
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar GitHub: {e}")
            return []
    
    async def _search_stack_overflow(self, query: str) -> List[Dict[str, Any]]:
        """Busca no Stack Overflow"""
        try:
            import aiohttp
            
            # API do Stack Overflow
            url = "https://api.stackexchange.com/2.3/search/advanced"
            params = {
                "order": "desc",
                "sort": "votes",
                "q": query,
                "site": "stackoverflow",
                "pagesize": 10
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        results = []
                        for item in data.get("items", []):
                            results.append({
                                "source": "stack_overflow",
                                "title": item.get("title", ""),
                                "authors": [item.get("owner", {}).get("display_name", "")],
                                "abstract": item.get("body", "")[:200] + "..." if item.get("body") else "",
                                "url": item.get("link", ""),
                                "pdf_url": None,
                                "published": int(item.get("creation_date", 0)) if item.get("creation_date") else None,
                                "categories": ["Q&A"],
                                "citations": item.get("score", 0),
                                "verified": False
                            })
                        
                        print(f"[Research Agent] Stack Overflow: {len(results)} perguntas encontradas")
                        return results
                    else:
                        return []
                        
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar Stack Overflow: {e}")
            return []
    
    async def _search_reliable_source(self, source_config: Dict[str, Any], query: str) -> List[Dict[str, Any]]:
        """Busca em uma fonte confiável específica"""
        try:
            import aiohttp
            
            # Usar scraper para buscar conteúdo da fonte
            results = await self.scraper.search_web(f"site:{source_config['url']} {query}", max_results=3)
            
            formatted_results = []
            for result in results:
                formatted_results.append({
                    "source": source_config["name"],
                    "title": result.get("title", ""),
                    "authors": [],
                    "abstract": result.get("description", ""),
                    "url": result.get("url", ""),
                    "pdf_url": None,
                    "published": None,
                    "categories": [source_config["type"]],
                    "citations": None,
                    "verified": source_config["reliability"] in ["very_high", "high"],
                    "reliability": source_config["reliability"],
                    "source_url": source_config["url"]
                })
            
            print(f"[Research Agent] {source_config['name']}: {len(formatted_results)} resultados encontrados")
            return formatted_results
            
        except Exception as e:
            print(f"[Research Agent] Erro ao buscar {source_config['name']}: {e}")
            return []
    
    def _validate_sources(
        self,
        sources: List[Dict[str, Any]],
        min_year: Optional[int] = None,
        min_citations: int = 0,
        reliable_sources: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Valida e filtra fontes baseado em critérios e confiabilidade
        """
        
        validated = []
        reliable_domains = set()
        
        # Extrair domínios confiáveis
        if reliable_sources:
            reliable_domains = set(source["url"].replace("https://", "").replace("http://", "").split("/")[0] 
                                 for source in reliable_sources)
        
        for source in sources:
            # Filtro de ano
            if min_year and source.get("published"):
                if source["published"] < min_year:
                    continue
            
            # Filtro de citações (se disponível)
            if source.get("citations") is not None:
                if source["citations"] < min_citations:
                    continue
            
            # Adicionar score de confiança baseado na fonte
            confidence = self._calculate_confidence(source, reliable_domains)
            source["confidence_score"] = confidence
            
            # Priorizar fontes confiáveis
            if confidence >= 0.7 or source.get("verified", False):
                validated.append(source)
        
        # Ordenar por score de confiança
        validated.sort(key=lambda x: x.get("confidence_score", 0), reverse=True)
        
        return validated
    
    def _calculate_confidence(
        self,
        source: Dict[str, Any],
        reliable_domains: Optional[set] = None
    ) -> float:
        """
        Calcula score de confiança da fonte
        """
        score = 0.5  # Base score
        
        # Fontes verificadas ganham pontos
        if source.get("verified", False):
            score += 0.3
        
        # Fontes confiáveis ganham pontos
        if reliable_domains and source.get("url"):
            domain = source["url"].replace("https://", "").replace("http://", "").split("/")[0]
            if domain in reliable_domains:
                score += 0.4
            elif source.get("reliability") == "very_high":
                score += 0.3
            elif source.get("reliability") == "high":
                score += 0.2
        
        # Fontes acadêmicas ganham pontos
        if source.get("source") in ["arxiv", "semantic_scholar", "pubmed", "nature", "science"]:
            score += 0.2
        
        # Citações aumentam confiança
        citations = source.get("citations", 0)
        if citations > 100:
            score += 0.1
        elif citations > 10:
            score += 0.05
        
        return min(score, 1.0)
    
    def _synthesize_results(self, sources: List[Dict[str, Any]]) -> str:
        """
        Sintetiza resultados de pesquisa
        """
        
        if not sources:
            return "Nenhuma fonte encontrada."
        
        # TODO: Usar LLM para criar síntese mais sofisticada
        
        synthesis = f"Encontradas {len(sources)} fontes relevantes:\n\n"
        
        for i, source in enumerate(sources[:5], 1):
            synthesis += f"{i}. {source['title']}\n"
            synthesis += f"   Fonte: {source['source']} | "
            synthesis += f"Confiança: {source['confidence_score']:.2f}\n"
            
            if source.get("abstract"):
                # Truncar abstract
                abstract = source["abstract"][:200] + "..." if len(source["abstract"]) > 200 else source["abstract"]
                synthesis += f"   {abstract}\n"
            
            synthesis += f"   URL: {source['url']}\n\n"
        
        return synthesis


# Instância global
research_agent = DeepResearchAgent()

"""
Web Scraping Híbrido
Detecta automaticamente tipo de site e escolhe ferramenta apropriada
"""
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Any, Optional
import httpx
from enum import Enum


class SiteType(Enum):
    """Tipos de sites identificados"""
    API = "api"
    STATIC = "static"
    DYNAMIC = "dynamic"


class HybridWebScraper:
    """
    Escolhe automaticamente a melhor ferramenta de scraping baseado no tipo de site
    """
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.timeout = 10
    
    def detect_site_type(self, url: str) -> SiteType:
        """Detecta automaticamente o tipo de site"""
        if "arxiv.org/api" in url or "api." in url or "/api/" in url:
            return SiteType.API
        elif any(domain in url for domain in ["scholar.google", "researchgate", "academia.edu"]):
            return SiteType.DYNAMIC
        else:
            return SiteType.STATIC
    
    async def scrape(self, url: str, source_type: Optional[SiteType] = None) -> Dict[str, Any]:
        """
        Scraping automático baseado no tipo de site
        """
        # Detectar tipo se não especificado
        if source_type is None:
            source_type = self.detect_site_type(url)
        
        # Escolher método apropriado
        if source_type == SiteType.API:
            return await self._scrape_api(url)
        elif source_type == SiteType.STATIC:
            return self._scrape_static(url)
        elif source_type == SiteType.DYNAMIC:
            return await self._scrape_dynamic(url)
    
    async def _scrape_api(self, url: str) -> Dict[str, Any]:
        """Scraping de APIs oficiais usando HTTPX async"""
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, headers=self.headers, timeout=self.timeout)
                response.raise_for_status()
                
                # Tentar parse JSON
                try:
                    data = response.json()
                except:
                    data = {"text": response.text}
                
                return {
                    "url": url,
                    "type": "api",
                    "status": "success",
                    "data": data
                }
            except Exception as e:
                return {
                    "url": url,
                    "type": "api",
                    "status": "error",
                    "error": str(e)
                }
    
    def _scrape_static(self, url: str) -> Dict[str, Any]:
        """Scraping de sites estáticos usando Requests + BeautifulSoup"""
        try:
            response = requests.get(url, headers=self.headers, timeout=self.timeout)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'lxml')
            
            # Extrair informações básicas
            title = soup.find('title')
            title_text = title.get_text(strip=True) if title else ""
            
            # Extrair texto main content
            # Priorizar tags semânticas
            main_content = soup.find('main') or soup.find('article') or soup.find('body')
            text = main_content.get_text(separator='\n', strip=True) if main_content else ""
            
            return {
                "url": url,
                "type": "static",
                "status": "success",
                "title": title_text,
                "content": text[:5000],  # Limitar tamanho
                "html": str(soup)[:10000]  # HTML para processamento adicional
            }
            
        except Exception as e:
            return {
                "url": url,
                "type": "static",
                "status": "error",
                "error": str(e)
            }
    
    async def _scrape_dynamic(self, url: str) -> Dict[str, Any]:
        """Scraping de sites dinâmicos usando Playwright"""
        # TODO: Implementar com Playwright quando necessário
        # Por enquanto, fallback para static
        return self._scrape_static(url)


class StaticScraper:
    """Scraper especializado para sites estáticos"""
    
    def parse(self, html: bytes) -> Dict[str, Any]:
        """Parse HTML e extrai informações estruturadas"""
        soup = BeautifulSoup(html, 'lxml')
        
        return {
            "title": soup.find('title').get_text() if soup.find('title') else "",
            "headings": [h.get_text() for h in soup.find_all(['h1', 'h2', 'h3'])],
            "paragraphs": [p.get_text() for p in soup.find_all('p')[:20]],
            "links": [a.get('href') for a in soup.find_all('a', href=True)[:50]]
        }


class DynamicScraper:
    """Scraper especializado para sites dinâmicos (Playwright)"""
    
    def parse(self, html: str) -> Dict[str, Any]:
        """Parse HTML renderizado"""
        soup = BeautifulSoup(html, 'lxml')
        
        return {
            "title": soup.find('title').get_text() if soup.find('title') else "",
            "content": soup.get_text(separator='\n', strip=True)[:5000]
        }


class AsyncAPIClient:
    """Cliente para APIs assíncronas"""
    
    async def fetch(self, url: str) -> Dict[str, Any]:
        """Fetch de API com tratamento de erros"""
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=10)
            return response.json()

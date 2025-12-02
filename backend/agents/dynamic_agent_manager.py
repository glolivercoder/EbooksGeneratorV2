"""
Dynamic Agent Manager
Gerencia criação de subagentes especializados e instalação de bibliotecas
"""
import subprocess
import sys
import os
from typing import List, Dict, Any, Optional
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class Domain(Enum):
    """Domínios especializados detectáveis"""
    FINANCE = "finance"
    MACHINE_LEARNING = "machine_learning"
    DATA_SCIENCE = "data_science"
    WEB_SCRAPING = "web_scraping"
    VISUALIZATION = "visualization"
    GENERAL = "general"


class DynamicAgentManager:
    """
    Gerenciador de agentes dinâmicos
    Detecta domínios, instala bibliotecas e cria subagentes especializados
    """
    
    # Whitelist de bibliotecas seguras por domínio
    SAFE_LIBRARIES = {
        Domain.FINANCE: [
            "yfinance", "pandas", "numpy", "ta-lib", "backtrader",
            "vectorbt", "finrl", "alpha_vantage", "pandas_datareader",
            "scipy", "statsmodels"
        ],
        Domain.MACHINE_LEARNING: [
            "scikit-learn", "xgboost", "lightgbm", "catboost",
            "tensorflow", "torch", "neuralprophet", "prophet",
            "keras", "transformers"
        ],
        Domain.DATA_SCIENCE: [
            "pandas", "numpy", "scipy", "statsmodels", "sympy",
            "networkx", "openpyxl", "xlrd"
        ],
        Domain.WEB_SCRAPING: [
            "beautifulsoup4", "requests", "selenium", "scrapy",
            "playwright", "httpx", "lxml", "html5lib"
        ],
        Domain.VISUALIZATION: [
            "plotly", "dash", "matplotlib", "seaborn", "bokeh",
            "altair", "holoviews", "streamlit"
        ]
    }
    
    # Keywords para detecção de domínio
    DOMAIN_KEYWORDS = {
        Domain.FINANCE: [
            "finance", "trading", "stock", "ações", "mercado financeiro",
            "backtest", "análise técnica", "investimento", "portfolio",
            "risco", "retorno", "volatilidade", "opções", "derivativos"
        ],
        Domain.MACHINE_LEARNING: [
            "machine learning", "deep learning", "neural network",
            "classificação", "regressão", "clustering", "previsão",
            "modelo preditivo", "aprendizado", "IA", "artificial"
        ],
        Domain.DATA_SCIENCE: [
            "análise de dados", "estatística", "probabilidade",
            "dataset", "dataframe", "ciência de dados", "big data"
        ],
        Domain.WEB_SCRAPING: [
            "scraping", "web scraping", "crawler", "parsing",
            "extração de dados", "html", "beautifulsoup"
        ],
        Domain.VISUALIZATION: [
            "visualização", "gráfico", "dashboard", "plot",
            "chart", "interativo", "plotly", "matplotlib"
        ]
    }
    
    def __init__(self, venv_path: Optional[str] = None):
        """
        Args:
            venv_path: Caminho para ambiente virtual (se None, usa sistema global)
        """
        self.venv_path = venv_path
        self.installed_libraries: Dict[str, List[str]] = {}
        self.active_agents: Dict[str, Any] = {}
    
    def detect_domain(self, prompt: str, outline: Optional[Dict] = None) -> List[Domain]:
        """
        Detecta domínios especializados baseado no prompt e outline
        """
        prompt_lower = prompt.lower()
        detected = []
        
        # Detectar por keywords no prompt
        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            if any(kw in prompt_lower for kw in keywords):
                detected.append(domain)
        
        # Detectar por outline (se fornecido)
        if outline and "research_areas" in outline:
            for area in outline["research_areas"]:
                area_lower = area.lower()
                for domain, keywords in self.DOMAIN_KEYWORDS.items():
                    if any(kw in area_lower for kw in keywords) and domain not in detected:
                        detected.append(domain)
        
        # Se nada detectado, retorna GENERAL
        if not detected:
            detected.append(Domain.GENERAL)
        
        logger.info(f"Detected domains: {[d.value for d in detected]}")
        return detected
    
    def get_recommended_libraries(self, domains: List[Domain]) -> List[str]:
        """
        Retorna bibliotecas recomendadas para os domínios detectados
        """
        libraries = set()
        
        for domain in domains:
            if domain in self.SAFE_LIBRARIES:
                # Adiciona bibliotecas essenciais do domínio
                domain_libs = self.SAFE_LIBRARIES[domain][:5]  # Top 5
                libraries.update(domain_libs)
        
        return list(libraries)
    
    def is_library_safe(self, library: str) -> bool:
        """
        Verifica se biblioteca está na whitelist
        """
        for libs in self.SAFE_LIBRARIES.values():
            if library in libs:
                return True
        return False
    
    def install_library(self, library: str, domain: Domain) -> bool:
        """
        Instala biblioteca de forma segura
        """
        # Verificar whitelist
        if not self.is_library_safe(library):
            logger.warning(f"Library '{library}' not in whitelist. Skipping.")
            return False
        
        logger.info(f"Installing library: {library}")
        
        try:
            # Determinar pip path
            if self.venv_path:
                pip_cmd = os.path.join(self.venv_path, "Scripts", "pip.exe")
            else:
                pip_cmd = "pip"
            
            # Instalar
            result = subprocess.run(
                [pip_cmd, "install", library],
                capture_output=True,
                text=True,
                timeout=120  # 2 minutos timeout
            )
            
            if result.returncode == 0:
                logger.info(f"✓ Successfully installed {library}")
                
                # Registrar instalação
                domain_key = domain.value
                if domain_key not in self.installed_libraries:
                    self.installed_libraries[domain_key] = []
                self.installed_libraries[domain_key].append(library)
                
                return True
            else:
                logger.error(f"✗ Failed to install {library}: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error(f"✗ Timeout installing {library}")
            return False
        except Exception as e:
            logger.error(f"✗ Error installing {library}: {e}")
            return False
    
    def create_specialist_agent(
        self,
        domain: Domain,
        libraries: List[str],
        research_query: str
    ) -> Dict[str, Any]:
        """
        Cria um subagente especializado
        """
        logger.info(f"Creating specialist agent for domain: {domain.value}")
        
        # Instalar bibliotecas necessárias
        installed = []
        failed = []
        
        for lib in libraries:
            if self.install_library(lib, domain):
                installed.append(lib)
            else:
                failed.append(lib)
        
        # Criar configuração do agente
        agent_config = {
            "domain": domain.value,
            "libraries_installed": installed,
            "libraries_failed": failed,
            "research_query": research_query,
            "capabilities": self._get_domain_capabilities(domain),
            "status": "ready" if installed else "degraded"
        }
        
        # Registrar agente ativo
        agent_id = f"{domain.value}_{len(self.active_agents)}"
        self.active_agents[agent_id] = agent_config
        
        logger.info(f"✓ Agent {agent_id} created successfully")
        return agent_config
    
    def _get_domain_capabilities(self, domain: Domain) -> List[str]:
        """
        Retorna capacidades específicas do domínio
        """
        capabilities_map = {
            Domain.FINANCE: [
                "análise técnica de ações",
                "backtesting de estratégias",
                "cálculo de indicadores financeiros",
                "análise de risco e retorno",
                "otimização de portfolio"
            ],
            Domain.MACHINE_LEARNING: [
                "treinamento de modelos preditivos",
                "feature engineering",
                "validação cruzada",
                "hyperparameter tuning",
                "análise de performance de modelos"
            ],
            Domain.DATA_SCIENCE: [
                "análise exploratória de dados",
                "estatística descritiva",
                "testes de hipóteses",
                "análise de correlações",
                "tratamento de dados faltantes"
            ],
            Domain.WEB_SCRAPING: [
                "extração de dados de websites",
                "parsing de HTML/XML",
                "automação de navegação",
                "coleta de dados estruturados"
            ],
            Domain.VISUALIZATION: [
                "criação de gráficos interativos",
                "dashboards",
                "visualização de séries temporais",
                "mapas e geolocalização"
            ]
        }
        
        return capabilities_map.get(domain, ["análise geral"])
    
    def execute_specialist_task(
        self,
        agent_id: str,
        task_code: str
    ) -> Dict[str, Any]:
        """
        Executa código usando um agente especializado
        
        NOTA: Por segurança, isso deve ser usado com MUITO CUIDADO
        Apenas para tarefas específicas e controladas
        """
        if agent_id not in self.active_agents:
            return {
                "success": False,
                "error": f"Agent {agent_id} not found"
            }
        
        agent = self.active_agents[agent_id]
        
        # TODO: Implementar execução segura de código
        # Por enquanto, apenas retorna mock
        logger.warning("Code execution not implemented yet (security)")
        
        return {
            "success": True,
            "agent": agent_id,
            "domain": agent["domain"],
            "message": "Code execution placeholder - to be implemented with sandboxing"
        }
    
    def get_status(self) -> Dict[str, Any]:
        """
        Retorna status do gerenciador
        """
        return {
            "active_agents": len(self.active_agents),
            "installed_libraries": self.installed_libraries,
            "agents": {
                agent_id: {
                    "domain": agent["domain"],
                    "status": agent["status"],
                    "libraries": agent["libraries_installed"]
                }
                for agent_id, agent in self.active_agents.items()
            }
        }


# Instância global
agent_manager = DynamicAgentManager()

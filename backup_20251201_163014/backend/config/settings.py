"""
Configurações da aplicação usando Pydantic Settings.
Carrega variáveis do .env e fornece validação de tipos.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional
import os


class Settings(BaseSettings):
    """Configurações globais da aplicação"""
    
    model_config = SettingsConfigDict(
        # Usa o .env na raiz do projeto (um nível acima de backend)
        env_file="../.env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    # OpenRouter API
    openrouter_api_key: str = Field(default="", description="OpenRouter API Key")
    openrouter_base_url: str = Field(default="https://openrouter.ai/api/v1")
    
    # OpenAI API
    openai_api_key: str = Field(default="", description="OpenAI API Key")
    openai_base_url: str = Field(default="https://api.openai.com/v1")
    
    # Gemini API
    gemini_api_key: str = Field(default="", description="Gemini API Key")
    
    # Pixabay API
    pixabay_api_key: str = Field(default="", description="Pixabay API Key")
    
    # Model Configuration
    research_model: str = Field(default="anthropic/claude-3-haiku")
    generation_model: str = Field(default="google/gemini-pro-1.5")
    image_model: str = Field(default="black-forest-labs/flux-schnell")
    model_timeout: int = Field(default=3, description="Timeout em segundos")
    
    # Application
    backend_port: int = Field(default=8000)
    frontend_port: int = Field(default=5173)
    backend_url: str = Field(default="http://localhost:8000")
    
    # Environment
    env: str = Field(default="development")
    
    @property
    def is_production(self) -> bool:
        return self.env == "production"
    
    def test_openrouter_connection(self) -> dict:
        """Testa conexão com OpenRouter"""
        # TODO: Implementar teste real
        return {
            "service": "OpenRouter",
            "status": "connected" if self.openrouter_api_key else "not_configured"
        }
    
    def test_openai_connection(self) -> dict:
        """Testa conexão com OpenAI"""
        # TODO: Implementar teste real
        return {
            "service": "OpenAI",
            "status": "connected" if self.openai_api_key else "not_configured"
        }
    
    def test_gemini_connection(self) -> dict:
        """Testa conexão com Gemini"""
        # TODO: Implementar teste real
        return {
            "service": "Gemini",
            "status": "connected" if self.gemini_api_key else "not_configured"
        }
    
    def test_pixabay_connection(self) -> dict:
        """Testa conexão com Pixabay"""
        # TODO: Implementar teste real
        return {
            "service": "Pixabay",
            "status": "connected" if self.pixabay_api_key else "not_configured"
        }


# Instância global
settings = Settings()

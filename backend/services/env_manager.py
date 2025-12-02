"""
Gerenciador de arquivo .env
Permite atualizar chaves API via interface sem editar arquivo manualmente
"""
from pathlib import Path
from typing import Dict
import os
import shutil
from datetime import datetime


class EnvManager:
    """Gerencia atualizações no arquivo .env"""
    
    def __init__(self, env_path: str = None):
        if env_path is None:
            # Procura .env na raiz do projeto
            current = Path(__file__).parent
            while current.parent != current:
                env_file = current / ".env"
                if env_file.exists():
                    self.env_path = env_file
                    break
                current = current.parent
            else:
                # Cria na raiz do projeto se não existir
                project_root = Path(__file__).parent.parent.parent
                self.env_path = project_root / ".env"
        else:
            self.env_path = Path(env_path)
    
    def read_env(self) -> Dict[str, str]:
        """Lê arquivo .env e retorna dict com chaves/valores"""
        if not self.env_path.exists():
            return {}
        
        env_vars = {}
        with open(self.env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if '=' in line:
                        key, value = line.split('=', 1)
                        env_vars[key.strip()] = value.strip()
        
        return env_vars
    
    def update_key(self, key: str, value: str) -> bool:
        """
        Atualiza uma chave específica no .env
        Cria backup antes de modificar
        """
        try:
            # Criar backup
            if self.env_path.exists():
                backup_path = self.env_path.parent / f".env.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                shutil.copy(self.env_path, backup_path)
            
            # Ler arquivo atual
            lines = []
            key_found = False
            
            if self.env_path.exists():
                with open(self.env_path, 'r', encoding='utf-8') as f:
                    lines = f.readlines()
            
            # Atualizar ou adicionar chave
            new_lines = []
            for line in lines:
                if line.strip().startswith(f"{key}="):
                    new_lines.append(f"{key}={value}\n")
                    key_found = True
                else:
                    new_lines.append(line)
            
            # Se chave não foi encontrada, adicionar no final
            if not key_found:
                new_lines.append(f"{key}={value}\n")
            
            # Escrever arquivo atualizado
            with open(self.env_path, 'w', encoding='utf-8') as f:
                f.writelines(new_lines)
            
            # Atualizar variáveis de ambiente do processo atual
            os.environ[key] = value
            
            return True
            
        except Exception as e:
            print(f"Erro ao atualizar {key}: {e}")
            return False
    
    def update_multiple(self, updates: Dict[str, str]) -> Dict[str, bool]:
        """Atualiza múltiplas chaves de uma vez"""
        results = {}
        for key, value in updates.items():
            results[key] = self.update_key(key, value)
        return results
    
    def validate_key_format(self, key: str, value: str) -> bool:
        """Valida formato da chave antes de salvar"""
        # Chave deve ser uppercase com underscores
        if not key.isupper():
            return False
        
        # Valor não deve conter quebras de linha
        if '\n' in value or '\r' in value:
            return False
        
        return True


# Instância global
env_manager = EnvManager()

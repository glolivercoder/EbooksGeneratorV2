"""
Mermaid Agent - IA especializada em gerar código Mermaid
Gera diagramas perfeitos a partir de descrições em linguagem natural
"""
from typing import Optional
import logging
from services.llm_client import llm_client, TaskType

logger = logging.getLogger(__name__)


class MermaidAgent:
    """
    Agente de IA especializado em gerar código Mermaid
    Superior a DALL-E para diagramas (400x mais barato, qualidade perfeita)
    """
    
    DIAGRAM_TYPES = {
        "flowchart": "graph TD",
        "sequence": "sequenceDiagram",
        "gantt": "gantt",
        "class": "classDiagram",
        "state": "stateDiagram-v2",
        "pie": "pie",
        "er": "erDiagram",
        "journey": "journey"
    }
    
    def __init__(self):
        self.generated_count = 0
        
    async def generate_diagram(
        self,
        description: str,
        diagram_type: str = "auto"
    ) -> dict:
        """
        Gera código Mermaid baseado em descrição
        
        Args:
            description: Descrição do diagrama em português
            diagram_type: Tipo específico ou 'auto' para IA decidir
        
        Returns:
            {
                "mermaid_code": "```mermaid\n...\n```",
                "type_used": "flowchart",
                "cost": 0.0001
            }
        """
        
        logger.info(f"Generating Mermaid diagram: type={diagram_type}, desc={description[:50]}...")
        
        # Build prompt
        prompt = self._build_prompt(description, diagram_type)
        
        try:
            # Use LLM client with proper fallback strategy
            # Priority: 1) User's configured model, 2) Cheapest available, 3) OpenAI fallback
            
            logger.info("Attempting to generate with configured LLM...")
            response = await llm_client.generate(
                prompt=prompt,
                task_type=TaskType.GENERATION,
                model=None,  # Let llm_client choose based on config
                max_tokens=1000,
                temperature=0.3
            )
            
            content = response["content"]
            
            # Clean up response
            code = self._extract_mermaid_code(content)
            
            # Validate syntax (basic)
            if not self._validate_mermaid(code):
                logger.warning("Generated invalid Mermaid, retrying...")
                raise ValueError("Invalid Mermaid syntax")
            
            # Wrap in markdown
            mermaid_code = f"```mermaid\n{code}\n```"
            
            # Calculate cost
            cost = 0.0
            tokens = response.get("tokens", {})
            model_used = response.get("model", "unknown")
            
            # Estimate cost based on model
            if "gpt" in model_used.lower():
                input_tokens = tokens.get("prompt_tokens", 200)
                output_tokens = tokens.get("completion_tokens", 300)
                if "gpt-4o-mini" in model_used.lower():
                    cost = (input_tokens / 1_000_000 * 0.15) + (output_tokens / 1_000_000 * 0.60)
                elif "gpt-4o" in model_used.lower():
                    cost = (input_tokens / 1_000_000 * 2.50) + (output_tokens / 1_000_000 * 10.00)
            elif "claude" in model_used.lower():
                input_tokens = tokens.get("prompt_tokens", 200)
                output_tokens = tokens.get("completion_tokens", 300)
                if "haiku" in model_used.lower():
                    cost = (input_tokens / 1_000_000 * 0.25) + (output_tokens / 1_000_000 * 1.25)
                elif "sonnet" in model_used.lower():
                    cost = (input_tokens / 1_000_000 * 3.00) + (output_tokens / 1_000_000 * 15.00)
            # Gemini and other free models = $0.00
            
            self.generated_count += 1
            
            logger.info(f"Mermaid generated successfully. Cost: ${cost:.4f}, Model: {model_used}")
            
            return {
                "mermaid_code": mermaid_code,
                "type_used": self._detect_type(code),
                "cost": cost,
                "model": model_used
            }
            
        except Exception as e:
            logger.error(f"Error generating Mermaid: {e}")
            raise Exception(f"Failed to generate diagram: {str(e)}")
    
    def _build_prompt(self, description: str, diagram_type: str) -> str:
        """Constrói prompt otimizado para IA"""
        
        type_hint = ""
        if diagram_type != "auto" and diagram_type in self.DIAGRAM_TYPES:
            type_hint = f"Use especificamente: {self.DIAGRAM_TYPES[diagram_type]}"
        else:
            type_hint = """Escolha o tipo mais adequado:
- Processos/Fluxos: graph TD ou graph LR
- Interações/Sequências: sequenceDiagram  
- Timeline/Cronograma: gantt
- Estruturas de dados: classDiagram
- Estados/Transições: stateDiagram-v2
- Proporções: pie
- Banco de dados: erDiagram"""
        
        prompt = f"""Você é um especialista em criar diagramas Mermaid v10+.

DESCRIÇÃO DO USUÁRIO:
{description}

INSTRUÇÕES:
{type_hint}

REGRAS IMPORTANTES:
1. Retorne APENAS o código Mermaid puro (sem ```mermaid wrapper)
2. Use labels em português
3. Mantenha SIMPLES e LEGÍVEL
4. Use IDs curtos (A, B, C ou id1, id2, etc.)
5. Máximo 15 nodes/elementos
6. Sintaxe Mermaid v10 válida

EXEMPLOS DE BOA SINTAXE:

Flowchart:
graph TD
    A[Inicio] --> B{{Decisao}}
    B -->|Sim| C[Acao]
    B -->|Nao| D[Outra Acao]

Sequence:
sequenceDiagram
    Alice->>Bob: Ola
    Bob-->>Alice: Oi!

Gantt:
gantt
    title Projeto
    Fase 1 :a1, 2024-01-01, 7d
    Fase 2 :a2, after a1, 14d

AGORA GERE O CODIGO (apenas o codigo, sem explicacoes):"""

        return prompt
    
    def _extract_mermaid_code(self, content: str) -> str:
        """Extrai código Mermaid da resposta da IA"""
        
        # Remove markdown wrappers
        code = content.strip()
        code = code.replace("```mermaid", "").replace("```", "")
        code = code.strip()
        
        # Remove explicações extras (pega só primeira parte válida)
        lines = code.split("\n")
        clean_lines = []
        
        for line in lines:
            # Para quando encontrar texto explicativo
            valid_diagram_starts = (
                "graph", "sequenceDiagram", "gantt", "classDiagram", 
                "stateDiagram", "pie", "erDiagram", "journey",
                "xychart-beta", "xychart", "mindmap", "timeline", "quadrantChart"
            )
            
            if line.strip() and not line.strip().startswith(valid_diagram_starts):
                # Check if it's a valid Mermaid line
                if any(char in line for char in ["-->", "->", "|", ":", "{", "}"]):
                    clean_lines.append(line)
                elif len(clean_lines) > 0:  # Already started, add line
                    clean_lines.append(line)
            else:
                clean_lines.append(line)
        
        return "\n".join(clean_lines).strip()
    
    def _validate_mermaid(self, code: str) -> bool:
        """Validação básica de sintaxe Mermaid"""
        
        if not code or len(code) < 10:
            return False
        
        # Check if starts with valid diagram type
        valid_starts = [
            "graph", "sequenceDiagram", "gantt", "classDiagram",
            "stateDiagram", "pie", "erDiagram", "journey",
            "xychart-beta", "xychart", "mindmap", "timeline", "quadrantChart"
        ]
        
        first_line = code.split("\n")[0].strip()
        
        return any(first_line.startswith(start) for start in valid_starts)
    
    def _detect_type(self, code: str) -> str:
        """Detecta tipo de diagrama do código"""
        
        first_line = code.split("\n")[0].strip().lower()
        
        if first_line.startswith("graph"):
            return "flowchart"
        elif first_line.startswith("sequencediagram"):
            return "sequence"
        elif first_line.startswith("gantt"):
            return "gantt"
        elif first_line.startswith("classdiagram"):
            return "class"
        elif first_line.startswith("statediagram"):
            return "state"
        elif first_line.startswith("pie"):
            return "pie"
        elif first_line.startswith("erdiagram"):
            return "er"
        elif first_line.startswith("xychart"):
            return "xychart"
        elif first_line.startswith("mindmap"):
            return "mindmap"
        elif first_line.startswith("timeline"):
            return "timeline"
        elif first_line.startswith("quadrantchart"):
            return "quadrant"
        else:
            return "unknown"
    
    def get_stats(self) -> dict:
        """Retorna estatísticas de uso"""
        return {
            "total_generated": self.generated_count,
            "supported_types": list(self.DIAGRAM_TYPES.keys())
        }


# Instância global
mermaid_agent = MermaidAgent()

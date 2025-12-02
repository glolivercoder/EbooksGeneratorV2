import { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, RotateCcw, Sparkles, Loader } from 'lucide-react'
import { useProject } from '../../stores/projectStore'
import toast from 'react-hot-toast'
import './PromptOptimizer.css'

interface PromptOptimizerProps {
  onComplete: (prompt: string, outlineData: any) => void
  initialPrompt?: string
  isLocked?: boolean
  onReset?: () => void
}

export default function PromptOptimizer({ 
  onComplete, 
  initialPrompt = 'Aprendendo usando a Tecnologia do Notebook LM - Crie um ebook conciso com 3 capítulos, cada um com aproximadamente 2 páginas. Foque em introdução prática, recursos principais e exemplos de uso do Notebook LM.', 
  isLocked = false, 
  onReset 
}: PromptOptimizerProps) {
  const [prompt, setPrompt] = useState(initialPrompt)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizedData, setOptimizedData] = useState<any>(null)
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false)
  const { addPrompt, addOutline } = useProject()

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt)
  }, [initialPrompt])

  const handleOptimize = async () => {
    if (!prompt.trim()) {
      toast.error('Digite um prompt primeiro')
      return
    }

    console.log('Enviando prompt para otimização:', prompt)
    setIsOptimizing(true)
    try {
      const response = await fetch('/api/prompt/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_prompt: prompt })
      })
      
      console.log('Status da resposta:', response.status)
      const data = await response.json()
      console.log('Dados recebidos:', data)
      if (data.status === 'success') {
        setOptimizedData(data)
        // Salvar prompt otimizado no store
        addPrompt({
          original: prompt,
          optimized: data.optimized_prompt
        })
        toast.success('Prompt otimizado com sucesso!')
      } else {
        console.error('Erro na resposta:', data)
        toast.error(`Erro ao otimizar prompt: ${data.message || 'Erro desconhecido'}`)
      }
    } catch (error) {
      console.error('Erro na requisição:', error)
      toast.error('Erro de conexão com o servidor')
    } finally {
      setIsOptimizing(false)
    }
  }

  const handleAccept = async () => {
    setIsGeneratingOutline(true)
    try {
      const response = await fetch('/api/book/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: optimizedData.optimized_prompt,
          target_audience: optimizedData.target_audience
        })
      })
      
      const outline = await response.json()
      if (outline.status === 'success') {
        // Salvar outline no store
        addOutline({
          bookTitle: optimizedData.suggested_title,
          refinedPrompt: optimizedData.optimized_prompt,
          totalChapters: outline.chapters?.length || 0,
          chapters: outline.chapters || []
        })
        onComplete(optimizedData.optimized_prompt, outline)
      } else {
        toast.error('Erro ao gerar outline')
      }
    } catch (error) {
      console.error(error)
      toast.error('Erro ao gerar outline')
    } finally {
      setIsGeneratingOutline(false)
    }
  }

  if (isLocked) {
    return (
      <div className="wizard-step prompt-optimizer locked">
        <div className="locked-header">
          <div className="locked-info">
            <CheckCircle className="text-success" size={24} />
            <div>
              <h3>Prompt Definido</h3>
              <p className="prompt-preview">{prompt}</p>
            </div>
          </div>
          {onReset && (
            <button className="btn btn-secondary btn-sm" onClick={onReset}>
              <RotateCcw size={16} /> Reiniciar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="wizard-step prompt-optimizer">
      <div className="step-header">
        <h2>📝 Descreva seu Ebook</h2>
        <p>Comece com uma ideia simples e nossa IA ajudará a expandi-la.</p>
      </div>

      <div className="prompt-input-container">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ex: Aprendendo usando a Tecnologia do Notebook LM - 3 capítulos com 2 páginas cada, focado em prática e exemplos..."
          rows={4}
          disabled={isOptimizing || !!optimizedData}
        />
        
        {!optimizedData && (
          <button 
            className="btn btn-primary btn-lg"
            onClick={handleOptimize}
            disabled={isOptimizing || !prompt.trim()}
          >
            {isOptimizing ? (
              <><Loader className="spinning" /> Otimizando...</>
            ) : (
              <><Sparkles /> Otimizar Prompt</>
            )}
          </button>
        )}
      </div>

      {optimizedData && (
        <div className="optimization-result">
          <div className="result-header">
            <h3>💡 Sugestão Otimizada</h3>
            <span className="badge">IA Enhanced</span>
          </div>
          
          <div className="optimized-content">
            <div className="field-group">
              <label>Título Sugerido:</label>
              <input 
                type="text" 
                value={optimizedData.suggested_title} 
                onChange={(e) => setOptimizedData({...optimizedData, suggested_title: e.target.value})}
              />
            </div>
            
            <div className="field-group">
              <label>Prompt Detalhado:</label>
              <textarea 
                value={optimizedData.optimized_prompt}
                onChange={(e) => setOptimizedData({...optimizedData, optimized_prompt: e.target.value})}
                rows={6}
              />
            </div>

            <div className="meta-info">
              <div className="meta-item">
                <strong>Público:</strong> {optimizedData.target_audience}
              </div>
              <div className="meta-item">
                <strong>Capítulos Est.:</strong> {optimizedData.estimated_chapters}
              </div>
            </div>
            
            <div className="suggestions-list">
              <strong>Sugestões Adicionais:</strong>
              <ul>
                {optimizedData.suggestions.map((s: string, i: number) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="action-buttons">
            <button 
              className="btn btn-secondary"
              onClick={() => setOptimizedData(null)}
            >
              <AlertCircle size={18} /> Rejeitar e Editar
            </button>
            
            <button 
              className="btn btn-primary"
              onClick={handleAccept}
              disabled={isGeneratingOutline}
            >
              {isGeneratingOutline ? (
                <><Loader className="spinning" /> Gerando Escopo...</>
              ) : (
                <><CheckCircle size={18} /> Aprovar e Gerar Escopo</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


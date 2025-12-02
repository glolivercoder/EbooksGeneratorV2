import { useState, useEffect } from 'react'
import { X, Settings, Cpu, Filter, Check, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import './LLMSelector.css'

interface LLMModel {
  id: string
  name: string
  provider: 'openrouter' | 'openai' | 'gemini'
  company?: string
  type?: 'text' | 'image' | 'audio' | 'multimodal'
  pricing?: 'free' | 'paid' | 'freemium'
  description?: string
  context_length?: number
}

interface LLMSelectorProps {
  isOpen: boolean
  onClose: () => void
}

const OPENAI_MODELS: LLMModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', company: 'OpenAI', type: 'text', pricing: 'paid', description: 'Multimodal avançado' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', company: 'OpenAI', type: 'text', pricing: 'paid', description: 'Versão econômica' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', provider: 'openai', company: 'OpenAI', type: 'text', pricing: 'paid', description: 'Respostas longas' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', provider: 'openai', company: 'OpenAI', type: 'text', pricing: 'paid', description: 'Clássico e rápido' },
]

const GEMINI_MODELS: LLMModel[] = [
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', company: 'Google', type: 'text', pricing: 'free', description: 'Versão completa' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', company: 'Google', type: 'text', pricing: 'free', description: 'Rápido e leve' },
]

export default function LLMSelector({ isOpen, onClose }: LLMSelectorProps) {
  const [selectedProvider, setSelectedProvider] = useState<'openrouter' | 'openai' | 'gemini'>('openrouter')
  const [orchestratorModel, setOrchestratorModel] = useState<string>('anthropic/claude-3.5-sonnet')
  const [agentsModel, setAgentsModel] = useState<string>('anthropic/claude-3-haiku')
  const [openrouterModels, setOpenrouterModels] = useState<LLMModel[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  
  // Filtros para OpenRouter
  const [companyFilter, setCompanyFilter] = useState<string>('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [pricingFilter, setPricingFilter] = useState<{ free: boolean; paid: boolean }>({ free: true, paid: true })

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem('llm-models-config')
    if (saved) {
      const config = JSON.parse(saved)
      setOrchestratorModel(config.orchestratorModel || 'anthropic/claude-3.5-sonnet')
      setAgentsModel(config.agentsModel || 'anthropic/claude-3-haiku')
    }
  }, [])

  // Buscar modelos da OpenRouter quando selecionado
  useEffect(() => {
    if (selectedProvider === 'openrouter' && openrouterModels.length === 0) {
      fetchOpenRouterModels()
    }
  }, [selectedProvider])

  const fetchOpenRouterModels = async () => {
    setIsLoadingModels(true)
    try {
      const response = await fetch('/api/openrouter/models?use_webpage=false')
      const data = await response.json()
      
      if (data.status === 'success') {
        const models = data.models.map((model: any) => ({
          ...model,
          provider: 'openrouter' as const
        }))
        setOpenrouterModels(models)
        toast.success(`Carregados ${models.length} modelos da OpenRouter`)
      } else {
        toast.error(`Erro ao buscar modelos: ${data.error}`)
      }
    } catch (error) {
      console.error('Erro ao buscar modelos:', error)
      toast.error('Erro ao buscar modelos da OpenRouter')
    } finally {
      setIsLoadingModels(false)
    }
  }

  const saveConfig = () => {
    const config = {
      orchestratorModel,
      agentsModel,
      selectedProvider,
      companyFilter,
      typeFilter,
      pricingFilter
    }
    localStorage.setItem('llm-models-config', JSON.stringify(config))
    toast.success('Configurações de LLM salvas!')
  }

  const getAvailableModels = (): LLMModel[] => {
    switch (selectedProvider) {
      case 'openrouter':
        const filtered = openrouterModels.filter(model => {
          const companyMatch = !companyFilter || model.company?.toLowerCase().includes(companyFilter.toLowerCase())
          const typeMatch = typeFilter === 'all' || model.type === typeFilter
          const pricingMatch = (model.pricing === 'free' && pricingFilter.free) || 
                             (model.pricing === 'paid' && pricingFilter.paid) ||
                             (model.pricing === 'freemium' && (pricingFilter.free || pricingFilter.paid))
          return companyMatch && typeMatch && pricingMatch
        })
        return filtered
      case 'openai':
        return OPENAI_MODELS
      case 'gemini':
        return GEMINI_MODELS
      default:
        return []
    }
  }

  if (!isOpen) return null

  return (
    <div className="llm-selector-overlay">
      <div className="llm-selector-modal">
        <div className="modal-header">
          <h2><Cpu size={20} /> Configurar Modelos LLM</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Seletor de Provedor */}
          <div className="provider-selector">
            <label>Provedor:</label>
            <div className="provider-buttons">
              <button
                className={`provider-btn ${selectedProvider === 'openrouter' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('openrouter')}
              >
                OpenRouter
              </button>
              <button
                className={`provider-btn ${selectedProvider === 'openai' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('openai')}
              >
                OpenAI
              </button>
              <button
                className={`provider-btn ${selectedProvider === 'gemini' ? 'active' : ''}`}
                onClick={() => setSelectedProvider('gemini')}
              >
                Gemini
              </button>
            </div>
          </div>

          {/* Filtros OpenRouter */}
          {selectedProvider === 'openrouter' && (
            <div className="filters-section">
              <div className="filters-header">
                <h3><Filter size={16} /> Filtros</h3>
                <button 
                  className="refresh-btn" 
                  onClick={fetchOpenRouterModels}
                  disabled={isLoadingModels}
                  title="Atualizar modelos"
                >
                  <RefreshCw size={16} className={isLoadingModels ? 'spinning' : ''} />
                  {isLoadingModels ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
              <div className="filters-grid">
                <div className="filter-group">
                  <label>Empresa:</label>
                  <input
                    type="text"
                    placeholder="Filtrar por empresa..."
                    value={companyFilter}
                    onChange={(e) => setCompanyFilter(e.target.value)}
                  />
                </div>
                <div className="filter-group">
                  <label>Tipo:</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="text">Texto</option>
                    <option value="image">Imagem</option>
                    <option value="audio">Áudio</option>
                    <option value="multimodal">Multimodal</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label>Preço:</label>
                  <div className="checkbox-group">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={pricingFilter.free}
                        onChange={(e) => setPricingFilter(prev => ({ ...prev, free: e.target.checked }))}
                      />
                      Gratuitos
                    </label>
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={pricingFilter.paid}
                        onChange={(e) => setPricingFilter(prev => ({ ...prev, paid: e.target.checked }))}
                      />
                      Pagos
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Modelos */}
          <div className="models-section">
            <h3>Modelos Disponíveis</h3>
            <div className="models-list">
              {selectedProvider === 'openrouter' && isLoadingModels ? (
                <div className="loading-models">
                  <RefreshCw size={24} className="spinning" />
                  <p>Carregando modelos da OpenRouter...</p>
                </div>
              ) : getAvailableModels().length === 0 ? (
                <div className="no-models">
                  <p>Nenhum modelo encontrado</p>
                  {selectedProvider === 'openrouter' && (
                    <button className="btn btn-secondary" onClick={fetchOpenRouterModels}>
                      Tentar novamente
                    </button>
                  )}
                </div>
              ) : (
                getAvailableModels().map(model => (
                  <div key={model.id} className="model-item">
                  <div className="model-info">
                    <div className="model-header">
                      <span className="model-name">{model.name}</span>
                      <span className={`model-pricing ${model.pricing}`}>
                        {model.pricing === 'free' && 'Grátis'}
                        {model.pricing === 'paid' && 'Pago'}
                        {model.pricing === 'freemium' && 'Freemium'}
                      </span>
                    </div>
                    {model.company && <span className="model-company">{model.company}</span>}
                    {model.description && <p className="model-description">{model.description}</p>}
                    {model.type && <span className="model-type">{model.type}</span>}
                  </div>
                  <div className="model-actions">
                    <button
                      className={`btn-select ${orchestratorModel === model.id ? 'selected' : ''}`}
                      onClick={() => setOrchestratorModel(model.id)}
                      title="Usar no Orquestrador"
                    >
                      <Settings size={14} />
                      {orchestratorModel === model.id && <Check size={12} />}
                    </button>
                    <button
                      className={`btn-select ${agentsModel === model.id ? 'selected' : ''}`}
                      onClick={() => setAgentsModel(model.id)}
                      title="Usar nos Agentes"
                    >
                      <Cpu size={14} />
                      {agentsModel === model.id && <Check size={12} />}
                    </button>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>

          {/* Configurações Atuais */}
          <div className="current-config">
            <h3>Configuração Atual</h3>
            <div className="config-grid">
              <div className="config-item">
                <label>Orquestrador:</label>
                <span className="model-selected">{orchestratorModel}</span>
              </div>
              <div className="config-item">
                <label>Agentes:</label>
                <span className="model-selected">{agentsModel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary" onClick={saveConfig}>
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  )
}

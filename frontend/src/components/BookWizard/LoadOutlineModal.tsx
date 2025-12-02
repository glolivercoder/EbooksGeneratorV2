import { useState, useEffect } from 'react'
import { X, Search, RefreshCw, BookOpen, Eye, Database, HardDrive } from 'lucide-react'
import toast from 'react-hot-toast'
import { useProject } from '../../stores/projectStore'
import './LoadOutlineModal.css'

interface OutlineHistory {
  id: string
  title: string
  description: string
  total_chapters: number
  created_at: string
  optimized_prompt: string
  chapters: Array<{
    number: number
    title: string
    description: string
    key_topics: string[]
    estimated_pages: number
  }>
  source?: 'backend' | 'local'
}

interface LoadOutlineModalProps {
  isOpen: boolean
  onClose: () => void
  onLoad: (outline: OutlineHistory) => void
}

export default function LoadOutlineModal({ isOpen, onClose, onLoad }: LoadOutlineModalProps) {
  const [histories, setHistories] = useState<OutlineHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedHistory, setSelectedHistory] = useState<OutlineHistory | null>(null)

  // Get local outlines from store
  const { outlines: localOutlines } = useProject()

  useEffect(() => {
    if (isOpen) {
      fetchHistories()
    }
  }, [isOpen])

  const fetchHistories = async () => {
    setIsLoading(true)
    const allHistories: OutlineHistory[] = []

    // 1. Add local outlines
    if (localOutlines && localOutlines.length > 0) {
      const formattedLocalOutlines = localOutlines.map(outline => ({
        id: outline.id,
        title: outline.bookTitle || 'Sem Título',
        description: `Outline salvo localmente. Prompt: ${(outline.refinedPrompt || '').substring(0, 50)}...`,
        total_chapters: outline.totalChapters,
        created_at: outline.createdAt,
        optimized_prompt: outline.refinedPrompt,
        chapters: outline.chapters,
        source: 'local' as const
      }))
      allHistories.push(...formattedLocalOutlines)
    }

    // 2. Fetch backend outlines
    try {
      const response = await fetch('http://localhost:8000/api/outline/history')
      const data = await response.json()

      if (data.status === 'success' && Array.isArray(data.histories)) {
        const backendHistories = data.histories.map((h: any) => ({ ...h, source: 'backend' }))
        allHistories.push(...backendHistories)
      } else {
        // Silent fail for backend if local exists, otherwise show error
        if (allHistories.length === 0) {
          toast.error('Erro ao carregar históricos do servidor')
        }
      }
    } catch (error) {
      console.error('Erro ao buscar históricos:', error)
      if (allHistories.length === 0) {
        toast.error('Erro de conexão com o servidor')
      }
    } finally {
      // Remove duplicates (by ID) if any, preferring backend (or local? let's keep both if IDs differ)
      // Assuming IDs are UUIDs, collision is unlikely.

      // Sort by date desc
      allHistories.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

      setHistories(allHistories)
      setIsLoading(false)
    }
  }

  const handleLoad = (history: OutlineHistory) => {
    onLoad(history)
    onClose()
    toast.success(`Outline carregado com sucesso (${history.source === 'local' ? 'Local' : 'Servidor'})`)
  }

  const filteredHistories = histories
    .filter(history =>
      (history.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (history.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isOpen) return null

  return (
    <div className="load-outline-overlay">
      <div className="load-outline-modal">
        <div className="modal-header">
          <h2><BookOpen size={20} /> Carregar Outline Salvo</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Busca */}
          <div className="search-section">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button className="refresh-btn" onClick={fetchHistories} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              Atualizar
            </button>
          </div>

          {/* Lista de outlines */}
          <div className="outlines-list">
            {isLoading ? (
              <div className="loading-state">
                <RefreshCw size={24} className="spinning" />
                <p>Carregando outlines...</p>
              </div>
            ) : filteredHistories.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>Nenhum outline encontrado</h3>
                <p>
                  {searchTerm ? 'Nenhum outline corresponde à sua busca.' : 'Nenhum outline salvo ainda.'}
                </p>
              </div>
            ) : (
              filteredHistories.map(history => (
                <div key={history.id} className="outline-item">
                  <div className="outline-content">
                    <div className="outline-header">
                      <div className="header-title-group">
                        <h3>{history.title}</h3>
                        {history.source === 'local' ? (
                          <span className="badge badge-local" title="Salvo no navegador"><HardDrive size={12} /> Local</span>
                        ) : (
                          <span className="badge badge-server" title="Salvo no servidor"><Database size={12} /> Server</span>
                        )}
                      </div>
                      <div className="outline-meta">
                        <span className="date">{formatDate(history.created_at)}</span>
                        <span className="chapters">{history.total_chapters} capítulos</span>
                      </div>
                    </div>

                    <p className="outline-description">{history.description}</p>

                    {selectedHistory?.id === history.id && (
                      <div className="outline-details">
                        <h4>Estrutura do Livro:</h4>
                        <div className="chapters-preview">
                          {history.chapters.slice(0, 3).map(chapter => (
                            <div key={chapter.number} className="chapter-preview">
                              <strong>Capítulo {chapter.number}:</strong> {chapter.title}
                              <p>{chapter.description}</p>
                            </div>
                          ))}
                          {history.chapters.length > 3 && (
                            <div className="more-chapters">
                              ... e mais {history.chapters.length - 3} capítulos
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="outline-actions">
                    <button
                      className="btn-action view-btn"
                      onClick={() => setSelectedHistory(selectedHistory?.id === history.id ? null : history)}
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>

                    <button
                      className="btn-action load-btn"
                      onClick={() => handleLoad(history)}
                      title="Carregar outline"
                    >
                      <BookOpen size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-info">
            <span>{filteredHistories.length} outlines encontrados</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}

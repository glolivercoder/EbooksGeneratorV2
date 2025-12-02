import { useState, useEffect } from 'react'
import { X, Clock, BookOpen, Search, Download, Trash2, Eye, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import './HistoryModal.css'

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
}

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  onRestore: (outline: OutlineHistory) => void
}

export default function HistoryModal({ isOpen, onClose, onRestore }: HistoryModalProps) {
  const [histories, setHistories] = useState<OutlineHistory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'chapters'>('date')
  const [selectedHistory, setSelectedHistory] = useState<OutlineHistory | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchHistories()
    }
  }, [isOpen])

  const fetchHistories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/outline/history')
      const data = await response.json()
      
      if (data.status === 'success') {
        setHistories(data.histories)
      } else {
        toast.error('Erro ao carregar histórico')
      }
    } catch (error) {
      console.error('Erro ao buscar históricos:', error)
      toast.error('Erro de conexão')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRestore = (history: OutlineHistory) => {
    onRestore(history)
    onClose()
    toast.success('Outline restaurado com sucesso!')
  }

  const handleDelete = async (historyId: string) => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este outline?')
    if (!confirmed) return

    try {
      const response = await fetch(`/api/outline/history/${historyId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setHistories(histories.filter(h => h.id !== historyId))
        toast.success('Outline excluído com sucesso')
      } else {
        toast.error('Erro ao excluir outline')
      }
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro de conexão')
    }
  }

  const handleExport = async (history: OutlineHistory) => {
    try {
      const response = await fetch(`/api/outline/export/${history.id}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `outline_${history.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success('Outline exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      toast.error('Erro ao exportar outline')
    }
  }

  const filteredAndSortedHistories = histories
    .filter(history => 
      history.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      history.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'chapters':
          return b.total_chapters - a.total_chapters
        default:
          return 0
      }
    })

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
    <div className="history-overlay">
      <div className="history-modal">
        <div className="modal-header">
          <h2><Clock size={20} /> Histórico de Outlines</h2>
          <button className="btn-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          {/* Filtros e busca */}
          <div className="history-filters">
            <div className="search-box">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="sort-controls">
              <label>Ordenar por:</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="date">Data</option>
                <option value="title">Título</option>
                <option value="chapters">Capítulos</option>
              </select>
            </div>

            <button className="refresh-btn" onClick={fetchHistories} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'spinning' : ''} />
              Atualizar
            </button>
          </div>

          {/* Lista de históricos */}
          <div className="history-list">
            {isLoading ? (
              <div className="loading-state">
                <RefreshCw size={24} className="spinning" />
                <p>Carregando histórico...</p>
              </div>
            ) : filteredAndSortedHistories.length === 0 ? (
              <div className="empty-state">
                <BookOpen size={48} />
                <h3>Nenhum outline encontrado</h3>
                <p>
                  {searchTerm ? 'Nenhum outline corresponde à sua busca.' : 'Nenhum outline salvo ainda.'}
                </p>
              </div>
            ) : (
              filteredAndSortedHistories.map(history => (
                <div key={history.id} className="history-item">
                  <div className="history-content">
                    <div className="history-header">
                      <h3>{history.title}</h3>
                      <div className="history-meta">
                        <span className="date">{formatDate(history.created_at)}</span>
                        <span className="chapters">{history.total_chapters} capítulos</span>
                      </div>
                    </div>
                    
                    <p className="history-description">{history.description}</p>
                    
                    {selectedHistory?.id === history.id && (
                      <div className="history-details">
                        <h4>Capítulos:</h4>
                        <div className="chapters-preview">
                          {history.chapters.slice(0, 3).map(chapter => (
                            <div key={chapter.number} className="chapter-preview">
                              <strong>Capítulo {chapter.number}:</strong> {chapter.title}
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
                  
                  <div className="history-actions">
                    <button
                      className="btn-action view-btn"
                      onClick={() => setSelectedHistory(selectedHistory?.id === history.id ? null : history)}
                      title="Ver detalhes"
                    >
                      <Eye size={16} />
                    </button>
                    
                    <button
                      className="btn-action restore-btn"
                      onClick={() => handleRestore(history)}
                      title="Restaurar outline"
                    >
                      <RefreshCw size={16} />
                    </button>
                    
                    <button
                      className="btn-action export-btn"
                      onClick={() => handleExport(history)}
                      title="Exportar outline"
                    >
                      <Download size={16} />
                    </button>
                    
                    <button
                      className="btn-action delete-btn"
                      onClick={() => handleDelete(history.id)}
                      title="Excluir outline"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-info">
            <span>{filteredAndSortedHistories.length} outlines encontrados</span>
          </div>
          <button className="btn btn-secondary" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Edit2, Plus, X, ExternalLink, Search, Globe, FileText } from 'lucide-react'
import toast from 'react-hot-toast'
import './ChapterScope.css'

interface Topic {
  id: string
  title: string
  description: string
  sources: string[]
  verified: boolean
}

interface ResearchSource {
  url: string
  title: string
  type: 'academic' | 'web' | 'custom'
  credibility: number
  last_accessed: string
}

interface ChapterScopeProps {
  chapter: {
    number: number
    title: string
    description: string
    key_topics: string[]
    estimated_pages: number
  }
  onUpdateChapter: (updates: any) => void
  bookId?: string
}

export default function ChapterScope({ chapter, onUpdateChapter, bookId }: ChapterScopeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(chapter.title)
  const [editedDescription, setEditedDescription] = useState(chapter.description)
  const [topics, setTopics] = useState<Topic[]>(
    chapter.key_topics.map((topic, index) => ({
      id: `topic-${index}`,
      title: topic,
      description: '',
      sources: [],
      verified: false
    }))
  )
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [researchSources, setResearchSources] = useState<ResearchSource[]>([])
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [isLoadingResearch, setIsLoadingResearch] = useState(false)

  useEffect(() => {
    // Carregar fontes de pesquisa do backend
    loadResearchSources()
  }, [chapter.number, bookId])

  const loadResearchSources = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/book/${bookId}/chapter/${chapter.number}/research-sources`)
      if (response.ok) {
        const data = await response.json()
        setResearchSources(data.sources || [])
      }
    } catch (error) {
      console.error('Erro ao carregar fontes de pesquisa:', error)
    }
  }

  const handleSaveEdit = () => {
    onUpdateChapter({
      title: editedTitle,
      description: editedDescription,
      key_topics: topics.map(t => t.title).filter(t => t.trim())
    })
    setIsEditing(false)
    toast.success('Capítulo atualizado com sucesso!')
  }

  const handleCancelEdit = () => {
    setEditedTitle(chapter.title)
    setEditedDescription(chapter.description)
    setIsEditing(false)
  }

  const handleAddTopic = () => {
    if (!newTopicTitle.trim()) return

    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: newTopicTitle.trim(),
      description: '',
      sources: [],
      verified: false
    }

    setTopics([...topics, newTopic])
    setNewTopicTitle('')
    toast.success('Tópico adicionado!')
  }

  const handleRemoveTopic = (topicId: string) => {
    setTopics(topics.filter(t => t.id !== topicId))
    toast.success('Tópico removido!')
  }

  const handleUpdateTopic = (topicId: string, updates: Partial<Topic>) => {
    setTopics(topics.map(t => 
      t.id === topicId ? { ...t, ...updates } : t
    ))
  }

  const handleAddCustomSource = async () => {
    if (!newSourceUrl.trim()) return

    try {
      // Validar URL
      const url = new URL(newSourceUrl.trim())
      
      // Buscar metadados da URL
      const response = await fetch('http://localhost:8000/api/research/validate-source', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.href })
      })

      if (response.ok) {
        const sourceData = await response.json()
        const newSource: ResearchSource = {
          url: url.href,
          title: sourceData.title || url.hostname,
          type: 'custom',
          credibility: sourceData.credibility || 0.5,
          last_accessed: new Date().toISOString()
        }

        setResearchSources([...researchSources, newSource])
        setNewSourceUrl('')
        toast.success('Fonte de pesquisa adicionada!')
      } else {
        toast.error('URL inválida ou inacessível')
      }
    } catch (error) {
      toast.error('URL inválida')
    }
  }

  const handleRemoveSource = (sourceUrl: string) => {
    setResearchSources(researchSources.filter(s => s.url !== sourceUrl))
    toast.success('Fonte removida!')
  }

  const handleResearchTopic = async (topicTitle: string) => {
    setIsLoadingResearch(true)
    try {
      const response = await fetch('http://localhost:8000/api/research/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          topic: topicTitle,
          chapter_number: chapter.number,
          book_id: bookId
        })
      })

      if (response.ok) {
        const researchData = await response.json()
        
        // Atualizar tópico com resultados da pesquisa
        handleUpdateTopic(topics.find(t => t.title === topicTitle)?.id || '', {
          description: researchData.summary,
          sources: researchData.sources || [],
          verified: true
        })

        // Adicionar fontes de pesquisa
        if (researchData.sources) {
          const newSources: ResearchSource[] = researchData.sources.map((source: any) => ({
            url: source.url,
            title: source.title,
            type: source.type || 'web',
            credibility: source.credibility || 0.7,
            last_accessed: new Date().toISOString()
          }))
          setResearchSources([...researchSources, ...newSources])
        }

        toast.success('Pesquisa concluída com sucesso!')
      } else {
        toast.error('Erro na pesquisa')
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error)
      toast.error('Erro ao conectar com agente de pesquisa')
    } finally {
      setIsLoadingResearch(false)
    }
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'academic': return <FileText size={14} />
      case 'web': return <Globe size={14} />
      case 'custom': return <ExternalLink size={14} />
      default: return <FileText size={14} />
    }
  }

  const getCredibilityColor = (credibility: number) => {
    if (credibility >= 0.8) return '#10b981' // green
    if (credibility >= 0.6) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  return (
    <div className="chapter-scope">
      <div className="chapter-header">
        {isEditing ? (
          <div className="edit-mode">
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="title-input"
              placeholder="Título do capítulo"
            />
            <textarea
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
              className="description-input"
              placeholder="Descrição do capítulo"
              rows={3}
            />
            <div className="edit-actions">
              <button className="btn-save" onClick={handleSaveEdit}>
                Salvar
              </button>
              <button className="btn-cancel" onClick={handleCancelEdit}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div className="view-mode">
            <div className="chapter-info">
              <h3>Capítulo {chapter.number}: {chapter.title}</h3>
              <p>{chapter.description}</p>
              <div className="chapter-meta">
                <span className="pages">{chapter.estimated_pages} páginas</span>
                <button 
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                  title="Editar capítulo"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="topics-section">
        <h4>Tópicos do Capítulo</h4>
        
        <div className="topics-list">
          {topics.map(topic => (
            <div key={topic.id} className="topic-item">
              <div className="topic-header">
                <span className="topic-title">{topic.title}</span>
                <div className="topic-actions">
                  <button
                    className="research-btn"
                    onClick={() => handleResearchTopic(topic.title)}
                    disabled={isLoadingResearch}
                    title="Pesquisar tópico"
                  >
                    <Search size={14} />
                  </button>
                  <button
                    className="remove-btn"
                    onClick={() => handleRemoveTopic(topic.id)}
                    title="Remover tópico"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              {topic.description && (
                <div className="topic-description">
                  <p>{topic.description}</p>
                  {topic.verified && <span className="verified-badge">✓ Verificado</span>}
                </div>
              )}
              
              {topic.sources.length > 0 && (
                <div className="topic-sources">
                  <strong>Fontes:</strong>
                  <ul>
                    {topic.sources.slice(0, 3).map((source, idx) => {
                      try {
                        const url = new URL(source)
                        return (
                          <li key={idx}>
                            <a href={source} target="_blank" rel="noopener noreferrer">
                              {url.hostname}
                            </a>
                          </li>
                        )
                      } catch (error) {
                        return (
                          <li key={idx}>
                            <span className="invalid-url" title="URL inválida">
                              {source}
                            </span>
                          </li>
                        )
                      }
                    })}
                    {topic.sources.length > 3 && (
                      <li>+{topic.sources.length - 3} fontes</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
          
          <div className="add-topic">
            <input
              type="text"
              value={newTopicTitle}
              onChange={(e) => setNewTopicTitle(e.target.value)}
              placeholder="Adicionar novo tópico..."
              onKeyPress={(e) => e.key === 'Enter' && handleAddTopic()}
            />
            <button className="add-btn" onClick={handleAddTopic}>
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="research-sources-section">
        <h4>Fontes de Pesquisa (RAG)</h4>
        
        <div className="add-source">
          <input
            type="url"
            value={newSourceUrl}
            onChange={(e) => setNewSourceUrl(e.target.value)}
            placeholder="Adicionar URL de pesquisa..."
          />
          <button className="add-source-btn" onClick={handleAddCustomSource}>
            <Plus size={16} />
          </button>
        </div>

        <div className="sources-list">
          {researchSources.map((source, index) => (
            <div key={index} className="source-item">
              <div className="source-header">
                <div className="source-info">
                  {getSourceIcon(source.type)}
                  <div className="source-details">
                    <span className="source-title">{source.title}</span>
                    <span className="source-url">{new URL(source.url).hostname}</span>
                  </div>
                </div>
                <div className="source-meta">
                  <div 
                    className="credibility-indicator"
                    style={{ backgroundColor: getCredibilityColor(source.credibility) }}
                    title={`Credibilidade: ${Math.round(source.credibility * 100)}%`}
                  />
                  <button
                    className="remove-source-btn"
                    onClick={() => handleRemoveSource(source.url)}
                    title="Remover fonte"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              <div className="source-actions">
                <a 
                  href={source.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="visit-btn"
                >
                  <ExternalLink size={14} />
                  Visitar
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isLoadingResearch && (
        <div className="research-loading">
          <div className="spinner"></div>
          <p>Pesquisando tópicos...</p>
        </div>
      )}
    </div>
  )
}

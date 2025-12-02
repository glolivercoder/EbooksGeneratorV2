import { useState } from 'react'
import { useProject } from '../../stores/projectStore'
import { Eye, Trash2, Download, RefreshCw, Book, FileText, List } from 'lucide-react'
import toast from 'react-hot-toast'
import './SavedDataTab.css'

interface SavedDataTabProps {
  className?: string
}

export default function SavedDataTab({ className }: SavedDataTabProps) {
  const { prompts, outlines, books, clearAll } = useProject()
  const [activeTab, setActiveTab] = useState<'prompts' | 'outlines' | 'books'>('prompts')
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleDeletePrompt = (_id: string) => {
    // TODO: Implementar deletePrompt no store usando o id
    toast.error('Função de exclusão ainda não implementada')
  }

  const handleDeleteOutline = (_id: string) => {
    // TODO: Implementar deleteOutline no store usando o id
    toast.error('Função de exclusão ainda não implementada')
  }

  const handleDeleteBook = (_id: string) => {
    // TODO: Implementar deleteBook no store usando o id
    toast.error('Função de exclusão ainda não implementada')
  }

  const handleLoadOutline = (_outline: any) => {
    // TODO: Implementar carregamento de outline no BookWizard usando o outline
    toast('Função de carregamento ainda não implementada', {
      icon: 'ℹ️'
    })
  }

  const handleExportData = () => {
    const data = { prompts, outlines, books }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ebook-generator-data-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    toast.success('Dados exportados com sucesso!')
  }

  const handleClearAll = () => {
    if (confirm('Tem certeza que deseja excluir TODOS os dados salvos? Esta ação não pode ser desfeita.')) {
      clearAll()
      toast.success('Todos os dados foram excluídos')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <div className={`saved-data-tab ${className || ''}`}>
      <div className="saved-data-header">
        <h2>Dados Salvos</h2>
        <div className="header-actions">
          <button className="btn btn-secondary btn-sm" onClick={handleExportData}>
            <Download size={16} /> Exportar Tudo
          </button>
          <button className="btn btn-danger btn-sm" onClick={handleClearAll}>
            <Trash2 size={16} /> Limpar Tudo
          </button>
        </div>
      </div>

      <div className="data-tabs">
        <button
          className={`tab-btn ${activeTab === 'prompts' ? 'active' : ''}`}
          onClick={() => setActiveTab('prompts')}
        >
          <FileText size={16} /> Prompts ({prompts.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'outlines' ? 'active' : ''}`}
          onClick={() => setActiveTab('outlines')}
        >
          <List size={16} /> Outlines ({outlines.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          <Book size={16} /> Books ({books.length})
        </button>
      </div>

      <div className="data-content">
        {activeTab === 'prompts' && (
          <div className="data-list">
            {prompts.length === 0 ? (
              <p className="empty-state">Nenhum prompt salvo.</p>
            ) : (
              prompts.map((prompt) => (
                <div key={prompt.id} className="data-item">
                  <div className="data-item-header" onClick={() => toggleExpanded(prompt.id)}>
                    <div className="item-info">
                      <span className="item-title">Prompt #{prompt.id.slice(-6)}</span>
                      <span className="item-date">{formatDate(prompt.createdAt)}</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); toggleExpanded(prompt.id) }}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDeletePrompt(prompt.id) }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {expandedItems.has(prompt.id) && (
                    <div className="data-item-content">
                      <div className="content-section">
                        <h4>Original:</h4>
                        <p>{prompt.original}</p>
                      </div>
                      {prompt.optimized && (
                        <div className="content-section">
                          <h4>Otimizado:</h4>
                          <p>{prompt.optimized}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'outlines' && (
          <div className="data-list">
            {outlines.length === 0 ? (
              <p className="empty-state">Nenhum outline salvo.</p>
            ) : (
              outlines.map((outline) => (
                <div key={outline.id} className="data-item">
                  <div className="data-item-header" onClick={() => toggleExpanded(outline.id)}>
                    <div className="item-info">
                      <span className="item-title">{outline.bookTitle}</span>
                      <span className="item-meta">{outline.totalChapters} capítulos</span>
                      <span className="item-date">{formatDate(outline.createdAt)}</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon btn-primary" onClick={(e) => { e.stopPropagation(); handleLoadOutline(outline) }}>
                        <RefreshCw size={16} />
                      </button>
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); toggleExpanded(outline.id) }}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteOutline(outline.id) }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {expandedItems.has(outline.id) && (
                    <div className="data-item-content">
                      <div className="content-section">
                        <h4>Prompt Refinado:</h4>
                        <p>{outline.refinedPrompt}</p>
                      </div>
                      <div className="content-section">
                        <h4>Capítulos:</h4>
                        <ul>
                          {outline.chapters.map((chapter: any) => (
                            <li key={chapter.number}>
                              Capítulo {chapter.number}: {chapter.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'books' && (
          <div className="data-list">
            {books.length === 0 ? (
              <p className="empty-state">Nenhum livro salvo.</p>
            ) : (
              books.map((book) => (
                <div key={book.id} className="data-item">
                  <div className="data-item-header" onClick={() => toggleExpanded(book.id)}>
                    <div className="item-info">
                      <span className="item-title">{book.title}</span>
                      <span className="item-meta">{book.chapters.length} capítulos</span>
                      <span className="item-date">{formatDate(book.createdAt)}</span>
                    </div>
                    <div className="item-actions">
                      <button className="btn-icon" onClick={(e) => { e.stopPropagation(); toggleExpanded(book.id) }}>
                        <Eye size={16} />
                      </button>
                      <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteBook(book.id) }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {expandedItems.has(book.id) && (
                    <div className="data-item-content">
                      <div className="content-section">
                        <h4>Capítulos:</h4>
                        <ul>
                          {book.chapters.map((chapter: any) => (
                            <li key={chapter.number}>
                              Capítulo {chapter.number}: {chapter.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { X, ExternalLink, Filter } from 'lucide-react'
import { getTemplateReferences, TemplateReference } from '../../services/designService'
import './TemplateReferencesModal.css'

interface TemplateReferencesModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect?: (reference: TemplateReference) => void
}

export default function TemplateReferencesModal({ isOpen, onClose, onSelect }: TemplateReferencesModalProps) {
    const [references, setReferences] = useState<TemplateReference[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('all')

    useEffect(() => {
        if (isOpen) {
            loadReferences()
        }
    }, [isOpen])

    const loadReferences = async () => {
        setLoading(true)
        try {
            const data = await getTemplateReferences()
            setReferences(data)
        } catch (error) {
            console.error('Failed to load references:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredReferences = filter === 'all'
        ? references
        : references.filter(ref => ref.category === filter || ref.theme === filter)

    if (!isOpen) return null

    return (
        <div className="modal-overlay">
            <div className="modal-content references-modal">
                <div className="modal-header">
                    <h2>🎨 Referências de Design</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    <div className="filters">
                        <Filter size={16} />
                        <button
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            Todos
                        </button>
                        <button
                            className={filter === 'blog' ? 'active' : ''}
                            onClick={() => setFilter('blog')}
                        >
                            Blog
                        </button>
                        <button
                            className={filter === 'cover' ? 'active' : ''}
                            onClick={() => setFilter('cover')}
                        >
                            Capas
                        </button>
                        <button
                            className={filter === 'editorial' ? 'active' : ''}
                            onClick={() => setFilter('editorial')}
                        >
                            Editorial
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading-state">Carregando referências...</div>
                    ) : (
                        <div className="references-grid">
                            {filteredReferences.map(ref => (
                                <div key={ref.id} className="reference-card">
                                    <div className="reference-image">
                                        <img src={ref.imageUrl} alt={ref.title} />
                                        <div className="reference-overlay">
                                            <a
                                                href={ref.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="view-source-btn"
                                            >
                                                <ExternalLink size={16} /> Ver Fonte
                                            </a>
                                        </div>
                                    </div>
                                    <div className="reference-info">
                                        <h3>{ref.title}</h3>
                                        <span className="badge">{ref.theme}</span>
                                        <p>{ref.description}</p>
                                        {onSelect && (
                                            <button
                                                className="use-reference-btn"
                                                onClick={() => onSelect(ref)}
                                            >
                                                Usar como Base
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

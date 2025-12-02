import { useState, useEffect } from 'react'
import { Trash2, Plus, ArrowRight, ArrowLeft, BookOpen, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useBookStore } from '../../stores/bookStore'

interface Chapter {
    number: number
    title: string
    description: string
    key_topics: string[]
    dependencies: number[]
    estimated_pages: number
}

interface OutlineData {
    book_title: string
    refined_prompt: string
    total_chapters: number
    chapters: Chapter[]
    research_areas: string[]
    required_libraries: string[]
    detected_domains: string[]
}

interface OutlineEditorProps {
    initialOutline: OutlineData
    onBack: () => void
    onComplete: (finalOutline: OutlineData) => void
}

export default function OutlineEditor({ initialOutline, onBack, onComplete }: OutlineEditorProps) {
    const [outline, setOutline] = useState<OutlineData>(initialOutline)
    const { updateOutline, currentBook, setCurrentBook } = useBookStore()

    // Auto-save outline com debouncing
    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (outline && outline.book_title) {
                console.log('OutlineEditor - Auto-salvando outline:', outline.book_title)

                // Atualizar ou criar currentBook
                const bookData = {
                    id: currentBook?.id || crypto.randomUUID(),
                    title: outline.book_title,
                    description: outline.refined_prompt || '',
                    optimized_prompt: outline.refined_prompt || '',
                    total_chapters: outline.total_chapters || 0,
                    chapters: outline.chapters || [],
                    created_at: currentBook?.created_at || new Date().toISOString(),
                    last_modified: new Date().toISOString(),
                    last_saved: new Date().toISOString(),
                    status: 'in_progress' as const
                }

                setCurrentBook(bookData)
                console.log('✓ Outline salvo no store')
            }
        }, 1500)

        return () => window.clearTimeout(timer)
    }, [outline, currentBook, setCurrentBook])

    const updateChapter = (index: number, field: keyof Chapter, value: any) => {
        if (!outline.chapters) return
        const newChapters = [...outline.chapters]
        newChapters[index] = { ...newChapters[index], [field]: value }
        setOutline({ ...outline, chapters: newChapters })
    }

    const removeChapter = (index: number) => {
        if (!outline.chapters || outline.chapters.length <= 1) {
            toast.error('O livro precisa ter pelo menos um capítulo.')
            return
        }

        const chapter = outline.chapters[index]
        const confirmed = window.confirm(
            `Remover o capítulo ${chapter.number}: "${chapter.title}"? Essa alteração não poderá ser desfeita nesta tela.`
        )
        if (!confirmed) return

        const newChapters = outline.chapters.filter((_, i) => i !== index)
        // Reordenar números
        const reordered = newChapters.map((ch, i) => ({ ...ch, number: i + 1 }))
        setOutline({ ...outline, chapters: reordered, total_chapters: reordered.length })
        toast.success('Capítulo removido do escopo do livro.')
    }

    const addChapter = () => {
        if (!outline.chapters) return

        const newChapter: Chapter = {
            number: outline.chapters.length + 1,
            title: 'Novo Capítulo',
            description: 'Descrição do capítulo...',
            key_topics: [],
            dependencies: [],
            estimated_pages: 10
        }
        setOutline({
            ...outline,
            chapters: [...(outline.chapters || []), newChapter],
            total_chapters: (outline.chapters?.length || 0) + 1
        })
    }

    const handleStartGeneration = () => {
        onComplete(outline)
    }

    return (
        <div className="wizard-step outline-editor">
            <div className="step-header">
                <h2>📚 Escopo do Livro</h2>
                <p>Revise e ajuste a estrutura do seu livro antes de gerar.</p>
            </div>

            <div className="outline-meta">
                <div className="meta-group">
                    <label>Título do Livro:</label>
                    <input
                        type="text"
                        value={outline.book_title || ''}
                        onChange={(e) => setOutline({ ...outline, book_title: e.target.value })}
                        className="title-input"
                    />
                </div>

                <div className="meta-tags">
                    <div className="tag-group">
                        <strong>Domínios Detectados:</strong>
                        {outline.detected_domains?.map(d => (
                            <span key={d} className="tag domain">{d}</span>
                        )) || <span className="tag">Nenhum domínio detectado</span>}
                    </div>
                    <div className="tag-group">
                        <strong>Bibliotecas Sugeridas:</strong>
                        {outline.required_libraries?.map(lib => (
                            <span key={lib} className="tag library">{lib}</span>
                        )) || <span className="tag">Nenhuma biblioteca sugerida</span>}
                    </div>
                </div>
            </div>

            <div className="chapters-list">
                {outline.chapters?.map((chapter, index) => (
                    <div key={index} className="chapter-card">
                        <div className="chapter-header">
                            <span className="chapter-number">Capítulo {chapter.number}</span>
                            <div className="chapter-actions">
                                <span className="pages-est"><Clock size={14} /> ~{chapter.estimated_pages} pág</span>
                                <button className="btn-icon danger" onClick={() => removeChapter(index)}>
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <div className="chapter-body">
                            <input
                                type="text"
                                value={chapter.title || ''}
                                onChange={(e) => updateChapter(index, 'title', e.target.value)}
                                className="chapter-title-input"
                            />
                            <textarea
                                value={chapter.description || ''}
                                onChange={(e) => updateChapter(index, 'description', e.target.value)}
                                className="chapter-desc-input"
                                rows={2}
                            />
                            <div className="topics-list">
                                <small>Tópicos: {chapter.key_topics?.join(', ') || 'Nenhum tópico definido'}</small>
                            </div>
                        </div>
                    </div>
                ))}

                <button className="btn-add-chapter" onClick={addChapter}>
                    <Plus size={20} /> Adicionar Capítulo
                </button>
            </div>

            <div className="wizard-actions">
                <button className="btn btn-secondary" onClick={onBack}>
                    <ArrowLeft size={18} /> Voltar
                </button>
                <button className="btn btn-primary btn-lg" onClick={handleStartGeneration}>
                    <BookOpen size={18} /> Iniciar Geração Completa <ArrowRight size={18} />
                </button>
            </div>
        </div>
    )
}

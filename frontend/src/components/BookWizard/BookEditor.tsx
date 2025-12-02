import { useState, useEffect } from 'react'
import { Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import RichTextEditor from '../RichTextEditor/RichTextEditor'
import '../RichTextEditor/RichTextEditor.css'

interface BookEditorProps {
    bookId: string
}

export default function BookEditor({ bookId }: BookEditorProps) {
    const [book, setBook] = useState<any>(null)
    const [currentChapterIndex, setCurrentChapterIndex] = useState(0)

    useEffect(() => {
        const fetchBook = async () => {
            const response = await fetch(`/api/book/${bookId}`)
            const data = await response.json()
            setBook(data)
        }
        fetchBook()
    }, [bookId])

    if (!book) return <div>Carregando livro...</div>

    const currentChapter = book.chapters.find((c: any) => c.chapter_number === currentChapterIndex + 1)
    const totalChapters = book.outline.total_chapters

    return (
        <div className="wizard-step book-editor">
            <div className="editor-layout">
                {/* Sidebar */}
                <div className="editor-sidebar">
                    <h3>📚 Capítulos</h3>
                    <div className="chapter-nav">
                        {book.outline.chapters.map((ch: any, index: number) => (
                            <button
                                key={ch.number}
                                className={`nav-item ${index === currentChapterIndex ? 'active' : ''}`}
                                onClick={() => setCurrentChapterIndex(index)}
                            >
                                <span className="num">{ch.number}</span>
                                <span className="title">{ch.title}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Editor */}
                <div className="editor-main">
                    <div className="editor-toolbar">
                        <div className="nav-controls">
                            <button
                                disabled={currentChapterIndex === 0}
                                onClick={() => setCurrentChapterIndex(prev => prev - 1)}
                            >
                                <ChevronLeft size={18} /> Anterior
                            </button>
                            <span>Capítulo {currentChapterIndex + 1} de {totalChapters}</span>
                            <button
                                disabled={currentChapterIndex === totalChapters - 1}
                                onClick={() => setCurrentChapterIndex(prev => prev + 1)}
                            >
                                Próximo <ChevronRight size={18} />
                            </button>
                        </div>

                        <div className="action-controls">
                            <button className="btn btn-secondary btn-sm">
                                <RefreshCw size={16} /> Regenerar
                            </button>
                            <button className="btn btn-primary btn-sm">
                                <Download size={16} /> Exportar
                            </button>
                        </div>
                    </div>

                    <div className="editor-content">
                        {currentChapter ? (
                            <div className="chapter-view">
                                <h1>{currentChapter.chapter_title}</h1>
                                <div className="content-body">
                                    <RichTextEditor
                                        content={currentChapter.content}
                                        editable={false}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="empty-state">Capítulo não encontrado</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

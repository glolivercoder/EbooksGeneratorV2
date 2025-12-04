import { useState, useEffect } from 'react'
import { X, BookOpen, Trash2, Clock } from 'lucide-react'
import { useBookStore, BookData } from '../../stores/bookStore'
import './SavedFilesModal.css'

interface SavedFilesModalProps {
    isOpen: boolean
    onClose: () => void
    onLoad: (fileData: BookData) => void
}

export default function SavedFilesModal({ isOpen, onClose, onLoad }: SavedFilesModalProps) {
    const { currentBook, savedBooks, deleteFromLibrary } = useBookStore()
    const [files, setFiles] = useState<BookData[]>([])

    // Carregar arquivos salvos quando modal abre
    useEffect(() => {
        if (isOpen) {
            setFiles(savedBooks || [])
        }
    }, [isOpen, savedBooks])

    const handleLoad = (file: BookData) => {
        console.log('SavedFilesModal - Carregando arquivo:', file.title)
        onLoad(file)
        onClose()
    }

    const handleDelete = (fileId: string) => {
        if (window.confirm('Deseja realmente deletar este arquivo?')) {
            if(fileId){
                deleteFromLibrary(fileId)
                console.log('✓ Arquivo deletado')
            }
        }
    }

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'Nunca'
        try {
            const date = new Date(isoString)
            return date.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return 'Data inválida'
        }
    }

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content saved-files-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>
                        <BookOpen size={24} />
                        Arquivos Salvos
                    </h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body">
                    {files.length === 0 ? (
                        <div className="empty-state">
                            <BookOpen size={48} />
                            <p>Nenhum arquivo salvo encontrado</p>
                            <small>Crie um novo outline para começar</small>
                        </div>
                    ) : (
                        <div className="files-list">
                            {files.map(file => (
                                <div
                                    key={file.id}
                                    className={`file-item ${currentBook?.id === file.id ? 'active' : ''}`}
                                    onClick={() => handleLoad(file)}
                                >
                                    <div className="file-info">
                                        <h3>{file.title || 'Sem título'}</h3>
                                        <p className="file-description">{file.description || 'Sem descrição'}</p>
                                        <div className="file-meta">
                                            <span>
                                                <BookOpen size={14} />
                                                {file.total_chapters || 0} capítulos
                                            </span>
                                            <span>
                                                <Clock size={14} />
                                                {formatDate(file.last_saved || file.last_modified)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="delete-btn"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if(file.id){
                                                handleDelete(file.id)
                                            }
                                        }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

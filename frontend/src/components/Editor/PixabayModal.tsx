import { useState } from 'react'
import { X, Search, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'
import './PixabayModal.css'

interface PixabayImage {
    id: number
    previewURL: string
    largeImageURL: string
    tags: string
    user: string
}

interface PixabayModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectImage: (url: string, alt: string) => void
}

export default function PixabayModal({ isOpen, onClose, onSelectImage }: PixabayModalProps) {
    const [query, setQuery] = useState('')
    const [images, setImages] = useState<PixabayImage[]>([])
    const [loading, setLoading] = useState(false)
    const [searched, setSearched] = useState(false)

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!query.trim()) return

        setLoading(true)
        setSearched(true)
        try {
            const response = await fetch(`http://localhost:8000/api/images/pixabay?query=${encodeURIComponent(query)}&per_page=12`)

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.detail || 'Erro ao buscar imagens')
            }

            const data = await response.json()
            setImages(data.images || [])

            if (data.images?.length === 0) {
                toast('Nenhuma imagem encontrada', { icon: '🔍' })
            }
        } catch (error) {
            console.error('Erro na busca:', error)
            toast.error('Erro ao buscar imagens. Verifique a API Key.')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="pixabay-modal-overlay" onClick={onClose}>
            <div className="pixabay-modal" onClick={e => e.stopPropagation()}>
                <div className="pixabay-header">
                    <div className="header-title">
                        <ImageIcon className="pixabay-icon" />
                        <h3>Buscar Imagens no Pixabay</h3>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="pixabay-search">
                    <form onSubmit={handleSearch} className="search-form">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Digite um tema (ex: tecnologia, natureza...)"
                            autoFocus
                        />
                        <button type="submit" disabled={loading || !query.trim()}>
                            {loading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                            Buscar
                        </button>
                    </form>
                </div>

                <div className="pixabay-results">
                    {loading ? (
                        <div className="loading-state">
                            <Loader2 className="animate-spin" size={32} />
                            <p>Buscando imagens...</p>
                        </div>
                    ) : images.length > 0 ? (
                        <div className="images-grid">
                            {images.map((img) => (
                                <div
                                    key={img.id}
                                    className="image-card"
                                    onClick={() => {
                                        onSelectImage(img.largeImageURL, img.tags)
                                        onClose()
                                    }}
                                >
                                    <img src={img.previewURL} alt={img.tags} loading="lazy" />
                                    <div className="image-overlay">
                                        <span>{img.tags.split(',')[0]}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searched ? (
                        <div className="empty-state">
                            <p>Nenhuma imagem encontrada para "{query}"</p>
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Digite algo para buscar imagens de alta qualidade</p>
                            <span className="powered-by">Powered by Pixabay</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

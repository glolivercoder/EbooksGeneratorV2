import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, X } from 'lucide-react'
import './ImageUploader.css'

interface ImageUploaderProps {
    onImageSelect: (file: File, dataUrl: string) => void
    onRemove?: () => void
    currentImage?: string
}

export default function ImageUploader({ onImageSelect, onRemove, currentImage }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [preview, setPreview] = useState<string | null>(currentImage || null)
    const [isDragging, setIsDragging] = useState(false)

    const handleFileSelect = (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem válida')
            return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string
            setPreview(dataUrl)
            onImageSelect(file, dataUrl)
        }
        reader.readAsDataURL(file)
    }

    const handleClick = () => {
        fileInputRef.current?.click()
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFileSelect(file)
        }
    }

    const handleRemove = () => {
        setPreview(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
        onRemove?.()
    }

    return (
        <div className="image-uploader">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                style={{ display: 'none' }}
            />

            {preview ? (
                <div className="image-preview">
                    <img src={preview} alt="Preview" />
                    <button className="remove-btn" onClick={handleRemove}>
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    className={`upload-area ${isDragging ? 'dragging' : ''}`}
                    onClick={handleClick}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <ImageIcon size={32} />
                    <p>Arraste uma imagem ou clique para selecionar</p>
                    <span>Usada para extrair paleta de cores</span>
                </div>
            )}
        </div>
    )
}

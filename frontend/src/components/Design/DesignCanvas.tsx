import { useEffect, useRef } from 'react'
import { Download, FileDown } from 'lucide-react'
import { useDesignStore } from '../../stores/designStore'
import './DesignCanvas.css'

interface DesignCanvasProps {
    onExport?: (html: string) => void
}

export default function DesignCanvas({ onExport }: DesignCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const { config } = useDesignStore()

    // Initialize canvas with placeholder
    useEffect(() => {
        if (!canvasRef.current) return

        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

        // Draw placeholder
        ctx.fillStyle = config.colors.background
        ctx.fillRect(0, 0, 800, 1000)

        ctx.fillStyle = config.colors.textSecondary
        ctx.font = '24px Inter'
        ctx.textAlign = 'center'
        ctx.fillText('Canvas de Design', 400, 500)
        ctx.font = '14px Inter'
        ctx.fillText('(Fabric.js será integrado em breve)', 400, 530)
    }, [config.colors])

    const handleAddText = () => {
        // TODO: Implement with Fabric.js
        console.log('Add text - Fabric.js integration pending')
    }

    const handleAddRectangle = () => {
        // TODO: Implement with Fabric.js
        console.log('Add rectangle - Fabric.js integration pending')
    }

    const handleExportPNG = () => {
        if (!canvasRef.current) return

        const dataURL = canvasRef.current.toDataURL('image/png')
        const link = document.createElement('a')
        link.download = 'design-cover.png'
        link.href = dataURL
        link.click()
    }

    const handleExportToEditor = () => {
        if (!canvasRef.current || !onExport) return

        const dataURL = canvasRef.current.toDataURL('image/png')
        const html = `
      <div class="design-cover" style="text-align: center; margin: 20px 0;">
        <img src="${dataURL}" alt="Design Cover" style="max-width: 100%; height: auto;" />
      </div>
    `

        onExport(html)
    }

    const handleClear = () => {
        if (!canvasRef.current) return

        const ctx = canvasRef.current.getContext('2d')
        if (!ctx) return

        ctx.fillStyle = config.colors.background
        ctx.fillRect(0, 0, 800, 1000)
    }

    return (
        <div className="design-canvas-container">
            <div className="canvas-toolbar">
                <button onClick={handleAddText} className="tool-btn" disabled>
                    + Texto
                </button>
                <button onClick={handleAddRectangle} className="tool-btn" disabled>
                    + Retângulo
                </button>
                <button onClick={handleClear} className="tool-btn danger">
                    Limpar
                </button>
                <div className="spacer"></div>
                <button onClick={handleExportPNG} className="tool-btn">
                    <Download size={16} />
                    PNG
                </button>
                <button onClick={handleExportToEditor} className="tool-btn primary">
                    <FileDown size={16} />
                    Aplicar ao Editor
                </button>
            </div>

            <div className="canvas-wrapper">
                <canvas ref={canvasRef} width={800} height={1000} />
            </div>

            <div className="canvas-status">
                <span>⚠️ Fabric.js integration em desenvolvimento - funcionalidade limitada</span>
            </div>
        </div>
    )
}

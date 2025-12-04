import { useEffect, useRef, useState } from 'react'
import { Canvas, FabricObject, Rect, Circle, Textbox } from 'fabric'
import { Download, FileDown } from 'lucide-react'
import { useDesignStore } from '../../stores/designStore'
import './DesignCanvas.css'

interface DesignCanvasProps {
    onExport?: (html: string) => void
}

export default function DesignCanvas({ onExport }: DesignCanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null)
    const { config } = useDesignStore()

    // Initialize Fabric.js v6 canvas
    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = new Canvas(canvasRef.current, {
            width: 800,
            height: 1000,
            backgroundColor: config.colors.background,
        })

        // Add welcome text
        const welcomeText = new Textbox('Clique em "+" para começar', {
            left: 400,
            top: 500,
            width: 400,
            fontSize: 24,
            fill: '#999',
            fontFamily: 'Inter',
            textAlign: 'center',
            originX: 'center',
            originY: 'center',
        })

        canvas.add(welcomeText)
        setFabricCanvas(canvas)

        return () => {
            canvas.dispose()
        }
    }, [])

    // Update canvas background when theme changes
    useEffect(() => {
        if (fabricCanvas && config.colors.background) {
            fabricCanvas.set('backgroundColor', config.colors.background)
            fabricCanvas.renderAll()
        }
    }, [fabricCanvas, config.colors.background])

    const handleAddText = () => {
        if (!fabricCanvas) return

        const text = new Textbox('Edite este texto', {
            left: 100,
            top: 100,
            width: 200,
            fontSize: 32,
            fill: config.colors.textPrimary,
            fontFamily: config.typography.primary,
        })

        fabricCanvas.add(text)
        fabricCanvas.setActiveObject(text)
        fabricCanvas.renderAll()
    }

    const handleAddRectangle = () => {
        if (!fabricCanvas) return

        const rect = new Rect({
            left: 100,
            top: 100,
            width: 200,
            height: 150,
            fill: config.colors.primary,
            stroke: config.colors.secondary,
            strokeWidth: 2,
        })

        fabricCanvas.add(rect)
        fabricCanvas.setActiveObject(rect)
        fabricCanvas.renderAll()
    }

    const handleAddCircle = () => {
        if (!fabricCanvas) return

        const circle = new Circle({
            left: 100,
            top: 100,
            radius: 75,
            fill: config.colors.accent,
            stroke: config.colors.primary,
            strokeWidth: 2,
        })

        fabricCanvas.add(circle)
        fabricCanvas.setActiveObject(circle)
        fabricCanvas.renderAll()
    }

    const handleExportPNG = () => {
        if (!fabricCanvas) return

        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1,
        })

        const link = document.createElement('a')
        link.download = 'design-cover.png'
        link.href = dataURL
        link.click()
    }

    const handleExportToEditor = () => {
        if (!fabricCanvas || !onExport) return

        const dataURL = fabricCanvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 1,
        })

        const html = `
      <div class="design-cover" style="text-align: center; margin: 20px 0;">
        <img src="${dataURL}" alt="Design Cover" style="max-width: 100%; height: auto;" />
      </div>
    `

        onExport(html)
    }

    const handleClear = () => {
        if (!fabricCanvas) return
        fabricCanvas.clear()
        fabricCanvas.set('backgroundColor', config.colors.background)
        fabricCanvas.renderAll()
    }

    const handleDelete = () => {
        if (!fabricCanvas) return
        const activeObjects = fabricCanvas.getActiveObjects()
        if (activeObjects.length) {
            fabricCanvas.remove(...activeObjects)
            fabricCanvas.discardActiveObject()
            fabricCanvas.renderAll()
        }
    }

    return (
        <div className="design-canvas-container">
            <div className="canvas-toolbar">
                <button onClick={handleAddText} className="tool-btn">
                    + Texto
                </button>
                <button onClick={handleAddRectangle} className="tool-btn">
                    + Retângulo
                </button>
                <button onClick={handleAddCircle} className="tool-btn">
                    + Círculo
                </button>
                <button onClick={handleDelete} className="tool-btn">
                    🗑️ Deletar
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
                <canvas ref={canvasRef} />
            </div>

            <div className="canvas-info">
                <span>✨ Fabric.js v6 integrado! Arraste, redimensione e edite objetos livremente.</span>
            </div>
        </div>
    )
}

/**
 * Export Service - Exporta templates em múltiplos formatos
 */

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'

export interface ExportOptions {
    filename?: string
    pageSize?: 'A4' | 'Letter' | 'A5'
    orientation?: 'portrait' | 'landscape'
}

/**
 * Converte imagens em base64 (já implementado no HTML gerado)
 */
async function ensureBase64Images(html: string): Promise<string> {
    return html
}

/**
 * Exporta como PDF usando jsPDF + html2canvas
 */
export async function exportAsPDF(html: string, options: ExportOptions = {}): Promise<void> {
    const {
        filename = 'documento',
        pageSize = 'A4',
        orientation = 'portrait'
    } = options

    try {
        const container = document.createElement('div')
        container.innerHTML = html
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        container.style.width = '800px'
        document.body.appendChild(container)

        const canvas = await html2canvas(container, {
            scale: 2,
            useCORS: true,
            logging: false
        })

        document.body.removeChild(container)

        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF({
            orientation,
            unit: 'mm',
            format: pageSize
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 0

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
        pdf.save(`${filename}.pdf`)

        return Promise.resolve()
    } catch (error) {
        console.error('Erro ao exportar PDF:', error)
        throw new Error('Falha ao exportar PDF')
    }
}

/**
 * Exporta como HTML/CSS standalone (Blog)
 */
export async function exportAsHTML(html: string, options: ExportOptions = {}): Promise<void> {
    const { filename = 'documento' } = options

    try {
        const processedHTML = await ensureBase64Images(html)
        const blob = new Blob([processedHTML], { type: 'text/html;charset=utf-8' })
        saveAs(blob, `${filename}.html`)
    } catch (error) {
        console.error('Erro ao exportar HTML:', error)
        throw new Error('Falha ao exportar HTML')
    }
}

/**
 * Exporta como Word (.doc)
 * HTML compatível com Microsoft Word
 */
export async function exportAsWord(html: string, options: ExportOptions = {}): Promise<void> {
    const { filename = 'documento' } = options

    try {
        // Criar HTML com metadados para Word
        const wordHTML = `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
<head>
    <meta charset='utf-8'>
    <title>${filename}</title>
</head>
<body>
${html}
</body>
</html>`

        const blob = new Blob([wordHTML], { type: 'application/vnd.ms-word' })
        saveAs(blob, `${filename}.doc`)
    } catch (error) {
        console.error('Erro ao exportar Word:', error)
        throw new Error('Falha ao exportar Word')
    }
}

/**
 * Exporta como LibreOffice (.odt)
 */
export async function exportAsODT(html: string, options: ExportOptions = {}): Promise<void> {
    const { filename = 'documento' } = options

    try {
        const odtContent = `<?xml version="1.0" encoding="UTF-8"?>
<office:document-content xmlns:office="urn:oasis:names:tc:opendocument:xmlns:office:1.0"
                         xmlns:text="urn:oasis:names:tc:opendocument:xmlns:text:1.0"
                         xmlns:style="urn:oasis:names:tc:opendocument:xmlns:style:1.0">
  <office:body>
    <office:text>
      ${convertHTMLToODT(html)}
    </office:text>
  </office:body>
</office:document-content>`

        const blob = new Blob([odtContent], { type: 'application/vnd.oasis.opendocument.text' })
        saveAs(blob, `${filename}.odt`)
    } catch (error) {
        console.error('Erro ao exportar ODT:', error)
        await exportAsHTML(html, { filename: `${filename}_odt_fallback` })
    }
}

/**
 * Converte HTML para ODT XML
 */
function convertHTMLToODT(html: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')
    let odtXML = ''

    doc.querySelectorAll('p').forEach(p => {
        odtXML += `<text:p>${p.textContent}</text:p>\n`
    })

    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach(h => {
        const level = h.tagName.substring(1)
        odtXML += `<text:h text:outline-level="${level}">${h.textContent}</text:h>\n`
    })

    return odtXML
}

/**
 * Função helper para exportar em qualquer formato
 */
export async function exportTemplate(
    html: string,
    format: 'pdf' | 'html' | 'word' | 'odt',
    options: ExportOptions = {}
): Promise<void> {
    switch (format) {
        case 'pdf':
            return exportAsPDF(html, options)
        case 'html':
            return exportAsHTML(html, options)
        case 'word':
            return exportAsWord(html, options)
        case 'odt':
            return exportAsODT(html, options)
        default:
            throw new Error(`Formato não suportado: ${format}`)
    }
}

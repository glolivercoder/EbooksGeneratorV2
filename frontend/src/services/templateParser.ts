/**
 * Template Parser - Analisa HTML do TipTap e extrai estrutura
 */

export interface ParsedContent {
    title: string
    headings: { level: number; text: string; id: string }[]
    paragraphs: string[]
    quotes: string[]
    lists: { type: 'ul' | 'ol'; items: string[] }[]
    images: { src: string; alt: string }[]
    tables: string[]
    codeBlocks: string[]
    rawHTML: string
}

export function parseContent(html: string): ParsedContent {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Extract title (first h1 or generate from text)
    const firstH1 = doc.querySelector('h1')
    const title = firstH1?.textContent?.trim() || 'Documento sem título'

    // Extract headings (h1-h6)
    const headings: ParsedContent['headings'] = []
    doc.querySelectorAll('h1, h2, h3, h4, h5, h6').forEach((heading, idx) => {
        const level = parseInt(heading.tagName.substring(1))
        headings.push({
            level,
            text: heading.textContent?.trim() || '',
            id: `heading-${idx}`
        })
    })

    // Extract paragraphs
    const paragraphs: string[] = []
    doc.querySelectorAll('p').forEach(p => {
        const text = p.textContent?.trim()
        if (text) paragraphs.push(text)
    })

    // Extract blockquotes
    const quotes: string[] = []
    doc.querySelectorAll('blockquote').forEach(quote => {
        const text = quote.textContent?.trim()
        if (text) quotes.push(text)
    })

    // Extract lists
    const lists: ParsedContent['lists'] = []
    doc.querySelectorAll('ul, ol').forEach(list => {
        const items: string[] = []
        list.querySelectorAll('li').forEach(li => {
            const text = li.textContent?.trim()
            if (text) items.push(text)
        })
        lists.push({
            type: list.tagName.toLowerCase() as 'ul' | 'ol',
            items
        })
    })

    // Extract images
    const images: ParsedContent['images'] = []
    doc.querySelectorAll('img').forEach(img => {
        images.push({
            src: img.getAttribute('src') || '',
            alt: img.getAttribute('alt') || ''
        })
    })

    // Extract tables
    const tables: string[] = []
    doc.querySelectorAll('table').forEach(table => {
        tables.push(table.outerHTML)
    })

    // Extract code blocks
    const codeBlocks: string[] = []
    doc.querySelectorAll('pre code').forEach(code => {
        codeBlocks.push(code.textContent || '')
    })

    return {
        title,
        headings,
        paragraphs,
        quotes,
        lists,
        images,
        tables,
        codeBlocks,
        rawHTML: html
    }
}

/**
 * Limpa HTML removendo scripts e estilos inline perigosos
 */
export function sanitizeHTML(html: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    // Remove scripts
    doc.querySelectorAll('script').forEach(el => el.remove())

    // Remove event handlers
    doc.querySelectorAll('*').forEach(el => {
        Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
                el.removeAttribute(attr.name)
            }
        })
    })

    return doc.body.innerHTML
}

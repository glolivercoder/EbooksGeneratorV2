/**
 * Template Generator - Aplica tema ao conteúdo estruturado
 */

import { DesignTemplate } from '../stores/designStore'
import { ParsedContent } from './templateParser'

export interface GeneratorOptions {
    includeGoogleFonts: boolean
    responsive: boolean
    darkMode: boolean
}

const DEFAULT_OPTIONS: GeneratorOptions = {
    includeGoogleFonts: true,
    responsive: true,
    darkMode: false
}

/**
 * Gera CSS com classes baseadas no tema
 */
function generateCSS(theme: DesignTemplate, options: GeneratorOptions): string {
    const { colors, typography } = theme

    return `
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: '${typography.body}', sans-serif;
            color: ${colors.textPrimary};
            background: ${colors.background};
            line-height: 1.6;
        }
        
        .ebook-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background: linear-gradient(135deg, ${colors.background} 0%, ${colors.surface} 100%);
        }
        
        .ebook-header {
            text-align: center;
            margin-bottom: 60px;
            padding: 40px;
            background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%);
            color: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1);
        }
        
        .ebook-title {
            font-family: '${typography.primary}', serif;
            font-size: 3em;
            font-weight: 700;
            margin-bottom: 10px;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
        }
        
        h1 {
            font-family: '${typography.primary}', serif;
            font-size: 2.5em;
            color: ${colors.primary};
            margin: 40px 0 20px 0;
            border-bottom: 3px solid ${colors.accent};
            padding-bottom: 10px;
        }
        
        h2 {
            font-family: '${typography.secondary}', sans-serif;
            font-size: 2em;
            color: ${colors.secondary};
            margin: 30px 0 15px 0;
        }
        
        h3 {
            font-family: '${typography.secondary}', sans-serif;
            font-size: 1.5em;
            color: ${colors.textPrimary};
            margin: 25px 0 12px 0;
        }
        
        p {
            font-family: '${typography.body}', sans-serif;
            font-size: 1.1em;
            margin-bottom: 20px;
            text-align: justify;
        }
        
        blockquote {
            font-family: '${typography.accent}', serif;
            font-size: 1.2em;
            font-style: italic;
            color: ${colors.textSecondary};
            border-left: 4px solid ${colors.accent};
            padding-left: 20px;
            margin: 30px 0;
            background: ${colors.surface};
            padding: 20px;
            border-radius: 8px;
        }
        
        ul, ol {
            margin: 20px 0 20px 40px;
        }
        
        li {
            margin-bottom: 10px;
            font-size: 1.05em;
        }
        
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 20px 0;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        th, td {
            padding: 12px;
            border: 1px solid ${colors.surface};
            text-align: left;
        }
        
        th {
            background: ${colors.primary};
            color: white;
            font-weight: 600;
        }
        
        tr:nth-child(even) {
            background: ${colors.surface};
        }
        
        pre {
            background: #2d2d2d;
            color: #f8f8f2;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 20px 0;
            font-family: '${typography.monospace}', monospace;
        }
        
        code {
            font-family: '${typography.monospace}', monospace;
            background: ${colors.surface};
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.9em;
        }
        
        pre code {
            background: transparent;
            padding: 0;
        }
        
        ${options.responsive ? `
        @media (max-width: 768px) {
            .ebook-container {
                padding: 20px 15px;
            }
            
            .ebook-title {
                font-size: 2em;
            }
            
            h1 {
                font-size: 1.8em;
            }
            
            h2 {
                font-size: 1.5em;
            }
        }
        ` : ''}
    </style>
    `
}

/**
 * Gera HTML com Google Fonts
 */
function generateFontsLink(theme: DesignTemplate): string {
    const fonts = [
        theme.typography.primary,
        theme.typography.secondary,
        theme.typography.body,
        theme.typography.accent,
        theme.typography.monospace
    ].filter(Boolean)

    const fontsQuery = fonts.map(f => f.replace(/ /g, '+')).join('&family=')

    return `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${fontsQuery}&display=swap" rel="stylesheet">`
}

/**
 * Aplica tema ao conteúdo parseado
 */
export function applyTemplate(
    content: ParsedContent,
    theme: DesignTemplate,
    options: Partial<GeneratorOptions> = {}
): string {
    const opts = { ...DEFAULT_OPTIONS, ...options }

    const fontsHTML = opts.includeGoogleFonts ? generateFontsLink(theme) : ''
    const css = generateCSS(theme, opts)

    // Build HTML structure
    let bodyHTML = `
    <div class="ebook-container">
        <header class="ebook-header">
            <h1 class="ebook-title">${content.title}</h1>
        </header>
        
        <main class="ebook-content">
            ${content.rawHTML}
        </main>
    </div>
    `

    // Complete HTML document
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.title}</title>
    ${fontsHTML}
    ${css}
</head>
<body>
    ${bodyHTML}
</body>
</html>`
}

/**
 * Extrai apenas o conteúdo interno (sem <html>, <head>, etc)
 * Para carregar de volta no TipTap
 */
export function extractContent(styledHTML: string): string {
    const parser = new DOMParser()
    const doc = parser.parseFromString(styledHTML, 'text/html')
    const content = doc.querySelector('.ebook-content')
    return content?.innerHTML || ''
}

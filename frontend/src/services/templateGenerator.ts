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
    const { colors, typography, layout = 'modern' } = theme

    // Common Base Styles
    let css = `
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: '${typography.body}', sans-serif;
            color: ${colors.textPrimary};
            background: ${colors.background};
            line-height: 1.6;
        }
        img { max-width: 100%; height: auto; display: block; margin: 20px auto; border-radius: 8px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; border: 1px solid ${colors.surface}; text-align: left; }
        th { background: ${colors.primary}; color: white; }
        a { color: ${colors.accent}; text-decoration: none; }
    `

    // Layout Specific Styles
    switch (layout) {
        case 'minimal':
            css += `
                .ebook-container {
                    max-width: 700px;
                    margin: 0 auto;
                    padding: 60px 40px;
                    background: ${colors.background};
                }
                .ebook-header {
                    text-align: center;
                    margin-bottom: 60px;
                    padding-bottom: 40px;
                    border-bottom: 1px solid ${colors.surface};
                }
                .ebook-title {
                    font-family: '${typography.primary}', serif;
                    font-size: 3em;
                    color: ${colors.textPrimary};
                    font-weight: 300;
                    letter-spacing: -1px;
                    margin-bottom: 10px;
                }
                h1 {
                    font-family: '${typography.primary}', serif;
                    font-size: 2.2em;
                    color: ${colors.textPrimary};
                    font-weight: 300;
                    margin-top: 40px;
                    margin-bottom: 20px;
                }
                h2 {
                    font-family: '${typography.secondary}', sans-serif;
                    font-size: 1.4em;
                    color: ${colors.secondary};
                    margin-top: 30px;
                    margin-bottom: 15px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                p {
                    margin-bottom: 24px;
                    font-size: 1.1em;
                    color: ${colors.textSecondary};
                    line-height: 1.8;
                }
                blockquote {
                    border-left: 2px solid ${colors.accent};
                    padding-left: 20px;
                    font-style: italic;
                    color: ${colors.textPrimary};
                    margin: 30px 0;
                }
            `
            break;

        case 'tech':
            css += `
                .ebook-container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 40px;
                    background: ${colors.background};
                    border: 1px solid ${colors.surface};
                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                }
                .ebook-header {
                    border-bottom: 4px solid ${colors.primary};
                    margin-bottom: 40px;
                    padding: 20px 0;
                    text-align: left;
                }
                .ebook-title {
                    font-family: '${typography.primary}', monospace;
                    color: ${colors.primary};
                    font-size: 3em;
                    text-transform: uppercase;
                    text-shadow: 0 0 10px ${colors.primary}40;
                }
                h1 {
                    font-family: '${typography.primary}', monospace;
                    color: ${colors.primary};
                    font-size: 2.2em;
                    text-transform: uppercase;
                    margin: 40px 0 20px;
                    border-bottom: 1px dashed ${colors.surface};
                    padding-bottom: 10px;
                }
                h2 {
                    font-family: '${typography.primary}', monospace;
                    color: ${colors.secondary};
                    border-left: 4px solid ${colors.accent};
                    padding-left: 15px;
                    margin: 30px 0;
                }
                p {
                    font-family: '${typography.body}', sans-serif;
                    margin-bottom: 20px;
                }
                pre {
                    background: ${colors.surface};
                    border: 1px solid ${colors.secondary};
                    border-radius: 4px;
                    padding: 20px;
                    font-family: '${typography.monospace}', monospace;
                    overflow-x: auto;
                    margin: 20px 0;
                }
                code {
                    font-family: '${typography.monospace}', monospace;
                    color: ${colors.accent};
                    background: ${colors.surface};
                    padding: 2px 5px;
                    border-radius: 3px;
                }
            `
            break;

        case 'magazine':
            css += `
                .ebook-container {
                    max-width: 100%;
                    margin: 0;
                    background: ${colors.background};
                }
                .ebook-header {
                    background: ${colors.primary};
                    color: white;
                    padding: 100px 20px;
                    text-align: center;
                    clip-path: polygon(0 0, 100% 0, 100% 85%, 0 100%);
                    margin-bottom: 60px;
                }
                .ebook-title {
                    font-family: '${typography.primary}', sans-serif;
                    font-size: 4em;
                    font-weight: 900;
                    text-transform: uppercase;
                    line-height: 0.9;
                    margin-bottom: 10px;
                    text-shadow: 2px 2px 0px ${colors.secondary};
                }
                .ebook-content {
                    max-width: 1000px;
                    margin: 0 auto;
                    padding: 0 20px;
                    column-count: 2;
                    column-gap: 60px;
                }
                h1 {
                    font-family: '${typography.primary}', sans-serif;
                    font-size: 2.5em;
                    font-weight: 800;
                    text-transform: uppercase;
                    line-height: 1;
                    margin: 40px 0 20px;
                    color: ${colors.textPrimary};
                    break-inside: avoid;
                }
                h2 {
                    font-family: '${typography.secondary}', serif;
                    font-size: 1.8em;
                    color: ${colors.accent};
                    margin-top: 30px;
                    break-inside: avoid;
                }
                p {
                    margin-bottom: 20px;
                    text-align: justify;
                    font-size: 1.05em;
                }
                p:first-of-type::first-letter {
                    font-size: 3.5em;
                    float: left;
                    line-height: 0.8;
                    padding-right: 10px;
                    font-weight: bold;
                    color: ${colors.primary};
                }
                blockquote {
                    background: ${colors.surface};
                    padding: 30px;
                    border-left: 8px solid ${colors.secondary};
                    font-family: '${typography.accent}', serif;
                    font-size: 1.3em;
                    font-weight: bold;
                    font-style: italic;
                    margin: 40px 0;
                    break-inside: avoid;
                    color: ${colors.textPrimary};
                }
                @media (max-width: 768px) {
                    .ebook-content { column-count: 1; }
                    .ebook-title { font-size: 2.5em; }
                }
            `
            break;

        case 'classic':
            css += `
                .ebook-container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 80px 50px;
                    background: ${colors.background};
                }
                .ebook-header {
                    text-align: center;
                    margin-bottom: 100px;
                }
                .ebook-title {
                    font-family: '${typography.primary}', serif;
                    font-size: 3em;
                    color: ${colors.primary};
                    font-weight: normal;
                    margin-bottom: 20px;
                }
                h1 {
                    font-family: '${typography.primary}', serif;
                    font-size: 2em;
                    color: ${colors.primary};
                    font-weight: normal;
                    text-align: center;
                    margin: 60px 0 30px;
                }
                h2 {
                    font-family: '${typography.secondary}', serif;
                    font-size: 1.4em;
                    color: ${colors.secondary};
                    text-align: center;
                    font-style: italic;
                    margin: 40px 0 20px;
                }
                p {
                    font-family: '${typography.body}', serif;
                    font-size: 1.2em;
                    line-height: 1.8;
                    text-align: justify;
                    text-indent: 2.5em;
                    margin-bottom: 0;
                }
                p.no-indent {
                    text-indent: 0;
                }
                blockquote {
                    margin: 40px;
                    font-style: italic;
                    text-align: center;
                    color: ${colors.textSecondary};
                    font-family: '${typography.secondary}', serif;
                }
            `
            break;

        default: // 'modern'
            css += `
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
            `
            break;
    }

    // Responsive adjustments
    if (options.responsive) {
        css += `
        @media (max-width: 768px) {
            .ebook-container { padding: 20px 15px; }
            .ebook-title { font-size: 2em; }
            h1 { font-size: 1.8em; }
            h2 { font-size: 1.5em; }
        }
        `
    }

    css += `</style>`
    return css
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

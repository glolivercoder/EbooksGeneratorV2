import { Node, mergeAttributes } from '@tiptap/core'
import { ReactNodeViewRenderer } from '@tiptap/react'
import MermaidComponent from './MermaidComponent'

export const MermaidExtension = Node.create({
    name: 'mermaid',

    group: 'block',

    content: 'text*',

    code: true,

    defining: true,

    parseHTML() {
        return [
            {
                tag: 'pre',
                preserveWhitespace: 'full',
                getAttrs: node => {
                    const child = node.querySelector('code')
                    if (child?.classList.contains('language-mermaid')) {
                        return {}
                    }
                    return false
                },
            },
            {
                tag: 'div',
                getAttrs: node => {
                    if (node.getAttribute('data-type') === 'mermaid') {
                        return {}
                    }
                    return false
                }
            }
        ]
    },

    renderHTML({ HTMLAttributes }) {
        return [
            'div',
            mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' }),
            ['pre', {}, ['code', { class: 'language-mermaid' }, 0]]
        ]
    },

    addNodeView() {
        return ReactNodeViewRenderer(MermaidComponent)
    },
})

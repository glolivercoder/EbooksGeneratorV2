import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function ChapterNode({ data }: any) {
    return (
        <div className="custom-node chapter-node">
            <Handle type="target" position={Position.Top} />
            <div className="node-header">
                <span className="node-icon">📚</span>
                <input
                    type="text"
                    defaultValue={data.title || 'Capítulo'}
                    className="node-title-input"
                />
            </div>
            <div className="node-content">
                <textarea
                    defaultValue={data.content || 'Conteúdo do capítulo...'}
                    className="node-textarea"
                    rows={3}
                />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

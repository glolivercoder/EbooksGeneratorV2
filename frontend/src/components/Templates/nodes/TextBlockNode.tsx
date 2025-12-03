import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function TextBlockNode({ data }: any) {
    return (
        <div className="custom-node textblock-node">
            <Handle type="target" position={Position.Top} />
            <div className="node-header">
                <span className="node-icon">📝</span>
                <strong>Texto</strong>
            </div>
            <div className="node-content">
                <textarea
                    defaultValue={data.text || 'Digite o texto aqui...'}
                    className="node-textarea"
                    rows={2}
                />
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

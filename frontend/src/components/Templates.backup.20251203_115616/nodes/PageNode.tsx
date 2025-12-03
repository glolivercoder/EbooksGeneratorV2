import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function PageNode({ data }: any) {
    return (
        <div className="custom-node page-node">
            <Handle type="target" position={Position.Top} />
            <div className="node-header">
                <span className="node-icon">📄</span>
                <strong>{data.label || 'Página'}</strong>
            </div>
            <div className="node-content">
                <div contentEditable suppressContentEditableWarning className="node-editable">
                    {data.content || 'Clique para editar...'}
                </div>
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

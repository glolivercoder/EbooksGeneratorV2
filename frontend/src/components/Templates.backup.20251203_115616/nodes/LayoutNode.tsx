import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function LayoutNode({ data }: any) {
    const columns = data.columns || 2

    return (
        <div className="custom-node layout-node">
            <Handle type="target" position={Position.Top} />
            <div className="node-header">
                <span className="node-icon">⚙️</span>
                <strong>Layout {columns} Colunas</strong>
            </div>
            <div className={`node-content layout-grid layout-${columns}col`}>
                {Array.from({ length: columns }).map((_, i) => (
                    <div key={i} className="layout-column">
                        Coluna {i + 1}
                    </div>
                ))}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

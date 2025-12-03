import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function ImageNode({ data }: any) {
    return (
        <div className="custom-node image-node">
            <Handle type="target" position={Position.Top} />
            <div className="node-header">
                <span className="node-icon">🖼️</span>
                <strong>Imagem</strong>
            </div>
            <div className="node-content image-placeholder">
                {data.src ? (
                    <img src={data.src} alt={data.alt || 'Imagem'} />
                ) : (
                    <div className="placeholder-text">
                        <span>📷</span>
                        <span>Clique para adicionar</span>
                    </div>
                )}
            </div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    )
}

import { useProject } from '../../stores/projectStore'

export default function DebugData() {
  const { prompts, outlines, books } = useProject()

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', background: '#f5f5f5', margin: '20px', borderRadius: '8px' }}>
      <h2>Dados Salvos no ProjectStore (LocalStorage)</h2>
      
      <section style={{ marginBottom: '20px' }}>
        <h3>Prompts ({prompts.length})</h3>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(prompts, null, 2)}
        </pre>
      </section>

      <section style={{ marginBottom: '20px' }}>
        <h3>Outlines ({outlines.length})</h3>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(outlines, null, 2)}
        </pre>
      </section>

      <section>
        <h3>Books ({books.length})</h3>
        <pre style={{ background: 'white', padding: '10px', borderRadius: '4px', maxHeight: '200px', overflow: 'auto' }}>
          {JSON.stringify(books, null, 2)}
        </pre>
      </section>
    </div>
  )
}

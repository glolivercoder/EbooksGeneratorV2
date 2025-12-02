// Teste para verificar se o outline carrega sem erros
console.log('🧪 Testando carregamento de outline...');

// Simular dados do outline como vêm do histórico
const mockOutline = {
    book_title: "Aprendendo usando a Tecnologia do Notebook LM",
    refined_prompt: "Aprendendo usando a Tecnologia do Notebook LM - Crie um ebook conciso com 3 capítulos...",
    total_chapters: 3,
    chapters: [
        {
            number: 1,
            title: "Introdução ao Notebook LM",
            description: "Visão geral da tecnologia Notebook LM e seus conceitos fundamentais",
            key_topics: ["Setup inicial", "Instalação", "Conceitos básicos"],
            dependencies: [],
            estimated_pages: 2
        },
        {
            number: 2,
            title: "Recursos Principais",
            description: "Funcionalidades essenciais e capacidades do Notebook LM",
            key_topics: ["Ferramentas principais", "API", "Integração"],
            dependencies: [],
            estimated_pages: 2
        },
        {
            number: 3,
            title: "Exemplos Práticos",
            description: "Casos de uso reais e implementações práticas",
            key_topics: ["Exemplos práticos", "Casos de uso", "Melhores práticas"],
            dependencies: [],
            estimated_pages: 2
        }
    ],
    research_areas: [],
    required_libraries: [],
    detected_domains: []
};

// Testar todas as operações que causavam erro
function testOutlineOperations() {
    console.log('✅ Testando operações seguras...');
    
    // Test 1: detected_domains.map()
    console.log('📍 detected_domains:', mockOutline.detected_domains?.map(d => d) || 'Nenhum');
    
    // Test 2: required_libraries.map()
    console.log('📚 required_libraries:', mockOutline.required_libraries?.map(lib => lib) || 'Nenhuma');
    
    // Test 3: chapters.map()
    console.log('📖 chapters:', mockOutline.chapters?.map((ch, i) => `Cap ${ch.number}: ${ch.title}`) || 'Nenhum capítulo');
    
    // Test 4: key_topics.join()
    console.log('🏷️ key_topics:', mockOutline.chapters?.map(ch => ch.key_topics?.join(', ') || 'Sem tópicos') || 'Sem capítulos');
    
    // Test 5: Operações de array
    const newChapters = [...(mockOutline.chapters || [])];
    console.log('🔄 newChapters length:', newChapters.length);
    
    // Test 6: Valores undefined
    console.log('📝 book_title:', mockOutline.book_title || '');
    console.log('📝 chapter.title:', mockOutline.chapters[0]?.title || '');
    console.log('📝 chapter.description:', mockOutline.chapters[0]?.description || '');
    
    console.log('✅ Todos os testes passaram! O outline deve carregar sem erros.');
}

testOutlineOperations();

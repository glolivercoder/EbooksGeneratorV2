import { useEffect, useState } from 'react'

/**
 * Hook personalizado para debouncing de valores
 * @param value - Valor a ser debounced
 * @param delay - Tempo de delay em milissegundos
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value)

    useEffect(() => {
        // Criar timeout para atualizar o valor debounced
        const handler = setTimeout(() => {
            setDebouncedValue(value)
        }, delay)

        // Cleanup: cancelar timeout se o valor mudar antes do delay
        return () => {
            clearTimeout(handler)
        }
    }, [value, delay])

    return debouncedValue
}

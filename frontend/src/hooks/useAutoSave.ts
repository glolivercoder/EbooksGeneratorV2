import { useEffect, useRef } from 'react'
import { useDebounce } from './useDebounce'

/**
 * Hook para auto-save genérico com debouncing
 * @param value - Valor a ser salvo
 * @param onSave - Callback de salvamento
 * @param delay - Tempo de delay em milissegundos (default: 2000ms)
 * @param immediate - Se true, salva imediatamente sem debounce
 */
export function useAutoSave<T>(
    value: T,
    onSave: (value: T) => void,
    delay: number = 2000,
    immediate: boolean = false
) {
    const debouncedValue = useDebounce(value, delay)
    const isFirstRun = useRef(true)

    useEffect(() => {
        // Pular o primeiro render para evitar salvamento inicial
        if (isFirstRun.current) {
            isFirstRun.current = false
            return
        }

        // Salvar imediatamente se requisitado
        if (immediate && value !== undefined && value !== null) {
            onSave(value)
            return
        }

        // Salvar valor debounced
        if (debouncedValue !== undefined && debouncedValue !== null) {
            onSave(debouncedValue)
        }
    }, [immediate ? value : debouncedValue])
}

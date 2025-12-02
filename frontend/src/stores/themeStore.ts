import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Theme = 'light' | 'dark'

interface ThemeStore {
    theme: Theme
    toggleTheme: () => void
    setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () =>
                set((state) => {
                    const newTheme = state.theme === 'light' ? 'dark' : 'light'
                    document.documentElement.setAttribute('data-theme', newTheme)
                    return { theme: newTheme }
                }),
            setTheme: (theme) => {
                document.documentElement.setAttribute('data-theme', theme)
                set({ theme })
            },
        }),
        {
            name: 'theme-storage',
        }
    )
)

// Aplicar tema inicial
const initialTheme = localStorage.getItem('theme-storage')
if (initialTheme) {
    const parsed = JSON.parse(initialTheme)
    document.documentElement.setAttribute('data-theme', parsed.state.theme)
}

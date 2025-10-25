// src/context/theme-provider.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light' | 'system';

interface ThemeProviderProps {
    children: ReactNode;
    defaultTheme?: Theme;
    storageKey?: string;
}

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const initialState: ThemeProviderState = {
    theme: 'system',
    setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
                                  children,
                                  defaultTheme = 'system',
                                  storageKey = 'theme',
                                  ...props
                              }: ThemeProviderProps) {
    const [theme, setTheme] = useState<Theme>(
        () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
    );

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        const effectiveTheme: 'light' | 'dark' = theme === 'system'
            ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            : theme;

        root.classList.add(effectiveTheme);

        const themeColor = effectiveTheme === 'dark' ? '#020817' : '#fff';
        const metaThemeColor = document.querySelector("meta[name='theme-color']");
        if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor);
    }, [theme]);

    useEffect(() => {
        if (theme !== 'system') return;

        const handleChange = (e: MediaQueryListEvent) => {
            const effectiveTheme = e.matches ? 'dark' : 'light';
            const root = window.document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(effectiveTheme);

            const themeColor = effectiveTheme === 'dark' ? '#020817' : '#fff';
            const metaThemeColor = document.querySelector("meta[name='theme-color']");
            if (metaThemeColor) metaThemeColor.setAttribute('content', themeColor);
        };

        const media = window.matchMedia('(prefers-color-scheme: dark)');
        media.addEventListener('change', handleChange);
        return () => media.removeEventListener('change', handleChange);
    }, [theme]);

    const value = {
        theme,
        setTheme: (newTheme: Theme) => {
            localStorage.setItem(storageKey, newTheme);
            setTheme(newTheme);
        },
    };

    return (
        <ThemeProviderContext.Provider {...props} value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeProviderContext);
    if (context === undefined)
        throw new Error('useTheme must be used within a ThemeProvider');
    return context;
};
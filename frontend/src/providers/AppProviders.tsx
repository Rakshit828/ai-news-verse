// src/providers/AppProviders.tsx
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { queryClient } from '@/lib/queryClient'

interface AppProvidersProps {
    children: React.ReactNode
}

export default function AppProviders({ children }: AppProvidersProps) {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                {children}
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 4000,
                        style: {
                            borderRadius: '8px',
                            fontFamily: 'inherit',
                        },
                    }}
                />
            </BrowserRouter>
        </QueryClientProvider>
    )
}

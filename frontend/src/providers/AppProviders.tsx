// src/providers/AppProviders.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { queryClient } from "@/lib/queryClient";
import { ThemeProvider } from "@/context/ThemeContext";
import { WebSocketProvider } from "@/context/WebSocketContext";

interface AppProvidersProps {
  children: React.ReactNode;
}

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <WebSocketProvider>
            {children}
          </WebSocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: "8px",
                fontFamily: "inherit",
              },
            }}
          />
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

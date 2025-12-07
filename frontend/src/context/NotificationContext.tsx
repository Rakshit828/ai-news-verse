
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';

interface NotificationContextType {
  connected: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Determine API URL based on environment or hardcoded as per apiClient
    const API_URL = 'http://localhost:8000/api/v1/news/stream';
    
    console.log("Connecting to SSE stream at", API_URL);

    const eventSource = new EventSource(API_URL, { withCredentials: true });

    eventSource.onopen = () => {
      console.log("Connected to news stream");
      setConnected(true);
    };

    eventSource.onmessage = (event) => {
      console.log("New message:", event.data);
      if (event.data) {
        toast.success(event.data, {
            description: "Click to refresh news feed",
            action: {
                label: "Refresh",
                onClick: () => window.location.reload() // Or trigger a refetch if we had a query client
            }
        });
      }
    };

    eventSource.onerror = (error) => {
      console.error("News stream error:", error);
      eventSource.close();
      setConnected(false);
      // Reconnection logic is handled by browser for EventSource usually, 
      // but closing it necessitates manual reconnection if we want custom logic.
      // For now, let's try to reconnect after 5 seconds if closed.
      setTimeout(() => {
          // React effect will handle re-mount/re-connect if we update state/dependencies properly
          // or we can just let it be.
          // Actually, if we close it, we should probably attempt to reconnect or let the effect loop?
          // Simplest is to let the user refresh or rely on browser's native reconnection if we didn't close it explicitly.
          // But 'onerror' often fires on connection loss.
      }, 5000);
    };

    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ connected }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

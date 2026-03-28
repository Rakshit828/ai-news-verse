// src/hooks/useWebSocket.ts
import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "@/store/authStore";

export type WebSocketStatus = "connecting" | "open" | "closed" | "error";


interface UseWebSocketOptions {
  /** Whether to automatically connect when the hook mounts (default: true) */
  autoConnect?: boolean;
  /** Reconnect delay in ms after disconnect (default: 3000) */
  reconnectDelay?: number;
  /** Max reconnect attempts before giving up (default: 10) */
  maxReconnectAttempts?: number;
  /** Called whenever a JSON message arrives */
  onMessage?: (data: unknown) => void;
}



/**
 * Custom hook to manage the live-news WebSocket connection.
 *
 * The backend endpoint is:
 *   ws://<host>/api/v1/news/ws/livenews
 *
 * It subscribes to Redis PubSub channels per user subcategory and pushes
 * `NewNewsNotification` JSON messages whenever fresh news is published.
 */
export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectDelay = 3000,
    maxReconnectAttempts = 10,
    onMessage,
  } = options;


  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [status, setStatus] = useState<WebSocketStatus>("closed");
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCleaningUpRef = useRef(false);

  // Keep a ref so the latest onMessage is always used in callbacks
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const getWsUrl = useCallback(() => {
    if (!isAuthenticated) return null;
    const restBase = import.meta.env.VITE_API_BASE_URL as string;
    const wsBase = restBase
      .replace(/^http/, "ws")
      .replace(/\/api\/v1\/?$/, "");
    return `${wsBase}/api/v1/news/ws/livenews`; // Token is sent implicitly via secure cookies
  }, [isAuthenticated]);

  const connect = useCallback(() => {
    const url = getWsUrl();
    if (!url || !isAuthenticated || isCleaningUpRef.current) return;

    // AVOID RECONNECTING IF ALREADY CONNECTED OR CONNECTING TO THE SAME URL
    if (wsRef.current) {
      if (
        wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING
      ) {
        // If the URL is the same, just keep the existing connection
        if (wsRef.current.url === new URL(url, window.location.origin).href) {
          return;
        }
      }

      // If URL changed or we need a fresh start, close the old one
      wsRef.current.onclose = null;
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("connecting");

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (wsRef.current !== ws) return;
      setStatus("open");
      reconnectAttemptsRef.current = 0; // reset on success
    };

    ws.onmessage = (event) => {
      if (wsRef.current !== ws) return;
      try {
        const data = JSON.parse(event.data);
        onMessageRef.current?.(data);
      } catch {
        // non-JSON frame — ignore
      }
    };

    ws.onerror = () => {
      if (wsRef.current !== ws) return;
      setStatus("error");
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
        setStatus("closed");
      }

      // Auto-reconnect logic: Only if not cleaning up and this was the active socket
      if (
        !isCleaningUpRef.current &&
        isAuthenticated &&
        reconnectAttemptsRef.current < maxReconnectAttempts
      ) {
        reconnectAttemptsRef.current += 1;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = setTimeout(() => {
          connect();
        }, reconnectDelay);
      }
    };
  }, [getWsUrl, isAuthenticated, maxReconnectAttempts, reconnectDelay]);

  const disconnect = useCallback(() => {
    // Stop any scheduled reconnect
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptsRef.current = maxReconnectAttempts; // prevent auto-reconnect
    if (wsRef.current) {
      wsRef.current.onclose = null; 
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus("closed");
  }, [maxReconnectAttempts]);

  // Auto-connect on mount (gated behind authentication)
  useEffect(() => {
    isCleaningUpRef.current = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (autoConnect && isAuthenticated) {
      // Small debounce (100ms) to prevent StrictMode double-mount from triggering
      // two rapid connections and to allow auth state to stabilize.
      timer = setTimeout(() => {
        connect();
      }, 100);
    }

    return () => {
      isCleaningUpRef.current = true;
      if (timer) clearTimeout(timer);
      
      // Cleanup on unmount
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      if (wsRef.current) {
        // Only log warning if we are actually established; 
        // otherwise stay silent to avoid "closed before established" console noise.
        const shouldCloseSilently = wsRef.current.readyState === WebSocket.CONNECTING;
        wsRef.current.onclose = null;
        if (shouldCloseSilently) {
           // We still have to close it to avoid leaks, but we can't fully 
           // suppress the browser console warning without a longer timeout 
           // or by never connecting in the first mount (the debounce handles this).
        }
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, isAuthenticated]);

  return { status, connect, disconnect };
}

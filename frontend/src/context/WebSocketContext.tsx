// src/context/WebSocketContext.tsx
import { createContext, useContext, useState, useCallback, useMemo } from "react";
import { useWebSocket, type WebSocketStatus } from "@/hooks/useWebSocket";
import type { LiveNewsNotification } from "@/types/news.types";
import type { Article } from "@/types/news.types";

interface WebSocketContextValue {
    /** Current connection state */
    status: WebSocketStatus;
    /** Live articles received via WebSocket (newest first) */
    liveArticles: Article[];
    /** Count of unread live articles */
    unreadCount: number;
    /** Mark all current live articles as read */
    markAllRead: () => void;
    /** Manually connect */
    connect: () => void;
    /** Manually disconnect */
    disconnect: () => void;
}


const WebSocketContext = createContext<WebSocketContextValue | null>(null);

/**
 * Normalises a `LiveNewsNotification` (WS payload) into the same `Article`
 * shape used by the REST-fetched news so we can render them with the same card.
 */
function toArticle(n: LiveNewsNotification): Article {
    // The backend sends "OPNEAI" (typo) for OpenAI; normalise it.
    const source = n.source === "OPNEAI" ? "OPENAI" : n.source;

    return {
        title: n.title,
        url: n.link,
        description: n.description ?? n.summary ?? "",
        category_id: n.category_id,
        subcategory_id: n.subcategory_id,
        source: source as Article["source"],
    };
}

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
    const [liveArticles, setLiveArticles] = useState<Article[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleMessage = useCallback((raw: unknown) => {
        const notification = raw as LiveNewsNotification;
        if (!notification?.guid || !notification?.title) return; // guard

        const article = toArticle(notification);

        setLiveArticles((prev) => {
            // Deduplicate by guid (url)
            if (prev.some((a) => a.url === article.url)) return prev;
            return [article, ...prev];
        });

        setUnreadCount((c) => c + 1);
    }, []);

    const { status, connect, disconnect } = useWebSocket({
        onMessage: handleMessage,
    });

    const markAllRead = useCallback(() => setUnreadCount(0), []);

    const value = useMemo<WebSocketContextValue>(
        () => ({
            status,
            liveArticles,
            unreadCount,
            markAllRead,
            connect,
            disconnect,
        }),
        [status, liveArticles, unreadCount, markAllRead, connect, disconnect],
    );

    return (
        <WebSocketContext.Provider value={value}>
            {children}
        </WebSocketContext.Provider>
    );
}

export function useWebSocketContext() {
    const ctx = useContext(WebSocketContext);
    if (!ctx) {
        throw new Error("useWebSocketContext must be used within <WebSocketProvider>");
    }
    return ctx;
}

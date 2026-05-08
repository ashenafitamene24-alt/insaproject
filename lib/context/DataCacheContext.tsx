"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresIn: number; // milliseconds
}

interface DataCacheContextType {
    getCache: <T>(key: string) => T | null;
    setCache: <T>(key: string, data: T, expiresIn?: number) => void;
    clearCache: (key?: string) => void;
    invalidateCache: (pattern: string) => void;
}

const DataCacheContext = createContext<DataCacheContextType | undefined>(undefined);

export function DataCacheProvider({ children }: { children: ReactNode }) {
    const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map());

    const getCache = useCallback(<T,>(key: string): T | null => {
        const entry = cache.get(key);
        if (!entry) return null;

        const now = Date.now();
        if (now - entry.timestamp > entry.expiresIn) {
            // Expired
            cache.delete(key);
            return null;
        }

        return entry.data as T;
    }, [cache]);

    const setCache = useCallback(<T,>(key: string, data: T, expiresIn: number = 5 * 60 * 1000) => {
        setCache(prev => {
            const newCache = new Map(prev);
            newCache.set(key, {
                data,
                timestamp: Date.now(),
                expiresIn
            });
            return newCache;
        });
    }, []);

    const clearCache = useCallback((key?: string) => {
        if (key) {
            setCache(prev => {
                const newCache = new Map(prev);
                newCache.delete(key);
                return newCache;
            });
        } else {
            setCache(new Map());
        }
    }, []);

    const invalidateCache = useCallback((pattern: string) => {
        setCache(prev => {
            const newCache = new Map(prev);
            const regex = new RegExp(pattern);

            for (const key of newCache.keys()) {
                if (regex.test(key)) {
                    newCache.delete(key);
                }
            }

            return newCache;
        });
    }, []);

    return (
        <DataCacheContext.Provider value={{ getCache, setCache, clearCache, invalidateCache }}>
            {children}
        </DataCacheContext.Provider>
    );
}

export function useDataCache() {
    const context = useContext(DataCacheContext);
    if (!context) {
        throw new Error('useDataCache must be used within DataCacheProvider');
    }
    return context;
}

/**
 * Custom hook for cached API calls
 */
export function useCachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: {
        expiresIn?: number;
        enabled?: boolean;
    } = {}
) {
    const { getCache, setCache } = useDataCache();
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const { expiresIn = 5 * 60 * 1000, enabled = true } = options;

    const fetchData = useCallback(async (forceRefresh = false) => {
        if (!enabled) return;

        // Check cache first
        if (!forceRefresh) {
            const cached = getCache<T>(key);
            if (cached) {
                setData(cached);
                return cached;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const result = await fetcher();
            setData(result);
            setCache(key, result, expiresIn);
            return result;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Unknown error');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [key, fetcher, enabled, expiresIn, getCache, setCache]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        isStale: !getCache(key)
    };
}

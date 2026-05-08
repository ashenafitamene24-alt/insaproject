"use client";

import { useState, useEffect, useCallback } from 'react';

interface ProcessedAssessment {
    _id: string;
    riskRegisterId: string;
    company: string;
    category: string;
    date: string;
    analyses: any[];
    riskMatrix: any[];
    summary: any;
}

// In-memory cache with 5-minute expiration
const cache = new Map<string, { data: ProcessedAssessment[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProcessedAssessments() {
    const [data, setData] = useState<ProcessedAssessment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (forceRefresh = false) => {
        const cacheKey = 'processed-assessments';
        const now = Date.now();

        // Check cache first
        if (!forceRefresh) {
            const cached = cache.get(cacheKey);
            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
                setData(cached.data);
                setLoading(false);
                return cached.data;
            }
        }

        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/analysis/processed');

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            const result = await res.json();
            const assessments = Array.isArray(result.assessments) ? result.assessments : [];

            // Update cache
            cache.set(cacheKey, { data: assessments, timestamp: now });

            setData(assessments);
            return assessments;
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Failed to fetch assessments';
            setError(message);
            console.error('Error fetching processed assessments:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        refetch: fetchData,
        clearCache: () => cache.clear()
    };
}

// Clear cache when data is updated
export function invalidateProcessedAssessmentsCache() {
    cache.clear();
}

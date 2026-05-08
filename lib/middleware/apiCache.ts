import { NextResponse } from 'next/server';

/**
 * Add cache headers to API responses
 * This tells the browser to cache responses for faster subsequent loads
 */
export function withCache(response: NextResponse, maxAge: number = 300) {
    // Cache for 5 minutes by default (300 seconds)
    response.headers.set(
        'Cache-Control',
        `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`
    );

    return response;
}

/**
 * Create a cached response
 */
export function cachedResponse(data: any, maxAge: number = 300) {
    const response = NextResponse.json(data);
    return withCache(response, maxAge);
}

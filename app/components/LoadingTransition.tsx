"use client";

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function LoadingTransition() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 300);
        return () => clearTimeout(timer);
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-50">
            <div className="h-1 bg-blue-600 animate-pulse" style={{
                animation: 'loading 1s ease-in-out infinite'
            }}>
                <style jsx>{`
          @keyframes loading {
            0% { width: 0%; margin-left: 0%; }
            50% { width: 50%; margin-left: 25%; }
            100% { width: 0%; margin-left: 100%; }
          }
        `}</style>
            </div>
        </div>
    );
}

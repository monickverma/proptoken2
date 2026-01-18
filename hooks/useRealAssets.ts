import { useState, useEffect } from 'react';
import { getAllSubmissions } from '../abmApi';
import { AssetSubmission } from '../abmTypes';

export interface MarketplaceAsset {
    id: string;
    name: string;
    location: string;
    tokenPrice: number;
    yieldPercent: number;
    image: string;
    risk: 'Low' | 'Medium' | 'High';
    tokenAddress?: string;
    description?: string;
}

export function useRealAssets() {
    const [assets, setAssets] = useState<MarketplaceAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchAssets();
    }, []);

    const fetchAssets = async () => {
        try {
            setLoading(true);
            const submissions = await getAllSubmissions();

            // Filter for verified assets (or Mock ones that are auto-eligible)
            // Ideally check submission.results.consensus.eligible
            // But for "Preloaded Mock", it might process async. 
            // We will show all submissions that have a name for now.

            const mapped: MarketplaceAsset[] = submissions
                .filter(sub => sub.spvName) // Basic filter
                .map(sub => {
                    // Determine Risk based on score or Mock status
                    const isMock = sub.isMock;
                    const score = sub.results?.consensus?.scores?.existence || 0;
                    let risk: 'Low' | 'Medium' | 'High' = 'High';
                    if (isMock || score > 0.8) risk = 'Low';
                    else if (score > 0.5) risk = 'Medium';

                    // Token Price: Arbitrary calculation or from valuation
                    // Valuation / 10000 tokens?
                    const valuation = sub.financials?.valuation || 1000000;
                    const tokenPrice = Math.round(valuation / 1000); // Assume 1000 supply?

                    return {
                        id: sub.id,
                        name: sub.spvName,
                        location: `${sub.location?.city}, ${sub.location?.country}`,
                        tokenPrice: tokenPrice,
                        yieldPercent: sub.financials?.expectedYield || 0,
                        image: sub.imageUrls?.[0] || 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=800', // Fallback
                        risk: risk,
                        tokenAddress: sub.results?.token?.tokenAddress,
                        description: `Asset type: ${sub.category}. ${sub.specifications?.type || ''}`
                    };
                });

            setAssets(mapped);
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to fetch assets", err);
            // Fallback to empty or handled in UI
            setError(err.message);
            setLoading(false);
        }
    };

    return { assets, loading, error, refetch: fetchAssets };
}

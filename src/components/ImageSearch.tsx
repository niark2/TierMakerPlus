"use client";

import { useState, useCallback } from "react";
import { useTierStore, type TierItem } from "@/store/useTierStore";
import { Search, Globe, Loader2, X, Plus, Image as ImageIcon } from "lucide-react";

interface GoogleImage {
    id: string;
    url: string;
    title: string;
}

export default function ImageSearch() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GoogleImage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addUnrankedItem = useTierStore((s) => s.addUnrankedItem);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/images?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error();
            const data = await response.json();

            if (data.error) throw new Error(data.error);

            setResults(data);
            if (data.length === 0) {
                setError("Aucune image trouvée.");
            }
        } catch {
            setError("Erreur lors de la recherche (cela peut arriver si Google bloque le scan). Réessayez.");
        } finally {
            setIsLoading(false);
        }
    }, [query]);

    const addImageToTierList = (img: GoogleImage) => {
        const item: TierItem = {
            id: img.id,
            type: "image",
            imageUrl: img.url,
        };
        addUnrankedItem(item);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase flex items-center gap-2">
                    <Globe size={14} className="text-emerald-500" />
                    Internet (Google)
                </h3>
                {results.length > 0 && (
                    <button onClick={() => setResults([])} className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] uppercase font-bold flex items-center gap-1 transition-all">
                        <X size={10} /> Clear
                    </button>
                )}
            </div>

            <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder="Chercher une image sur le Web..."
                    className="input-modern flex-1 pr-10"
                />
                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="absolute right-1 top-1 w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
                >
                    {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                </button>
            </div>

            {error && <p className="text-[10px] font-bold bg-red-500/10 text-red-400 p-2 rounded-lg border border-red-500/20">{error}</p>}

            {isLoading && results.length === 0 && (
                <div className="py-20 flex flex-col items-center justify-center gap-4 text-[var(--color-text-secondary)]">
                    <Loader2 size={32} className="animate-spin text-indigo-500" />
                    <span className="text-xs font-medium animate-pulse">Scan des images en cours...</span>
                </div>
            )}

            {results.length > 0 && (
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {results.map((img) => (
                        <button
                            key={img.id}
                            onClick={() => addImageToTierList(img)}
                            className="bg-[var(--color-surface)]/20 border border-[var(--color-border)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group overflow-hidden rounded-xl relative aspect-square"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={img.url}
                                alt={img.title}
                                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Plus className="text-white" size={24} />
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {results.length === 0 && !isLoading && (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-[var(--color-text-secondary)] border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                    <ImageIcon size={32} strokeWidth={1} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-center px-4">Entrez un mot-clé pour explorer le web</span>
                </div>
            )}
        </div>
    );
}

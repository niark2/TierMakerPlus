"use client";

import { useState, useCallback } from "react";
import { searchDeezerTracks, searchDeezerAlbums, getAlbumTracks, type DeezerTrack, type DeezerAlbum } from "@/lib/deezer";
import { useTierStore, type TierItem } from "@/store/useTierStore";
import { Search, Music, Loader2, X, Disc, ListMusic } from "lucide-react";

export default function MusicSearch() {
    const [query, setQuery] = useState("");
    const [searchType, setSearchType] = useState<"track" | "album">("track");
    const [results, setResults] = useState<(DeezerTrack | DeezerAlbum)[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const addUnrankedItem = useTierStore((s) => s.addUnrankedItem);

    const handleSearch = useCallback(async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const data = searchType === "track"
                ? await searchDeezerTracks(query)
                : await searchDeezerAlbums(query);

            setResults(data);
            if (data.length === 0) {
                setError("Aucun résultat trouvé.");
            }
        } catch {
            setError("Erreur lors de la recherche. Réessayez.");
        } finally {
            setIsLoading(false);
        }
    }, [query, searchType]);

    const addTrackToTierList = (track: DeezerTrack) => {
        const item: TierItem = {
            id: `deezer-${track.id}-${Date.now()}`,
            type: "music",
            imageUrl: track.album.cover_medium || track.album.cover_big,
            label: track.title,
            artist: track.artist.name,
        };
        addUnrankedItem(item);
    };

    const handleAddAlbum = async (album: DeezerAlbum) => {
        setIsLoading(true);
        try {
            const tracks = await getAlbumTracks(album.id);
            if (tracks.length === 0) {
                setError("Impossible de récupérer les pistes de cet album.");
                return;
            }

            const confirmAdd = window.confirm(
                `Ajouter les ${tracks.length} musiques de l'album "${album.title}" à la banque ?`
            );

            if (confirmAdd) {
                tracks.forEach((track, index) => {
                    const item: TierItem = {
                        id: `deezer-${track.id}-${Date.now()}-${index}`,
                        type: "music",
                        imageUrl: album.cover_medium || album.cover_big,
                        label: track.title,
                        artist: album.artist.name,
                    };
                    addUnrankedItem(item);
                });
            }
        } catch {
            setError("Erreur lors de l'ajout de l'album.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase flex items-center gap-2">
                    <Music size={14} className="text-pink-500" />
                    Musique (Deezer)
                </h3>
                {results.length > 0 && (
                    <button onClick={() => setResults([])} className="text-[10px] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] uppercase font-bold flex items-center gap-1 transition-colors">
                        <X size={10} /> Clear
                    </button>
                )}
            </div>

            {/* Search Type Toggle */}
            <div className="flex p-1 bg-[var(--color-surface)]/50 rounded-xl border border-[var(--color-border)] gap-1">
                <button
                    onClick={() => { setSearchType("track"); setResults([]); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${searchType === "track" ? "bg-indigo-600 text-white shadow-lg" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                        }`}
                >
                    <ListMusic size={14} />
                    Titres
                </button>
                <button
                    onClick={() => { setSearchType("album"); setResults([]); }}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold uppercase transition-all ${searchType === "album" ? "bg-indigo-600 text-white shadow-lg" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                        }`}
                >
                    <Disc size={14} />
                    Albums
                </button>
            </div>

            <div className="flex gap-2 relative">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    placeholder={searchType === "track" ? "Chercher un titre..." : "Chercher un album..."}
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

            {results.length > 0 && (
                <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {results.map((res) => {
                        const isTrack = "album" in res;
                        return (
                            <button
                                key={res.id}
                                onClick={() => isTrack ? addTrackToTierList(res as DeezerTrack) : handleAddAlbum(res as DeezerAlbum)}
                                className="flex items-center gap-3 p-2 rounded-xl bg-[var(--color-surface)]/20 border border-[var(--color-border)] hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all text-left group"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={isTrack ? (res as DeezerTrack).album.cover_medium : (res as DeezerAlbum).cover_medium}
                                    alt={res.title}
                                    className="w-10 h-10 rounded-lg object-cover shadow-lg flex-shrink-0 grayscale group-hover:grayscale-0 transition-all duration-300"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-[var(--color-text)] truncate select-none">{res.title}</p>
                                        {!isTrack && <span className="text-[8px] bg-indigo-500/20 text-indigo-400 px-1 rounded border border-indigo-500/30 uppercase font-black">Album</span>}
                                    </div>
                                    <p className="text-[10px] text-[var(--color-text-secondary)] font-medium truncate select-none">
                                        {res.artist.name}
                                    </p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}



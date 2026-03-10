export interface DeezerTrack {
    id: number;
    title: string;
    artist: {
        id: number;
        name: string;
    };
    album: {
        id: number;
        title: string;
        cover_medium: string;
        cover_big: string;
    };
    preview: string;
}

export interface DeezerAlbum {
    id: number;
    title: string;
    cover_medium: string;
    cover_big: string;
    artist: {
        name: string;
    };
}

interface DeezerSearchResponse<T> {
    data: T[];
    total: number;
}

export async function searchDeezerTracks(query: string): Promise<DeezerTrack[]> {
    if (!query.trim()) return [];
    return fetchDeezer<DeezerTrack>(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=12`);
}

export async function searchDeezerAlbums(query: string): Promise<DeezerAlbum[]> {
    if (!query.trim()) return [];
    return fetchDeezer<DeezerAlbum>(`https://api.deezer.com/search/album?q=${encodeURIComponent(query)}&limit=12`);
}

export async function getAlbumTracks(albumId: number): Promise<DeezerTrack[]> {
    return fetchDeezer<DeezerTrack>(`https://api.deezer.com/album/${albumId}/tracks`);
}

async function fetchDeezer<T>(url: string): Promise<T[]> {
    try {
        const response = await fetch(
            `https://corsproxy.io/?${encodeURIComponent(url)}`
        );

        if (!response.ok) return [];

        const data: DeezerSearchResponse<T> = await response.json();
        return data.data ?? [];
    } catch {
        return [];
    }
}


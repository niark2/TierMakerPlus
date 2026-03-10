import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TierItem {
    id: string;
    type: "image" | "music" | "custom";
    imageUrl: string;
    label?: string;
    artist?: string;
    customText?: string;
    fontFamily?: string;
    fontSize?: number;
    fontColor?: string;
    textPosition?: "top" | "center" | "bottom";
}

export interface Category {
    id: string;
    name: string;
    color: string;
    items: TierItem[];
}

interface TierSnapshot {
    title: string;
    categories: Category[];
    unrankedItems: TierItem[];
}

interface TierState extends TierSnapshot {
    past: TierSnapshot[];
    future: TierSnapshot[];
    setTitle: (title: string) => void;
    addCategory: (name: string, color: string) => void;
    removeCategory: (id: string) => void;
    updateCategory: (id: string, updates: Partial<Pick<Category, "name" | "color">>) => void;
    addItemToCategory: (categoryId: string, item: TierItem) => void;
    addUnrankedItem: (item: TierItem) => void;
    removeItem: (itemId: string) => void;
    moveItem: (
        itemId: string,
        fromContainerId: string,
        toContainerId: string,
        newIndex: number
    ) => void;
    reorderInContainer: (containerId: string, oldIndex: number, newIndex: number) => void;
    resetBoard: () => void;
    loadState: (state: TierSnapshot) => void;
    undo: () => void;
    redo: () => void;
    saveHistory: () => void;
}


const DEFAULT_CATEGORIES: Category[] = [
    { id: "s", name: "S", color: "#ff4d4d", items: [] },
    { id: "a", name: "A", color: "#ffa502", items: [] },
    { id: "b", name: "B", color: "#eccc68", items: [] },
    { id: "c", name: "C", color: "#2ed573", items: [] },
    { id: "d", name: "D", color: "#1e90ff", items: [] },
];

function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function findAndRemoveItem(
    categories: Category[],
    unranked: TierItem[],
    itemId: string
): { item: TierItem | null; categories: Category[]; unranked: TierItem[] } {
    let foundItem: TierItem | null = null;

    const newCategories = categories.map((cat) => {
        const idx = cat.items.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
            foundItem = cat.items[idx];
            return { ...cat, items: [...cat.items.slice(0, idx), ...cat.items.slice(idx + 1)] };
        }
        return cat;
    });

    if (!foundItem) {
        const idx = unranked.findIndex((i) => i.id === itemId);
        if (idx !== -1) {
            foundItem = unranked[idx];
            return {
                item: foundItem,
                categories: newCategories,
                unranked: [...unranked.slice(0, idx), ...unranked.slice(idx + 1)],
            };
        }
    }

    return { item: foundItem, categories: newCategories, unranked };
}

export const useTierStore = create<TierState>()(
    persist(
        (set, get) => ({
            title: "Ma Tier List NIark",
            categories: DEFAULT_CATEGORIES,
            unrankedItems: [],
            past: [],
            future: [],

            saveHistory: () => {
                const { title, categories, unrankedItems, past } = get();
                // Limit history to 20 steps to save memory
                const newPast = [...past, { title, categories, unrankedItems }].slice(-20);
                set({ past: newPast, future: [] });
            },

            undo: () => {
                const { past, future, title, categories, unrankedItems } = get();
                if (past.length === 0) return;

                const previous = past[past.length - 1];
                const newPast = past.slice(0, past.length - 1);

                set({
                    ...previous,
                    past: newPast,
                    future: [{ title, categories, unrankedItems }, ...future],
                });
            },

            redo: () => {
                const { past, future, title, categories, unrankedItems } = get();
                if (future.length === 0) return;

                const next = future[0];
                const newFuture = future.slice(1);

                set({
                    ...next,
                    past: [...past, { title, categories, unrankedItems }],
                    future: newFuture,
                });
            },

            setTitle: (title) => {
                get().saveHistory();
                set({ title });
            },

            addCategory: (name, color) => {
                get().saveHistory();
                set((state) => ({
                    categories: [
                        ...state.categories,
                        { id: generateId(), name, color, items: [] },
                    ],
                }));
            },

            removeCategory: (id) => {
                get().saveHistory();
                set((state) => {
                    const cat = state.categories.find((c) => c.id === id);
                    return {
                        categories: state.categories.filter((c) => c.id !== id),
                        unrankedItems: [...state.unrankedItems, ...(cat?.items ?? [])],
                    };
                });
            },

            updateCategory: (id, updates) => {
                get().saveHistory();
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === id ? { ...c, ...updates } : c
                    ),
                }));
            },

            addItemToCategory: (categoryId, item) => {
                get().saveHistory();
                set((state) => ({
                    categories: state.categories.map((c) =>
                        c.id === categoryId
                            ? { ...c, items: [...c.items, { ...item, id: item.id || generateId() }] }
                            : c
                    ),
                }));
            },

            addUnrankedItem: (item) => {
                get().saveHistory();
                set((state) => ({
                    unrankedItems: [
                        ...state.unrankedItems,
                        { ...item, id: item.id || generateId() },
                    ],
                }));
            },

            removeItem: (itemId) => {
                get().saveHistory();
                set((state) => {
                    const result = findAndRemoveItem(state.categories, state.unrankedItems, itemId);
                    return { categories: result.categories, unrankedItems: result.unranked };
                });
            },

            moveItem: (itemId, _fromContainerId, toContainerId, newIndex) => {
                get().saveHistory();
                set((state) => {
                    const result = findAndRemoveItem(state.categories, state.unrankedItems, itemId);
                    if (!result.item) return state;

                    if (toContainerId === "unranked") {
                        const newUnranked = [...result.unranked];
                        newUnranked.splice(newIndex, 0, result.item);
                        return { categories: result.categories, unrankedItems: newUnranked };
                    }

                    const newCategories = result.categories.map((cat) => {
                        if (cat.id === toContainerId) {
                            const newItems = [...cat.items];
                            newItems.splice(newIndex, 0, result.item!);
                            return { ...cat, items: newItems };
                        }
                        return cat;
                    });

                    return { categories: newCategories, unrankedItems: result.unranked };
                });
            },

            reorderInContainer: (containerId, oldIndex, newIndex) => {
                get().saveHistory();
                set((state) => {
                    if (containerId === "unranked") {
                        const items = [...state.unrankedItems];
                        const [moved] = items.splice(oldIndex, 1);
                        items.splice(newIndex, 0, moved);
                        return { unrankedItems: items };
                    }

                    return {
                        categories: state.categories.map((cat) => {
                            if (cat.id === containerId) {
                                const items = [...cat.items];
                                const [moved] = items.splice(oldIndex, 1);
                                items.splice(newIndex, 0, moved);
                                return { ...cat, items };
                            }
                            return cat;
                        }),
                    };
                });
            },

            resetBoard: () => {
                get().saveHistory();
                set({
                    title: "Ma Tier List",
                    categories: DEFAULT_CATEGORIES.map((c) => ({ ...c, items: [] })),
                    unrankedItems: [],
                });
            },

            loadState: (newState) => {
                get().saveHistory();
                set({
                    title: newState.title,
                    categories: newState.categories,
                    unrankedItems: newState.unrankedItems,
                });
            },

        }),
        {
            name: "tier-list-storage",
            partialize: (state) => ({
                title: state.title,
                categories: state.categories,
                unrankedItems: state.unrankedItems,
            }),
        }
    )
);


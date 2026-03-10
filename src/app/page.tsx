"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    pointerWithin,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    type DragOverEvent,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useTierStore, type TierItem } from "@/store/useTierStore";
import TierRow from "@/components/TierRow";
import DraggableItem from "@/components/DraggableItem";
import MusicSearch from "@/components/MusicSearch";
import ImageBuilder from "@/components/ImageBuilder";
import ExportButton from "@/components/ExportButton";
import AddCategory from "@/components/AddCategory";
import ImageSearch from "@/components/ImageSearch";
import ThemeToggle from "@/components/ThemeToggle";
import {
    RotateCcw,
    Save,
    FolderOpen,
    Pencil,
    Music,
    ImagePlus,
    PlusCircle,
    Undo2,
    Redo2,
    Upload,
    Globe,
} from "lucide-react";



import { motion, AnimatePresence } from "framer-motion";


function ImageBank() {
    const unrankedItems = useTierStore((s) => s.unrankedItems);
    const addUnrankedItem = useTierStore((s) => s.addUnrankedItem);
    const { setNodeRef, isOver } = useDroppable({ id: "unranked" });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isNativeOver, setIsNativeOver] = useState(false);

    const processFiles = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach((file) => {
            if (!file.type.startsWith("image/")) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageUrl = e.target?.result as string;
                addUnrankedItem({
                    id: `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    type: "image",
                    imageUrl,
                });
            };
            reader.readAsDataURL(file);
        });
    };

    const handleNativeDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsNativeOver(true);
    };

    const handleNativeDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsNativeOver(false);
    };

    const handleNativeDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsNativeOver(false);
        processFiles(e.dataTransfer.files);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase flex items-center gap-2">
                    <FolderOpen size={14} className="text-indigo-400" />
                    Bank d&apos;Images
                </h3>
                <div className="flex items-center gap-3">
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        accept="image/*"
                        onChange={(e) => processFiles(e.target.files)}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[var(--color-text-secondary)] hover:text-indigo-400 transition-colors p-1"
                        title="Ajouter des images"
                    >
                        <Upload size={14} />
                    </button>
                    <span className="text-[10px] text-[var(--color-text-secondary)] font-medium">
                        {unrankedItems.length}
                    </span>
                </div>
            </div>

            <div
                ref={setNodeRef}
                onDragOver={handleNativeDragOver}
                onDragLeave={handleNativeDragLeave}
                onDrop={handleNativeDrop}
                className={`bank-grid min-h-[120px] flex flex-wrap content-start gap-4 p-4 rounded-xl transition-all duration-300 border ${isOver || isNativeOver
                    ? "bg-indigo-500/10 border-indigo-500/50 ring-1 ring-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.1)]"
                    : "bg-[var(--color-surface)]/20 border-[var(--color-border)]"
                    }`}
            >
                <SortableContext
                    items={unrankedItems.map((i) => i.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {unrankedItems.map((item) => (
                        <DraggableItem key={item.id} item={item} />
                    ))}
                </SortableContext>

                {unrankedItems.length === 0 && !isNativeOver && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] gap-1 py-4 select-none">
                        <span className="text-xs font-medium italic text-center">Déposez vos images ici ou utilisez le bouton +</span>
                    </div>
                )}

                {isNativeOver && (
                    <div className="w-full h-full absolute inset-0 flex items-center justify-center bg-indigo-500/20 backdrop-blur-[2px] rounded-xl pointer-events-none border-2 border-dashed border-indigo-500 animate-pulse">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Lâcher pour ajouter</span>
                    </div>
                )}
            </div>
        </div>
    );
}




function Sidebar() {
    const [activeTab, setActiveTab] = useState<"bank" | "search" | "web" | "build" | "cats">("bank");

    const tabs = [
        { id: "bank", label: "Banque", icon: FolderOpen },
        { id: "search", label: "Musique", icon: Music },
        { id: "web", label: "Internet", icon: Globe },
        { id: "build", label: "Créer", icon: ImagePlus },
        { id: "cats", label: "Options", icon: PlusCircle },
    ] as const;


    return (
        <div className="bento-card overflow-hidden flex flex-col h-[580px]">
            {/* Tab Navigation */}
            <div className="flex border-b border-color-mix(in srgb, var(--color-text), transparent 95%) bg-color-mix(in srgb, var(--color-bg), transparent 60%) p-2 gap-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex flex-col items-center justify-center py-3 rounded-lg transition-all duration-300 relative ${activeTab === tab.id ? "text-indigo-400" : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                            }`}
                    >
                        <tab.icon size={18} className="mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-500 rounded-full"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="h-full"
                    >
                        {activeTab === "bank" && <ImageBank />}
                        {activeTab === "search" && <MusicSearch />}
                        {activeTab === "web" && <ImageSearch />}
                        {activeTab === "build" && <ImageBuilder />}
                        {activeTab === "cats" && <AddCategory />}

                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function Home() {

    const boardRef = useRef<HTMLDivElement>(null);
    const {
        title,
        setTitle,
        categories,
        unrankedItems,
        moveItem,
        reorderInContainer,
        resetBoard,
        loadState,
        undo,
        redo,
        past,
        future,
    } = useTierStore();

    const [activeItem, setActiveItem] = useState<TierItem | null>(null);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(title);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === "z") {
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if ((e.ctrlKey || e.metaKey) && e.key === "y") {
                redo();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [undo, redo]);


    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        })
    );

    // Find which container an item belongs to
    const findContainer = useCallback(
        (itemId: string): string | null => {
            if (unrankedItems.some((i) => i.id === itemId)) return "unranked";
            for (const cat of categories) {
                if (cat.items.some((i) => i.id === itemId)) return cat.id;
            }
            return null;
        },
        [categories, unrankedItems]
    );

    // Find the item object by id
    const findItem = useCallback(
        (itemId: string): TierItem | null => {
            const unranked = unrankedItems.find((i) => i.id === itemId);
            if (unranked) return unranked;
            for (const cat of categories) {
                const found = cat.items.find((i) => i.id === itemId);
                if (found) return found;
            }
            return null;
        },
        [categories, unrankedItems]
    );

    const handleDragStart = (event: DragStartEvent) => {
        const item = findItem(String(event.active.id));
        setActiveItem(item);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeContainer = findContainer(activeId);
        let overContainer = findContainer(overId);

        // If overId is a container itself (category id or "unranked"), use it directly
        if (!overContainer) {
            if (overId === "unranked" || categories.some((c) => c.id === overId)) {
                overContainer = overId;
            }
        }

        if (!activeContainer || !overContainer || activeContainer === overContainer) return;

        // Move item to the new container
        const overItems =
            overContainer === "unranked"
                ? unrankedItems
                : categories.find((c) => c.id === overContainer)?.items ?? [];

        const overIndex = overItems.findIndex((i) => i.id === overId);
        const newIndex = overIndex >= 0 ? overIndex : overItems.length;

        moveItem(activeId, activeContainer, overContainer, newIndex);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveItem(null);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        if (activeId === overId) return;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer) return;

        if (activeContainer === overContainer) {
            const items =
                activeContainer === "unranked"
                    ? unrankedItems
                    : categories.find((c) => c.id === activeContainer)?.items ?? [];

            const oldIndex = items.findIndex((i) => i.id === activeId);
            const newIndex = items.findIndex((i) => i.id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                reorderInContainer(activeContainer, oldIndex, newIndex);
            }
        }
    };

    const handleSave = () => {
        const state = useTierStore.getState();
        const data = JSON.stringify({
            title: state.title,
            categories: state.categories,
            unrankedItems: state.unrankedItems,
        });
        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.tierlist.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleLoad = () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,.tierlist.json";
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
                try {
                    const parsed = JSON.parse(reader.result as string) as {
                        title: string;
                        categories: typeof categories;
                        unrankedItems: typeof unrankedItems;
                    };
                    loadState(parsed);
                } catch (err) {
                    console.error("Invalid file:", err);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handleTitleSave = () => {
        if (editTitle.trim()) {
            setTitle(editTitle.trim());
        }
        setIsEditingTitle(false);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={pointerWithin}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="min-h-screen p-4 md:p-8 max-w-[1600px] mx-auto">
                {/* Modern Header */}
                <header className="mb-8 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-[var(--color-border)] pb-6">
                    <div className="flex flex-col gap-1 flex-1">
                        <span className="text-[10px] font-black tracking-[0.5em] text-indigo-400 uppercase">NIarkTierList</span>
                        {isEditingTitle ? (
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onBlur={handleTitleSave}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleTitleSave();
                                    if (e.key === "Escape") setIsEditingTitle(false);
                                }}
                                className="input-modern text-3xl font-black bg-transparent border-none p-0 focus:ring-0 w-full"
                                autoFocus
                            />
                        ) : (
                            <h1
                                className="text-4xl font-black tracking-tighter cursor-pointer group flex items-center gap-4 hover:text-indigo-400 transition-all duration-300"
                                onClick={() => {
                                    setEditTitle(title);
                                    setIsEditingTitle(true);
                                }}
                            >
                                {title}
                                <Pencil
                                    size={20}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-secondary)]"
                                />
                            </h1>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-3 items-center">
                        <ThemeToggle />
                        <div className="flex gap-1 mr-2 bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)] shadow-sm">
                            <button
                                onClick={undo}
                                disabled={past.length === 0}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                title="Undo (Ctrl+Z)"
                            >
                                <Undo2 size={18} />
                            </button>
                            <button
                                onClick={redo}
                                disabled={future.length === 0}
                                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[var(--color-surface-hover)] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                                title="Redo (Ctrl+Y)"
                            >
                                <Redo2 size={18} />
                            </button>
                        </div>
                        <ExportButton targetRef={boardRef} filename={title.replace(/\s+/g, "_")} />
                        <button onClick={handleSave} className="btn-modern">
                            <Save size={16} />
                            Save
                        </button>
                        <button onClick={handleLoad} className="btn-modern">
                            <FolderOpen size={16} />
                            Load
                        </button>
                        <button onClick={resetBoard} className="btn-modern btn-danger">
                            <RotateCcw size={16} />
                            Reset
                        </button>
                    </div>

                </header>


                {/* Modern Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-12 items-start">
                    {/* Sidebar with Tabs */}
                    <aside className="sticky top-12">
                        <Sidebar />
                    </aside>



                    {/* Tier Rows Area */}
                    <main className="space-y-6">
                        <div ref={boardRef} className="space-y-4">
                            {categories.map((category) => (
                                <TierRow key={category.id} category={category} />
                            ))}
                        </div>
                    </main>
                </div>
            </div>

            {/* Drag Overlay with modern animation */}
            <DragOverlay dropAnimation={null}>
                {activeItem ? (
                    <div className="item-card ring-2 ring-indigo-500 shadow-2xl scale-110 rotate-2 cursor-grabbing">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={activeItem.imageUrl}
                            alt={activeItem.label ?? "dragging"}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}


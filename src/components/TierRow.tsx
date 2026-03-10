"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import type { Category } from "@/store/useTierStore";
import { useTierStore } from "@/store/useTierStore";
import DraggableItem from "./DraggableItem";
import { Trash2, Pencil, Palette, Check, X } from "lucide-react";
import { useState, useRef } from "react";

interface TierRowProps {
    category: Category;
}

export default function TierRow({ category }: TierRowProps) {
    const { updateCategory, removeCategory } = useTierStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(category.name);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const { setNodeRef, isOver } = useDroppable({ id: category.id });

    const handleRename = () => {
        if (editName.trim()) {
            updateCategory(category.id, { name: editName.trim() });
        }
        setIsEditing(false);
    };

    return (
        <div className={`tier-row group transition-all duration-300 ${isOver ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-[var(--color-bg)]" : ""}`}>
            {/* Category Label (Head) */}
            <div
                className="tier-label relative group/label flex-shrink-0"
                style={{ backgroundColor: category.color }}
            >
                {isEditing ? (
                    <div className="flex flex-col items-center gap-2 px-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleRename();
                                if (e.key === "Escape") setIsEditing(false);
                            }}
                            className="w-16 bg-black/30 text-white text-center rounded border border-white/20 outline-none text-xs font-bold py-1"
                            autoFocus
                        />
                        <div className="flex gap-1">
                            <button onClick={handleRename} className="p-1 hover:bg-white/20 rounded"><Check size={12} /></button>
                            <button onClick={() => setIsEditing(false)} className="p-1 hover:bg-white/20 rounded"><X size={12} /></button>
                        </div>
                    </div>
                ) : (
                    <span className="text-xl font-black">{category.name}</span>
                )}

                {/* Action controls */}
                {!isEditing && (
                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => {
                                setEditName(category.name);
                                setIsEditing(true);
                            }}
                            className="w-5 h-5 bg-black/20 hover:bg-black/40 rounded flex items-center justify-center transition-colors"
                        >
                            <Pencil size={10} />
                        </button>
                        <button
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="w-5 h-5 bg-black/20 hover:bg-black/40 rounded flex items-center justify-center transition-colors"
                        >
                            <Palette size={10} />
                        </button>
                        <button
                            onClick={() => removeCategory(category.id)}
                            className="w-5 h-5 bg-black/20 hover:bg-red-500/50 rounded flex items-center justify-center transition-colors"
                        >
                            <Trash2 size={10} />
                        </button>
                    </div>
                )}

                {/* Absolute Color Picker */}
                {showColorPicker && (
                    <div className="absolute left-full top-0 ml-4 z-[100] p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-2xl flex flex-col gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Color</span>
                        <input
                            type="color"
                            value={category.color}
                            onChange={(e) => updateCategory(category.id, { color: e.target.value })}
                            className="w-12 h-12 cursor-pointer bg-transparent border-none rounded overflow-hidden"
                        />
                        <button
                            onClick={() => setShowColorPicker(false)}
                            className="btn-modern py-1 px-2 text-[10px]"
                        >
                            Close
                        </button>
                    </div>
                )}
            </div>

            {/* Item Drop Zone (Content) */}
            <div
                ref={setNodeRef}
                className={`flex-1 flex flex-wrap items-center gap-2 p-3 min-h-[100px] transition-colors duration-200 ${isOver ? "bg-[var(--color-accent)]/10" : "bg-transparent"
                    }`}
            >
                <SortableContext
                    items={category.items.map((i) => i.id)}
                    strategy={horizontalListSortingStrategy}
                >
                    {category.items.map((item) => (
                        <DraggableItem key={item.id} item={item} />
                    ))}
                </SortableContext>

                {category.items.length === 0 && !isOver && (
                    <div className="flex-1 flex justify-center py-4">
                        <span className="text-xs text-[var(--color-text-secondary)] uppercase tracking-widest font-medium select-none">Empty Row</span>
                    </div>
                )}
            </div>
        </div>
    );
}


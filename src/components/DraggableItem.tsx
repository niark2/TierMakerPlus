"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { TierItem } from "@/store/useTierStore";
import { useTierStore } from "@/store/useTierStore";
import { X } from "lucide-react";

interface DraggableItemProps {
    item: TierItem;
}

export default function DraggableItem({ item }: DraggableItemProps) {
    const removeItem = useTierStore((s) => s.removeItem);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : "auto" as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="item-card group relative"
            {...attributes}
            {...listeners}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={item.imageUrl}
                alt={item.label ?? "tier item"}
                draggable={false}
                className="w-full h-full object-cover"
            />

            {/* Modern Overlay */}
            {item.type === "music" && item.label && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm px-1 py-1 text-[8px] text-white leading-tight truncate text-center transition-all group-hover:bg-indigo-600/90 select-none">
                    <span className="font-bold truncate block">{item.label}</span>
                    {item.artist && (
                        <span className="block text-[7px] text-indigo-300 truncate font-medium">{item.artist}</span>
                    )}
                </div>
            )}


            {/* Delete button - Modern circle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.id);
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500/90 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:scale-110 shadow-lg z-10"
                title="Supprimer"
            >
                <X size={12} strokeWidth={3} />
            </button>
        </div>

    );
}

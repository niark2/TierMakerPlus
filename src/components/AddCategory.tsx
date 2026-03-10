"use client";

import { useState } from "react";
import { useTierStore } from "@/store/useTierStore";
import { Plus, X, Check } from "lucide-react";

const PRESET_COLORS = [
    "#ff4d4d", "#ffa502", "#eccc68", "#2ed573",
    "#1e90ff", "#a29bfe", "#70a1ff", "#ff4757",
    "#2f3542", "#57606f",
];

export default function AddCategory() {
    const { addCategory } = useTierStore();
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState("#6c5ce7");

    const handleAdd = () => {
        if (!name.trim()) return;
        addCategory(name.trim(), color);
        setName("");
        setColor("#6c5ce7");
        setIsOpen(false);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-modern w-full justify-center py-4 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]/30"
            >
                <Plus size={18} />
                <span className="font-bold tracking-tight">Ajouter une catégorie</span>
            </button>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase">Nouvelle Catégorie</h3>
                <button onClick={() => setIsOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors">
                    <X size={14} />
                </button>
            </div>

            <div className="space-y-4">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    placeholder="S, A, B, Goated..."
                    className="input-modern w-full"
                    autoFocus
                />

                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
                        Couleur
                    </label>
                    <div className="flex flex-wrap gap-2 items-center">
                        {PRESET_COLORS.map((c) => (
                            <button
                                key={c}
                                onClick={() => setColor(c)}
                                className={`w-8 h-8 rounded-lg transition-all duration-200 border-2 ${color === c ? "scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]" : "border-transparent opacity-60 hover:opacity-100"
                                    }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-[var(--color-border)]">
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="absolute inset-0 w-full h-full scale-150 cursor-pointer bg-transparent border-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 pt-2">
                    <button onClick={handleAdd} className="btn-modern flex-1 justify-center bg-indigo-600 border-indigo-500 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                        <Check size={16} />
                        Confirmer
                    </button>
                </div>
            </div>
        </div>
    );
}


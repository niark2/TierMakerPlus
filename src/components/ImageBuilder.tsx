"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useTierStore, type TierItem } from "@/store/useTierStore";
import { ImagePlus, Type, Upload, Settings2 } from "lucide-react";

const FONTS = [
    "Outfit",
    "Arial",
    "Impact",
    "Georgia",
    "Courier New",
    "Verdana",
];

const TEXT_POSITIONS = [
    { label: "Haut", value: "top" as const },
    { label: "Centre", value: "center" as const },
    { label: "Bas", value: "bottom" as const },
];

export default function ImageBuilder() {
    const addUnrankedItem = useTierStore((s) => s.addUnrankedItem);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [customText, setCustomText] = useState("");
    const [fontFamily, setFontFamily] = useState("Outfit");
    const [fontSize, setFontSize] = useState(24);
    const [fontColor, setFontColor] = useState("#ffffff");
    const [textPosition, setTextPosition] = useState<"top" | "center" | "bottom">("bottom");
    const [bgColor, setBgColor] = useState("#4f46e5");

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const addUploadedImageDirectly = () => {
        if (!uploadedImage) return;

        const item: TierItem = {
            id: `img-${Date.now()}`,
            type: "image",
            imageUrl: uploadedImage,
        };
        addUnrankedItem(item);
        setUploadedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const wrapText = useCallback((ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
        const words = text.split(" ");
        const lines: string[] = [];
        let currentLine = "";

        for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (ctx.measureText(testLine).width > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        }
        if (currentLine) lines.push(currentLine);
        return lines;
    }, []);

    const drawText = useCallback((ctx: CanvasRenderingContext2D, size: number) => {
        if (!customText) return;

        ctx.font = `bold ${fontSize * 1.5}px ${fontFamily}`;
        ctx.fillStyle = fontColor;
        ctx.textAlign = "center";

        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;

        const lines = wrapText(ctx, customText, size - 30);
        const lineHeight = fontSize * 1.5 * 1.2;

        let startY: number = 0;
        switch (textPosition) {
            case "top":
                startY = (fontSize * 1.5) + 20;
                break;
            case "center":
                startY = (size - lines.length * lineHeight) / 2 + (fontSize * 1.5);
                break;
            case "bottom":
                startY = size - lines.length * lineHeight - 10 + (fontSize * 1.5);
                break;
        }

        lines.forEach((line, i) => {
            const y = startY + i * lineHeight;
            ctx.fillText(line, size / 2, y);
        });
    }, [customText, fontSize, fontFamily, fontColor, wrapText, textPosition]);

    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const size = 300;
        canvas.width = size;
        canvas.height = size;

        if (uploadedImage) {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                ctx.drawImage(img, 0, 0, size, size);
                drawText(ctx, size);
            };
            img.src = uploadedImage;
        } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, size, size);
            drawText(ctx, size);
        }
    }, [uploadedImage, bgColor, drawText]);


    useEffect(() => {
        renderCanvas();
    }, [renderCanvas]);

    const generateCustomItem = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL("image/png");
        const item: TierItem = {
            id: `custom-${Date.now()}`,
            type: "custom",
            imageUrl: dataUrl,
            label: customText || undefined,
            customText,
            fontFamily,
            fontSize,
            fontColor,
            textPosition,
        };
        addUnrankedItem(item);
    };

    return (
        <div className="space-y-6">
            <h3 className="text-[10px] font-bold tracking-[0.2em] text-[var(--color-text-secondary)] uppercase flex items-center gap-2 px-1">
                <ImagePlus size={14} className="text-indigo-400" />
                Image Builder
            </h3>

            {/* Direct Upload Section */}
            <div className="space-y-4">
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-modern flex-1 py-3 bg-[var(--color-surface)]/20 border-[var(--color-border)] hover:bg-[var(--color-surface)]/40"
                    >
                        <Upload size={14} />
                        <span className="text-xs font-bold">Upload Image</span>
                    </button>
                    {uploadedImage && (
                        <button
                            onClick={addUploadedImageDirectly}
                            className="btn-modern bg-indigo-600 border-indigo-500 hover:bg-indigo-700"
                        >
                            Ajouter
                        </button>
                    )}
                </div>
            </div>

            {/* Custom Builder Section */}
            <div className="space-y-6 p-4 rounded-2xl bg-[var(--color-surface)]/30 border border-[var(--color-border)]">
                <div className="flex items-center gap-2 text-indigo-300">
                    <Type size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--color-text)]">Générateur de Carte</span>
                </div>

                <div className="flex flex-col gap-6">
                    {/* Preview Box */}
                    <div className="relative group mx-auto">
                        <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative aspect-square w-[200px] h-[200px] bg-[var(--color-bg)] rounded-lg overflow-hidden border border-[var(--color-border)]">
                            <canvas
                                ref={canvasRef}
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Builder Controls */}
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={customText}
                            onChange={(e) => setCustomText(e.target.value)}
                            placeholder="Texte de la carte..."
                            className="input-modern w-full"
                        />

                        <div className="grid grid-cols-2 gap-3">
                            <select
                                value={fontFamily}
                                onChange={(e) => setFontFamily(e.target.value)}
                                className="input-modern text-[10px] font-bold py-2"
                            >
                                {FONTS.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                ))}
                            </select>

                            <div className="flex items-center gap-2 input-modern py-1">
                                <span className="text-[10px] font-bold text-[var(--color-text-secondary)] ml-2">PX</span>
                                <input
                                    type="number"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="bg-transparent border-none outline-none w-full text-xs font-bold text-[var(--color-text)]"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter">Color</span>
                                    <input
                                        type="color"
                                        value={fontColor}
                                        onChange={(e) => setFontColor(e.target.value)}
                                        className="w-8 h-8 rounded-lg cursor-pointer bg-[var(--color-surface)] border-none overflow-hidden"
                                    />
                                </div>
                                {!uploadedImage && (
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[8px] font-bold text-[var(--color-text-secondary)] uppercase tracking-tighter">BG</span>
                                        <input
                                            type="color"
                                            value={bgColor}
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-8 h-8 rounded-lg cursor-pointer bg-[var(--color-surface)] border border-[var(--color-border)] overflow-hidden"
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-1 bg-[var(--color-surface)]/50 p-1 rounded-lg border border-[var(--color-border)]">
                                {TEXT_POSITIONS.map((pos) => (
                                    <button
                                        key={pos.value}
                                        onClick={() => setTextPosition(pos.value)}
                                        className={`w-7 h-7 flex items-center justify-center rounded-md transition-all ${textPosition === pos.value
                                            ? "bg-indigo-600 text-white shadow-lg"
                                            : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                                            }`}
                                        title={pos.label}
                                    >
                                        <Settings2 size={12} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <button
                    onClick={generateCustomItem}
                    className="btn-modern w-full py-4 bg-indigo-600 border-indigo-500 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20"
                >
                    <ImagePlus size={18} />
                    <span className="font-bold">Générer la Carte</span>
                </button>
            </div>
        </div>
    );
}


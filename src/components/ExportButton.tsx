"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { Download, Loader2 } from "lucide-react";

interface ExportButtonProps {
    targetRef: React.RefObject<HTMLDivElement | null>;
    filename?: string;
}

export default function ExportButton({ targetRef, filename = "tier-list" }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);
    const linkRef = useRef<HTMLAnchorElement>(null);

    const handleExport = async () => {
        if (!targetRef.current) return;

        setIsExporting(true);

        try {
            const backgroundColor = typeof window !== 'undefined'
                ? getComputedStyle(document.documentElement).getPropertyValue("--color-bg").trim()
                : "#0b0f19";

            const dataUrl = await toPng(targetRef.current, {
                cacheBust: true,
                pixelRatio: 2,
                backgroundColor: backgroundColor || "#0b0f19",
            });

            const link = linkRef.current;
            if (link) {
                link.download = `${filename}.png`;
                link.href = dataUrl;
                link.click();
            }
        } catch (err) {
            console.error("Export failed:", err);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <button onClick={handleExport} disabled={isExporting} className="btn-modern bg-indigo-600 border-indigo-500 hover:bg-indigo-700 text-white">
                {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : (
                    <Download size={16} />
                )}
                {isExporting ? "Exporting..." : "Export PNG"}
            </button>
            <a ref={linkRef} className="hidden" aria-hidden="true" />
        </>
    );
}


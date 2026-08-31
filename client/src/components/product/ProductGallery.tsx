"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { RemoteImage } from "@/components/common/RemoteImage";
import { cn } from "@/lib/utils";

/**
 * Product image viewer.
 *
 * A product carries at most five images (`upload.array("images", 5)`), so the
 * whole set is rendered as a stack and cross-faded rather than paged in and
 * out — the swap costs one opacity transition and never re-requests a file the
 * browser already holds.
 */
export function ProductGallery({
    images,
    title,
}: {
    images: string[];
    title: string;
}) {
    const { t } = useTranslation();
    const [active, setActive] = useState(0);
    const count = images.length;

    const step = useCallback(
        (delta: number) => setActive((index) => (index + delta + count) % count),
        [count],
    );

    // Arrow keys move between images once the gallery has focus.
    useEffect(() => {
        if (count <= 1) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "ArrowLeft") step(-1);
            if (event.key === "ArrowRight") step(1);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [count, step]);

    if (count === 0) {
        return (
            <div className="relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-surface">
                <RemoteImage src={null} alt={title} className="size-full" />
            </div>
        );
    }

    return (
        <div>
            <div className="group relative aspect-square overflow-hidden rounded-xl border border-ink-200 bg-surface">
                {images.map((image, index) => (
                    <div
                        key={image}
                        aria-hidden={index !== active}
                        className={cn(
                            "absolute inset-0 transition-opacity duration-400 ease-out",
                            index === active ? "opacity-100" : "pointer-events-none opacity-0",
                        )}
                    >
                        <RemoteImage
                            src={image}
                            alt={
                                index === 0
                                    ? title
                                    : t("products.galleryImageAlt", { title, index: index + 1 })
                            }
                            priority={index === 0}
                            sizes="(max-width: 1024px) 100vw, 45vw"
                            className="transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                    </div>
                ))}

                {count > 1 ? (
                    <>
                        <button
                            type="button"
                            onClick={() => step(-1)}
                            aria-label={t("products.galleryPrevious")}
                            className="touch-target glass absolute left-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 text-ink-700 opacity-100 transition-[opacity,transform] duration-200 hover:scale-105 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                            <ChevronLeft className="size-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => step(1)}
                            aria-label={t("products.galleryNext")}
                            className="touch-target glass absolute right-3 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-200 text-ink-700 opacity-100 transition-[opacity,transform] duration-200 hover:scale-105 focus-visible:opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                        >
                            <ChevronRight className="size-5" />
                        </button>

                        <div className="glass absolute bottom-3 right-3 rounded-full border border-ink-200 px-2.5 py-1 text-xs font-medium tabular-nums text-ink-700">
                            {active + 1} / {count}
                        </div>
                    </>
                ) : null}
            </div>

            {count > 1 ? (
                <div
                    role="tablist"
                    aria-label={t("products.galleryImages", { title })}
                    className="scrollbar-thin -mx-1 mt-3 flex snap-x snap-mandatory gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 sm:pb-0"
                >
                    {images.map((image, index) => (
                        <button
                            key={image}
                            type="button"
                            role="tab"
                            onClick={() => setActive(index)}
                            aria-label={t("products.galleryShowImage", {
                                index: index + 1,
                                count,
                            })}
                            aria-selected={index === active}
                            className={cn(
                                "relative aspect-square w-16 shrink-0 snap-start overflow-hidden rounded-xl border-2 bg-surface transition-[border-color,transform] duration-200 hover:scale-[1.03] sm:w-auto",
                                index === active
                                    ? "border-brand-500"
                                    : "border-ink-200 hover:border-ink-300",
                            )}
                        >
                            <RemoteImage src={image} alt="" sizes="80px" />
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

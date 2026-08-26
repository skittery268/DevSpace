"use client";

import { ImageOff } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "@/lib/utils";

/**
 * Cloudinary URL with a graceful placeholder and a fade-in.
 *
 * Images are hard-deleted from Cloudinary when a product or category is
 * removed, and a stale URL is a normal outcome rather than a bug — so a broken
 * load falls back instead of leaving a torn layout. The fade covers the moment
 * a remote image pops in, which is the difference between a catalog that
 * settles and one that flickers.
 */
export function RemoteImage({
    src,
    alt,
    className,
    sizes,
    priority = false,
}: {
    src: string | null | undefined;
    alt: string;
    className?: string;
    sizes?: string;
    priority?: boolean;
}) {
    const { t } = useTranslation();
    const [failed, setFailed] = useState(false);
    const [loaded, setLoaded] = useState(false);

    if (!src || failed) {
        return (
            <div
                // `absolute inset-0` mirrors what next/image does with `fill`, so a
                // missing image occupies exactly the box a loaded one would have.
                className={cn(
                    "absolute inset-0 flex items-center justify-center bg-ink-100 text-ink-400",
                    className,
                )}
                role="img"
                aria-label={t("products.noImage", { alt })}
            >
                <ImageOff className="size-6" />
            </div>
        );
    }

    return (
        <Image
            src={src}
            alt={alt}
            fill
            sizes={sizes ?? "(max-width: 768px) 50vw, 25vw"}
            priority={priority}
            onError={() => setFailed(true)}
            onLoad={() => setLoaded(true)}
            className={cn(
                "object-cover transition-opacity duration-500 ease-out",
                loaded ? "opacity-100" : "opacity-0",
                className,
            )}
        />
    );
}

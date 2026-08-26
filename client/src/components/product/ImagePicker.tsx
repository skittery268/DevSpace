"use client";

import { ImagePlus, X } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * File picker for the multipart product/category forms.
 *
 * `multer` is configured without a size or MIME filter, so nothing is enforced
 * server-side: the `accept` attribute and the count limit below are the only
 * guardrails the user gets.
 */
export function ImagePicker({
    files,
    onChange,
    max = 5,
    label,
    hint,
    existingUrls = [],
    className,
}: {
    files: File[];
    onChange: (files: File[]) => void;
    max?: number;
    /** Defaults to the translated word for "images". */
    label?: string;
    hint?: string;
    existingUrls?: string[];
    className?: string;
}) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);

    const previews = useMemo(
        () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
        [files],
    );

    // Object URLs leak until they are explicitly revoked.
    useEffect(() => {
        return () => {
            for (const preview of previews) URL.revokeObjectURL(preview.url);
        };
    }, [previews]);

    const handleSelect = (list: FileList | null) => {
        if (!list) return;
        onChange([...files, ...Array.from(list)].slice(0, max));
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-ink-800">
                    {label ?? t("imagePicker.label")}
                </span>
                <span className="text-xs text-ink-500">
                    {files.length} / {max}
                </span>
            </div>

            {existingUrls.length > 0 && files.length === 0 ? (
                <p className="text-xs text-ink-500">
                    {t("imagePicker.existing", {
                        images: t("count.images", { count: existingUrls.length }),
                    })}
                </p>
            ) : null}

            <div className="flex flex-wrap gap-2">
                {previews.map(({ file, url }, index) => (
                    <div
                        key={`${file.name}-${index}`}
                        className="relative size-24 overflow-hidden rounded-lg border border-ink-200 bg-ink-100"
                    >
                        {/* Blob previews never go through the image optimizer. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={url}
                            alt={file.name}
                            className="size-full object-cover"
                        />
                        <button
                            type="button"
                            aria-label={t("imagePicker.remove", { name: file.name })}
                            onClick={() => onChange(files.filter((_, i) => i !== index))}
                            className="absolute right-1 top-1 rounded-full bg-scrim/70 p-1 text-white transition-colors hover:bg-scrim"
                        >
                            <X className="size-3" />
                        </button>
                    </div>
                ))}

                {files.length < max ? (
                    <button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="flex size-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-ink-300 text-ink-500 transition-colors hover:border-brand-400 hover:text-link"
                    >
                        <ImagePlus className="size-5" />
                        <span className="text-xs">{t("imagePicker.add")}</span>
                    </button>
                ) : null}
            </div>

            {files.length > 0 ? (
                <div>
                    <Button variant="ghost" size="sm" onClick={() => onChange([])}>
                        {t("imagePicker.clearSelection")}
                    </Button>
                </div>
            ) : null}

            {hint ? <p className="text-xs text-ink-500">{hint}</p> : null}

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple={max > 1}
                className="hidden"
                onChange={(event) => handleSelect(event.target.files)}
            />
        </div>
    );
}

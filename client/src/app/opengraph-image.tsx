import { ImageResponse } from "next/og";

import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

/**
 * The social card every page falls back to.
 *
 * Drawn rather than shipped as a file so it stays in step with the design
 * system: the plane is `--color-brand-deep`, the tile is `--color-brand-600`,
 * and the mark is the same shell prompt the `Logo` component draws. A product
 * page overrides this with its own photograph.
 *
 * Nothing here reads the request, which keeps it statically generated at build
 * time and cached — the alt text is therefore the English brand line rather
 * than a per-locale string.
 */

export const alt = `${APP_NAME} — ${APP_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "0 96px",
                    background: "linear-gradient(135deg, #062e22 0%, #0a6247 60%, #0d7d6f 100%)",
                    color: "white",
                    fontFamily: "sans-serif",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 104,
                            height: 104,
                            borderRadius: 26,
                            background: "#0a8259",
                            border: "1px solid rgba(255,255,255,0.22)",
                        }}
                    >
                        {/* The caret and cursor rule from `Logo`, at card scale. */}
                        <svg
                            width="66"
                            height="66"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M7 7.5 11.5 12 7 16.5" />
                            <path d="M14 16.5h3.5" />
                        </svg>
                    </div>
                    <div style={{ fontSize: 84, fontWeight: 600, letterSpacing: "-0.03em" }}>
                        {APP_NAME}
                    </div>
                </div>

                <div
                    style={{
                        marginTop: 40,
                        fontSize: 40,
                        lineHeight: 1.3,
                        color: "rgba(255,255,255,0.82)",
                        maxWidth: 880,
                    }}
                >
                    {APP_TAGLINE}
                </div>
            </div>
        ),
        size,
    );
}

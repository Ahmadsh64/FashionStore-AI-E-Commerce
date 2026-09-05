"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  images: string[];
  alt: string;
};

export function ProductGallery({ images, alt }: Props) {
  const [index, setIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-lg bg-muted text-sm text-muted-foreground">
        אין תמונה
      </div>
    );
  }

  const current = images[Math.min(index, images.length - 1)];
  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <>
      <div className="space-y-3">
        <div className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          <Image
            src={current}
            alt={alt}
            fill
            priority
            className="object-cover"
            sizes="(min-width: 768px) 50vw, 100vw"
          />

          <button
            type="button"
            onClick={() => setZoomed(true)}
            className="absolute top-3 left-3 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
            aria-label="הגדל"
          >
            <Expand className="h-4 w-4" />
          </button>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
                aria-label="תמונה קודמת"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-background/80 p-2 opacity-0 backdrop-blur transition-opacity hover:bg-background group-hover:opacity-100"
                aria-label="תמונה הבאה"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/80 px-2 py-1 text-xs backdrop-blur">
                {index + 1} / {images.length}
              </div>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-5 gap-2">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative aspect-square overflow-hidden rounded-md border-2 transition-all",
                  i === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/40",
                )}
                aria-label={`תמונה ${i + 1}`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {zoomed && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            type="button"
            className="absolute top-4 left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="סגור"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="relative h-full w-full max-w-4xl">
            <Image
              src={current}
              alt={alt}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute top-1/2 right-4 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute top-1/2 left-4 -translate-y-1/2 rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}

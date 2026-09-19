"use client";

type Props = {
  src: string;
  poster?: string;
};

/** Full-bleed muted loop for the home hero. */
export function HeroVideo({ src, poster }: Props) {
  return (
    <video
      className="absolute inset-0 h-full w-full object-cover object-center"
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      poster={poster}
      aria-hidden
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

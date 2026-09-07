const ITEMS = [
  "משלוח חינם מעל ₪300",
  "החזרות עד 30 יום",
  "קולקציית קיץ 2026",
  "אריזה מוקפדת מכל הזמנה",
  "תמיכה בעברית בוואטסאפ",
];

export function AnnouncementBar() {
  const loop = [...ITEMS, ...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-b bg-primary text-primary-foreground">
      <div className="animate-marquee flex w-max gap-10 whitespace-nowrap py-2 text-[11px] tracking-[0.18em]">
        {loop.map((item, i) => (
          <span key={`${item}-${i}`} className="flex items-center gap-10">
            {item}
            <span aria-hidden className="text-gold">
              ◆
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

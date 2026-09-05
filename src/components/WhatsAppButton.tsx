"use client";

import { usePathname } from "next/navigation";

export function WhatsAppButton() {
  const pathname = usePathname();
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE;
  if (!phone) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/checkout")) return null;

  const digits = phone.replace(/\D/g, "");
  const href = `https://wa.me/${digits}?text=${encodeURIComponent("היי, יש לי שאלה על FashionStore")}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp"
      className="fixed bottom-20 left-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 md:bottom-6 md:left-6"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="currentColor" aria-hidden>
        <path d="M20.5 3.5A11 11 0 0 0 2.1 17.2L1 23l6-1.6A11 11 0 0 0 20.5 3.5zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.5.9.9-3.4-.2-.3A9 9 0 1 1 12 20.5zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.1-.7.9-.8 1-.3.2-.6.1a7.4 7.4 0 0 1-2.2-1.4 8.2 8.2 0 0 1-1.5-1.9c-.2-.3 0-.4.1-.6l.4-.5.1-.3c0-.1 0-.3 0-.4s-.6-1.4-.8-1.9-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3a2.3 2.3 0 0 0-.7 1.7 4 4 0 0 0 .8 2.1 9.1 9.1 0 0 0 3.5 3.4 11.7 11.7 0 0 0 3.3 1.2 3 3 0 0 0 1.9-.6 2.5 2.5 0 0 0 .8-1.7c.1-.3 0-.5-.1-.6z" />
      </svg>
    </a>
  );
}

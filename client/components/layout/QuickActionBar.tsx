"use client";

import { Phone, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useSiteConfig } from "@/lib/settings-store";

export function QuickActionBar() {
  const siteConfig = useSiteConfig();
  const telUrl = siteConfig.telUrl || "tel:+2349075602319";
  const whatsAppUrl = siteConfig.whatsAppUrl || "https://wa.me/2349075602319";
  const directionsUrl = siteConfig.directionsUrl || siteConfig.googleMapsUrl;

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 glass-strong border-t border-border z-40 pb-safe">
      <div className="flex items-center justify-between p-2 max-w-md mx-auto">
        <a
          href={telUrl}
          className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-primary transition-colors h-11"
          aria-label={`Call Church: ${siteConfig.phone || "+2349075602319"}`}
        >
          <Phone className="w-5 h-5 mb-1 text-primary" />
          <span className="text-[10px] font-semibold">Call</span>
        </a>

        <a
          href={whatsAppUrl}
          target="_blank"
          className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-[#25D366] transition-colors h-11"
          aria-label="Chat on WhatsApp"
          rel="noreferrer"
        >
          <FaWhatsapp className="w-5 h-5 mb-1 text-[#25D366]" />
          <span className="text-[10px] font-semibold">WhatsApp</span>
        </a>

        <a
          href={directionsUrl}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex flex-col items-center justify-center py-2 text-foreground hover:text-gold transition-colors h-11"
          aria-label="Directions to Church"
        >
          <MapPin className="w-5 h-5 mb-1 text-gold" />
          <span className="text-[10px] font-semibold">Directions</span>
        </a>
      </div>
    </div>
  );
}

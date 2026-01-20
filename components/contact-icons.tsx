// components/contact-icons.tsx
"use client";

import * as React from "react";
import { MessageCircle, Globe, Mail, Music2 } from "lucide-react";

interface ContactIconsProps {
  contacts?: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    email?: string;
    site?: string;
  };
  skeleton?: boolean;
}

function InstagramIcon({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="stroke-current"
      style={{ strokeWidth: 2 }}
    >
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="3.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
    </svg>
  );
}

function ContactLink({
  href,
  children,
  title,
  skeleton = false,
}: {
  href?: string;
  children: React.ReactNode;
  title: string;
  skeleton?: boolean;
}) {
  if (skeleton || !href) {
    return (
      <div
        title={title}
        className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-muted border border-border animate-pulse"
        aria-hidden="true"
      >
        <div className="h-5 w-5 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      title={title}
      className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-muted text-muted-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 active:scale-90"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </a>
  );
}

export default function ContactIcons({
  contacts,
  skeleton = false,
}: ContactIconsProps) {
  if (!contacts && !skeleton) return null;

  // Função auxiliar para garantir o DDI 55 no WhatsApp
  const formatWhatsAppLink = (phone: string) => {
    let cleaned = phone.replace(/\D/g, "");
    // Se tiver DDD mas não tiver o 55 (10 ou 11 dígitos), adiciona o prefixo
    if (cleaned.length >= 10 && cleaned.length <= 11) {
      cleaned = `55${cleaned}`;
    }
    return `https://wa.me/${cleaned}`;
  };

  const contactTypes = [
    {
      key: "whatsapp",
      title: "WhatsApp",
      icon: <MessageCircle size={20} strokeWidth={2.2} />,
      value: contacts?.whatsapp,
      href: contacts?.whatsapp
        ? formatWhatsAppLink(contacts.whatsapp)
        : undefined,
    },
    {
      key: "instagram",
      title: "Instagram",
      icon: <InstagramIcon size={22} />, // Mantido em 22 conforme solicitado
      value: contacts?.instagram,
      href: contacts?.instagram
        ? `https://instagram.com/${contacts.instagram.replace("@", "")}`
        : undefined,
    },
    {
      key: "tiktok",
      title: "TikTok",
      icon: <Music2 size={20} strokeWidth={2.2} />,
      value: contacts?.tiktok,
      href: contacts?.tiktok
        ? `https://tiktok.com/@${contacts.tiktok.replace("@", "")}`
        : undefined,
    },
    {
      key: "email",
      title: "E-mail",
      icon: <Mail size={20} strokeWidth={2.2} />,
      value: contacts?.email,
      href: contacts?.email ? `mailto:${contacts.email}` : undefined,
    },
    {
      key: "site",
      title: "Site Oficial",
      icon: <Globe size={20} strokeWidth={2.2} />,
      value: contacts?.site,
      href: contacts?.site
        ? contacts.site.startsWith("http")
          ? contacts.site
          : `https://${contacts.site}`
        : undefined,
    },
  ];

  const visibleContacts = skeleton
    ? contactTypes
    : contactTypes.filter((contact) => contact.value);

  if (visibleContacts.length === 0 && !skeleton) return null;

  return (
    <div className="flex items-center gap-1 pl-0.5">
      {visibleContacts.map((contact) => (
        <ContactLink
          key={contact.key}
          href={contact.href}
          title={contact.title}
          skeleton={skeleton}
        >
          {contact.icon}
        </ContactLink>
      ))}
    </div>
  );
}
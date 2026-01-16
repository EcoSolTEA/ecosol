// components/contact-icons.tsx
"use client";

import * as React from "react";
import { MessageCircle, Globe, Mail, Music2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContactIconsProps {
  contacts: {
    whatsapp?: string;
    instagram?: string;
    tiktok?: string;
    email?: string;
    site?: string;
  };
  skeleton?: boolean;
}

function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
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
        className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-muted text-muted-foreground border border-border animate-pulse"
      >
        <div className="h-4 w-4 bg-muted-foreground/20 rounded" />
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={title}
      className="inline-flex items-center justify-center h-9 w-9 rounded-xl bg-muted text-muted-foreground border border-border hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-200 active:scale-90"
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

  const contactTypes = [
    {
      key: "whatsapp",
      title: "WhatsApp",
      icon: <MessageCircle size={18} strokeWidth={2.5} />,
      value: contacts?.whatsapp,
      href: contacts?.whatsapp
        ? `https://wa.me/${contacts.whatsapp.replace(/\D/g, "")}`
        : undefined,
    },
    {
      key: "instagram",
      title: "Instagram",
      icon: <InstagramIcon size={18} />,
      value: contacts?.instagram,
      href: contacts?.instagram
        ? `https://instagram.com/${contacts.instagram.replace("@", "")}`
        : undefined,
    },
    {
      key: "tiktok",
      title: "TikTok",
      icon: <Music2 size={18} strokeWidth={2.5} />,
      value: contacts?.tiktok,
      href: contacts?.tiktok
        ? `https://tiktok.com/@${contacts.tiktok.replace("@", "")}`
        : undefined,
    },
    {
      key: "email",
      title: "E-mail",
      icon: <Mail size={18} strokeWidth={2.5} />,
      value: contacts?.email,
      href: contacts?.email ? `mailto:${contacts.email}` : undefined,
    },
    {
      key: "site",
      title: "Site Oficial",
      icon: <Globe size={18} strokeWidth={2.5} />,
      value: contacts?.site,
      href: contacts?.site
        ? contacts.site.startsWith("http")
          ? contacts.site
          : `https://${contacts.site}`
        : undefined,
    },
  ];

  const visibleContacts = skeleton
    ? contactTypes // Em skeleton, mostra todos
    : contactTypes.filter((contact) => contact.value); // Em normal, mostra apenas os com valor

  if (visibleContacts.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
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

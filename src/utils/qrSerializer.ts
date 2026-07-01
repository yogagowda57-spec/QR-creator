import {
  WiFiConfig,
  SMSConfig,
  PhoneConfig,
  EmailConfig,
  VCardConfig,
  LocationConfig,
  WhatsAppConfig,
  UPIConfig,
  EventConfig,
  CalendarConfig,
  SocialConfig,
} from "../types";

// Helper to format date for iCalendar format: YYYYMMDDTHHMMSS
export function formatCalendarDate(dateString: string): string {
  if (!dateString) return "";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString.replace(/[-:]/g, "");
  
  const pad = (num: number) => String(num).padStart(2, "0");
  
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

export const qrSerializer = {
  text: (val: string) => val,
  
  url: (val: string) => {
    let url = val.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }
    return url;
  },

  wifi: (config: WiFiConfig) => {
    const ssid = (config.ssid || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
    const password = (config.password || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
    const encryption = config.encryption || "nopass";
    const hidden = config.hidden ? "H:true;" : "";
    return `WIFI:S:${ssid};T:${encryption};P:${password};${hidden};`;
  },

  phone: (config: PhoneConfig) => {
    return `tel:${config.phone.trim()}`;
  },

  sms: (config: SMSConfig) => {
    return `SMSTO:${config.phone.trim()}:${config.message || ""}`;
  },

  email: (config: EmailConfig) => {
    const subject = encodeURIComponent(config.subject || "");
    const body = encodeURIComponent(config.body || "");
    return `mailto:${config.email.trim()}?subject=${subject}&body=${body}`;
  },

  vcard: (config: VCardConfig) => {
    const lines = [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `N:${config.lastName || ""};${config.firstName || ""};;;`,
      `FN:${config.firstName || ""} ${config.lastName || ""}`.trim(),
    ];

    if (config.organization) lines.push(`ORG:${config.organization}`);
    if (config.title) lines.push(`TITLE:${config.title}`);
    if (config.phoneMobile) lines.push(`TEL;TYPE=CELL:${config.phoneMobile}`);
    if (config.phoneWork) lines.push(`TEL;TYPE=WORK,VOICE:${config.phoneWork}`);
    if (config.email) lines.push(`EMAIL;TYPE=PREF,INTERNET:${config.email}`);
    if (config.url) lines.push(`URL:${config.url}`);
    
    if (
      config.addressStreet ||
      config.addressCity ||
      config.addressState ||
      config.addressZip ||
      config.addressCountry
    ) {
      lines.push(
        `ADR;TYPE=WORK:;;${config.addressStreet || ""};${config.addressCity || ""};${config.addressState || ""};${config.addressZip || ""};${config.addressCountry || ""}`
      );
    }
    
    if (config.note) lines.push(`NOTE:${config.note}`);
    lines.push("END:VCARD");
    
    return lines.filter(Boolean).join("\n");
  },

  location: (config: LocationConfig) => {
    // Google Maps search query is highly compatible on both Android & iOS
    return `https://www.google.com/maps/search/?api=1&query=${config.latitude},${config.longitude}`;
  },

  whatsapp: (config: WhatsAppConfig) => {
    // clean phone number (only digits, including country code)
    const phone = config.phone.replace(/\D/g, "");
    const text = encodeURIComponent(config.message || "");
    return `https://wa.me/${phone}${text ? `?text=${text}` : ""}`;
  },

  upi: (config: UPIConfig) => {
    const parts = [
      `pa=${config.payeeVPA}`,
      `pn=${encodeURIComponent(config.payeeName)}`,
    ];
    if (config.amount) parts.push(`am=${config.amount}`);
    if (config.transactionNote) parts.push(`tn=${encodeURIComponent(config.transactionNote)}`);
    if (config.currency) parts.push(`cu=${config.currency}`);
    return `upi://pay?${parts.join("&")}`;
  },

  event: (config: EventConfig) => {
    const start = formatCalendarDate(config.startDate);
    const end = formatCalendarDate(config.endDate);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${config.title}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
    ];

    if (config.location) lines.push(`LOCATION:${config.location}`);
    if (config.description) lines.push(`DESCRIPTION:${config.description}`);
    
    lines.push("END:VEVENT");
    lines.push("END:VCALENDAR");

    return lines.join("\n");
  },

  calendar: (config: CalendarConfig) => {
    // fallback or alternative format (simple iCalendar block)
    const start = formatCalendarDate(config.dtstart);
    const end = formatCalendarDate(config.dtend);
    const lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `SUMMARY:${config.summary}`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
    ];
    if (config.description) lines.push(`DESCRIPTION:${config.description}`);
    lines.push("END:VEVENT");
    lines.push("END:VCALENDAR");
    return lines.join("\n");
  },

  social: (config: SocialConfig) => {
    const user = config.username.trim();
    switch (config.platform.toLowerCase()) {
      case "instagram":
        return `https://instagram.com/${user}`;
      case "twitter":
      case "x":
        return `https://x.com/${user}`;
      case "linkedin":
        return config.customUrl ? config.customUrl : `https://linkedin.com/in/${user}`;
      case "youtube":
        return config.customUrl ? config.customUrl : `https://youtube.com/@${user}`;
      case "tiktok":
        return `https://tiktok.com/@${user}`;
      case "facebook":
        return `https://facebook.com/${user}`;
      case "github":
        return `https://github.com/${user}`;
      default:
        return config.customUrl || user;
    }
  }
};

export type QRType =
  | "text"
  | "url"
  | "wifi"
  | "phone"
  | "sms"
  | "email"
  | "vcard"
  | "location"
  | "whatsapp"
  | "upi"
  | "event"
  | "calendar"
  | "social";

export type DotStyle = "square" | "dots" | "rounded" | "classy" | "diamond" | "star";
export type EyeStyle = "square" | "rounded" | "extra-rounded" | "circle" | "leaf" | "shield";
export type InnerEyeStyle = "square" | "circle" | "diamond" | "star" | "heart" | "shield";

export interface QRConfig {
  type: QRType;
  text: string; // The fully serialized QR string
  // Customization
  size: number;
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  isTransparent: boolean;
  errorCorrectionLevel: "L" | "M" | "Q" | "H";
  // Custom Modules
  dotStyle: DotStyle;
  eyeStyle: EyeStyle;
  innerEyeStyle: InnerEyeStyle;
  outerEyeColor: string;
  innerEyeColor: string;
  customEyeColor: boolean;
  // Brand Logo
  logoUrl: string | null;
  logoSize: number; // Percentage of QR code size, e.g. 15-30%
  logoBorderRadius: number;
  logoBackgroundColor: string;
  logoPadding: number;
  hasLogoBackground: boolean;
}

export interface QRHistoryEntry {
  id: string;
  title: string;
  type: QRType;
  text: string;
  config: QRConfig;
  createdAt: string;
  isFavorite: boolean;
}

export interface WiFiConfig {
  ssid: string;
  password?: string;
  encryption: "WEP" | "WPA" | "nopass";
  hidden: boolean;
}

export interface SMSConfig {
  phone: string;
  message: string;
}

export interface PhoneConfig {
  phone: string;
}

export interface EmailConfig {
  email: string;
  subject: string;
  body: string;
}

export interface VCardConfig {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phoneMobile?: string;
  phoneWork?: string;
  email?: string;
  url?: string;
  addressStreet?: string;
  addressCity?: string;
  addressState?: string;
  addressZip?: string;
  addressCountry?: string;
  note?: string;
}

export interface LocationConfig {
  latitude: string;
  longitude: string;
}

export interface WhatsAppConfig {
  phone: string;
  message: string;
}

export interface UPIConfig {
  payeeVPA: string;
  payeeName: string;
  amount?: string;
  transactionNote?: string;
  currency?: string;
}

export interface EventConfig {
  title: string;
  startDate: string;
  endDate: string;
  location?: string;
  description?: string;
}

export interface CalendarConfig {
  summary: string;
  dtstart: string;
  dtend: string;
  description?: string;
}

export interface SocialConfig {
  platform: string;
  username: string;
  customUrl?: string;
}

import { useState, useEffect } from "react";
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
  SocialConfig,
  QRType,
} from "../types";
import { qrSerializer } from "../utils/qrSerializer";
import { MapPin, Wifi, Key, Phone, Mail, User, Shield, Info } from "lucide-react";

interface QRFormProps {
  type: QRType;
  onChange: (serializedText: string, metadata: any) => void;
}

export default function QRForm({ type, onChange }: QRFormProps) {
  // State for each type
  const [url, setUrl] = useState("https://google.com");
  const [text, setText] = useState("Hello, Welcome to QRMaster Pro!");
  
  const [wifi, setWifi] = useState<WiFiConfig>({
    ssid: "Home_Network",
    password: "secure_password",
    encryption: "WPA",
    hidden: false,
  });

  const [phone, setPhone] = useState<PhoneConfig>({
    phone: "+1234567890",
  });

  const [sms, setSms] = useState<SMSConfig>({
    phone: "+1234567890",
    message: "Hi, I scanned your QR code!",
  });

  const [email, setEmail] = useState<EmailConfig>({
    email: "contact@qrmaster.pro",
    subject: "Inquiry from QR Code",
    body: "Hi, I would like to get in touch.",
  });

  const [vcard, setVcard] = useState<VCardConfig>({
    firstName: "John",
    lastName: "Doe",
    organization: "QRMaster Labs",
    title: "Lead UI Engineer",
    phoneMobile: "+1 555-0199",
    phoneWork: "+1 555-0233",
    email: "john.doe@qrmaster.pro",
    url: "https://qrmaster.pro",
    addressStreet: "123 Innovation Blvd",
    addressCity: "San Francisco",
    addressState: "CA",
    addressZip: "94107",
    addressCountry: "United States",
    note: "Professional designer and code craftsman.",
  });

  const [location, setLocation] = useState<LocationConfig>({
    latitude: "37.7749",
    longitude: "-122.4194",
  });

  const [whatsapp, setWhatsapp] = useState<WhatsAppConfig>({
    phone: "+15550199",
    message: "Hello! I scanned your WhatsApp QR Code.",
  });

  const [upi, setUpi] = useState<UPIConfig>({
    payeeVPA: "qrmaster@okaxis",
    payeeName: "QRMaster Pro Services",
    amount: "49.99",
    transactionNote: "Subscription Payment",
    currency: "INR",
  });

  const [event, setEvent] = useState<EventConfig>({
    title: "QRMaster Launch Summit",
    startDate: new Date(Date.now() + 86400000).toISOString().slice(0, 16), // Tomorrow
    endDate: new Date(Date.now() + 100800000).toISOString().slice(0, 16),
    location: "Metaverse Arena & Live stream",
    description: "The grand product presentation and community networking session.",
  });

  const [social, setSocial] = useState<SocialConfig>({
    platform: "instagram",
    username: "qrmaster_pro",
    customUrl: "",
  });

  // Automatically trigger serialize on any form state change
  useEffect(() => {
    let serialized = "";
    let meta: any = {};

    switch (type) {
      case "url":
        serialized = qrSerializer.url(url);
        meta = { url };
        break;
      case "text":
        serialized = qrSerializer.text(text);
        meta = { text };
        break;
      case "wifi":
        serialized = qrSerializer.wifi(wifi);
        meta = { wifi };
        break;
      case "phone":
        serialized = qrSerializer.phone(phone);
        meta = { phone };
        break;
      case "sms":
        serialized = qrSerializer.sms(sms);
        meta = { sms };
        break;
      case "email":
        serialized = qrSerializer.email(email);
        meta = { email };
        break;
      case "vcard":
        serialized = qrSerializer.vcard(vcard);
        meta = { vcard };
        break;
      case "location":
        serialized = qrSerializer.location(location);
        meta = { location };
        break;
      case "whatsapp":
        serialized = qrSerializer.whatsapp(whatsapp);
        meta = { whatsapp };
        break;
      case "upi":
        serialized = qrSerializer.upi(upi);
        meta = { upi };
        break;
      case "event":
      case "calendar":
        serialized = qrSerializer.event(event);
        meta = { event };
        break;
      case "social":
        serialized = qrSerializer.social(social);
        meta = { social };
        break;
      default:
        serialized = text;
        meta = { text };
    }

    onChange(serialized, meta);
  }, [type, url, text, wifi, phone, sms, email, vcard, location, whatsapp, upi, event, social]);

  // Quick geolocation retriever
  const fetchCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
        },
        (error) => {
          alert(`Geolocation Error: ${error.message}. Please input coordinates manually.`);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-sm font-bold tracking-tight font-sans shadow-sm";
  const labelClass = "block text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400 mb-1.5";

  return (
    <div className="space-y-4 animate-fade-in">
      {/* 1. Website URL */}
      {type === "url" && (
        <div id="form-url">
          <label className={labelClass}>Website Destination URL</label>
          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://example.com"
              className={inputClass}
              required
            />
          </div>
          <p className="mt-1.5 text-xs text-gray-400 dark:text-zinc-500">
            Scanning devices will immediately redirect to this browser link.
          </p>
        </div>
      )}

      {/* 2. Plain Text */}
      {type === "text" && (
        <div id="form-text">
          <label className={labelClass}>Plain Text Content</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type any message, note, code, or offline text here..."
            className={`${inputClass} h-32 resize-none`}
            maxLength={1200}
          />
          <div className="flex justify-between mt-1 text-xs text-gray-400">
            <span>Supports raw text strings up to 1,200 characters</span>
            <span>{text.length}/1200</span>
          </div>
        </div>
      )}

      {/* 3. WiFi Network */}
      {type === "wifi" && (
        <div id="form-wifi" className="space-y-3">
          <div>
            <label className={labelClass}>Network SSID (Name)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-600">
                <Wifi className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                className={`${inputClass} pl-10`}
                placeholder="SSID Name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Security Type</label>
              <select
                value={wifi.encryption}
                onChange={(e) => setWifi({ ...wifi, encryption: e.target.value as any })}
                className={inputClass}
              >
                <option value="WPA">WPA / WPA2 (Recommended)</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Unencrypted (Open Network)</option>
              </select>
            </div>

            {wifi.encryption !== "nopass" && (
              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-600">
                    <Key className="h-4 w-4" />
                  </span>
                  <input
                    type="password"
                    value={wifi.password || ""}
                    onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                    className={`${inputClass} pl-10`}
                    placeholder="WIFI Password"
                  />
                </div>
              </div>
            )}
          </div>

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={wifi.hidden}
              onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-xs text-gray-600 dark:text-zinc-400">Hidden Network SSID</span>
          </label>
        </div>
      )}

      {/* 4. Phone Number */}
      {type === "phone" && (
        <div id="form-phone">
          <label className={labelClass}>Phone Number</label>
          <div className="relative">
            <span className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-600">
              <Phone className="h-4 w-4" />
            </span>
            <input
              type="tel"
              value={phone.phone}
              onChange={(e) => setPhone({ phone: e.target.value })}
              placeholder="e.g. +1 555-0199"
              className={`${inputClass} pl-10`}
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">Includes international area code prefix (+1, +91, etc.)</p>
        </div>
      )}

      {/* 5. SMS */}
      {type === "sms" && (
        <div id="form-sms" className="space-y-3">
          <div>
            <label className={labelClass}>Recipient Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-600">
                <Phone className="h-4 w-4" />
              </span>
              <input
                type="tel"
                value={sms.phone}
                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                placeholder="e.g. +1 555-0199"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Prefilled Message Body</label>
            <textarea
              value={sms.message}
              onChange={(e) => setSms({ ...sms, message: e.target.value })}
              placeholder="Hi, let's talk about..."
              className={`${inputClass} h-20 resize-none`}
            />
          </div>
        </div>
      )}

      {/* 6. Email */}
      {type === "email" && (
        <div id="form-email" className="space-y-3">
          <div>
            <label className={labelClass}>Destination Email Address</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-gray-400 dark:text-zinc-600">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                value={email.email}
                onChange={(e) => setEmail({ ...email, email: e.target.value })}
                placeholder="contact@example.com"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Email Subject</label>
            <input
              type="text"
              value={email.subject}
              onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              placeholder="Partnership Proposal"
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Email Body Draft</label>
            <textarea
              value={email.body}
              onChange={(e) => setEmail({ ...email, body: e.target.value })}
              placeholder="Write message contents here..."
              className={`${inputClass} h-20 resize-none`}
            />
          </div>
        </div>
      )}

      {/* 7. Contact (vCard) */}
      {type === "vcard" && (
        <div id="form-vcard" className="space-y-3 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
          <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-indigo-500" /> Primary Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>First Name</label>
              <input
                type="text"
                value={vcard.firstName}
                onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Last Name</label>
              <input
                type="text"
                value={vcard.lastName}
                onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Mobile Phone</label>
              <input
                type="text"
                value={vcard.phoneMobile || ""}
                onChange={(e) => setVcard({ ...vcard, phoneMobile: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Work Phone</label>
              <input
                type="text"
                value={vcard.phoneWork || ""}
                onChange={(e) => setVcard({ ...vcard, phoneWork: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email Address</label>
            <input
              type="email"
              value={vcard.email || ""}
              onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
              className={inputClass}
            />
          </div>

          <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider pt-2 border-t border-gray-100 dark:border-zinc-800">
            Professional & Web
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Company / Org</label>
              <input
                type="text"
                value={vcard.organization || ""}
                onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Job Title</label>
              <input
                type="text"
                value={vcard.title || ""}
                onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Website / Portfolio URL</label>
            <input
              type="url"
              value={vcard.url || ""}
              onChange={(e) => setVcard({ ...vcard, url: e.target.value })}
              className={inputClass}
            />
          </div>

          <h4 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider pt-2 border-t border-gray-100 dark:border-zinc-800">
            Mailing Address
          </h4>
          <div>
            <label className={labelClass}>Street Address</label>
            <input
              type="text"
              value={vcard.addressStreet || ""}
              onChange={(e) => setVcard({ ...vcard, addressStreet: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            <div>
              <label className={labelClass}>City</label>
              <input
                type="text"
                value={vcard.addressCity || ""}
                onChange={(e) => setVcard({ ...vcard, addressCity: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>State/Prov</label>
              <input
                type="text"
                value={vcard.addressState || ""}
                onChange={(e) => setVcard({ ...vcard, addressState: e.target.value })}
                className={inputClass}
              />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className={labelClass}>Zip Code</label>
              <input
                type="text"
                value={vcard.addressZip || ""}
                onChange={(e) => setVcard({ ...vcard, addressZip: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Country</label>
            <input
              type="text"
              value={vcard.addressCountry || ""}
              onChange={(e) => setVcard({ ...vcard, addressCountry: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Personal Biography / Bio Note</label>
            <textarea
              value={vcard.note || ""}
              onChange={(e) => setVcard({ ...vcard, note: e.target.value })}
              className={`${inputClass} h-16 resize-none`}
            />
          </div>
        </div>
      )}

      {/* 8. Location */}
      {type === "location" && (
        <div id="form-location" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Latitude</label>
              <input
                type="text"
                value={location.latitude}
                onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Longitude</label>
              <input
                type="text"
                value={location.longitude}
                onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={fetchCurrentLocation}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl border border-indigo-200 dark:border-indigo-900/30 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
          >
            <MapPin className="h-4 w-4" /> Use Current GPS Coordinates
          </button>
        </div>
      )}

      {/* 9. WhatsApp Direct */}
      {type === "whatsapp" && (
        <div id="form-whatsapp" className="space-y-3">
          <div>
            <label className={labelClass}>WhatsApp Phone Number</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-indigo-500">
                <Shield className="h-4 w-4" />
              </span>
              <input
                type="tel"
                value={whatsapp.phone}
                onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
                placeholder="e.g. +1 555-0199"
                className={`${inputClass} pl-10`}
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-400">Include country prefix without formatting symbols (+ or spaces)</p>
          </div>
          <div>
            <label className={labelClass}>Prefilled Chat Message</label>
            <textarea
              value={whatsapp.message}
              onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
              placeholder="Hello! I am scanning to chat."
              className={`${inputClass} h-20 resize-none`}
            />
          </div>
        </div>
      )}

      {/* 10. UPI Pay */}
      {type === "upi" && (
        <div id="form-upi" className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Payee UPI ID (VPA)</label>
              <input
                type="text"
                value={upi.payeeVPA}
                onChange={(e) => setUpi({ ...upi, payeeVPA: e.target.value })}
                placeholder="e.g. user@okaxis"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Payee Display Name</label>
              <input
                type="text"
                value={upi.payeeName}
                onChange={(e) => setUpi({ ...upi, payeeName: e.target.value })}
                placeholder="e.g. John Doe"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Billing Amount (Optional)</label>
              <input
                type="number"
                step="0.01"
                value={upi.amount || ""}
                onChange={(e) => setUpi({ ...upi, amount: e.target.value })}
                placeholder="e.g. 299.00"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Transaction Currency</label>
              <select
                value={upi.currency}
                onChange={(e) => setUpi({ ...upi, currency: e.target.value })}
                className={inputClass}
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Billing Note / Reference</label>
            <input
              type="text"
              value={upi.transactionNote || ""}
              onChange={(e) => setUpi({ ...upi, transactionNote: e.target.value })}
              placeholder="e.g. Invoice #2034"
              className={inputClass}
            />
          </div>
        </div>
      )}

      {/* 11. Event (iCalendar / vEvent) */}
      {(type === "event" || type === "calendar") && (
        <div id="form-event" className="space-y-3">
          <div>
            <label className={labelClass}>Event Title / Name</label>
            <input
              type="text"
              value={event.title}
              onChange={(e) => setEvent({ ...event, title: e.target.value })}
              placeholder="Grand Summit 2026"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Start Date & Time</label>
              <input
                type="datetime-local"
                value={event.startDate}
                onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>End Date & Time</label>
              <input
                type="datetime-local"
                value={event.endDate}
                onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Event Location (Physical or Web Link)</label>
            <input
              type="text"
              value={event.location || ""}
              onChange={(e) => setEvent({ ...event, location: e.target.value })}
              placeholder="101 Innovation Way, San Francisco"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Description / Notes</label>
            <textarea
              value={event.description || ""}
              onChange={(e) => setEvent({ ...event, description: e.target.value })}
              placeholder="Add key highlights or schedules..."
              className={`${inputClass} h-16 resize-none`}
            />
          </div>
        </div>
      )}

      {/* 12. Social Media Links */}
      {type === "social" && (
        <div id="form-social" className="space-y-3">
          <div>
            <label className={labelClass}>Social Media Platform</label>
            <select
              value={social.platform}
              onChange={(e) => setSocial({ ...social, platform: e.target.value })}
              className={inputClass}
            >
              <option value="instagram">Instagram</option>
              <option value="twitter">Twitter / X</option>
              <option value="linkedin">LinkedIn</option>
              <option value="youtube">YouTube</option>
              <option value="tiktok">TikTok</option>
              <option value="facebook">Facebook</option>
              <option value="github">GitHub</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Username (or handle)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs text-gray-400 font-mono">@</span>
              <input
                type="text"
                value={social.username}
                onChange={(e) => setSocial({ ...social, username: e.target.value })}
                placeholder="username"
                className={`${inputClass} pl-8`}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Custom Channel / Profile URL (Optional Override)</label>
            <input
              type="url"
              value={social.customUrl || ""}
              onChange={(e) => setSocial({ ...social, customUrl: e.target.value })}
              placeholder="https://..."
              className={inputClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}

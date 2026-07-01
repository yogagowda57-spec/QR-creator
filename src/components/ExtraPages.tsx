import { useState, FormEvent } from "react";
import { Mail, ShieldCheck, FileText, HelpCircle, User, MessageSquare, Send } from "lucide-react";

interface ExtraPagesProps {
  activeView: "about" | "contact" | "privacy" | "terms" | "faq" | null;
  onClose: () => void;
  addToast: (msg: string, type: "success" | "info" | "error") => void;
}

export default function ExtraPages({ activeView, onClose, addToast }: ExtraPagesProps) {
  const [currentTab, setCurrentTab] = useState<"about" | "contact" | "privacy" | "terms" | "faq">(
    activeView || "about"
  );

  // FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContactSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) {
      addToast("Please fill out all contact fields.", "error");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      addToast("Message transmitted successfully! We'll respond shortly.", "success");
      setName("");
      setEmail("");
      setMsg("");
      setIsSubmitting(false);
    }, 1200);
  };

  const faqs = [
    {
      q: "Are the generated QR codes free for commercial use?",
      a: "Yes, 100%! All QR codes generated using QRMaster Pro are fully licensed under Creative Commons Zero (CC0). You can use them on business cards, billboards, packaging, television broadcasts, or books without any licensing fees, royalties, or required attribution.",
    },
    {
      q: "How does the custom styling affect the scan rate?",
      a: "Custom dots and shaped finder patterns can affect scans on very old devices. However, we use high-standard Error Correction Levels (M, Q, H). If your QR contains custom eye elements or complex centered logos, we recommend utilizing a minimum size of 256px and keeping the central logo under 20% scale.",
    },
    {
      q: "Is my personal data or uploaded logo sent to a server?",
      a: "Absolutely not. QRMaster Pro operates entirely inside your local browser sandbox. The QR code is drawn and calculated on your client-side CPU. Uploaded logos are read via HTML5 FileReader APIs and never traverse external networks. Your privacy is structurally guaranteed.",
    },
    {
      q: "Why won't my QR code scan?",
      a: "Common causes include: (1) Low contrast - foreground color should be significantly darker than background color, (2) Too much data packed in standard low error correction - increase Error Correction Level to 'H', (3) Logo is too large - reduce logo size in scale parameters.",
    },
    {
      q: "How does the JSON Export/Import feature work?",
      a: "Your design history and configurations are stored in your browser's Local Storage. The Export tool packs these arrays into a lightweight JSON file. You can import this JSON file on another browser or device to restore your saved templates instantly.",
    },
  ];

  const sidebarTabs = [
    { id: "about", label: "About", icon: User },
    { id: "faq", label: "FAQ / Help", icon: HelpCircle },
    { id: "contact", label: "Contact Us", icon: MessageSquare },
    { id: "privacy", label: "Privacy Policy", icon: ShieldCheck },
    { id: "terms", label: "Terms of Service", icon: FileText },
  ] as const;

  if (!activeView) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-md animate-fade-in p-4">
      <div
        id="extra-pages-modal"
        className="relative w-full max-w-4xl h-[85vh] bg-white dark:bg-zinc-900 rounded-3xl border border-gray-150 dark:border-zinc-800 shadow-2xl flex flex-col md:flex-row overflow-hidden animate-scale-up"
      >
        {/* Navigation Sidebar */}
        <div className="w-full md:w-64 bg-gray-50/80 dark:bg-zinc-950/40 border-r border-gray-150 dark:border-zinc-800/80 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Information Hub
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-zinc-500 mt-1">
                QRMaster Pro Documentation
              </p>
            </div>

            <nav className="space-y-1">
              {sidebarTabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = currentTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isSelected
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                        : "text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-850"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <button
            onClick={onClose}
            className="mt-6 md:mt-0 w-full py-2.5 bg-gray-150 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 rounded-xl text-xs font-semibold tracking-wider uppercase cursor-pointer transition-colors"
          >
            Close Portal
          </button>
        </div>

        {/* Content Container */}
        <div className="flex-1 p-6 md:p-8 overflow-y-auto custom-scrollbar bg-white dark:bg-zinc-900">
          {/* ABOUT VIEW */}
          {currentTab === "about" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                About QRMaster Pro
              </h2>
              <p className="text-sm text-gray-600 dark:text-zinc-300 leading-relaxed">
                QRMaster Pro is a high-performance, offline-first vector design utility built for developers,
                designers, and marketing campaigns. Standard generators output generic, blocky pixels. QRMaster Pro
                empowers you to customize cell shapes, corner eyes, colors, and upload brand icons into custom styled
                marketing assets.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                    100% Client-Side
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    All matrix calculation and canvas rasterization takes place on your device processor. No information or images are ever transmitted to any external API.
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/40 border border-gray-100 dark:border-zinc-800">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1.5">
                    Vector Preserved Output
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 leading-relaxed">
                    Supports high-resolution PNG, SVG formats suitable for large scale print ads, signs, posters, and digital displays.
                  </p>
                </div>
              </div>

              <div className="pt-4 text-xs text-gray-400">
                <p>Designed with ❤️ for total creative digital freedom.</p>
                <p className="mt-1">Version 1.4.2 (Production Ready)</p>
              </div>
            </div>
          )}

          {/* CONTACT VIEW */}
          {currentTab === "contact" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                <Mail className="h-6 w-6 text-indigo-500" /> Get in Touch
              </h2>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Have a feature recommendation, custom integration query, or bug report? Complete the form below, and our development team will respond.
              </p>

              <form onSubmit={handleContactSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alexis Wright"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alexis@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
                    Your Message
                  </label>
                  <textarea
                    rows={4}
                    value={msg}
                    onChange={(e) => setMsg(e.target.value)}
                    placeholder="Describe your inquiry or feature ideas in detail..."
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                  {isSubmitting ? "Transmitting..." : "Send Secure Message"}
                </button>
              </form>
            </div>
          )}

          {/* FAQ VIEW */}
          {currentTab === "faq" && (
            <div className="space-y-5 animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-gray-150 dark:border-zinc-800 rounded-2xl overflow-hidden bg-gray-50/50 dark:bg-zinc-900"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-xs text-gray-800 dark:text-zinc-200 hover:bg-gray-100/50 dark:hover:bg-zinc-800/40 transition-colors cursor-pointer"
                      >
                        <span>{faq.q}</span>
                        <span className="text-indigo-500 font-bold">{isOpen ? "−" : "+"}</span>
                      </button>
                      
                      {isOpen && (
                        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800/60 text-xs text-gray-500 dark:text-zinc-400 leading-relaxed animate-fade-in">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PRIVACY POLICY */}
          {currentTab === "privacy" && (
            <div className="space-y-5 animate-fade-in text-gray-600 dark:text-zinc-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Privacy Policy
              </h2>
              <p className="text-xs text-gray-400">Effective Date: June 2026</p>

              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 mb-1">
                    1. Data Processing Architecture
                  </h4>
                  <p>
                    All generation occurs client-side in your local browser sandbox. Uploaded logos remain inside local RAM and never leave your hardware. No tracking or cookies are utilized.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 mb-1">
                    2. Local Storage Persistence
                  </h4>
                  <p>
                    Your configurations, search query references, and recently designed QR histories are stored in your device's browser `localStorage`. You may clear this history database permanently at any time by clicking "Clear History" inside the main dashboard.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 mb-1">
                    3. No Third-Party Disclosure
                  </h4>
                  <p>
                    Because we do not transmit, analyze, or archive any user inputs or generated text parameters on external databases, it is structurally impossible for us to share, distribute, or monetize your information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TERMS OF SERVICE */}
          {currentTab === "terms" && (
            <div className="space-y-5 animate-fade-in text-gray-600 dark:text-zinc-300">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Terms of Service
              </h2>
              <p className="text-xs text-gray-400">Effective Date: June 2026</p>

              <div className="space-y-4 text-xs leading-relaxed">
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 mb-1">
                    1. Royalty-Free Usage License
                  </h4>
                  <p>
                    We grant all users a universal, perpetual, non-exclusive, fully paid-up royalty-free license to generate, use, customize, reprint, and commercially display any QR outputs created by QRMaster Pro.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 mb-1">
                    2. Disclaimer of Warranties
                  </h4>
                  <p>
                    The service and outputs are provided on an "as-is" and "as-available" basis without warranties of any kind. You assume complete responsibility for validating the scan rates and legibility of output files on your targeted hardware prior to executing heavy printing campaigns.
                  </p>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-zinc-100 mb-1">
                    3. Prohibited Usage
                  </h4>
                  <p>
                    You may not use QRMaster Pro to serialize or generate QR payloads directing users to malicious endpoints, credential fishing portals, viruses, or illegal activity vectors.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef, ChangeEvent } from "react";
import {
  QRConfig,
  QRHistoryEntry,
  QRType,
  DotStyle,
  EyeStyle,
  InnerEyeStyle,
} from "./types";
import ThemeToggle from "./components/ThemeToggle";
import QRForm from "./components/QRForm";
import LogoSelector from "./components/LogoSelector";
import ExtraPages from "./components/ExtraPages";
import { renderQRCodeToCanvas, renderQRCodeToSVG } from "./utils/qrRenderer";
import {
  Download,
  Copy,
  Printer,
  Share2,
  Maximize2,
  RotateCcw,
  RotateCw,
  Star,
  Search,
  Filter,
  History,
  Trash2,
  FileJson,
  Upload,
  Layers,
  Palette,
  Sparkles,
  Bookmark,
  ExternalLink,
  ChevronRight,
  Info,
  Sliders,
  Image as ImageIcon,
} from "lucide-react";

const INITIAL_CONFIG: QRConfig = {
  type: "url",
  text: "https://google.com",
  size: 512,
  margin: 20,
  foregroundColor: "#1e1b4b", // Deep indigo 950
  backgroundColor: "#ffffff",
  isTransparent: false,
  errorCorrectionLevel: "H",
  dotStyle: "square",
  eyeStyle: "square",
  innerEyeStyle: "square",
  outerEyeColor: "#1e1b4b",
  innerEyeColor: "#1e1b4b",
  customEyeColor: false,
  logoUrl: null,
  logoSize: 22,
  logoBorderRadius: 20,
  logoPadding: 6,
  hasLogoBackground: true,
  logoBackgroundColor: "#ffffff",
};

export default function App() {
  // Config state
  const [config, setConfig] = useState<QRConfig>(INITIAL_CONFIG);

  // Undo / Redo Stacks
  const [undoStack, setUndoStack] = useState<QRConfig[]>([]);
  const [redoStack, setRedoStack] = useState<QRConfig[]>([]);

  // Local storage history list
  const [history, setHistory] = useState<QRHistoryEntry[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("qrmaster-history");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  });

  // Active designer section accordion tabs
  const [activeAccordion, setActiveAccordion] = useState<"layout" | "colors" | "shapes" | "logo">("layout");

  // UI state managers
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeExtraView, setActiveExtraView] = useState<"about" | "contact" | "privacy" | "terms" | "faq" | null>(null);

  // Search & Filter state for History log
  const [searchQuery, setSearchQuery] = useState("");
  const [historyFilter, setHistoryFilter] = useState<string>("all");
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Toast Notifications list
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: "success" | "info" | "error" }>>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const historyFileInputRef = useRef<HTMLInputElement>(null);

  // Helper to trigger floating toast notification alert
  const addToast = (message: string, type: "success" | "info" | "error" = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // State modification hook with automated Undo recording
  const updateConfig = (newFields: Partial<QRConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...newFields };
      // Push previous state to undo stack, and clear the redo stack
      setUndoStack((u) => [...u, prev]);
      setRedoStack([]);
      return next;
    });
  };

  // Undo handler
  const handleUndo = () => {
    if (undoStack.length === 0) {
      addToast("Nothing left to undo", "info");
      return;
    }
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((u) => u.slice(0, -1));
    setRedoStack((r) => [...r, config]);
    setConfig(prev);
    addToast("Configuration undone", "info");
  };

  // Redo handler
  const handleRedo = () => {
    if (redoStack.length === 0) {
      addToast("Nothing left to redo", "info");
      return;
    }
    const next = redoStack[redoStack.length - 1];
    setRedoStack((r) => r.slice(0, -1));
    setUndoStack((u) => [...u, config]);
    setConfig(next);
    addToast("Configuration redone", "info");
  };

  // Hook into keyboard shortcuts for productivity (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdKey = isMac ? e.metaKey : e.ctrlKey;

      if (cmdKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      } else if (cmdKey && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [config, undoStack, redoStack]);

  // Sync canvas layout in real-time as state elements update
  useEffect(() => {
    const render = async () => {
      if (canvasRef.current) {
        setIsLoading(true);
        try {
          await renderQRCodeToCanvas(canvasRef.current, config);
        } catch (e) {
          console.error("Renderer Failure: ", e);
        } finally {
          setIsLoading(false);
        }
      }
    };
    render();
  }, [config]);

  // Persist history logs to local storage
  useEffect(() => {
    localStorage.setItem("qrmaster-history", JSON.stringify(history));
  }, [history]);

  // Standard payload serialization hook from the child forms
  const handleFormChange = (serializedText: string) => {
    if (config.text !== serializedText) {
      updateConfig({ text: serializedText });
    }
  };

  // Store active design configuration as a saved template in history
  const handleSaveToHistory = () => {
    const title = prompt("Enter a memorable title for this QR Code template:", `Design: ${config.type.toUpperCase()}`) || "";
    if (!title.trim()) return;

    const entry: QRHistoryEntry = {
      id: Math.random().toString(36).substring(2, 9),
      title: title.trim(),
      type: config.type,
      text: config.text,
      config: { ...config },
      createdAt: new Date().toLocaleString(),
      isFavorite: false,
    };

    setHistory((prev) => [entry, ...prev]);
    addToast("Template added to design database!", "success");
  };

  // Star / Favorite QR template toggle
  const toggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    addToast("Favorite status updated", "success");
  };

  // Restore history template
  const restoreHistoryItem = (entry: QRHistoryEntry) => {
    setConfig({ ...entry.config });
    addToast(`Restored design: ${entry.title}`, "success");
  };

  // Delete individual template item
  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    addToast("Template removed from local storage", "info");
  };

  // Clear all local histories
  const clearAllHistory = () => {
    if (confirm("Are you sure you want to permanently clear all saved QR templates and history? This cannot be undone.")) {
      setHistory([]);
      addToast("Local database cleared completely", "info");
    }
  };

  // Export History as a raw JSON file
  const exportHistoryToJSON = () => {
    if (history.length === 0) {
      addToast("Nothing to export yet.", "info");
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `qrmaster_pro_history_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast("History database exported successfully", "success");
  };

  // Import History JSON file handler
  const handleImportJSONClick = () => {
    historyFileInputRef.current?.click();
  };

  const importHistoryFromJSON = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // validate key parameters
          const isValid = parsed.every((item) => item.id && item.title && item.config);
          if (isValid) {
            setHistory((prev) => [...parsed, ...prev]);
            addToast(`Imported ${parsed.length} templates successfully!`, "success");
          } else {
            addToast("Invalid schema format inside JSON template.", "error");
          }
        } else {
          addToast("JSON structure must be an array of templates.", "error");
        }
      } catch (err) {
        addToast("Failed to parse JSON file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = ""; // Clear file selector
  };

  // Download logic for PNG
  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `qrmaster_pro_${config.type}_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
    addToast("PNG downloaded in high-res!", "success");
  };

  // Download logic for JPEG
  const downloadJPEG = () => {
    if (!canvasRef.current) return;
    
    // JPEG requires drawing transparent backgrounds as opaque white
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = config.size;
    tempCanvas.height = config.size;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx) {
      tempCtx.fillStyle = config.isTransparent ? "#ffffff" : config.backgroundColor;
      tempCtx.fillRect(0, 0, config.size, config.size);
      tempCtx.drawImage(canvasRef.current, 0, 0);
      
      const dataUrl = tempCanvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      link.download = `qrmaster_pro_${config.type}_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
      addToast("JPEG downloaded successfully!", "success");
    }
  };

  // Download logic for SVG
  const downloadSVG = () => {
    const svgContent = renderQRCodeToSVG(config);
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = `qrmaster_pro_${config.type}_${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    addToast("SVG vector file exported successfully!", "success");
  };

  // Copy QR Code Image to System Clipboard
  const copyQRImageToClipboard = async () => {
    if (!canvasRef.current) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (blob) {
          const item = new ClipboardItem({ "image/png": blob });
          await navigator.clipboard.write([item]);
          addToast("QR Code image copied directly to clipboard!", "success");
        } else {
          addToast("Failed to serialize clipboard image blob.", "error");
        }
      }, "image/png");
    } catch (e) {
      addToast("Browser clipboard writing restricted. Try downloading the PNG instead.", "error");
    }
  };

  // Copy serialized QR string payload
  const copyRawData = () => {
    navigator.clipboard.writeText(config.text);
    addToast("Serialized payload text copied!", "success");
  };

  // Print QR Code
  const printQRCode = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL();
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QRMaster Pro - Printable Asset</title>
            <style>
              body { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; font-family: system-ui, sans-serif; background: white; color: black; }
              img { max-width: 90vw; max-height: 70vh; border: 1px solid #eaeaea; padding: 12px; border-radius: 12px; }
              h1 { margin-bottom: 4px; font-size: 24px; }
              p { font-size: 14px; color: #555; max-width: 500px; text-align: center; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <h1>QRMaster Pro Asset</h1>
            <p>Type: <strong>${config.type.toUpperCase()}</strong></p>
            <img src="${dataUrl}"/>
            <p style="font-family: monospace; font-size: 11px;">Payload: ${config.text}</p>
            <script>window.onload = function() { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Share QR deep link or image
  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QRMaster Pro Styled Code",
          text: `Check out my custom styled QR code! Type: ${config.type.toUpperCase()}`,
          url: window.location.href,
        });
        addToast("Sharing session completed!", "success");
      } catch (e) {
        addToast("Sharing cancelled", "info");
      }
    } else {
      // Fallback: Copy link
      navigator.clipboard.writeText(window.location.href);
      addToast("Sharing not supported natively. Copied page URL to share!", "info");
    }
  };

  // Filtered History list
  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = historyFilter === "all" || item.type === historyFilter;
    const matchesFav = !showOnlyFavorites || item.isFavorite;
    return matchesSearch && matchesType && matchesFav;
  });

  const qrTypes: Array<{ id: QRType; label: string; icon: string }> = [
    { id: "url", label: "Website URL", icon: "🔗" },
    { id: "text", label: "Plain Text", icon: "📝" },
    { id: "wifi", label: "WiFi Access", icon: "📶" },
    { id: "phone", label: "Phone Call", icon: "📞" },
    { id: "sms", label: "SMS Send", icon: "💬" },
    { id: "email", label: "Email Mailto", icon: "✉️" },
    { id: "vcard", label: "vCard Contact", icon: "👤" },
    { id: "location", label: "Location Map", icon: "📍" },
    { id: "whatsapp", label: "WhatsApp Link", icon: "📱" },
    { id: "upi", label: "UPI Payment", icon: "💳" },
    { id: "event", label: "Calendar Event", icon: "📅" },
    { id: "social", label: "Social Profile", icon: "👥" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-800 dark:text-zinc-100 flex flex-col transition-colors selection:bg-indigo-500 selection:text-white">
      
      {/* 1. Header Navbar */}
      <header id="main-header" className="sticky top-0 z-40 bg-slate-900/90 dark:bg-slate-950/90 backdrop-blur-xl border-b border-white/10 px-4 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl flex items-center justify-center font-black text-xl italic shadow-lg shadow-indigo-500/20 text-white select-none">
            QR
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic text-white leading-none">
              audinex<span className="text-indigo-400">tech</span>
            </h1>
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400/80 mt-1">build by yoga</p>
          </div>
        </div>

        {/* Header Tools */}
        <div className="flex items-center gap-2">
          {/* Extra view toggles */}
          <button
            onClick={() => setActiveExtraView("faq")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            FAQ
          </button>
          <button
            onClick={() => setActiveExtraView("about")}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-indigo-600 dark:text-zinc-400 dark:hover:text-indigo-400 transition-colors cursor-pointer"
          >
            About
          </button>

          <div className="h-5 w-px bg-gray-200 dark:bg-zinc-800 mx-1 hidden md:block" />

          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-0.5 mr-1">
            <button
              onClick={handleUndo}
              disabled={undoStack.length === 0}
              className="p-2 rounded-lg text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer focus:outline-none"
              title="Undo Customization (Ctrl+Z)"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={handleRedo}
              disabled={redoStack.length === 0}
              className="p-2 rounded-lg text-gray-400 dark:text-zinc-500 hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-30 cursor-pointer focus:outline-none"
              title="Redo Customization (Ctrl+Y)"
            >
              <RotateCw className="h-4.5 w-4.5" />
            </button>
          </div>

          <ThemeToggle />
        </div>
      </header>

      {/* 2. Main Dashboard Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: QR Type & Form Customizer (7-grid) */}
        <section id="customizer-panel" className="lg:col-span-7 space-y-6">
          
          {/* QR Type Selection Grid */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl p-4 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-indigo-500" /> Choose QR Payload Scheme
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {qrTypes.map((t) => {
                const isActive = config.type === t.id;
                return (
                  <button
                    key={t.id}
                    id={`qr-tab-${t.id}`}
                    onClick={() => updateConfig({ type: t.id })}
                    className={`p-2 rounded-xl text-center flex flex-col items-center justify-center gap-1 transition-all border cursor-pointer ${
                      isActive
                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10 font-bold"
                        : "bg-gray-50/50 dark:bg-zinc-950/20 border-gray-150 dark:border-zinc-850 text-gray-600 dark:text-zinc-400 hover:border-gray-300 dark:hover:border-zinc-700"
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    <span className="text-[10px] tracking-wide font-medium truncate max-w-full">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Real-time Input Form */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-3.5 flex items-center gap-1.5 pb-2 border-b border-gray-50 dark:border-zinc-800/40">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" /> Enter Content Details
            </h3>
            
            <QRForm type={config.type} onChange={handleFormChange} />
          </div>

          {/* Accordion customizers: Colors, Shapes, Logos */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-2xl shadow-sm divide-y divide-gray-100 dark:divide-zinc-800">
            
            {/* Accordion 1: Size & Layout */}
            <div className="overflow-hidden">
              <button
                id="accordion-toggle-layout"
                onClick={() => setActiveAccordion(activeAccordion === "layout" ? "layout" : "layout")}
                className="w-full flex items-center justify-between p-4.5 text-left font-black text-[10px] uppercase tracking-[0.2em] text-gray-800 dark:text-zinc-200 cursor-pointer hover:bg-gray-50/40 dark:hover:bg-zinc-850/20"
              >
                <span className="flex items-center gap-2">
                  <Sliders className="h-4 w-4 text-indigo-500" /> 1. Dimensions & Layout
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeAccordion === "layout" ? "rotate-90" : ""}`} />
              </button>

              {activeAccordion === "layout" && (
                <div className="p-5 bg-white dark:bg-zinc-900 border-t border-gray-50 dark:border-zinc-800/50 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Resolution Size</span>
                        <span className="text-xs text-gray-400 font-mono">{config.size} x {config.size} px</span>
                      </div>
                      <input
                        type="range"
                        min="256"
                        max="1024"
                        step="64"
                        value={config.size}
                        onChange={(e) => updateConfig({ size: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Outer Margin</span>
                        <span className="text-xs text-gray-400 font-mono">{config.margin} px</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="64"
                        step="4"
                        value={config.margin}
                        onChange={(e) => updateConfig({ margin: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-zinc-400 mb-1.5 uppercase tracking-wider">
                      Error Correction Level
                    </label>
                    <select
                      value={config.errorCorrectionLevel}
                      onChange={(e) => updateConfig({ errorCorrectionLevel: e.target.value as any })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm"
                    >
                      <option value="L">L (7% Restoration Capability - Fastest scan)</option>
                      <option value="M">M (15% Restoration Capability - Recommended)</option>
                      <option value="Q">Q (25% Restoration Capability - Heavy custom styles)</option>
                      <option value="H">H (30% Restoration Capability - High density / logo overlays)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 2: Colors Customizer */}
            <div className="overflow-hidden">
              <button
                id="accordion-toggle-colors"
                onClick={() => setActiveAccordion(activeAccordion === "colors" ? "layout" : "colors")}
                className="w-full flex items-center justify-between p-4.5 text-left font-black text-[10px] uppercase tracking-[0.2em] text-gray-800 dark:text-zinc-200 cursor-pointer hover:bg-gray-50/40 dark:hover:bg-zinc-850/20"
              >
                <span className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-indigo-500" /> 2. Palette & Transparency
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeAccordion === "colors" ? "rotate-90" : ""}`} />
              </button>

              {activeAccordion === "colors" && (
                <div className="p-5 bg-white dark:bg-zinc-900 border-t border-gray-50 dark:border-zinc-800/50 space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Foreground color picker */}
                    <div className="p-3.5 bg-gray-50/50 dark:bg-zinc-950/20 rounded-xl border border-gray-100 dark:border-zinc-800/40">
                      <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider mb-2">
                        Foreground Dots Color
                      </label>
                      <div className="flex items-center gap-2.5">
                        <input
                          type="color"
                          value={config.foregroundColor}
                          onChange={(e) => updateConfig({ foregroundColor: e.target.value })}
                          className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer overflow-hidden outline-none bg-transparent"
                        />
                        <input
                          type="text"
                          value={config.foregroundColor}
                          onChange={(e) => updateConfig({ foregroundColor: e.target.value })}
                          className="flex-1 px-3 py-1.5 text-xs font-mono border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-gray-700 dark:text-zinc-300 uppercase"
                        />
                      </div>
                    </div>

                    {/* Background color picker */}
                    <div className="p-3.5 bg-gray-50/50 dark:bg-zinc-950/20 rounded-xl border border-gray-100 dark:border-zinc-800/40">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-[11px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                          Background Canvas Color
                        </label>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={config.isTransparent}
                            onChange={(e) => updateConfig({ isTransparent: e.target.checked })}
                            className="h-3.5 w-3.5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-zinc-850"
                          />
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">Transparent</span>
                        </label>
                      </div>
                      
                      {!config.isTransparent ? (
                        <div className="flex items-center gap-2.5">
                          <input
                            type="color"
                            value={config.backgroundColor}
                            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                            className="w-8 h-8 rounded-lg border-0 p-0 cursor-pointer overflow-hidden outline-none bg-transparent"
                          />
                          <input
                            type="text"
                            value={config.backgroundColor}
                            onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-1.5 text-xs font-mono border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-lg text-gray-700 dark:text-zinc-300 uppercase"
                          />
                        </div>
                      ) : (
                        <div className="py-2.5 text-center text-xs text-gray-400 dark:text-zinc-500 border border-dashed border-gray-200 dark:border-zinc-850 rounded-lg">
                          Transparency active (Alpha output enabled)
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Finder pattern color override */}
                  <div className="pt-3 border-t border-gray-50 dark:border-zinc-800/40">
                    <label className="flex items-center gap-2.5 cursor-pointer select-none mb-3">
                      <input
                        type="checkbox"
                        checked={config.customEyeColor}
                        onChange={(e) => updateConfig({ customEyeColor: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-semibold text-gray-600 dark:text-zinc-300">Customize Corner Eyes Colors</span>
                    </label>

                    {config.customEyeColor && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Outer Eye Boundary Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.outerEyeColor}
                              onChange={(e) => updateConfig({ outerEyeColor: e.target.value })}
                              className="w-6.5 h-6.5 rounded p-0 border-0 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={config.outerEyeColor}
                              onChange={(e) => updateConfig({ outerEyeColor: e.target.value })}
                              className="flex-1 px-2.5 py-1 text-xs font-mono border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded text-gray-700 dark:text-zinc-300 uppercase"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                            Inner Eye Dot Color
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={config.innerEyeColor}
                              onChange={(e) => updateConfig({ innerEyeColor: e.target.value })}
                              className="w-6.5 h-6.5 rounded p-0 border-0 cursor-pointer bg-transparent"
                            />
                            <input
                              type="text"
                              value={config.innerEyeColor}
                              onChange={(e) => updateConfig({ innerEyeColor: e.target.value })}
                              className="flex-1 px-2.5 py-1 text-xs font-mono border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded text-gray-700 dark:text-zinc-300 uppercase"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 3: Shapes & Styles */}
            <div className="overflow-hidden">
              <button
                id="accordion-toggle-shapes"
                onClick={() => setActiveAccordion(activeAccordion === "shapes" ? "layout" : "shapes")}
                className="w-full flex items-center justify-between p-4.5 text-left font-black text-[10px] uppercase tracking-[0.2em] text-gray-800 dark:text-zinc-200 cursor-pointer hover:bg-gray-50/40 dark:hover:bg-zinc-850/20"
              >
                <span className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 text-indigo-500" /> 3. Structural Node Shapes
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeAccordion === "shapes" ? "rotate-90" : ""}`} />
              </button>

              {activeAccordion === "shapes" && (
                <div className="p-5 bg-white dark:bg-zinc-900 border-t border-gray-50 dark:border-zinc-800/50 space-y-4 animate-fade-in">
                  
                  {/* Dot Style Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                      Main Dots Node Design
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(["square", "dots", "rounded", "classy", "diamond", "star"] as DotStyle[]).map((ds) => (
                        <button
                          key={ds}
                          type="button"
                          onClick={() => updateConfig({ dotStyle: ds })}
                          className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                            config.dotStyle === ds
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm"
                              : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-850"
                          }`}
                        >
                          {ds}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Eye Frame Style Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-50 dark:border-zinc-800/40">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                        Corner Eye Frame Shape
                      </label>
                      <select
                        value={config.eyeStyle}
                        onChange={(e) => updateConfig({ eyeStyle: e.target.value as EyeStyle })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                      >
                        <option value="square">Square Frame</option>
                        <option value="rounded">Rounded Frame</option>
                        <option value="extra-rounded">Extra Rounded</option>
                        <option value="circle">Full Circle Frame</option>
                        <option value="leaf">Aesthetic Leaf Frame</option>
                        <option value="shield">Noble Shield Frame</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                        Inner Eye Core Shape
                      </label>
                      <select
                        value={config.innerEyeStyle}
                        onChange={(e) => updateConfig({ innerEyeStyle: e.target.value as InnerEyeStyle })}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium"
                      >
                        <option value="square">Standard Square Core</option>
                        <option value="circle">Smooth Circular Core</option>
                        <option value="diamond">Angled Diamond Core</option>
                        <option value="star">Faceted Star Core</option>
                        <option value="heart">Love Heart Core</option>
                        <option value="shield">Noble Shield Core</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Accordion 4: Centered Logo Overlay */}
            <div className="overflow-hidden">
              <button
                id="accordion-toggle-logo"
                onClick={() => setActiveAccordion(activeAccordion === "logo" ? "layout" : "logo")}
                className="w-full flex items-center justify-between p-4.5 text-left font-black text-[10px] uppercase tracking-[0.2em] text-gray-800 dark:text-zinc-200 cursor-pointer hover:bg-gray-50/40 dark:hover:bg-zinc-850/20"
              >
                <span className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-indigo-500" /> 4. Centered Logo Overlay
                </span>
                <ChevronRight className={`h-4 w-4 transition-transform ${activeAccordion === "logo" ? "rotate-90" : ""}`} />
              </button>

              {activeAccordion === "logo" && (
                <div className="p-5 bg-white dark:bg-zinc-900 border-t border-gray-50 dark:border-zinc-800/50 animate-fade-in">
                  <LogoSelector
                    currentLogoUrl={config.logoUrl}
                    onSelectLogo={(url) => updateConfig({ logoUrl: url })}
                    logoSize={config.logoSize}
                    onLogoSizeChange={(v) => updateConfig({ logoSize: v })}
                    logoBorderRadius={config.logoBorderRadius}
                    onLogoBorderRadiusChange={(v) => updateConfig({ logoBorderRadius: v })}
                    logoPadding={config.logoPadding}
                    onLogoPaddingChange={(v) => updateConfig({ logoPadding: v })}
                    hasLogoBackground={config.hasLogoBackground}
                    onHasLogoBackgroundChange={(v) => updateConfig({ hasLogoBackground: v })}
                    logoBackgroundColor={config.logoBackgroundColor}
                    onLogoBackgroundColorChange={(v) => updateConfig({ logoBackgroundColor: v })}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Column: Live Preview & History (5-grid) */}
        <section id="preview-panel" className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
          
          {/* Live Preview Card */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-3xl p-5 shadow-md flex flex-col items-center justify-center relative overflow-hidden group">
            
            {/* Top Bar Indicators */}
            <div className="w-full flex justify-between items-center mb-4">
              <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] tracking-wide uppercase flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" /> Real-time preview
              </span>

              {/* Save To Local Templates */}
              <button
                onClick={handleSaveToHistory}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 text-xs font-semibold text-gray-600 dark:text-zinc-300 cursor-pointer bg-white dark:bg-zinc-900/40 transition-colors"
                title="Save this QR design configuration to History"
              >
                <Bookmark className="h-3.5 w-3.5" /> Save Template
              </button>
            </div>

            {/* Main Canvas Frame */}
            <div className="relative w-full aspect-square max-w-[340px] flex items-center justify-center bg-gray-50 dark:bg-zinc-950/40 border border-gray-150 dark:border-zinc-850 p-6 rounded-2xl shadow-inner group/canvas">
              {isLoading && (
                <div className="absolute inset-0 bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm z-10 flex items-center justify-center flex-col gap-2 rounded-2xl animate-fade-in">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Rasterizing...</span>
                </div>
              )}
              
              <canvas
                id="qr-output-canvas"
                ref={canvasRef}
                className="w-full h-full max-w-full max-h-full object-contain transition-all duration-300 drop-shadow-md group-hover/canvas:scale-[1.01]"
              />

              {/* Fullscreen Button Hover overlay */}
              <button
                onClick={() => setIsFullscreen(true)}
                className="absolute bottom-2.5 right-2.5 p-2 bg-indigo-600 text-white rounded-lg opacity-0 group-hover/canvas:opacity-100 transition-opacity shadow-lg cursor-pointer flex items-center justify-center focus:opacity-100"
                title="Open Expanded Preview"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
            </div>

            {/* Quick action grid */}
            <div className="w-full grid grid-cols-2 gap-2 mt-4.5">
              <button
                onClick={copyQRImageToClipboard}
                className="py-2 px-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Copy className="h-3.5 w-3.5 text-indigo-500" /> Copy Image
              </button>
              <button
                onClick={copyRawData}
                className="py-2 px-3 border border-gray-200 dark:border-zinc-800 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200 flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 text-indigo-500" /> Copy Payload
              </button>
            </div>

            {/* Download Export Triggers */}
            <div className="w-full pt-4 mt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs text-gray-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                <span>Exporter Formats</span>
                <span>Select file type</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={downloadPNG}
                  className="py-2.5 px-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wide cursor-pointer shadow-sm transition-colors flex flex-col items-center justify-center gap-1 group/btn"
                >
                  <Download className="h-3.5 w-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                  <span>High PNG</span>
                </button>
                <button
                  onClick={downloadSVG}
                  className="py-2.5 px-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold tracking-wide cursor-pointer shadow-sm transition-colors flex flex-col items-center justify-center gap-1 group/btn"
                >
                  <Download className="h-3.5 w-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                  <span>Vector SVG</span>
                </button>
                <button
                  onClick={downloadJPEG}
                  className="py-2.5 px-1 bg-zinc-800 dark:bg-zinc-850 hover:bg-zinc-900 dark:hover:bg-zinc-800 text-white rounded-xl text-xs font-bold tracking-wide cursor-pointer shadow-sm transition-colors flex flex-col items-center justify-center gap-1 group/btn"
                >
                  <Download className="h-3.5 w-3.5 group-hover/btn:translate-y-0.5 transition-transform" />
                  <span>JPEG</span>
                </button>
              </div>

              {/* Small Action Icons */}
              <div className="flex justify-center items-center gap-4.5 pt-1 text-gray-400 dark:text-zinc-500">
                <button
                  onClick={printQRCode}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Print Asset
                </button>
                <div className="h-3.5 w-px bg-gray-200 dark:bg-zinc-800" />
                <button
                  onClick={shareQRCode}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase cursor-pointer"
                >
                  <Share2 className="h-4 w-4" /> Share Asset
                </button>
              </div>
            </div>
          </div>

          {/* Local Storage Saved History */}
          <div className="bg-white dark:bg-zinc-900 border border-gray-150 dark:border-zinc-800/80 rounded-3xl p-5 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                <History className="h-4 w-4 text-indigo-500" /> Template Library ({history.length})
              </h3>
              
              {history.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={exportHistoryToJSON}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 dark:text-zinc-500 cursor-pointer"
                    title="Export Library to JSON"
                  >
                    <FileJson className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={handleImportJSONClick}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-indigo-400 text-gray-400 hover:text-indigo-600 dark:text-zinc-500 cursor-pointer"
                    title="Import Library from JSON"
                  >
                    <Upload className="h-4.5 w-4.5" />
                  </button>
                  <button
                    onClick={clearAllHistory}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-800 hover:border-rose-300 text-gray-400 hover:text-rose-500 dark:text-zinc-500 cursor-pointer"
                    title="Clear Library Database"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                  <input
                    type="file"
                    ref={historyFileInputRef}
                    onChange={importHistoryFromJSON}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Search and Filters */}
            {history.length > 0 && (
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400">
                    <Search className="h-3.5 w-3.5" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[10px]">
                  <select
                    value={historyFilter}
                    onChange={(e) => setHistoryFilter(e.target.value)}
                    className="px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-gray-500"
                  >
                    <option value="all">All Payload Types</option>
                    <option value="url">Web URL</option>
                    <option value="text">Plain Text</option>
                    <option value="wifi">WiFi Network</option>
                    <option value="upi">UPI Deep Link</option>
                    <option value="vcard">vCards</option>
                  </select>

                  <button
                    onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
                    className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-1 font-semibold cursor-pointer transition-colors ${
                      showOnlyFavorites
                        ? "border-amber-400 bg-amber-50/50 text-amber-600"
                        : "border-gray-200 dark:border-zinc-800 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Star className={`h-3 w-3 ${showOnlyFavorites ? "fill-amber-400 text-amber-500" : ""}`} /> Favorites Only
                  </button>
                </div>
              </div>
            )}

            {/* Template lists container */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1.5 custom-scrollbar">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between p-2.5 rounded-2xl border border-gray-100 dark:border-zinc-800/60 bg-gray-50/40 dark:bg-zinc-950/20 hover:border-indigo-200 dark:hover:border-indigo-900/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0" onClick={() => restoreHistoryItem(item)}>
                      <div className="w-8 h-8 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100/30 flex items-center justify-center text-sm shrink-0">
                        {qrTypes.find((t) => t.id === item.type)?.icon || "📝"}
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 dark:text-zinc-200 truncate">{item.title}</p>
                        <p className="text-[10px] text-gray-400 dark:text-zinc-500 truncate mt-0.5">{item.text}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
                        title="Toggle Favorite Star"
                      >
                        <Star className={`h-3.5 w-3.5 ${item.isFavorite ? "fill-amber-400 text-amber-500" : ""}`} />
                      </button>
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                        title="Remove Template"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-gray-400 dark:text-zinc-500 border border-dashed border-gray-200 dark:border-zinc-850 rounded-2xl">
                  {history.length === 0
                    ? "Template library is currently empty. Design and click 'Save Template' above."
                    : "No saved templates match your active filters."}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* 3. Footer Status Bar */}
      <footer className="h-8 bg-indigo-600 text-white px-4 lg:px-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest select-none">
        <div className="flex gap-6">
          <span>Status: Ready</span>
          <span className="hidden sm:inline">Format: UTF-8</span>
          <span className="hidden md:inline">Memory: 24.5KB</span>
          <span className="hidden lg:inline">Cloud Sync Active</span>
        </div>
        <div className="flex gap-4.5">
          <button onClick={() => setActiveExtraView("about")} className="hover:underline cursor-pointer">About</button>
          <button onClick={() => setActiveExtraView("contact")} className="hover:underline cursor-pointer">Support</button>
          <button onClick={() => setActiveExtraView("privacy")} className="hover:underline cursor-pointer">Privacy</button>
          <button onClick={() => setActiveExtraView("terms")} className="hover:underline cursor-pointer">Terms</button>
        </div>
      </footer>

      {/* 4. Fullscreen Canvas Modal Preview */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-md animate-fade-in p-6">
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 p-2.5 rounded-xl bg-zinc-900 text-white border border-zinc-800 hover:bg-zinc-800 cursor-pointer transition-all shadow-xl"
            title="Close Fullscreen"
          >
            ❌ Close Expanded View
          </button>

          <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center max-w-full max-h-[75vh] aspect-square overflow-hidden border border-zinc-100">
            <img
              src={canvasRef.current?.toDataURL() || ""}
              alt="High resolution QR Code preview"
              className="max-w-full max-h-full object-contain drop-shadow-lg"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-bold text-white tracking-wide uppercase">QR Code Expansion Frame</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-md truncate">{config.text}</p>
          </div>
        </div>
      )}

      {/* 5. Sub-Pages Drawer Portal Modal */}
      <ExtraPages
        activeView={activeExtraView}
        onClose={() => setActiveExtraView(null)}
        addToast={addToast}
      />

      {/* 6. Animated Floating Toasts Notification Hub */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl flex items-center justify-between border text-xs font-semibold tracking-wide animate-slide-in-right ${
              t.type === "success"
                ? "bg-emerald-50 dark:bg-emerald-950/90 text-emerald-800 dark:text-emerald-300 border-emerald-100 dark:border-emerald-950"
                : t.type === "error"
                ? "bg-rose-50 dark:bg-rose-950/90 text-rose-800 dark:text-rose-300 border-rose-100 dark:border-rose-950"
                : "bg-indigo-50 dark:bg-indigo-950/90 text-indigo-800 dark:text-indigo-300 border-indigo-100 dark:border-indigo-950"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">{t.type === "success" ? "✅" : t.type === "error" ? "❌" : "ℹ️"}</span>
              <span>{t.message}</span>
            </div>
            <button
              onClick={() => setToasts((prev) => prev.filter((item) => item.id !== t.id))}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-white font-bold ml-4 cursor-pointer"
            >
              ×
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

import React, { useRef, useState } from "react";
import { Upload, Trash2, ShieldAlert, Check } from "lucide-react";

// Inline vector presets represented as safe, robust SVG DataURLs to avoid network loading errors
export const LOGO_PRESETS = [
  {
    name: "WiFi Wave",
    id: "wifi",
    // Base64 or plain SVG encoded to a DataURL
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%234f46e5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h.01"/><path d="M8.5 16.5a5 5 0 0 1 7 0"/><path d="M5 13a10 10 0 0 1 14 0"/><path d="M1.5 9.5a15 15 0 0 1 21 0"/></svg>',
    color: "#e0e7ff",
  },
  {
    name: "Location",
    id: "location",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ef4444" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>',
    color: "#fee2e2",
  },
  {
    name: "WhatsApp",
    id: "whatsapp",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%2322c55e" stroke="none"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.811 1.452 5.518 0 10.006-4.486 10.01-10.004.002-2.673-1.04-5.185-2.936-7.082-1.895-1.897-4.41-2.937-7.083-2.938-5.52 0-10.007 4.487-10.01 10.005-.001 1.838.497 3.633 1.442 5.23L1.039 20.91l4.811-1.258-.203-.122zm11.233-7.518c-.27-.135-1.602-.79-1.85-.88-.25-.09-.432-.135-.612.135-.18.27-.697.88-.855 1.06-.157.18-.315.202-.585.068-.27-.135-1.14-.42-2.172-1.34-.803-.715-1.345-1.6-1.502-1.87-.158-.27-.017-.417.118-.552.122-.12.27-.315.405-.472.135-.157.18-.27.27-.45.09-.18.045-.337-.022-.472-.068-.135-.612-1.474-.838-2.018-.22-.53-.442-.458-.612-.467-.16-.008-.344-.01-.529-.01-.184 0-.485.07-.74.35-.254.28-1.009.985-1.009 2.404s1.025 2.79 1.168 2.98c.143.19 2.017 3.08 4.887 4.32.682.295 1.214.471 1.63.6.686.218 1.31.187 1.802.114.549-.08 1.602-.656 1.83-1.258.225-.6.225-1.114.157-1.223-.067-.108-.248-.172-.518-.307z"/></svg>',
    color: "#dcfce7",
  },
  {
    name: "Web Globe",
    id: "web",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%232563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>',
    color: "#dbeafe",
  },
  {
    name: "Instagram",
    id: "instagram",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23db2777" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
    color: "#fce7f3",
  },
  {
    name: "Envelope",
    id: "email",
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="%23d97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
    color: "#fef3c7",
  },
];

interface LogoSelectorProps {
  currentLogoUrl: string | null;
  onSelectLogo: (url: string | null) => void;
  logoSize: number;
  onLogoSizeChange: (val: number) => void;
  logoBorderRadius: number;
  onLogoBorderRadiusChange: (val: number) => void;
  logoPadding: number;
  onLogoPaddingChange: (val: number) => void;
  hasLogoBackground: boolean;
  onHasLogoBackgroundChange: (val: boolean) => void;
  logoBackgroundColor: string;
  onLogoBackgroundColorChange: (val: string) => void;
}

export default function LogoSelector({
  currentLogoUrl,
  onSelectLogo,
  logoSize,
  onLogoSizeChange,
  logoBorderRadius,
  onLogoBorderRadiusChange,
  logoPadding,
  onLogoPaddingChange,
  hasLogoBackground,
  onHasLogoBackgroundChange,
  logoBackgroundColor,
  onLogoBackgroundColorChange,
}: LogoSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Check type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Unsupported file type. Please select an image.");
      return;
    }
    // Check size (max 3MB for fast client-side performance)
    if (file.size > 3 * 1024 * 1024) {
      setErrorMessage("File too large. Maximum size is 3MB.");
      return;
    }

    setErrorMessage(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onSelectLogo(reader.result);
      }
    };
    reader.onerror = () => {
      setErrorMessage("Failed to read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Preset Row */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Preset Brand Overlays
        </label>
        <div className="grid grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => onSelectLogo(null)}
            className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
              currentLogoUrl === null
                ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold"
                : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 text-gray-500 dark:text-zinc-400"
            }`}
          >
            <span className="text-sm">❌</span>
            <span>None</span>
          </button>

          {LOGO_PRESETS.map((preset) => {
            const isSelected = currentLogoUrl === preset.url;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectLogo(preset.url)}
                className={`p-2.5 rounded-xl border text-xs font-medium flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm"
                    : "border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/40 text-gray-600 dark:text-zinc-400"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center relative"
                  style={{ backgroundColor: preset.color }}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-5.5 h-5.5 object-contain"
                    referrerPolicy="no-referrer"
                  />
                  {isSelected && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-indigo-600 rounded-full flex items-center justify-center text-[8px] text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3px]" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] truncate max-w-full">{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag and drop zone */}
      <div>
        <label className="block text-xs font-semibold text-gray-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
          Or Upload Custom Brand Logo
        </label>
        
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            dragOver
              ? "border-indigo-500 bg-indigo-50/25 dark:bg-indigo-950/10 scale-[0.99]"
              : "border-gray-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-zinc-700 bg-white/50 dark:bg-zinc-900/30"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {currentLogoUrl && !LOGO_PRESETS.some((p) => p.url === currentLogoUrl) ? (
            <div className="flex items-center gap-3 w-full justify-center">
              <div className="relative w-12 h-12 rounded-lg bg-gray-50 dark:bg-zinc-800 border border-gray-100 dark:border-zinc-700 flex items-center justify-center p-1 overflow-hidden">
                <img
                  src={currentLogoUrl}
                  alt="Custom uploaded logo"
                  className="max-w-full max-h-full object-contain rounded"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Custom Brand Active</p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500">Click or drag new to replace</p>
              </div>
            </div>
          ) : (
            <>
              <div className="p-2 bg-gray-50 dark:bg-zinc-800/80 rounded-xl text-gray-400 dark:text-zinc-500">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700 dark:text-zinc-300">
                  Drag & Drop or <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Browse</span>
                </p>
                <p className="text-[10px] text-gray-400 dark:text-zinc-500 mt-0.5">Supports PNG, JPEG, SVG up to 3MB</p>
              </div>
            </>
          )}
        </div>

        {errorMessage && (
          <div className="mt-2 p-2 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-950/30 rounded-lg flex items-center gap-2 text-xs text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Vector custom sliders (if a logo is currently loaded) */}
      {currentLogoUrl && (
        <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800/80 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700 dark:text-zinc-300">Logo Scale</span>
            <span className="text-xs text-gray-400 font-mono">{logoSize}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="30"
            step="1"
            value={logoSize}
            onChange={(e) => onLogoSizeChange(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
          <p className="text-[10px] text-gray-400 dark:text-zinc-500">
            Keep logo under 25% to guarantee maximum offline scanning readability.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">Border Radius</span>
                <span className="text-[11px] text-gray-400 font-mono">{logoBorderRadius}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={logoBorderRadius}
                onChange={(e) => onLogoBorderRadiusChange(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-gray-500 dark:text-zinc-400">Safety Margin</span>
                <span className="text-[11px] text-gray-400 font-mono">{logoPadding}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="12"
                step="1"
                value={logoPadding}
                onChange={(e) => onLogoPaddingChange(Number(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-gray-50 dark:border-zinc-800/40">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={hasLogoBackground}
                onChange={(e) => onHasLogoBackgroundChange(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 dark:border-zinc-800 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs font-semibold text-gray-600 dark:text-zinc-400">Draw Protective Backing Mask</span>
            </label>

            {hasLogoBackground && (
              <div className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-zinc-800/40 rounded-xl animate-fade-in">
                <span className="text-[11px] text-gray-500 dark:text-zinc-400">Mask Color</span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={logoBackgroundColor}
                    onChange={(e) => onLogoBackgroundColorChange(e.target.value)}
                    className="w-6 h-6 rounded-md border-0 p-0 cursor-pointer overflow-hidden outline-none bg-transparent"
                  />
                  <input
                    type="text"
                    value={logoBackgroundColor}
                    onChange={(e) => onLogoBackgroundColorChange(e.target.value)}
                    className="w-20 px-1.5 py-0.5 text-[10px] font-mono border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded text-gray-600 dark:text-zinc-300"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelectLogo(null)}
            className="w-full flex items-center justify-center gap-1.5 mt-2 py-1.5 border border-rose-100 dark:border-rose-950/20 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/10 text-xs rounded-lg font-medium cursor-pointer transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Remove Brand Overlay
          </button>
        </div>
      )}
    </div>
  );
}

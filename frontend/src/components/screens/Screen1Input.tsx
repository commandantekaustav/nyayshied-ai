import React, { useRef } from 'react';
import { Camera, Upload, Zap, FileText, IndianRupee, ShieldCheck, AlertCircle, Laptop } from 'lucide-react';

interface Screen1InputProps {
  deviceImage: File | null;
  imagePreview: string | null;
  invoiceFile: File | null;
  walkInQuote: number;
  onDeviceImageChange: (file: File | null, preview: string | null) => void;
  onInvoiceFileChange: (file: File | null) => void;
  onQuoteChange: (quote: number) => void;
  onLoadGoldenCase: () => void;
  isLoading: boolean;
}

export const Screen1Input: React.FC<Screen1InputProps> = ({
  deviceImage,
  imagePreview,
  invoiceFile,
  walkInQuote,
  onDeviceImageChange,
  onInvoiceFileChange,
  onQuoteChange,
  onLoadGoldenCase,
  isLoading,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  const handleDeviceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onDeviceImageChange(file, previewUrl);
    }
  };

  const handleInvoiceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onInvoiceFileChange(file);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Top Banner Button: Load Live Case #001 */}
      <button
        onClick={onLoadGoldenCase}
        disabled={isLoading}
        className="w-full relative overflow-hidden group p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-teal-500/20 border border-amber-500/40 hover:border-amber-400 text-left transition-all active:scale-[0.99] shadow-lg shadow-amber-500/5"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/30">
              <Zap className="w-4 h-4 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                  Judge Fast-Track
                </span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-1.5 py-0.2 rounded-full border border-amber-500/30">
                  Offline Ready
                </span>
              </div>
              <h3 className="text-sm font-extrabold text-white mt-0.5">
                ⚡ Load Live Case #001 (Kolkata HP Victus)
              </h3>
            </div>
          </div>
          <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform">
            Pre-fill →
          </span>
        </div>
        <p className="text-[11px] text-slate-400 mt-2 pl-10 leading-snug">
          HP Victus 15-fa1310tx • Invoice SOA370366199413 • ₹20,000 quote vs. ₹2,500 OEM bezel (8.0× markup)
        </p>
      </button>

      {/* Main Forensic Camera Upload Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Laptop className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100">1. Laptop Chassis / Hinge Photo</h2>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
            Required
          </span>
        </div>

        {/* Hidden File Inputs */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleDeviceFile}
          className="hidden"
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          onChange={handleDeviceFile}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-slate-950 aspect-[4/3] group shadow-inner">
            <img
              src={imagePreview}
              alt="Device Damage Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3 justify-between">
              <div>
                <span className="text-[11px] font-mono text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Forensic Frame Staged
                </span>
                <p className="text-[10px] text-slate-400">
                  {deviceImage?.name || 'Live Case #001 Sample Frame'}
                </p>
              </div>
              <div className="flex space-x-1.5">
                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-[11px] text-slate-200 font-medium transition"
                >
                  Change
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => cameraInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 transition-all group active:scale-95 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Camera className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-slate-100">Rear Camera</span>
              <span className="text-[10px] text-slate-400 mt-0.5">Capture laptop hinge</span>
            </button>

            <button
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-5 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/60 hover:bg-slate-950 transition-all group active:scale-95 text-center"
            >
              <div className="w-11 h-11 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6 stroke-[2]" />
              </div>
              <span className="text-xs font-bold text-slate-100">Upload Photo</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG from gallery</span>
            </button>
          </div>
        )}

        <p className="text-[11px] text-slate-400 mt-2.5 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
          <span>Spatial AI isolates manufacturing hinge fatigue from cosmetic surface marks.</span>
        </p>
      </div>

      {/* Walk-In Quote Input Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <IndianRupee className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100">2. Service Center Quotation (₹)</h2>
          </div>
          <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
            Demanded
          </span>
        </div>

        <div className="relative mt-2">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <span className="text-lg font-bold text-amber-400">₹</span>
          </div>
          <input
            type="number"
            min="100"
            max="200000"
            step="100"
            value={walkInQuote || ''}
            onChange={(e) => onQuoteChange(parseFloat(e.target.value) || 0)}
            placeholder="e.g. 20000"
            className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-2xl py-3.5 pl-9 pr-4 text-lg font-mono font-bold text-white placeholder-slate-600 transition outline-none"
          />
        </div>

        {/* Quick Quote Pills */}
        <div className="flex items-center space-x-2 mt-2.5">
          <span className="text-[10px] text-slate-400 font-medium">Quick Select:</span>
          {[12000, 15000, 20000, 25000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onQuoteChange(val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition ${
                walkInQuote === val
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              ₹{val.toLocaleString('en-IN')}
            </button>
          ))}
        </div>
      </div>

      {/* Invoice Upload Card (Optional) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-100">3. Service Job Sheet / Invoice</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
            Optional
          </span>
        </div>

        <input
          ref={invoiceInputRef}
          type="file"
          accept="image/*,application/pdf"
          onChange={handleInvoiceFile}
          className="hidden"
        />

        <div
          onClick={() => invoiceInputRef.current?.click()}
          className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer flex items-center justify-between transition group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center justify-center group-hover:text-emerald-400 transition">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">
                {invoiceFile ? invoiceFile.name : 'Upload Service Center Estimation Slip'}
              </p>
              <p className="text-[10px] text-slate-400">
                {invoiceFile ? `${(invoiceFile.size / 1024).toFixed(1)} KB` : 'PDF, JPEG or photo of quotation'}
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-400">
            {invoiceFile ? 'Replace' : 'Browse'}
          </span>
        </div>
      </div>
    </div>
  );
};

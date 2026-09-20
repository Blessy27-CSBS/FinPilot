import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { uploadDocument } from '../api';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  theme?: 'light' | 'dark';
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  theme = 'light'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await uploadDocument(file);
      setUploadResult(res);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload processing error');
    } finally {
      setUploading(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setUploadResult(null);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
      <div className={`rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 border ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-900'
          : 'bg-slate-900 border-slate-800 text-white'
      }`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              theme === 'light'
                ? 'bg-cyan-50 border-cyan-200 text-cyan-700'
                : 'bg-cyan-950 border-cyan-800 text-cyan-400'
            }`}>
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className={`text-base font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Import Statement / Bill
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                CSV, PDF statements & bill notices
              </p>
            </div>
          </div>
          <button
            onClick={() => { resetModal(); onClose(); }}
            className={`p-1 rounded-lg transition ${
              theme === 'light'
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {!uploadResult ? (
            <>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition flex flex-col items-center justify-center gap-3 ${
                  dragActive
                    ? 'border-cyan-500 bg-cyan-50/50'
                    : theme === 'light'
                    ? 'border-slate-300 hover:border-slate-400 bg-slate-50/60 hover:bg-slate-50'
                    : 'border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
                }`}
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv,.pdf,.png,.jpg,.jpeg"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  theme === 'light' ? 'bg-cyan-100 text-cyan-700' : 'bg-slate-800 text-cyan-400'
                }`}>
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                    {file ? file.name : 'Click to browse or drag and drop statement'}
                  </p>
                  <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>
                    Supports bank CSV exports, PDF e-statements, or bill receipts
                  </p>
                </div>
                {file && (
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-mono ${
                    theme === 'light'
                      ? 'bg-cyan-50 text-cyan-800 border-cyan-200'
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                  }`}>
                    {(file.size / 1024).toFixed(1)} KB
                  </span>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{error}</span>
                </div>
              )}

              <div className={`rounded-xl p-3 border text-xs space-y-1 ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-600'
                  : 'bg-slate-950/60 border-slate-800/60 text-slate-400'
              }`}>
                <p className={`font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Privacy & Cleaning Guarantees:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Exact & fuzzy duplicate transactions removed automatically.</li>
                  <li>Internal transfers & credit card payments excluded to avoid double counting.</li>
                  <li>PrivacyGuard runs locally before any insight processing.</li>
                </ul>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { resetModal(); onClose(); }}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                    theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!file || uploading}
                  onClick={handleUpload}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-medium transition shadow-sm"
                >
                  {uploading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Processing & Cleaning...</span>
                    </>
                  ) : (
                    <span>Process Statement</span>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className={`w-12 h-12 rounded-full border flex items-center justify-center mx-auto ${
                theme === 'light'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-emerald-950/60 border border-emerald-800 text-emerald-400'
              }`}>
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className={`text-base font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Statement Processed
                </h4>
                <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{uploadResult.filename}</p>
              </div>

              <div className={`grid grid-cols-2 gap-2 text-left p-3 rounded-xl border ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200'
                  : 'bg-slate-950/60 border border-slate-800'
              }`}>
                <div className="p-2">
                  <p className={`text-[11px] uppercase font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Parsed Transactions</p>
                  <p className={`text-lg font-bold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{uploadResult.raw_parsed_count}</p>
                </div>
                <div className="p-2">
                  <p className={`text-[11px] uppercase font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Active Ledger Items</p>
                  <p className="text-lg font-bold text-emerald-500 mt-0.5">{uploadResult.cleaned_count}</p>
                </div>
                <div className="p-2">
                  <p className={`text-[11px] uppercase font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Duplicates Filtered</p>
                  <p className={`text-sm font-semibold mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{uploadResult.statistics?.duplicates_count || 0}</p>
                </div>
                <div className="p-2">
                  <p className={`text-[11px] uppercase font-semibold ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Transfers Excluded</p>
                  <p className={`text-sm font-semibold mt-0.5 ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>{uploadResult.statistics?.transfers_count || 0}</p>
                </div>
              </div>

              {uploadResult.obligation_detected && (
                <div className={`p-3 rounded-lg border text-left ${
                  theme === 'light'
                    ? 'bg-cyan-50 border-cyan-200 text-cyan-900'
                    : 'bg-cyan-950/30 border border-cyan-800/60 text-slate-300'
                }`}>
                  <p className={`text-xs font-semibold ${theme === 'light' ? 'text-cyan-800' : 'text-cyan-300'}`}>Upcoming Obligation Detected</p>
                  <p className="text-xs mt-0.5">
                    {uploadResult.obligation_detected.name}: ₹{uploadResult.obligation_detected.amount.toLocaleString('en-IN')} due {uploadResult.obligation_detected.due_date}
                  </p>
                </div>
              )}

              <button
                onClick={() => { resetModal(); onClose(); }}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition"
              >
                Done & View Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

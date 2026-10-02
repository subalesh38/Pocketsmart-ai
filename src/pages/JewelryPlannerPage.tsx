import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ArrowRight, IndianRupee, Upload, X,
  Image as ImageIcon, AlertCircle,
} from 'lucide-react';
import { planApi } from '../api/plan';
import { ApiError } from '../api/client';
import { fmt } from '../components/plan/PlanResultComponents';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const MAX_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const OCCASIONS = ['Wedding', 'Engagement', 'Birthday', 'Party', 'Festival', 'Formal Event', 'Other'];
const STYLES = ['Traditional', 'Minimal', 'Elegant', 'Bridal', 'Contemporary', 'Statement'];

export const JewelryPlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [totalBudget, setTotalBudget] = useState(50000);
  const [occasion, setOccasion] = useState('Wedding');
  const [style, setStyle] = useState('Elegant');
  const [preferences, setPreferences] = useState('');

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setImageError('Only JPG, PNG and WEBP images are allowed.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setImageError(`Image must be under ${MAX_MB} MB. This file is ${(file.size / 1024 / 1024).toFixed(1)} MB.`);
      e.target.value = '';
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target?.result as string);
    reader.onerror = () => setImageError('Failed to read image file. Please try another image.');
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setImageError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalBudget < 1000 || totalBudget > 10000000) {
      setError('Budget must be between ₹1,000 and ₹1,00,00,000');
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const result = await planApi.createJewelryPlan({
        total_budget: totalBudget,
        occasion,
        preferences: [style, preferences].filter(Boolean).join('. ').slice(0, 500),
        image: imageFile ?? undefined,
      });
      navigate('/recommendations/jewelry', { state: { plan: result } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'BUDGET_TOO_LOW' && err.details?.minimum) {
          setError(`Budget too low. Minimum required: ${fmt(err.details.minimum)}`);
        } else if (err.code === 'IMAGE_INVALID') {
          setImageError(err.message || 'Invalid or corrupted image. Please upload a valid JPG, PNG, or WebP image.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
        <LoadingSkeleton
          title="Planning your budget..."
          subtitle={imageFile ? "Analyzing outfit colors and styling hallmarked jewelry..." : "Curating certified jewelry pieces within your budget..."}
          variant="plan"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <Sparkles className="w-4 h-4" /><span>Jewelry & Accessories Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Fine Jewelry Budget Planner</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Curate BIS-hallmarked fine jewelry within your exact price ceiling.</p>
      </div>

      {error && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-8">
        {/* Budget */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-blue-600" /><span>Budget Limit</span>
            </h2>
            <span className="text-xs text-slate-400">Total jewelry ceiling</span>
          </div>
          <div className="space-y-2">
            <label htmlFor="jewelry-total-budget" className="block text-xs font-semibold text-slate-700">
              Total Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 text-lg font-bold">₹</span>
              <input
                id="jewelry-total-budget"
                type="number"
                min="1000"
                max="10000000"
                step="1000"
                required
                value={totalBudget}
                onChange={e => setTotalBudget(Number(e.target.value))}
                className="w-full min-h-[44px] pl-9 pr-4 py-2.5 text-base font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 tabular-nums"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span>Quick Presets:</span>
              {[20000, 50000, 100000, 200000, 500000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTotalBudget(val)}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer tabular-nums flex items-center ${
                    totalBudget === val ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt(val)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Occasion & Style */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" /><span>Occasion & Styling</span>
            </h2>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="jewelry-occasion-select" className="block text-xs font-semibold text-slate-700">
              Occasion
            </label>
            <select
              id="jewelry-occasion-select"
              value={occasion}
              onChange={e => setOccasion(e.target.value)}
              className="w-full min-h-[44px] px-3 py-2.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-blue-600"
            >
              {OCCASIONS.map(occ => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Styling Direction</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {STYLES.map(sty => (
                <button
                  key={sty}
                  type="button"
                  onClick={() => setStyle(sty)}
                  className={`min-h-[44px] p-2.5 rounded-xl border text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-center ${
                    style === sty ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {sty}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5 pt-1">
            <label htmlFor="jewelry-preferences" className="block text-xs font-semibold text-slate-700">
              Additional Preferences
            </label>
            <textarea
              id="jewelry-preferences"
              rows={3}
              value={preferences}
              onChange={e => setPreferences(e.target.value.slice(0, 500))}
              placeholder="Metal type, stone, colours, etc."
              className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 text-slate-800 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400">{500 - preferences.length} characters remaining</p>
          </div>
        </div>

        {/* Image upload */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-600" /><span>Upload Outfit Image</span>
            </h2>
            <span className="text-xs text-slate-400">Optional · AI colour matching</span>
          </div>

          {imageError && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-xs"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{imageError}</span>
            </div>
          )}

          {imagePreview ? (
            <div className="p-4 border border-blue-200 bg-blue-50/40 rounded-xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={imagePreview}
                  alt="Outfit preview"
                  onError={() => setImageError('Failed to display preview. Please upload a valid image.')}
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200 shadow-2xs"
                />
                <div>
                  <span className="text-xs font-bold text-slate-900 block">✓ {imageFile?.name}</span>
                  <span className="text-[11px] text-slate-500">{(imageFile!.size / 1024).toFixed(0)} KB · AI will analyse colours & style</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="min-h-[44px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-white border border-rose-200 hover:bg-rose-50 rounded-lg cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Remove
              </button>
            </div>
          ) : (
            <div className="relative border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-400 transition-colors bg-slate-50/50">
              <label htmlFor="outfit-image-upload" className="sr-only">Upload Outfit Image</label>
              <input
                id="outfit-image-upload"
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto text-blue-600 shadow-2xs">
                  <Upload className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-900 block">Drag & drop or click to upload</span>
                <p className="text-[11px] text-slate-400">JPG, PNG or WEBP · max {MAX_MB} MB</p>
              </div>
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span>Generate Jewelry Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

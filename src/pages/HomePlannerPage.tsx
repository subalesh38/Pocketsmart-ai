import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  ArrowRight,
  Plus,
  Trash2,
  Check,
  Lamp,
  Fan,
  Armchair,
  Utensils,
  AlertCircle,
  IndianRupee,
} from 'lucide-react';
import { planApi } from '../api/plan';
import { ApiError } from '../api/client';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

interface CustomFixtureItem {
  id: string;
  name: string;
  quantity: number;
}

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const fmt = (n: number) => INR.format(n);

export const HomePlannerPage: React.FC = () => {
  const navigate = useNavigate();

  const [totalBudget, setTotalBudget] = useState(50000);
  const [numLights, setNumLights] = useState(6);
  const [numCeilingFans, setNumCeilingFans] = useState(2);
  const [numFurniturePieces, setNumFurniturePieces] = useState(4);
  const [numDiningTables, setNumDiningTables] = useState(1);
  const [customItems, setCustomItems] = useState<CustomFixtureItem[]>([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const availableRooms = ['Living Room', 'Kitchen', 'Bedroom'];
  const [selectedRooms, setSelectedRooms] = useState<string[]>(['Living Room', 'Bedroom']);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      if (selectedRooms.length > 1) setSelectedRooms(selectedRooms.filter(r => r !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  const handleAddCustomItem = () => {
    if (!newItemName.trim()) return;
    setCustomItems([...customItems, { id: String(Date.now()), name: newItemName.trim(), quantity: newItemQty }]);
    setNewItemName('');
    setNewItemQty(1);
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
      const rooms = selectedRooms.join(', ');
      const customNotes = customItems.map(i => `${i.name} x${i.quantity}`).join(', ');
      const notes = [additionalNotes, customNotes ? `Custom items: ${customNotes}` : ''].filter(Boolean).join('. ').slice(0, 500);

      const result = await planApi.createHomePlan({
        total_budget: totalBudget,
        rooms,
        lights: numLights,
        fans: numCeilingFans,
        furniture: numFurniturePieces,
        dining_tables: numDiningTables,
        notes,
      });
      navigate('/recommendations/home', { state: { plan: result } });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'BUDGET_TOO_LOW' && err.details?.minimum) {
          setError(`Budget too low. Minimum required: ${fmt(err.details.minimum)}`);
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
          subtitle="Analyzing your home specifications and selecting verified recommendations..."
          variant="plan"
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      <div className="pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 mb-1">
          <Home className="w-4 h-4" />
          <span>Home Interior Suite</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Home Interior Budget Planner
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Create a customized budget plan for your dream home interior.
        </p>
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
        {/* SECTION 1: Budget Details */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-blue-600" />
              <span>Section 1: Budget Details</span>
            </h2>
            <span className="text-xs text-slate-400">Total expenditure limit</span>
          </div>

          <div className="space-y-2">
            <label htmlFor="home-total-budget" className="block text-xs font-semibold text-slate-700">
              Total Budget (₹)
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400 text-xl font-bold">₹</span>
              <input
                id="home-total-budget"
                type="number"
                min="1000"
                max="10000000"
                step="1000"
                required
                value={totalBudget}
                onChange={e => setTotalBudget(Number(e.target.value))}
                placeholder="50000"
                className="w-full min-h-[44px] pl-10 pr-4 py-3 text-xl font-bold text-slate-900 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 tabular-nums"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-500">
              <span>Quick Presets:</span>
              {[25000, 50000, 100000, 200000, 350000].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setTotalBudget(val)}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer tabular-nums flex items-center ${
                    totalBudget === val
                      ? 'bg-blue-50 text-blue-700 border-blue-300 font-bold'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {fmt(val)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 2: Fixtures & Furniture */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Armchair className="w-4 h-4 text-blue-600" />
              <span>Section 2: Fixtures & Furniture</span>
            </h2>
            <span className="text-xs text-slate-400">Editable item counts (0–50)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: 'home-lights', label: 'Number of Lights', sub: 'LEDs, spots & ambient', icon: <Lamp className="w-4 h-4" />, color: 'bg-amber-50 text-amber-600', val: numLights, set: setNumLights, max: 50 },
              { id: 'home-fans', label: 'Number of Ceiling Fans', sub: 'Living & bedrooms', icon: <Fan className="w-4 h-4" />, color: 'bg-sky-50 text-sky-600', val: numCeilingFans, set: setNumCeilingFans, max: 50 },
              { id: 'home-furniture', label: 'Number of Furniture Pieces', sub: 'Sofas, beds, chairs, tables', icon: <Armchair className="w-4 h-4" />, color: 'bg-blue-50 text-blue-600', val: numFurniturePieces, set: setNumFurniturePieces, max: 50 },
              { id: 'home-dining', label: 'Number of Dining Tables', sub: '4-seater or 6-seater sets', icon: <Utensils className="w-4 h-4" />, color: 'bg-emerald-50 text-emerald-600', val: numDiningTables, set: setNumDiningTables, max: 50 },
            ].map(({ id, label, sub, icon, color, val, set, max }) => (
              <div key={id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center`}>{icon}</div>
                  <div>
                    <label htmlFor={id} className="text-xs font-bold text-slate-900 block cursor-pointer">
                      {label}
                    </label>
                    <span className="text-[11px] text-slate-500">{sub}</span>
                  </div>
                </div>
                <input
                  id={id}
                  type="number"
                  min="0"
                  max={max}
                  value={val}
                  onChange={e => set(Math.max(0, Math.min(max, Number(e.target.value))))}
                  className="w-16 min-h-[44px] px-2.5 py-1.5 text-center text-sm font-bold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-3">
            <label htmlFor="home-custom-item-name" className="text-xs font-bold text-slate-700 block">
              Add Custom Items:
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                id="home-custom-item-name"
                type="text"
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder="e.g. Coffee Table, TV Unit, Shoe Rack"
                className="flex-1 min-h-[44px] text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
              />
              <div className="flex items-center gap-2">
                <label htmlFor="home-custom-item-qty" className="text-xs text-slate-400">Qty:</label>
                <input
                  id="home-custom-item-qty"
                  type="number"
                  min="1"
                  max="20"
                  value={newItemQty}
                  onChange={e => setNewItemQty(Math.max(1, Number(e.target.value)))}
                  className="w-14 min-h-[44px] text-xs px-2 py-2 bg-white border border-slate-200 rounded-lg text-center"
                />
                <button
                  type="button"
                  onClick={handleAddCustomItem}
                  className="min-h-[44px] px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {customItems.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {customItems.map(item => (
                  <span key={item.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-800 font-medium">
                    <span>{item.name} ×{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => setCustomItems(customItems.filter(i => i.id !== item.id))}
                      className="text-blue-500 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: Rooms Covered */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              <span>Section 3: Rooms Covered</span>
            </h2>
            <span className="text-xs text-slate-400">Select active target zones</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {availableRooms.map(room => {
              const isSelected = selectedRooms.includes(room);
              return (
                <button
                  key={room}
                  type="button"
                  onClick={() => toggleRoom(room)}
                  className={`min-h-[44px] p-3 rounded-xl border text-xs font-semibold text-center transition-colors cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{room}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: Additional Notes */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
          <label htmlFor="home-additional-notes" className="block text-xs font-bold text-slate-900 uppercase tracking-wide">
            Section 4: Style & Notes (Optional)
          </label>
          <textarea
            id="home-additional-notes"
            rows={3}
            value={additionalNotes}
            onChange={e => setAdditionalNotes(e.target.value.slice(0, 500))}
            placeholder="Any specific requirements or preferences..."
            className="w-full text-xs p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-800 leading-relaxed"
          />
          <p className="text-[11px] text-slate-400">Max 500 characters · {500 - additionalNotes.length} remaining</p>
        </div>

        {/* Submit */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[44px] inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-blue-600"
          >
            <span>Generate Recommendations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

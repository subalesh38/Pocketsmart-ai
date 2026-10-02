import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home,
  PartyPopper,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingDown,
  Percent,
  Sliders,
  Star,
  Layers,
  ChevronRight,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  // Interactive mini budget simulator
  const [simBudget, setSimBudget] = useState(75000);
  const [simCategory, setSimCategory] = useState<'party' | 'home' | 'jewelry'>('party');

  const getSimBreakdown = () => {
    if (simCategory === 'party') {
      return [
        { name: 'Catering & Beverages', pct: 42, amount: Math.round(simBudget * 0.42) },
        { name: 'Decoration & Lighting', pct: 20, amount: Math.round(simBudget * 0.20) },
        { name: 'Entertainment & Music', pct: 16, amount: Math.round(simBudget * 0.16) },
        { name: 'Venue Rental', pct: 12, amount: Math.round(simBudget * 0.12) },
        { name: 'Contingency Buffer', pct: 10, amount: Math.round(simBudget * 0.10) },
      ];
    } else if (simCategory === 'home') {
      return [
        { name: 'Furniture (Living & Bed)', pct: 45, amount: Math.round(simBudget * 0.45) },
        { name: 'Lighting & Fixtures', pct: 22, amount: Math.round(simBudget * 0.22) },
        { name: 'Ceiling Fans & Ventilation', pct: 16, amount: Math.round(simBudget * 0.16) },
        { name: 'Decor Accents', pct: 10, amount: Math.round(simBudget * 0.10) },
        { name: 'Installation Reserve', pct: 7, amount: Math.round(simBudget * 0.07) },
      ];
    } else {
      return [
        { name: 'Necklace / Statement Choker', pct: 45, amount: Math.round(simBudget * 0.45) },
        { name: 'Earrings / Jhumkis', pct: 24, amount: Math.round(simBudget * 0.24) },
        { name: 'Kadas & Bangles', pct: 20, amount: Math.round(simBudget * 0.20) },
        { name: 'Rings & Accents', pct: 11, amount: Math.round(simBudget * 0.11) },
      ];
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const testimonials = [
    {
      quote:
        'PocketSmart allocated our ₹1.5L apartment interior budget so accurately. The lighting and ceiling fan recommendations stayed ₹12,000 below our ceiling!',
      name: 'Aditya Verma',
      role: 'Home Owner',
      city: 'Bengaluru',
    },
    {
      quote:
        'Planning our daughter’s 10th birthday party with 60 guests felt overwhelming until PocketSmart budgeted catering per-plate and left a safe contingency buffer.',
      name: 'Pooja Sundaram',
      role: 'Parent',
      city: 'Chennai',
    },
    {
      quote:
        'The outfit photo upload detected my emerald saree tones and matched hallmarked gold Kundan jewelry that perfectly complemented my look within ₹80,000.',
      name: 'Meera Kulkarni',
      role: 'Fashion Enthusiast',
      city: 'Mumbai',
    },
  ];

  return (
    <div className="space-y-20 py-8 sm:py-14">
      {/* 1. HERO SECTION (Section 5) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-md border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>PocketSmart AI · Spend smarter. Plan better.</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                AI-Powered Budget Planning <br />
                <span className="text-blue-600">for Everyday Needs</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                PocketSmart helps you make smarter financial decisions across <strong>home interiors</strong>, <strong>parties</strong>, and <strong>fine jewelry</strong>. Input your budget, specify your preferences, and let AI allocate categories and find verified recommendations that fit.
              </p>
            </div>

            {/* Primary & Secondary Buttons (Section 5) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm transition-all cursor-pointer"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#features"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span>Learn More</span>
              </a>
            </div>

            {/* Trust markers */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-slate-500 border-t border-slate-200/80">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
                <span>Zero Overspend Protection</span>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingDown className="w-4 h-4 text-emerald-600" />
                <span>Save 12-18% on average</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Percent className="w-4 h-4 text-blue-600" />
                <span>Multi-platform verified matches</span>
              </div>
            </div>
          </div>

          {/* Hero Visual Card: PocketSmart Planning Dashboard Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Smart AI Allocation
                  </div>
                  <div className="text-xl font-bold text-slate-900 tabular-nums">
                    ₹75,000 Budget
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-blue-700 font-semibold flex items-center gap-1 justify-end">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>Party Planner</span>
                  </div>
                  <div className="text-xs text-slate-500">50 Guests · Rooftop</div>
                </div>
              </div>

              {/* Category Breakdown Table */}
              <div className="divide-y divide-slate-100 my-4 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Catering</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹32,000</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Decoration</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹15,000</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Entertainment</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹12,000</span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Venue</span>
                  <span className="font-bold text-slate-900 tabular-nums">₹9,000</span>
                </div>
                <div className="py-2.5 flex items-center justify-between bg-blue-50/60 px-2 rounded">
                  <span className="text-blue-800 font-semibold">Contingency Buffer</span>
                  <span className="font-bold text-blue-800 tabular-nums">₹7,000</span>
                </div>
              </div>

              {/* Progress and status */}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-emerald-700">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>96% within budget</span>
                  </span>
                  <span className="tabular-nums">₹68,000 Allocated</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '91%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLANNER CARDS (Section 5) */}
      <section id="planners" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Choose Your Budget Planner
          </h2>
          <p className="text-sm text-slate-600">
            Select a tailored planning domain to configure item quantities, rooms, or occasions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Home Interior Budget Planner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
                <Home className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Home Interior Budget Planner</h3>
                <p className="text-sm text-slate-600 mt-1 font-normal">
                  Plan your home interior and allocate your budget across furniture, lighting, fans, decor, and dining.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Rooms: Living Room, Kitchen, Bedroom</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Fixtures: Lights, Ceiling Fans, Furniture Pieces</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Sources: Amazon, Flipkart, IKEA, Pepperfry</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/planner/home"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <span>Plan Home Interior</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 2: Party Budget Planner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
                <PartyPopper className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Party Budget Planner</h3>
                <p className="text-sm text-slate-600 mt-1 font-normal">
                  Plan your event with smart budget allocation for catering, decoration, entertainment, and venue.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Headcount per-plate calculator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Catering, Decor & Entertainment breakdowns</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Contingency reserve for unexpected costs</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/planner/party"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <span>Plan Party & Events</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Card 3: Jewelry Budget Planner */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200/60">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Jewelry Budget Planner</h3>
                <p className="text-sm text-slate-600 mt-1 font-normal">
                  Find jewelry recommendations for your occasion based on your budget, style, and outfit colors.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Occasion: Wedding, Party, Festival, Formal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Optional outfit photo color extraction</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  <span>Bracelets, Rings, Necklaces, Earrings, Watches</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Link
                to="/planner/jewelry"
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
              >
                <span>Find Jewelry</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION (Anchor #features) */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Intelligent Planning, Not Blind Shopping
          </h2>
          <p className="text-sm text-slate-600">
            PocketSmart AI is engineered around the sequence: <strong>Plan → Allocate → Recommend → Compare → Select</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">01. PLAN</span>
            <h4 className="text-base font-semibold text-slate-900">Set True Upper Limits</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Input your total target budget in ₹ INR, room counts, guest numbers, and design preferences.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">02. ALLOCATE</span>
            <h4 className="text-base font-semibold text-slate-900">AI Category Math</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The engine balances categories and locks an unspent contingency buffer for hidden costs.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">03. RECOMMEND</span>
            <h4 className="text-base font-semibold text-slate-900">Multi-Platform Sourcing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Receive verified options on Amazon, Flipkart, IKEA, Myntra, and Tanishq with exact prices and AI match scores.
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl p-5 space-y-2 shadow-2xs">
            <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">04. COMPARE</span>
            <h4 className="text-base font-semibold text-slate-900">Zero-Overspend Check</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Compare items side-by-side and continuously verify that your selections remain safely within budget.
            </p>
          </div>
        </div>
      </section>

      {/* 4. LIVE ALLOCATION SIMULATOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs text-blue-400 font-semibold bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/60">
                <Sliders className="w-3.5 h-3.5" />
                <span>AI Budget Allocation Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Try the Allocation Simulator
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Adjust your total budget and switch planner domains to watch PocketSmart dynamically
                distribute funds and protect emergency buffer cash.
              </p>

              {/* Domain switcher */}
              <div className="flex items-center gap-2 p-1 bg-slate-800 rounded-xl border border-slate-700 max-w-sm">
                <button
                  onClick={() => setSimCategory('party')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    simCategory === 'party' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Party
                </button>
                <button
                  onClick={() => setSimCategory('home')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    simCategory === 'home' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setSimCategory('jewelry')}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                    simCategory === 'jewelry' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Jewelry
                </button>
              </div>

              {/* Slider */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Simulated Budget:</span>
                  <span className="font-bold text-white tabular-nums text-sm">
                    {formatINR(simBudget)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20000"
                  max="500000"
                  step="5000"
                  value={simBudget}
                  onChange={e => setSimBudget(Number(e.target.value))}
                  className="w-full accent-blue-500 h-2 bg-slate-800 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>₹20,000</span>
                  <span>₹2,50,000</span>
                  <span>₹5,00,000</span>
                </div>
              </div>
            </div>

            {/* Generated Simulator Output Card */}
            <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 backdrop-blur-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700 text-xs">
                <span className="text-slate-300 font-medium">Calculated Category Distribution</span>
                <span className="text-emerald-400 font-semibold">100% Calculated Fit</span>
              </div>

              <div className="space-y-3.5 my-4">
                {getSimBreakdown().map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-200">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 tabular-nums">{item.pct}%</span>
                        <span className="font-bold text-white tabular-nums">
                          {formatINR(item.amount)}
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-700/80 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${item.pct * 2}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-700 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to test with your actual preferences?
                </span>
                <Link
                  to={`/planner/${simCategory}`}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors cursor-pointer"
                >
                  Plan with this Budget →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION (Section 6) */}
      <section id="testimonials" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 uppercase tracking-wider mb-1">
            <span>Sample Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Trusted by Smart Planners
          </h2>
          <p className="text-sm text-slate-600">
            Sample testimonials illustrating how homeowners, parents, and shoppers make zero-overspend budget plans with PocketSmart.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between shadow-2xs hover:border-slate-300 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <span className="text-[11px] font-semibold text-blue-700">{t.role}</span>
                </div>
                <span className="text-slate-400">{t.city}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. CALL TO ACTION & FOOTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-600 rounded-2xl p-8 sm:p-12 text-white text-center space-y-5 shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
            Start Planning Your Next Budget in Seconds
          </h2>
          <p className="text-sm text-blue-100 max-w-xl mx-auto">
            Choose Home, Party, or Jewelry and let PocketSmart AI turn your upper ceiling into an organized plan.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-blue-900 bg-white hover:bg-blue-50 rounded-xl transition-colors shadow-sm"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-blue-700" />
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 pt-8 pb-14 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900">PocketSmart AI</span>
            <span>·</span>
            <span>Spend smarter. Plan better.</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
            <Link to="/planner/home" className="hover:text-blue-600">Home Planner</Link>
            <Link to="/planner/party" className="hover:text-blue-600">Party Planner</Link>
            <Link to="/planner/jewelry" className="hover:text-blue-600">Jewelry Planner</Link>
            <Link to="/history" className="hover:text-blue-600">History</Link>
          </div>
          <p>© 2026 PocketSmart AI. AI-powered budget planning and recommendations.</p>
        </div>
      </footer>
    </div>
  );
};

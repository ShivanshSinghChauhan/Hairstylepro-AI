
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from './services/geminiService';
import { NICHES } from './constants';
import { UserState, GenerationResult, Gender, Niche, SubNiche } from './types';
import HairstyleCard from './components/HairstyleCard';
import EditorOverlay from './components/EditorOverlay';

type View = 'tool' | 'pricing' | 'about' | 'login' | 'signup';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('tool');
  const [state, setState] = useState<UserState>({
    originalImage: null,
    gender: 'female',
    results: [],
    isGenerating: false,
    selectedResultId: null,
  });

  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [selectedSubNiche, setSelectedSubNiche] = useState<SubNiche | null>(null);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (previewIndex === null) return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') setPreviewIndex(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex, state.results.length]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({ 
          ...prev, 
          originalImage: event.target?.result as string,
          results: [],
          selectedResultId: null 
        }));
        setSelectedNiche(null);
        setSelectedSubNiche(null);
        setErrorMessage(null);
        setCurrentView('tool');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenderChange = (gender: Gender) => {
    setState(prev => ({ ...prev, gender }));
  };

  const generateStyles = async () => {
    if (!state.originalImage || !selectedSubNiche) return;
    setState(prev => ({ ...prev, isGenerating: true, results: [] }));
    setErrorMessage(null);
    setGenerationProgress(0);
    const results: GenerationResult[] = [];

    try {
      // Generate exactly 5 variations
      for (let i = 0; i < 5; i++) {
        try {
          const imageUrl = await geminiService.generateHairstyle(
            state.originalImage!, 
            selectedSubNiche.name, 
            state.gender,
            i + 1
          );
          if (imageUrl) {
            const result: GenerationResult = { id: `${selectedSubNiche.id}-${i}`, imageUrl, styleName: `${selectedSubNiche.name} (Var ${i+1})` };
            results.push(result);
            setState(prev => ({ ...prev, results: [...results] }));
          }
        } catch (e: any) {
          if (e.message?.includes("429")) setErrorMessage("API Quota reached. Try again in a minute.");
        }
        setGenerationProgress(Math.round(((i + 1) / 5) * 100));
        if (i < 4) await new Promise(r => setTimeout(r, 1000));
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An error occurred.");
    }
    setState(prev => ({ ...prev, isGenerating: false }));
  };

  const handleNext = () => {
    if (previewIndex !== null) setPreviewIndex((previewIndex + 1) % state.results.length);
  };

  const handlePrev = () => {
    if (previewIndex !== null) setPreviewIndex((previewIndex - 1 + state.results.length) % state.results.length);
  };

  const Navbar = () => (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-gray-100 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('tool')}>
        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-fuchsia-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
        <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600">HairstyleAI<span className="text-gray-900">Pro</span></span>
      </div>
      
      <div className="hidden md:flex items-center space-x-8">
        <button onClick={() => setCurrentView('tool')} className={`text-sm font-bold transition-colors ${currentView === 'tool' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Studio</button>
        <button onClick={() => setCurrentView('pricing')} className={`text-sm font-bold transition-colors ${currentView === 'pricing' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>Pricing</button>
        <button onClick={() => setCurrentView('about')} className={`text-sm font-bold transition-colors ${currentView === 'about' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-900'}`}>About</button>
      </div>

      <div className="flex items-center space-x-3">
        <button onClick={() => setCurrentView('login')} className="text-sm font-bold text-gray-700 hover:text-indigo-600 px-4 py-2 transition-colors">Login</button>
        <button onClick={() => setCurrentView('signup')} className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-bold text-sm hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-200">Get Started</button>
      </div>
    </nav>
  );

  const ToolView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Left Panel: Profile & Image */}
      <div className="lg:col-span-4 space-y-8">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <h2 className="text-2xl font-black mb-2 tracking-tight">Step 1: Base Image</h2>
          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            Upload a clear portrait to begin your transformation.
          </p>

          <div className="mb-8">
            <label className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-3 block">Identify As</label>
            <div className="flex p-1 bg-gray-100 rounded-2xl">
              <button 
                onClick={() => handleGenderChange('female')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${state.gender === 'female' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              > Female </button>
              <button 
                onClick={() => handleGenderChange('male')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${state.gender === 'male' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500'}`}
              > Male </button>
            </div>
          </div>
          
          {!state.originalImage ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="bg-gray-50 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-gray-200 hover:border-indigo-400 group transition-all"
            >
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
              </div>
              <span className="text-indigo-600 font-bold">Import Portrait</span>
              <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group border-4 border-white">
                <img src={state.originalImage} alt="Original" className="w-full aspect-[3/4] object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                   <button onClick={() => fileInputRef.current?.click()} className="bg-white text-gray-900 px-6 py-2 rounded-full font-black text-xs uppercase">New Image</button>
                </div>
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 bg-gray-50 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-100 transition-all">Swap Photo</button>
            </div>
          )}
        </div>

        {/* Branding Credit */}
        <div className="bg-indigo-900 text-white rounded-3xl p-6 shadow-2xl overflow-hidden relative">
          <div className="relative z-10">
            <h4 className="font-black text-xl mb-2 italic">Neural Stylist Pro</h4>
            <p className="text-indigo-200 text-xs leading-relaxed opacity-80">
              Powered by proprietary AI architectures developed by <strong>Shivansh Singh Chauhan</strong>. 
              Our system analyzes 40+ facial landmarks for 100% realistic texture mapping.
            </p>
          </div>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* Right Panel: Selection & Generation */}
      <div className="lg:col-span-8 space-y-8">
        {!state.originalImage ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-gray-100 shadow-xl opacity-60">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
             </div>
             <p className="text-gray-400 font-black uppercase tracking-widest text-sm">Waiting for Photo Upload</p>
          </div>
        ) : state.isGenerating ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-xl text-center px-12">
            <div className="relative w-32 h-32 mb-8">
              <div className="absolute inset-0 border-8 border-gray-50 rounded-full"></div>
              <div className="absolute inset-0 border-8 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-xl font-black text-indigo-600">{generationProgress}%</div>
            </div>
            <h3 className="text-3xl font-black mb-4">Projecting 5 Unique Takes...</h3>
            <p className="text-gray-500 font-medium max-w-md">Our AI is generating five distinct variations of "{selectedSubNiche?.name}" to find your perfect look.</p>
          </div>
        ) : state.results.length > 0 ? (
          <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
              <div>
                <button onClick={() => setState(prev => ({...prev, results: []}))} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center mb-1">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
                  Back to Selection
                </button>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">{selectedSubNiche?.name} <span className="text-gray-400 font-medium">Showcase</span></h3>
              </div>
              <button 
                onClick={() => setIsEditorOpen(true)}
                disabled={!state.selectedResultId}
                className="px-6 py-3 bg-white border-2 border-indigo-600 text-indigo-600 disabled:opacity-30 rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-lg"
              >
                AI Retouch
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.results.map((result, index) => (
                <HairstyleCard 
                  key={result.id} 
                  result={result} 
                  isSelected={state.selectedResultId === result.id}
                  onSelect={(id) => setState(prev => ({ ...prev, selectedResultId: id }))}
                  onPreview={() => setPreviewIndex(index)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                Step 2: {selectedNiche ? `Choose ${selectedNiche.name} Style` : 'Select a Styling Niche'}
                {selectedNiche && (
                  <button onClick={() => {setSelectedNiche(null); setSelectedSubNiche(null);}} className="ml-auto text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Reset Niche</button>
                )}
              </h3>

              {!selectedNiche ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {NICHES.map(niche => (
                    <button
                      key={niche.id}
                      onClick={() => setSelectedNiche(niche)}
                      className="group flex items-center p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-indigo-400 hover:bg-white transition-all text-left"
                    >
                      <span className="text-4xl mr-4 group-hover:scale-110 transition-transform">{niche.icon}</span>
                      <div>
                        <h4 className="font-black text-gray-900">{niche.name}</h4>
                        <p className="text-xs text-gray-400 font-medium">Explore {niche.subNiches.length} premium styles</p>
                      </div>
                      <svg className="w-5 h-5 ml-auto text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                   <div className="mb-2 p-4 bg-indigo-50 rounded-xl flex items-center space-x-3">
                      <span className="text-2xl">{selectedNiche.icon}</span>
                      <p className="text-sm font-bold text-indigo-800">Viewing curated sub-niches for <strong>{selectedNiche.name}</strong></p>
                   </div>
                   {selectedNiche.subNiches.map(sub => (
                    <button
                      key={sub.id}
                      onClick={() => setSelectedSubNiche(sub)}
                      className={`flex flex-col p-6 rounded-2xl border transition-all text-left ${selectedSubNiche?.id === sub.id ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl scale-[1.02]' : 'bg-gray-50 border-gray-100 hover:border-indigo-300 text-gray-900'}`}
                    >
                      <h4 className="font-black text-lg">{sub.name}</h4>
                      <p className={`text-xs mt-1 ${selectedSubNiche?.id === sub.id ? 'text-indigo-100' : 'text-gray-400'}`}>{sub.description}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedSubNiche && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                   <button 
                    onClick={generateStyles} 
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:scale-[1.02] transition-all flex items-center justify-center space-x-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.337a4 4 0 01-2.58.344l-2.087-.417a2 2 0 01-1.428-1.428l-.417-2.087a4 4 0 01.344-2.58l.337-.675a6 6 0 00.517-3.86l-.477-2.387a2 2 0 00-1.022-1.547l-1.618-.809a2 2 0 00-2.618.894L1.31 4.31a2 2 0 00.894 2.618l1.618.809a2 2 0 011.022 1.547l.477 2.387a6 6 0 01-.517 3.86l-.337.675a4 4 0 00-.344 2.58l.417 2.087a2 2 0 001.428 1.428l2.087.417a4 4 0 002.58-.344l.675-.337a6 6 0 013.86-.517l2.387.477a2 2 0 001.022-.547l.809-1.618a2 2 0 00-.894-2.618l-1.618-.809z"/></svg>
                    <span>Generate 5 Variations</span>
                  </button>
                  <p className="text-center text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mt-4">High-fidelity texture mapping engaged</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const AuthView = ({ type }: { type: 'login' | 'signup' }) => (
    <div className="min-h-[80vh] flex items-center justify-center px-4 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
        <div className="p-8 bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white text-center">
          <h2 className="text-3xl font-black mb-2">{type === 'login' ? 'Welcome Back' : 'Join the Revolution'}</h2>
          <p className="opacity-80 text-sm">{type === 'login' ? 'Continue your styling journey' : 'Start your 7-day free trial today'}</p>
        </div>
        <div className="p-8 space-y-4">
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
            <input type="email" placeholder="name@example.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
            <input type="password" placeholder="••••••••" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
          </div>
          <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl shadow-indigo-100 hover:shadow-indigo-200 hover:bg-indigo-700 transition-all">
            {type === 'login' ? 'Sign In' : 'Create Account'}
          </button>
          <div className="text-center pt-4">
            <span className="text-gray-400 text-sm">{type === 'login' ? "Don't have an account?" : "Already have an account?"}</span>
            <button onClick={() => setCurrentView(type === 'login' ? 'signup' : 'login')} className="ml-2 text-indigo-600 font-bold text-sm hover:underline">
              {type === 'login' ? 'Sign Up' : 'Log In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PricingView = () => (
    <div className="py-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-center mb-16 px-6">
        <h2 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">Simple, Transparent Pricing</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Choose the plan that fits your creative needs. Unlock 4K exports and unlimited AI edits.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto px-6">
        {[
          { name: 'Starter', price: '0', features: ['5 Variations/Session', 'Standard Quality', 'Basic Styles'], cta: 'Current Plan', popular: false },
          { name: 'Pro', price: '19', features: ['Unlimited Sessions', 'HD Texture Mapping', 'All Styling Niches', 'Priority Processing'], cta: 'Upgrade to Pro', popular: true },
          { name: 'Studio', price: '49', features: ['API Access', 'Batch Processing', 'Advanced Custom Prompts', '24/7 Support'], cta: 'Contact Sales', popular: false }
        ].map((plan) => (
          <div key={plan.name} className={`relative p-8 rounded-3xl border ${plan.popular ? 'border-indigo-600 bg-indigo-50/30' : 'border-gray-200 bg-white'} shadow-xl transition-transform hover:scale-105 duration-300`}>
            {plan.popular && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Most Popular</span>}
            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
            <div className="flex items-baseline mb-6">
              <span className="text-4xl font-black">$</span>
              <span className="text-6xl font-black tracking-tighter">{plan.price}</span>
              <span className="text-gray-500 font-bold ml-2">/mo</span>
            </div>
            <ul className="space-y-4 mb-8">
              {plan.features.map(f => (
                <li key={f} className="flex items-center text-sm font-medium text-gray-600">
                  <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button className={`w-full py-4 rounded-2xl font-bold transition-all ${plan.popular ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-gray-100 text-gray-900 hover:bg-gray-200'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const AboutView = () => (
    <div className="max-w-4xl mx-auto py-20 px-6 animate-in fade-in duration-1000">
      <div className="bg-white rounded-3xl p-12 shadow-2xl border border-gray-100">
        <div className="flex flex-col md:flex-row items-center gap-12 mb-12">
          <div className="w-48 h-48 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-6xl text-white font-black shadow-2xl">
            SC
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-4">Behind the Vision</h1>
            <p className="text-xl text-indigo-600 font-bold mb-4">Engineered by Shivansh Singh Chauhan</p>
            <p className="text-gray-500 leading-relaxed text-lg">
              HairstyleAI Pro was born from a passion for bridging the gap between cutting-edge Generative AI and practical everyday utility. Using Google's Gemini 2.5 Flash architecture, we've developed a system that doesn't just overlay hair, but understands facial topology and texture mapping at a professional salon level.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 border-t border-gray-100">
          <div className="text-center">
            <h4 className="font-black text-indigo-600 text-3xl mb-1">1M+</h4>
            <p className="text-sm font-bold text-gray-400 uppercase">Styles Generated</p>
          </div>
          <div className="text-center border-x border-gray-100">
            <h4 className="font-black text-indigo-600 text-3xl mb-1">15+</h4>
            <p className="text-sm font-bold text-gray-400 uppercase">Core Algorithms</p>
          </div>
          <div className="text-center">
            <h4 className="font-black text-indigo-600 text-3xl mb-1">99%</h4>
            <p className="text-sm font-bold text-gray-400 uppercase">Realism Rating</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafbff]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        {errorMessage && (
          <div className="mb-8 p-4 bg-red-600 text-white rounded-2xl flex items-center justify-between shadow-xl animate-bounce">
            <span className="text-sm font-bold">{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        )}

        {currentView === 'tool' && <ToolView />}
        {currentView === 'pricing' && <PricingView />}
        {currentView === 'about' && <AboutView />}
        {currentView === 'login' && <AuthView type="login" />}
        {currentView === 'signup' && <AuthView type="signup" />}
      </main>

      {/* Sequential Preview Modal */}
      {previewIndex !== null && state.results[previewIndex] && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/95 backdrop-blur-xl p-4 transition-all" onClick={() => setPreviewIndex(null)}>
          <button className="absolute top-8 right-8 z-[110] text-white hover:scale-110 transition-transform" onClick={() => setPreviewIndex(null)}>
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute inset-y-0 left-0 flex items-center px-4 md:px-12">
             <button onClick={(e) => { e.stopPropagation(); handlePrev(); }} className="bg-white/10 hover:bg-white/20 p-6 rounded-full text-white backdrop-blur-md transition-all">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
             </button>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center px-4 md:px-12">
             <button onClick={(e) => { e.stopPropagation(); handleNext(); }} className="bg-white/10 hover:bg-white/20 p-6 rounded-full text-white backdrop-blur-md transition-all">
               <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>
          <div className="relative max-w-4xl w-full h-full flex flex-col items-center justify-center p-8">
            <img key={state.results[previewIndex].imageUrl} src={state.results[previewIndex].imageUrl} className="max-w-full max-h-[75vh] object-contain rounded-3xl shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300" onClick={(e) => e.stopPropagation()} />
            <div className="mt-8 text-center" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-4xl font-black text-white mb-2">{state.results[previewIndex].styleName}</h2>
              <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">Variation {previewIndex + 1} of {state.results.length}</span>
            </div>
          </div>
        </div>
      )}

      {isEditorOpen && <EditorOverlay onEdit={async (p) => {
          setIsEditing(true);
          const res = await geminiService.editImage(state.results.find(r => r.id === state.selectedResultId)!.imageUrl, p);
          if (res) setState(prev => ({...prev, results: prev.results.map(r => r.id === state.selectedResultId ? {...r, imageUrl: res} : r)}));
          setIsEditing(false);
          setIsEditorOpen(false);
      }} isEditing={isEditing} onClose={() => setIsEditorOpen(false)} />}
      
      <footer className="mt-20 border-t border-gray-100 py-12 text-center bg-white">
        <p className="text-gray-400 font-bold text-sm tracking-wide">© 2025 HairstyleAI Pro • Created with ❤️ by <span className="text-indigo-600">Shivansh Singh Chauhan</span></p>
      </footer>
    </div>
  );
};

export default App;

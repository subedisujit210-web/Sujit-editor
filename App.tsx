
import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import ProcessingStatus from './components/ProcessingStatus';
import { processWithAI, generateWriting } from './services/geminiService';
import { EditState, ProcessingStep } from './types';

type AppMode = 'generate' | 'edit';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('edit');
  const [state, setState] = useState<EditState>({
    status: 'idle',
    originalImage: null,
    editedImage: null
  });

  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [isTextLoading, setIsTextLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  
  const [enhancements, setEnhancements] = useState({
    removeChains: true,
    smile: false,
    removeBackground: false,
    himalayanBackground: false,
    maleMakeup: false,
    femaleMakeup: false,
    // Epic Styles
    cyberpunk: false,
    royal: false,
    anime: false,
    oilPainting: false,
    ethereal: false,
  });

  const [steps, setSteps] = useState<ProcessingStep[]>([]);

  const editSteps: ProcessingStep[] = [
    { id: '1', label: 'Analyzing visual context...', isComplete: false },
    { id: '2', label: 'Segmenting subjects...', isComplete: false },
    { id: '3', label: 'Processing background layers...', isComplete: false },
    { id: '4', label: 'Applying neural filters...', isComplete: false },
    { id: '5', label: 'Optimizing final render...', isComplete: false },
  ];

  const generateSteps: ProcessingStep[] = [
    { id: '1', label: 'Interpreting writing prompt...', isComplete: false },
    { id: '2', label: 'Sampling latent space...', isComplete: false },
    { id: '3', label: 'Synthesizing textures...', isComplete: false },
    { id: '4', label: 'Enhancing resolution...', isComplete: false },
    { id: '5', label: 'Finalizing composition...', isComplete: false },
  ];

  const handleImageSelect = (base64: string, type: string) => {
    setState({ status: 'idle', originalImage: base64, editedImage: null });
    setMimeType(type);
    setShowOriginal(false);
    setGeneratedText('');
  };

  const handleProcess = async () => {
    const isEdit = mode === 'edit';
    if (isEdit && !state.originalImage) return;
    if (!isEdit && !customPrompt.trim()) return;

    setState(prev => ({ ...prev, status: 'processing', error: undefined }));
    setSteps(isEdit ? editSteps : generateSteps);

    const progressInterval = setInterval(() => {
      setSteps(currentSteps => {
        const nextIncompleteIndex = currentSteps.findIndex(s => !s.isComplete);
        if (nextIncompleteIndex !== -1 && nextIncompleteIndex < currentSteps.length - 1) {
          const newSteps = [...currentSteps];
          newSteps[nextIncompleteIndex] = { ...newSteps[nextIncompleteIndex], isComplete: true };
          return newSteps;
        }
        return currentSteps;
      });
    }, 1200);

    try {
      let finalPrompt = "";
      
      if (isEdit) {
        const tasks = [];
        // Core Enhancements
        if (enhancements.removeBackground) tasks.push("Remove background and replace with studio focus.");
        if (enhancements.himalayanBackground) tasks.push("Replace background with high-resolution Himalayan mountains.");
        if (enhancements.smile) tasks.push("Adjust the subject to have a warm, natural, and realistic smile.");
        if (enhancements.maleMakeup) tasks.push("Apply professional male grooming: clean skin, groomed eyebrows, and light cinematic contouring.");
        if (enhancements.femaleMakeup) tasks.push("Apply elegant female makeup: smooth skin, soft eyeliner, and natural lipstick.");
        
        // Epic Styles
        if (enhancements.cyberpunk) tasks.push("Transform the scene into a cyberpunk aesthetic with neon lights, futuristic textures, and blue/purple color grading.");
        if (enhancements.royal) tasks.push("Drape the subject in royal attire, converting the photo into a regal historical portrait with golden ornaments.");
        if (enhancements.anime) tasks.push("Reimagine the photo as a high-quality studio Ghibli-style anime illustration.");
        if (enhancements.oilPainting) tasks.push("Convert the photo into a classical museum-grade oil painting with visible brushstrokes and rich textures.");
        if (enhancements.ethereal) tasks.push("Add a magical, ethereal glow to the photo with soft focus, light blooms, and a dreamy atmosphere.");

        if (customPrompt) tasks.push(customPrompt);
        finalPrompt = `Edit this portrait professionally: ${tasks.join(". ")}. Ensure high detail and consistent lighting.`;
      } else {
        finalPrompt = `Generate a high-quality professional masterpiece photograph: ${customPrompt}`;
      }
      
      const result = await processWithAI(
        finalPrompt, 
        isEdit ? state.originalImage! : undefined, 
        isEdit ? mimeType : undefined
      );
      
      clearInterval(progressInterval);
      setSteps(prev => prev.map(s => ({ ...s, isComplete: true })));
      
      setState({
        status: 'success',
        originalImage: state.originalImage,
        editedImage: result
      });
    } catch (err: any) {
      clearInterval(progressInterval);
      setState(prev => ({ ...prev, status: 'error', error: err.message }));
    }
  };

  const handleGenerateWriting = async (type: 'caption' | 'story') => {
    setIsTextLoading(true);
    try {
      const prompt = type === 'caption' ? "Write a cool Instagram caption for this photo." : "Write a short creative story about this person or scene.";
      const text = await generateWriting(prompt, state.editedImage || state.originalImage || undefined, mimeType);
      setGeneratedText(text);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTextLoading(false);
    }
  };

  const downloadResult = () => {
    if (!state.editedImage) return;
    const link = document.createElement('a');
    link.href = state.editedImage;
    link.download = `sujit_${mode}_result.png`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] py-8 px-4 sm:px-6 lg:px-8 font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl ring-4 ring-white">
              <span className="text-white text-4xl font-black italic">S</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">Sujit <span className="text-blue-600">Editor</span></h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                ULTIMATE NEURAL ENGINE 5.0
              </p>
            </div>
          </div>
          
          <div className="bg-white p-1.5 rounded-3xl shadow-md border border-slate-200 flex gap-1">
            <button 
              onClick={() => { setMode('edit'); setState({status: 'idle', originalImage: null, editedImage: null}); setGeneratedText(''); }}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${mode === 'edit' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              PRO EDITOR
            </button>
            <button 
              onClick={() => { setMode('generate'); setState({status: 'idle', originalImage: null, editedImage: null}); setGeneratedText(''); }}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all ${mode === 'generate' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              NEURAL CREATOR
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Area */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-200 min-h-[600px] flex flex-col relative overflow-hidden group">
              {state.status === 'success' && state.editedImage ? (
                <div className="flex-1 flex flex-col space-y-6 animate-fade-in">
                  <div className="relative flex-1 rounded-[2rem] overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group">
                    <img src={showOriginal ? state.originalImage! : state.editedImage} alt="Result" className="w-full h-full object-contain" />
                    <div className="absolute top-8 left-8">
                       <div className="bg-white/95 backdrop-blur-xl px-6 py-3 rounded-2xl text-xs font-black shadow-xl border border-slate-200 uppercase tracking-widest text-slate-900">
                        {showOriginal ? 'ORIGINAL SOURCE' : 'AI MASTERPIECE'}
                      </div>
                    </div>
                    {mode === 'edit' && state.originalImage && (
                      <button 
                        onMouseDown={() => setShowOriginal(true)} 
                        onMouseUp={() => setShowOriginal(false)} 
                        onTouchStart={() => setShowOriginal(true)}
                        onTouchEnd={() => setShowOriginal(false)}
                        className="absolute bottom-8 right-8 bg-slate-900 text-white px-8 py-4 rounded-2xl text-sm font-black shadow-2xl transition-all active:scale-90 select-none hover:bg-black flex items-center gap-3 border border-white/20"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        HOLD TO COMPARE
                      </button>
                    )}
                  </div>

                  {generatedText && (
                    <div className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] animate-fade-in relative shadow-sm">
                      <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-indigo-600 rounded-full"></span>
                        Neural Storyteller
                      </h4>
                      <p className="text-base font-medium text-slate-800 leading-relaxed italic">"{generatedText}"</p>
                      <button onClick={() => setGeneratedText('')} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 transition-colors">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button onClick={downloadResult} className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-6 px-10 rounded-3xl shadow-2xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-4 text-xl tracking-tight">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      DOWNLOAD MASTERPIECE
                    </button>
                    <button onClick={() => setState({ status: 'idle', originalImage: null, editedImage: null })} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black py-6 px-8 rounded-3xl transition-all active:scale-[0.98]">
                      NEW PROJECT
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col h-full">
                  {mode === 'edit' ? (
                    <ImageUploader onImageSelect={handleImageSelect} currentImage={state.originalImage} disabled={state.status === 'processing'} />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-8 bg-slate-50/50 rounded-[2rem] border-4 border-dashed border-slate-200">
                       <div className="w-24 h-24 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 animate-bounce">
                          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                       </div>
                       <div className="text-center max-w-md">
                          <h2 className="text-3xl font-black text-slate-900 mb-4">Neural Creator</h2>
                          <p className="text-slate-500 font-bold text-lg leading-snug">Describe your vision using our Neural Writing System to generate high-end photography from scratch.</p>
                       </div>
                    </div>
                  )}
                  
                  {((mode === 'edit' && state.originalImage) || (mode === 'generate')) && state.status !== 'processing' && (
                    <div className="mt-auto pt-8 flex flex-col items-center gap-6 animate-fade-in w-full">
                      {/* Writing System Input */}
                      <div className="w-full bg-white border-2 border-slate-200 rounded-[2.5rem] p-1.5 overflow-hidden focus-within:ring-8 focus-within:ring-blue-100 transition-all shadow-2xl">
                        <textarea 
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          placeholder={mode === 'edit' ? "Neural Commands: 'Add a crown', 'Change shirt color'..." : "Describe the photo: 'A futuristic city', 'Portrait of an astronaut'..."}
                          className="w-full bg-transparent p-6 text-slate-900 placeholder-slate-400 font-black text-lg resize-none focus:outline-none min-h-[140px]"
                        />
                        <div className="bg-slate-50 rounded-[2rem] p-4 flex justify-between items-center border-t border-slate-100">
                           <div className="flex items-center gap-3 ml-2">
                             <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm animate-pulse"></div>
                             <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Neural System Active</span>
                           </div>
                           <button onClick={handleProcess} className="bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-[1.5rem] font-black text-sm shadow-2xl active:scale-95 transition-all flex items-center gap-2">
                             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                             {mode === 'edit' ? 'PROCESS MASTERPIECE' : 'SYNTHESIZE PHOTO'}
                           </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {state.status === 'processing' ? (
              <ProcessingStatus steps={steps} />
            ) : (
              <div className="space-y-6">
                {/* Image Config Card */}
                <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-slate-200 sticky top-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight mb-8 flex items-center gap-3">
                    <span className="w-3 h-8 bg-blue-600 rounded-full"></span>
                    {mode === 'edit' ? 'PRO CONFIG' : 'ENGINE PARAMS'}
                  </h3>
                  
                  {mode === 'edit' ? (
                    <div className="space-y-4">
                      <div className="grid gap-3">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-1">Epic Style Conversions</p>
                         <div className="grid grid-cols-2 gap-2">
                            <EpicStyleButton label="CYBERPUNK" active={enhancements.cyberpunk} onClick={() => setEnhancements(e => ({...e, cyberpunk: !e.cyberpunk}))} icon="🌃" />
                            <EpicStyleButton label="ROYAL" active={enhancements.royal} onClick={() => setEnhancements(e => ({...e, royal: !e.royal}))} icon="👑" />
                            <EpicStyleButton label="ANIME" active={enhancements.anime} onClick={() => setEnhancements(e => ({...e, anime: !e.anime}))} icon="🎋" />
                            <EpicStyleButton label="OIL PAINT" active={enhancements.oilPainting} onClick={() => setEnhancements(e => ({...e, oilPainting: !e.oilPainting}))} icon="🎨" />
                         </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-4">Enhancements</p>
                        <div className="space-y-2">
                          <OptionToggle label="Himalayan BG" desc="Mountain Textures" icon="🏔️" checked={enhancements.himalayanBackground} onChange={(v) => setEnhancements(e => ({...e, himalayanBackground: v, removeBackground: false}))} />
                          <OptionToggle label="Studio BG" desc="Subject Extraction" icon="👤" checked={enhancements.removeBackground} onChange={(v) => setEnhancements(e => ({...e, removeBackground: v, himalayanBackground: false}))} />
                          <OptionToggle label="Magic Smile" desc="Natural Refinement" icon="😊" checked={enhancements.smile} onChange={(v) => setEnhancements(e => ({...e, smile: v}))} />
                          <OptionToggle label="Ethereal Glow" desc="Dreamy Atmos" icon="✨" checked={enhancements.ethereal} onChange={(v) => setEnhancements(e => ({...e, ethereal: v}))} />
                        </div>
                      </div>

                      <div className="pt-4 grid grid-cols-2 gap-2">
                        <button onClick={() => setEnhancements(e => ({...e, maleMakeup: !e.maleMakeup, femaleMakeup: false}))} className={`p-4 rounded-2xl border-2 font-black text-[10px] transition-all tracking-wider ${enhancements.maleMakeup ? 'border-blue-500 bg-blue-50 text-blue-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>MALE MAKEUP</button>
                        <button onClick={() => setEnhancements(e => ({...e, femaleMakeup: !e.femaleMakeup, maleMakeup: false}))} className={`p-4 rounded-2xl border-2 font-black text-[10px] transition-all tracking-wider ${enhancements.femaleMakeup ? 'border-pink-500 bg-pink-50 text-pink-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>FEMALE MAKEUP</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 shadow-inner">
                        <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest mb-4">Output Preset</p>
                        <div className="grid grid-cols-1 gap-2">
                           <button className="bg-slate-900 text-white p-4 rounded-2xl text-[11px] font-black shadow-xl tracking-widest">MASTER PHOTOGRAPHY</button>
                           <button className="bg-white border border-slate-200 text-slate-400 p-4 rounded-2xl text-[11px] font-black opacity-50 tracking-widest">DIGITAL CONCEPT ART</button>
                           <button className="bg-white border border-slate-200 text-slate-400 p-4 rounded-2xl text-[11px] font-black opacity-50 tracking-widest">CINEMATIC FRAME</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Writing System Card */}
                  {(state.status === 'success' || state.originalImage) && (
                    <div className="mt-8 bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl text-white border border-slate-800 animate-fade-in">
                      <h3 className="text-sm font-black tracking-widest mb-4 flex items-center gap-2 text-blue-400">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        WRITING SYSTEM
                      </h3>
                      
                      <div className="space-y-2">
                        <button 
                          disabled={isTextLoading}
                          onClick={() => handleGenerateWriting('caption')}
                          className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl font-black text-[10px] text-left transition-all flex items-center justify-between group border border-white/5"
                        >
                          GENERATE SOCIAL CAPTION
                          <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </button>
                        <button 
                          disabled={isTextLoading}
                          onClick={() => handleGenerateWriting('story')}
                          className="w-full bg-white/5 hover:bg-white/10 p-4 rounded-2xl font-black text-[10px] text-left transition-all flex items-center justify-between group border border-white/5"
                        >
                          NEURAL SHORT STORY
                          <svg className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                        </button>
                      </div>

                      {isTextLoading && (
                        <div className="mt-4 flex items-center gap-3 text-[10px] font-black text-blue-400 animate-pulse">
                          <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          PROCESSING SCRIPT...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>
    </div>
  );
};

const EpicStyleButton: React.FC<{label: string, active: boolean, onClick: () => void, icon: string}> = ({ label, active, onClick, icon }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all gap-2 ${active ? 'border-blue-600 bg-blue-50 text-blue-900 shadow-lg scale-105' : 'border-slate-100 bg-slate-50 text-slate-400 hover:border-slate-200'}`}
  >
    <span className="text-2xl">{icon}</span>
    <span className="text-[9px] font-black tracking-tighter uppercase">{label}</span>
  </button>
);

const OptionToggle: React.FC<{label: string, desc: string, icon: string, checked: boolean, onChange: (v: boolean) => void}> = ({ label, desc, icon, checked, onChange }) => (
  <label className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer ${checked ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${checked ? 'bg-blue-600 shadow-lg text-white' : 'bg-white shadow-sm border border-slate-100'}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-black text-slate-900 leading-none mb-1">{label}</p>
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter opacity-70">{desc}</p>
      </div>
    </div>
    <div className="relative inline-flex items-center">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
    </div>
  </label>
);

export default App;

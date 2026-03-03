"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Layers, Smartphone, ScanLine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function BrickLabStudio() {
  const [images, setImages] = useState<(string | null)[]>(Array(5).fill(null));
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleUpload = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...images];
      updated[index] = reader.result as string;
      setImages(updated);
      setActiveIndex(index);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    const updated = [...images];
    updated[index] = null;
    setImages(updated);
    if (index === activeIndex && index > 0) setActiveIndex(index - 1);
  };

  const triggerUpload = (index: number) => {
    fileInputRefs.current[index]?.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 flex flex-col items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Decor - Subtle Logo Colors */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#f57c00]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#004b87]/5 rounded-full blur-[120px]" />
      </div>

      {/* Top Navigation / Logo Area */}
      <div className="absolute top-6 left-8 z-50 flex flex-col items-start">
        <img src="/logobackgroundremoved.png" alt="BrickLab Studio" className="h-30" />
      </div>

      <div className="max-w-6xl w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
        
        {/* Left Column: The "Workbench" (Main Preview) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-3">
                <Layers className="text-[#004b87]" /> Workspace
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                {images.filter(Boolean).length} / 5 Assets Ready
              </p>
            </div>
            <Button variant="outline" className="border-slate-300 hover:bg-slate-100 text-slate-600">
              Clear All
            </Button>
          </motion.div>

          {/* Main Stage */}
          <div className="relative aspect-video bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xl shadow-slate-200/50 group">
            <AnimatePresence mode="wait">
              {images[activeIndex] ? (
                <motion.div
                  key={activeIndex}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="w-full h-full relative"
                >
                  <img
                    src={images[activeIndex]!}
                    alt="Active Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* "Scanning" Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#f57c00]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none animate-scan" />
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-[#004b87] border border-slate-200 shadow-sm">
                    IMG_SOURCE_0{activeIndex + 1}.RAW
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center border border-dashed border-slate-300">
                    <ScanLine className="w-8 h-8 opacity-50 text-[#004b87]" />
                  </div>
                  <p>Select a slot below to begin</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filmstrip / Thumbnails */}
          <div className="grid grid-cols-5 gap-4">
            {images.map((img, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => img ? setActiveIndex(i) : triggerUpload(i)}
                className={`
                  relative aspect-square rounded-xl cursor-pointer overflow-hidden border-2 transition-all duration-300 bg-white
                  ${activeIndex === i ? "border-[#f57c00] shadow-[0_0_15px_rgba(245,124,0,0.2)]" : "border-slate-200 hover:border-slate-400"}
                `}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={(el) => { fileInputRefs.current[i] = el }}
                  onChange={(e) => handleUpload(i, e.target.files?.[0] || null)}
                />

                {img ? (
                  <>
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => removeImage(e, i)}
                      className="absolute top-1 right-1 bg-white/80 hover:bg-red-50 text-red-600 p-1 rounded-md transition-colors shadow-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {activeIndex === i && (
                      <div className="absolute inset-0 ring-4 ring-inset ring-[#f57c00]/20 rounded-xl" />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#004b87] transition-colors" />
                    <span className="text-[10px] uppercase font-bold text-slate-400 group-hover:text-slate-600">Add</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Controls & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/50 p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Configuration</h3>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-600 font-medium">
                  <span>Rendering Detail</span>
                  <span className="text-[#004b87]">High</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-gradient-to-r from-[#f57c00] to-orange-400" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-600 font-medium">Detail Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Low', 'Medium', 'High'].map((size, index) => (
                    <button 
                      key={size} 
                      className={`py-2 rounded-lg text-sm font-medium transition ${index === 1 ? 'bg-[#004b87] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-[#004b87] mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-[#004b87]">Mobile Ready Output</p>
                    <p className="text-xs text-blue-800/70 leading-relaxed">
                      Your generated brick layout will include a digital guide optimized for mobile viewing during assembly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full py-7 text-lg bg-[#f57c00] hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 mt-6 group font-bold"
              disabled={images.every(img => img === null)}
            >
              Generate Layout
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
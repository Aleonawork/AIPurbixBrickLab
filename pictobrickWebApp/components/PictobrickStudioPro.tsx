"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Layers, Smartphone, ScanLine, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function PictobrickStudioPro() {
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
      setActiveIndex(index); // Auto-switch to the new image
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
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Background Decor - Subtle Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-6xl w-full z-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The "Workbench" (Main Preview) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                <Layers className="text-indigo-400" /> Brick Architect
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Workspace • {images.filter(Boolean).length} / 5 Assets Ready
              </p>
            </div>
            <Button variant="outline" className="border-slate-700 hover:bg-slate-800 text-slate-300">
              Clear All
            </Button>
          </motion.div>

          {/* Main Stage */}
          <div className="relative aspect-video bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl group">
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
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none animate-scan" />
                  <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono text-indigo-300 border border-indigo-500/30">
                    IMG_SOURCE_0{activeIndex + 1}.RAW
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full h-full flex flex-col items-center justify-center text-slate-500 gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center border border-dashed border-slate-700">
                    <ScanLine className="w-8 h-8 opacity-50" />
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
                  relative aspect-square rounded-xl cursor-pointer overflow-hidden border-2 transition-all duration-300
                  ${activeIndex === i ? "border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "border-slate-800 hover:border-slate-600 bg-slate-900/40"}
                `}
              >
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  ref={(el) => { fileInputRefs.current[i] = el }} // fix: do not return anything
                  onChange={(e) => handleUpload(i, e.target.files?.[0] || null)}
                />

                {img ? (
                  <>
                    <img src={img} className="w-full h-full object-cover" />
                    <button
                      onClick={(e) => removeImage(e, i)}
                      className="absolute top-1 right-1 bg-black/50 hover:bg-red-500/80 p-1 rounded-md transition-colors"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                    {activeIndex === i && (
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-xl" />
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1 group">
                    <Upload className="w-5 h-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-[10px] uppercase font-bold text-slate-600 group-hover:text-slate-400">Add</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Column: Controls & Stats */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="bg-slate-900/60 backdrop-blur-xl border-slate-800 p-6 flex-1 flex flex-col">
            <h3 className="text-lg font-semibold text-white mb-6">Configuration</h3>
            
            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Complexity</span>
                  <span>High</span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full bg-indigo-500" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Target Size</label>
                <div className="grid grid-cols-3 gap-2">
                  {['S', 'M', 'L'].map((size) => (
                    <button key={size} className="bg-slate-800 hover:bg-slate-700 text-slate-300 py-2 rounded-lg text-sm transition">
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-indigo-100">Mobile Ready</p>
                    <p className="text-xs text-indigo-300/70">
                      Your brick layout will be optimized for viewing on all devices.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Button 
              className="w-full py-7 text-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-900/20 mt-6 group"
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
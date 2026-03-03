"use client";

import { motion, Variants } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon, SlidersHorizontal, Box, Layers, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function HomePage() {


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-hidden flex flex-col">
      
      {/* Background Decor - Matched to Studio Page */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#f57c00]/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-[#004b87]/5 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 w-full px-6 py-6 lg:px-12 flex items-center justify-between">
        <Link href="/">
          <img src="/logobackgroundremoved.png" alt="BrickLab Studio" className="h-30 w-auto object-contain" />
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-bold text-slate-600">
          <Link href="#how-it-works" className="hover:text-[#004b87] transition-colors">How it Works</Link>
          <Link href="#gallery" className="hover:text-[#004b87] transition-colors">Gallery</Link>
        </div>
        <Link href="/pro">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-[#004b87] px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm hover:bg-slate-50 hover:shadow-md">
            Launch Workspace <ArrowUpRight className="w-4 h-4" />
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 pt-12 pb-24">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Text */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="space-y-8"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-[#004b87] text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Professional Grade
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-black tracking-tight text-slate-800 leading-[1.1]">
              Your memories. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f57c00] to-orange-400">
                Built brick by brick.
              </span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
              Upload your favorite photos and our advanced rendering engine instantly generates a custom, buildable mosaic art kit.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex items-center gap-4 pt-4">
              <Link href="/pro">
                <button className="flex items-center gap-2 bg-[#f57c00] hover:bg-orange-600 text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-lg shadow-orange-500/20 hover:-translate-y-1">
                  Open Studio <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
            </motion.div>
          </motion.div>

          {/* Hero Mockup (Matches the Studio Card Style) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, rotate: 1 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <Card className="bg-white/80 backdrop-blur-xl border border-slate-200 shadow-2xl shadow-slate-200/60 p-4 rounded-3xl aspect-[4/3] flex flex-col">
              {/* Fake App Header */}
              <div className="flex items-center gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
                <div className="w-3 h-3 rounded-full bg-slate-200" />
              </div>
              {/* Fake App Stage */}
              <div className="flex-1 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden relative group">
                <div className="absolute inset-0 bg-[linear-gradient(45deg,#004b870a_25%,transparent_25%,transparent_75%,#004b870a_75%,#004b870a),linear-gradient(45deg,#004b870a_25%,transparent_25%,transparent_75%,#004b870a_75%,#004b870a)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />
                <div className="text-center relative z-10">
                  <Box className="w-12 h-12 text-[#004b87] opacity-50 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Live Rendering</p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </main>

      {/* Features Section - Using Studio Cards */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto w-full px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Step 1 */}
          <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004b87] mb-6">
              <ImageIcon className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">1. Upload Photo</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Choose any high-quality photo from your device. Our engine supports ultra-high resolutions for maximum detail.
            </p>
          </Card>

          {/* Step 2 */}
          <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#f57c00] mb-6">
              <SlidersHorizontal className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">2. Configure Details</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Use the workspace to crop, adjust complexity, and select your ideal canvas dimensions and color palettes.
            </p>
          </Card>

          {/* Step 3 */}
          <Card className="bg-white border-slate-200 shadow-xl shadow-slate-200/40 p-8 rounded-3xl hover:-translate-y-1 transition-transform duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004b87] mb-6">
              <Box className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-3">3. Build Your Kit</h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              We ship you a premium kit with perfectly color-matched bricks and a mobile-optimized instruction guide.
            </p>
          </Card>

        </div>
      </section>

    </div>
  );
}
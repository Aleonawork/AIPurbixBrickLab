"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ImagePlus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function Generation() {
  const [images, setImages] = useState<(string | null)[]>(Array(5).fill(null));

  const handleUpload = (index: number, file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...images];
      updated[index] = reader.result as string;
      setImages(updated);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (index: number) => {
    const updated = [...images];
    updated[index] = null;
    setImages(updated);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            Brick Generation
          </h1>
          <p className="text-slate-400 text-lg">
            Please wait as we generate your build!
          </p>
          <img src="Doug" alt="Doug the dog" />
        </motion.div>

        {/* Upload Grid */}
        
      </div>
    </div>
  );
}

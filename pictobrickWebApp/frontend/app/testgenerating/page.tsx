"use client";

import { useState } from "react";
import Script from 'next/script';
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

                <h1 className="text-4xl font-bold tracking-tight">3D Viewer Testing</h1>

                <p className="text-slate-400 text-lg">
                    Feel free to test any camera settings in the js file before attempting to view them here!
                </p>

                {/* This is where the 3D scene will inject itself */}
                <div
                    id="container3D"
                    className="w-full max-w-2xl h-[400px] mx-auto rounded-xl border border-slate-800 bg-black/20"
                ></div>

                {/* The Script Loader */}
                <Script
                    src="/viewer.js"
                    type="module"
                    strategy="afterInteractive"
                />

            </div>
        </div>
    );
}

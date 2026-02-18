"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ImagePlus, X } from "lucide-react";
import { motion } from "framer-motion";

export default function PictobrickUploadTemplate() {
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
            Pictobrick Upload Studio
          </h1>
          <p className="text-slate-400 text-lg">
            Upload up to 5 photos to generate your custom brick design
          </p>
        </motion.div>

        {/* Upload Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {images.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="bg-slate-900/60 backdrop-blur border border-slate-800 rounded-2xl shadow-xl">
                <CardContent className="p-4">
                  <div className="relative aspect-square rounded-xl overflow-hidden border border-slate-700 flex items-center justify-center">
                    {img ? (
                      <>
                        <img
                          src={img}
                          alt={`Upload ${i + 1}`}
                          className="w-full h-full object-cover"
                        />

                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-2 text-slate-400 hover:text-white transition">
                        <ImagePlus className="w-10 h-10" />
                        <span className="text-sm">Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) =>
                            handleUpload(i, e.target.files?.[0] || null)
                          }
                        />
                      </label>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Action Area */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col items-center gap-4 pt-4"
        >
          <Button className="px-10 py-6 text-lg rounded-2xl shadow-2xl">
            <Upload className="mr-2 h-5 w-5" />
            Generate Brick Layout
          </Button>

          <p className="text-sm text-slate-500">
            Supported formats: JPG, PNG, WEBP
          </p>
        </motion.div>
      </div>
    </div>
  );
}

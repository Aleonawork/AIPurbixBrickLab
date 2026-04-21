"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, ArrowRight, ArrowLeft as Prev,
  Check, Download, Grid2x2, ImageIcon, Plus, Trash2, BookOpen, Box,
} from "lucide-react";

const MosaicViewer3D = dynamic(() => import("@/components/MosaicViewer3D"), { ssr: false });
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  renderMosaic,
  renderMosaicWithHighlight,
  renderBuildStep,
} from "@/lib/mosaic";
import { deleteBuild, getBuild, sizeLabel, type StoredBuild } from "@/lib/builds";

export default function BuildResultPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [build, setBuild] = useState<StoredBuild | null | undefined>(undefined);
  const [showOriginal, setShowOriginal] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [hoveredHex, setHoveredHex] = useState<string | null>(null);
  const [buildMode, setBuildMode] = useState(false);
  const [buildStep, setBuildStep] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!id) return;
    setBuild(getBuild(id) ?? null);
  }, [id]);

  useEffect(() => {
    if (!build || !canvasRef.current || showOriginal || show3D) return;
    const longSide = Math.max(build.gridW, build.gridH);
    const brickPx = Math.max(8, Math.min(22, Math.floor(900 / longSide)));
    const { indices, gridW, gridH, parts } = build;

    if (buildMode) {
      renderBuildStep(canvasRef.current, indices, gridW, gridH, parts.map(p => p.hex), buildStep, { brickPx });
    } else if (hoveredHex) {
      renderMosaicWithHighlight(canvasRef.current, indices, gridW, gridH, hoveredHex, { brickPx });
    } else {
      renderMosaic(canvasRef.current, indices, gridW, gridH, { brickPx });
    }
  }, [build, showOriginal, show3D, hoveredHex, buildMode, buildStep]);

  const stepHexes = build?.parts.map(p => p.hex) ?? [];
  const totalSteps = stepHexes.length;
  const currentStepPart = build?.parts[buildStep];

  const enterBuildMode = () => {
    setShowOriginal(false);
    setShow3D(false);
    setHoveredHex(null);
    setBuildStep(0);
    setBuildMode(true);
  };

  const exitBuildMode = () => {
    setBuildMode(false);
    setBuildStep(0);
  };

  const handleDelete = () => {
    if (!build) return;
    if (!window.confirm(`Delete "${build.title}"? This cannot be undone.`)) return;
    deleteBuild(build.id);
    router.push("/my-builds");
  };

  const handleDownload = () => {
    if (!canvasRef.current || !build) return;
    const url = canvasRef.current.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `${build.title.replace(/\s+/g, "_")}.png`;
    a.click();
  };

  if (build === undefined) {
    return <div className="max-w-7xl mx-auto px-6 py-12 text-slate-400">Loading build…</div>;
  }

  if (build === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Build not found</h1>
        <p className="text-slate-400">This build doesn&apos;t exist on this device. Builds are stored locally for this demo.</p>
        <Link href="/my-builds">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Back to My Builds</Button>
        </Link>
      </div>
    );
  }

  const totalBricks = build.indices.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/my-builds" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> My Builds
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">{build.title}</h1>
          <p className="text-sm text-slate-400">
            {build.gridW} × {build.gridH} bricks · {sizeLabel(build.gridW, build.gridH)} · {build.detail} detail · {totalBricks.toLocaleString()} pieces
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/create">
            <Button variant="outline" className="border-slate-700 text-slate-200">
              <Plus className="w-4 h-4 mr-2" /> New Build
            </Button>
          </Link>
          {build.sourceThumbDataUrl && !buildMode && (
            <Button variant="outline" onClick={() => { setShowOriginal(v => !v); setHoveredHex(null); }} className="border-slate-700 text-slate-200">
              {showOriginal ? <><Grid2x2 className="w-4 h-4 mr-2" /> Show Mosaic</> : <><ImageIcon className="w-4 h-4 mr-2" /> Show Original</>}
            </Button>
          )}
          {!buildMode && (
            <Button
              variant="outline"
              onClick={() => { setShow3D(v => !v); setShowOriginal(false); setHoveredHex(null); setBuildMode(false); }}
              className={`border-slate-700 text-slate-200 ${show3D ? "bg-slate-700" : ""}`}
            >
              <Box className="w-4 h-4 mr-2" /> {show3D ? "2D View" : "3D View"}
            </Button>
          )}
          {!buildMode ? (
            <Button onClick={enterBuildMode} className="bg-indigo-600 hover:bg-indigo-500 text-white">
              <BookOpen className="w-4 h-4 mr-2" /> Build Guide
            </Button>
          ) : (
            <Button variant="outline" onClick={exitBuildMode} className="border-slate-700 text-slate-200">
              Exit Guide
            </Button>
          )}
          <Button onClick={handleDownload} className="bg-[#f57c00] hover:bg-orange-600 text-white">
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
          <Button onClick={handleDelete} variant="outline" className="border-red-500/40 text-red-300 hover:bg-red-500/10">
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Canvas column */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Build mode step info bar */}
          {buildMode && currentStepPart && (
            <Card className="bg-slate-900/60 border-slate-700 p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-8 h-8 rounded-md border border-black/40 shrink-0 shadow-md"
                    style={{ backgroundColor: currentStepPart.hex }}
                  />
                  <div className="min-w-0">
                    <p className="text-white font-semibold truncate">{currentStepPart.name}</p>
                    <p className="text-slate-400 text-xs">{currentStepPart.count.toLocaleString()} bricks · Step {buildStep + 1} of {totalSteps}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBuildStep(s => Math.max(0, s - 1))}
                    disabled={buildStep === 0}
                    className="border-slate-700 text-slate-200 disabled:opacity-30"
                  >
                    <Prev className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBuildStep(s => Math.min(totalSteps - 1, s + 1))}
                    disabled={buildStep === totalSteps - 1}
                    className="border-slate-700 text-slate-200 disabled:opacity-30"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${((buildStep + 1) / totalSteps) * 100}%` }}
                />
              </div>
            </Card>
          )}

          <Card className="bg-slate-900/40 border-slate-800 p-4 overflow-hidden">
            {show3D ? (
              <div className="h-[520px] rounded-lg overflow-hidden">
                <MosaicViewer3D indices={build.indices} gridW={build.gridW} gridH={build.gridH} />
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <img
                  src={build.sourceThumbDataUrl ?? ""}
                  alt="Original photo"
                  className={`w-full h-auto rounded-lg shadow-2xl shadow-black/40 ${showOriginal && build.sourceThumbDataUrl && !buildMode ? "block" : "hidden"}`}
                />
                <canvas
                  ref={canvasRef}
                  className={`w-full h-auto rounded-lg shadow-2xl shadow-black/40 ${showOriginal && build.sourceThumbDataUrl && !buildMode ? "hidden" : "block"}`}
                />
              </div>
            )}
          </Card>
        </div>

        {/* Parts list column */}
        <Card className="lg:col-span-4 bg-slate-900/40 border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-1">Parts List</h2>
          <p className="text-xs text-slate-500 mb-4">
            {buildMode ? "Click a color to jump to that step." : "Hover a color to highlight it on the mosaic."}
          </p>
          <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto pr-1">
            {build.parts.map((row, i) => {
              const isCurrentStep = buildMode && i === buildStep;
              const isPlacedStep = buildMode && i < buildStep;
              return (
                <div
                  key={row.hex + row.name}
                  onMouseEnter={() => !buildMode && setHoveredHex(row.hex)}
                  onMouseLeave={() => !buildMode && setHoveredHex(null)}
                  onClick={() => buildMode && setBuildStep(i)}
                  className={`flex items-center justify-between py-2.5 rounded px-1 transition-colors
                    ${!buildMode ? "cursor-pointer hover:bg-slate-800/60" : "cursor-pointer"}
                    ${isCurrentStep ? "bg-indigo-500/15 ring-1 ring-indigo-500/40" : ""}
                    ${isPlacedStep ? "opacity-40" : ""}
                  `}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className="w-5 h-5 rounded border border-black/40 shrink-0"
                      style={{ backgroundColor: row.hex }}
                    />
                    <span className={`text-sm truncate ${isCurrentStep ? "text-white font-semibold" : "text-slate-200"}`}>
                      {row.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm font-mono text-slate-400">{row.count.toLocaleString()}</span>
                    {isPlacedStep && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
            <span className="text-slate-400">Total pieces</span>
            <span className="font-mono text-white">{totalBricks.toLocaleString()}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

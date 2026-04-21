"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Trash2, Plus, ImageIcon, Grid2x2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { renderMosaic } from "@/lib/mosaic";
import { deleteBuild, getBuild, sizeLabel, type StoredBuild } from "@/lib/builds";

export default function BuildResultPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const [build, setBuild] = useState<StoredBuild | null | undefined>(undefined);
  const [showOriginal, setShowOriginal] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!id) return;
    setBuild(getBuild(id) ?? null);
  }, [id]);

  useEffect(() => {
    if (!build || !canvasRef.current) return;
    const longSide = Math.max(build.gridW, build.gridH);
    const brickPx = Math.max(8, Math.min(22, Math.floor(900 / longSide)));
    renderMosaic(canvasRef.current, build.indices, build.gridW, build.gridH, {
      brickPx,
    });
  }, [build]);

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
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 text-slate-400">
        Loading build…
      </div>
    );
  }

  if (build === null) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center space-y-6">
        <h1 className="text-3xl font-bold text-white">Build not found</h1>
        <p className="text-slate-400">
          This build doesn&apos;t exist on this device. Builds are stored locally for
          this demo.
        </p>
        <Link href="/my-builds">
          <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">
            Back to My Builds
          </Button>
        </Link>
      </div>
    );
  }

  const totalBricks = build.indices.length;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            href="/my-builds"
            className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1"
          >
            <ArrowLeft className="w-4 h-4" /> My Builds
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {build.title}
          </h1>
          <p className="text-sm text-slate-400">
            {build.gridW} × {build.gridH} bricks · {sizeLabel(build.gridW, build.gridH)} ·{" "}
            {build.detail} detail · {totalBricks.toLocaleString()} pieces
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/create">
            <Button variant="outline" className="border-slate-700 text-slate-200">
              <Plus className="w-4 h-4 mr-2" /> New Build
            </Button>
          </Link>
          {build.sourceThumbDataUrl && (
            <Button
              variant="outline"
              onClick={() => setShowOriginal((v) => !v)}
              className="border-slate-700 text-slate-200"
            >
              {showOriginal ? (
                <><Grid2x2 className="w-4 h-4 mr-2" /> Show Mosaic</>
              ) : (
                <><ImageIcon className="w-4 h-4 mr-2" /> Show Original</>
              )}
            </Button>
          )}
          <Button
            onClick={handleDownload}
            className="bg-[#f57c00] hover:bg-orange-600 text-white"
          >
            <Download className="w-4 h-4 mr-2" /> Download PNG
          </Button>
          <Button
            onClick={handleDelete}
            variant="outline"
            className="border-red-500/40 text-red-300 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card className="lg:col-span-8 bg-slate-900/40 border-slate-800 p-4 overflow-auto">
          <div className="flex items-center justify-center">
            <img
              src={build.sourceThumbDataUrl ?? ""}
              alt="Original photo"
              className={`w-full h-auto rounded-lg shadow-2xl shadow-black/40 ${showOriginal && build.sourceThumbDataUrl ? "block" : "hidden"}`}
            />
            <canvas
              ref={canvasRef}
              className={`w-full h-auto rounded-lg shadow-2xl shadow-black/40 ${showOriginal && build.sourceThumbDataUrl ? "hidden" : "block"}`}
            />
          </div>
        </Card>

        <Card className="lg:col-span-4 bg-slate-900/40 border-slate-800 p-6">
          <h2 className="text-lg font-bold text-white mb-1">Parts List</h2>
          <p className="text-xs text-slate-500 mb-4">
            1×1 plates needed to build this mosaic.
          </p>
          <div className="divide-y divide-slate-800 max-h-[600px] overflow-y-auto pr-2">
            {build.parts.map((row) => (
              <div
                key={row.hex + row.name}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-5 h-5 rounded border border-black/40 shrink-0"
                    style={{ backgroundColor: row.hex }}
                  />
                  <span className="text-sm text-slate-200 truncate">
                    {row.name}
                  </span>
                </div>
                <span className="text-sm font-mono text-slate-400">
                  {row.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
            <span className="text-slate-400">Total pieces</span>
            <span className="font-mono text-white">
              {totalBricks.toLocaleString()}
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
}

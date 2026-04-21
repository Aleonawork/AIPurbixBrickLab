import type { DetailLevel, PartsRow } from "./mosaic";

export type StoredBuild = {
  id: string;
  title: string;
  createdAt: string;
  detail: DetailLevel;
  gridW: number;
  gridH: number;
  indices: number[];
  thumbDataUrl: string;
  sourceThumbDataUrl?: string;
  parts: PartsRow[];
};

const KEY = "pictobrick.builds.v1";

function safeRead(): StoredBuild[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredBuild[]) : [];
  } catch {
    return [];
  }
}

function safeWrite(builds: StoredBuild[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(builds));
  } catch {
    // Quota likely; drop oldest until it fits.
    const trimmed = [...builds];
    while (trimmed.length > 1) {
      trimmed.pop();
      try {
        window.localStorage.setItem(KEY, JSON.stringify(trimmed));
        return;
      } catch {
        // keep trimming
      }
    }
  }
}

export function listBuilds(): StoredBuild[] {
  return safeRead().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getBuild(id: string): StoredBuild | undefined {
  return safeRead().find((b) => b.id === id);
}

export function saveBuild(build: StoredBuild) {
  const all = safeRead();
  const next = [build, ...all.filter((b) => b.id !== build.id)];
  safeWrite(next);
}

export function deleteBuild(id: string) {
  const next = safeRead().filter((b) => b.id !== id);
  safeWrite(next);
}

export function renameBuild(id: string, title: string) {
  const all = safeRead();
  const next = all.map((b) => (b.id === id ? { ...b, title: title.trim() || b.title } : b));
  safeWrite(next);
}

export function generateId(): string {
  return `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function sizeLabel(gridW: number, gridH: number): "Small" | "Medium" | "Large" {
  const long = Math.max(gridW, gridH);
  if (long <= 50) return "Small";
  if (long <= 80) return "Medium";
  return "Large";
}

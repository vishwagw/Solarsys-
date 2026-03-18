"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Sun } from "lucide-react";

const SolarDashboard = dynamic(() => import("@/components/SolarDashboard"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full border-2 border-t-[#ffc107] border-[rgba(255,193,7,0.15)] animate-spin mx-auto mb-4" />
        <p className="text-[var(--text-secondary)] text-sm">Initializing Solar Design Studio...</p>
      </div>
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between px-6 py-3 border-b border-[rgba(255,193,7,0.1)] bg-[var(--bg-secondary)] z-50 flex-shrink-0">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#ffc107] flex items-center justify-center solar-glow">
            <Sun size={16} color="#050810" fill="#050810" />
          </div>
          <span className="text-lg font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Solar<span className="gradient-text">Sense</span>
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            <span className="status-dot active" />
            <span>PVGIS Connected</span>
          </div>
          <div className="h-4 w-px bg-[rgba(255,193,7,0.1)]" />
          <span className="text-xs text-[var(--text-muted)]">Design Studio</span>
        </div>
      </header>
      <SolarDashboard />
    </div>
  );
}

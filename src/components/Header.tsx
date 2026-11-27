"use client";

import Link from "next/link";
import { CheckCircle2, KeyRound } from "lucide-react";

interface HeaderProps {
  isPro?: boolean;
  onOpenUpgrade?: () => void;
}

export function Header({ isPro = false, onOpenUpgrade }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 bg-[#090D16]/95 backdrop-blur-xl border-b border-white/10 text-white">
      <div className="max-w-[1360px] mx-auto h-full px-4 sm:px-6 flex items-center justify-between gap-3">
        <Link
          href="/"
          className="flex items-center gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded"
        >
          <span
            aria-hidden="true"
            className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 flex items-center justify-center shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 6H11M5 8.5H11M5 11H8.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </span>
          <span className="flex items-baseline gap-1.5">
            <span className="font-display font-bold text-[15px] tracking-tight text-white">
              ScopeCraft
            </span>
            <span className="hidden sm:inline font-mono text-[10px] uppercase tracking-wider text-slate-400">
              by CraftApp
            </span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-300">
          <Link href="/#studio" className="hover:text-white transition-colors">
            Builder
          </Link>
          <Link href="/audit" className="hover:text-white transition-colors">
            Scope Check
          </Link>
          <Link href="/templates" className="hover:text-white transition-colors">
            30 Templates
          </Link>
          <Link href="/pricing" className="hover:text-white transition-colors">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Link
            href="/templates"
            className="md:hidden inline-flex items-center justify-center min-h-[44px] px-2 text-xs font-medium text-slate-300 hover:text-white"
          >
            Templates
          </Link>

          {isPro ? (
            <button
              type="button"
              onClick={onOpenUpgrade}
              className="inline-flex items-center gap-1.5 min-h-[44px] px-2.5 sm:px-3 rounded-lg bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-semibold tracking-wide whitespace-nowrap"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>PRO ACTIVE</span>
            </button>
          ) : (
            <>
              {onOpenUpgrade ? (
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg border border-white/15 bg-white/[0.05] text-xs font-medium text-slate-200 hover:bg-white/[0.1] hover:text-white transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Activate Key</span>
                </button>
              ) : (
                <Link
                  href="/pricing#activate"
                  className="hidden sm:inline-flex items-center gap-1.5 min-h-[44px] px-3 rounded-lg border border-white/15 bg-white/[0.05] text-xs font-medium text-slate-200 hover:bg-white/[0.1] hover:text-white transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Activate Key</span>
                </Link>
              )}

              {onOpenUpgrade ? (
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="inline-flex items-center justify-center min-h-[44px] px-3 sm:px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#031F16] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  Upgrade to Pro
                </button>
              ) : (
                <Link
                  href="/pricing"
                  className="inline-flex items-center justify-center min-h-[44px] px-3 sm:px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-[#031F16] text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  Upgrade to Pro
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
}

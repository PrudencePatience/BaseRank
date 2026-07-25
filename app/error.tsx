"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="min-h-screen px-5 py-8 text-[#f7f2e8]">
      <section className="mx-auto flex max-w-xl flex-col gap-5 rounded-lg border border-red-400/30 bg-[#20232b] p-6 shadow-glow">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-300" />
          <h1 className="text-xl font-semibold">Something went wrong.</h1>
        </div>
        <p className="text-sm text-red-100/80">{error.message || "The app hit an unexpected client error."}</p>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-4 py-3 text-sm font-bold text-[#17191f]"
          onClick={reset}
        >
          <RotateCcw className="h-4 w-4" />
          Try again
        </button>
      </section>
    </main>
  );
}

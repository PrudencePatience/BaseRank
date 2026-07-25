"use client";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-[#101114] px-5 py-8 text-[#f7f2e8]">
          <section className="mx-auto max-w-xl rounded-lg border border-red-400/30 bg-[#20232b] p-6">
            <h1 className="text-xl font-semibold">BaseRank needs a refresh.</h1>
            <p className="mt-3 text-sm text-red-100/80">{error.message || "An unexpected error occurred."}</p>
            <button className="mt-5 rounded-md bg-[#f3c85f] px-4 py-3 text-sm font-bold text-[#17191f]" onClick={reset}>
              Reload
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}

"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-xs uppercase tracking-[0.4em] text-[#c8b273]">NINE XN GARMENTS</p>
      <h1 className="mt-4 font-display text-5xl">Something went wrong</h1>
      <p className="mt-4 max-w-md text-[#b4b4ae]">The page could not be loaded. Try again, or return to the collection.</p>
      <button onClick={reset} className="mt-8 bg-[#c8b273] px-8 py-3 text-sm tracking-[0.2em] text-black">
        Try again
      </button>
    </div>
  );
}

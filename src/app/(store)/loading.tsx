export default function Loading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
      <div className="gold-rule w-24" />
      <p className="text-sm uppercase tracking-[0.35em] text-[#c8b273]">Loading the collection</p>
      <div className="h-px w-40 overflow-hidden bg-[#2a2a2a]">
        <div className="h-full w-1/2 animate-pulse bg-[#c8b273]" />
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

type VideoItem = {
  id: string;
  title: string;
  caption: string;
  videoUrl: string;
  posterUrl: string | null;
};

export function HomepageVideos({ videos }: { videos: VideoItem[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = videos.find((video) => video.id === activeId) || null;

  if (videos.length === 0) return null;

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-[#2a2a2a] bg-[#090909] px-4 py-12 md:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,178,115,0.12),transparent_55%)]" />
      <div className="relative mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-[#c8b273]">On film</p>
          <h2 className="mt-2 font-display text-4xl md:text-5xl">Portrait looks</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[#b4b4ae]">
            Watch 9:16 collection films. Tap a frame to play, unmute, or open it larger.
          </p>
        </div>
        <div className="gold-rule w-32" />
      </div>
      <div className="relative flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {videos.map((video, index) => (
          <ReelCard key={video.id} video={video} delay={index * 80} onOpen={() => setActiveId(video.id)} />
        ))}
      </div>
      {active && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setActiveId(null)}>
          <div className="relative w-full max-w-[420px]" onClick={(e) => e.stopPropagation()}>
            <video
              key={active.id}
              className="aspect-[9/16] w-full rounded-3xl border border-[#c8b273]/40 object-cover shadow-[0_30px_80px_rgba(0,0,0,0.55)]"
              src={active.videoUrl}
              poster={active.posterUrl || undefined}
              controls
              autoPlay
              playsInline
              loop
            />
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                {active.title && <p className="font-display text-2xl">{active.title}</p>}
                {active.caption && <p className="mt-1 text-sm text-[#b4b4ae]">{active.caption}</p>}
              </div>
              <button className="border border-[#c8b273] px-4 py-2 text-xs uppercase tracking-[0.2em]" onClick={() => setActiveId(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function ReelCard({
  video,
  delay,
  onOpen,
}: {
  video: VideoItem;
  delay: number;
  onOpen: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    const el = videoRef.current;
    if (!node || !el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
          el.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
        } else {
          el.pause();
          setPlaying(false);
        }
      },
      { threshold: [0.6] },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  async function togglePlay() {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      await el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }

  return (
    <article
      ref={wrapRef}
      className="group relative w-[220px] shrink-0 snap-center sm:w-[260px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="luxury-card overflow-hidden rounded-[26px] border border-[#2a2a2a] bg-black">
        <video
          ref={videoRef}
          className="aspect-[9/16] w-full object-cover"
          src={video.videoUrl}
          poster={video.posterUrl || undefined}
          muted={muted}
          loop
          playsInline
          preload="metadata"
          onClick={togglePlay}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 opacity-80" />
        <div className="absolute inset-x-0 bottom-0 space-y-2 p-4">
          {video.title && <p className="font-display text-xl leading-tight">{video.title}</p>}
          {video.caption && <p className="line-clamp-2 text-xs text-[#d7d7d0]">{video.caption}</p>}
          <div className="pointer-events-auto flex gap-2 pt-1">
            <button
              type="button"
              onClick={togglePlay}
              className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur"
            >
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={() => setMuted((value) => !value)}
              className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-[0.18em] backdrop-blur"
            >
              {muted ? "Unmute" : "Mute"}
            </button>
            <button
              type="button"
              onClick={onOpen}
              className="rounded-full bg-[#c8b273] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-black"
            >
              Expand
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

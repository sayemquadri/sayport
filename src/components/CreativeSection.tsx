import { useEffect, useRef, useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  Film,
  Headphones,
  Pause,
  Play,
  Presentation,
  Volume2,
} from 'lucide-react';
import { CREATIVE_ARCHIVE } from '../data/portfolio';
import { isValidConfiguredUrl } from '../utils/portfolio';
import { Reveal } from './Reveal';

interface CreativeSectionProps {
  onOpenProject: (projectId: string) => void;
}

type LiteraryTab = 'synopsis' | 'approach' | 'excerpt';

export function CreativeSection({ onOpenProject }: CreativeSectionProps) {
  const { voiceSection, greenString, storyAnalysis, presentations } = CREATIVE_ARCHIVE;

  const [selectedTrackIdx, setSelectedTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [literaryTab, setLiteraryTab] = useState<LiteraryTab>('synopsis');
  const [activeStudyIdx, setActiveStudyIdx] = useState(0);

  const activeTrack = voiceSection.tracks[selectedTrackIdx] ?? voiceSection.tracks[0];
  const hasRealAudio = Boolean(activeTrack.audioUrl && isValidConfiguredUrl(activeTrack.audioUrl));
  const activeStudy = storyAnalysis.studies[activeStudyIdx] ?? storyAnalysis.studies[0];

  useEffect(() => {
    setIsPlaying(false);
    setProgressPct(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [selectedTrackIdx]);

  // Smooth visual playback progress when previewing a track slot without an external audio file yet
  useEffect(() => {
    if (!isPlaying || hasRealAudio) return;

    const tick = window.setInterval(() => {
      setProgressPct((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 0;
        }
        return prev + 2;
      });
    }, 180);

    return () => window.clearInterval(tick);
  }, [isPlaying, hasRealAudio]);

  const handleTogglePlayback = () => {
    if (hasRealAudio && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        void audioRef.current.play();
        setIsPlaying(true);
      }
      return;
    }

    if (progressPct >= 100) {
      setProgressPct(0);
    }
    setIsPlaying((prev) => !prev);
  };

  return (
    <section
      id="creative"
      className="border-t border-[#27272C] px-5 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
            {CREATIVE_ARCHIVE.indexLabel}
          </p>
          <h2 className="mt-4 text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.12] tracking-[-0.02em] text-[#F0EFEC] [text-wrap:balance]">
            Beyond the{' '}
            <span className="font-serif italic font-normal">Build.</span>
          </h2>
          <p className="mt-4 text-[15.5px] leading-[1.7] text-[#919198]">
            {CREATIVE_ARCHIVE.supportingText}
          </p>
        </Reveal>

        {/* Chapter I: Voice, Dubbing & Narration Showcase */}
        <Reveal className="mt-14 border-t border-[#27272C] pt-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-10">
            <div className="min-w-0 lg:col-span-5">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
                <Headphones className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{voiceSection.label}</span>
              </div>
              <h3 className="mt-3 text-2xl font-semibold tracking-tight text-[#F0EFEC] sm:text-3xl">
                {voiceSection.title}
              </h3>
              <p className="mt-4 text-[15px] leading-[1.7] text-[#919198]">
                {voiceSection.summary}
              </p>

              <div className="mt-7 space-y-2.5">
                {voiceSection.tracks.map((track, idx) => {
                  const isSelected = idx === selectedTrackIdx;
                  return (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => setSelectedTrackIdx(idx)}
                      aria-pressed={isSelected}
                      data-testid={`voice-track-${track.id}`}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'border-[#8B4DFF] bg-[#191329] text-[#F0EFEC]'
                          : 'border-[#27272C] bg-[#111114] text-[#919198] hover:border-[#8B4DFF]/45 hover:text-[#F0EFEC]'
                      }`}
                    >
                      <div className="min-w-0">
                        <span className="block text-[10px] font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
                          {track.code} · {track.category}
                        </span>
                        <span className="mt-1 block truncate text-sm font-medium text-[#F0EFEC]">
                          {track.title}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-[#919198] tabular-nums">
                        {track.durationLabel}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => onOpenProject('anime-dubbing-reels')}
                  className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#F0EFEC] transition-colors hover:text-[#C4A7FF]"
                >
                  <span>Open voice & dubbing dossier</span>
                  <ArrowUpRight className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Interactive In-Page Audio Deck */}
            <div className="min-w-0 lg:col-span-7">
              <div className="rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#27272C] pb-4 text-xs">
                  <span className="font-medium tracking-[0.12em] text-[#C4A7FF] tabular-nums">
                    {activeTrack.code} · STUDIO MONITOR
                  </span>
                  <span className="text-[#919198]">{activeTrack.category}</span>
                </div>

                {hasRealAudio && (
                  <audio
                    ref={audioRef}
                    src={activeTrack.audioUrl}
                    onTimeUpdate={(e) => {
                      const el = e.currentTarget;
                      if (el.duration > 0) {
                        setProgressPct(Math.round((el.currentTime / el.duration) * 100));
                      }
                    }}
                    onEnded={() => {
                      setIsPlaying(false);
                      setProgressPct(0);
                    }}
                  />
                )}

                <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={handleTogglePlayback}
                    aria-label={isPlaying ? `Pause ${activeTrack.title}` : `Preview ${activeTrack.title}`}
                    data-testid="voice-play-toggle"
                    className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#7C3AED] text-[#F0EFEC] transition-colors hover:bg-[#6D28D9]"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="truncate text-base font-semibold text-[#F0EFEC]">
                        {activeTrack.title}
                      </h4>
                      <span className="shrink-0 text-xs text-[#919198] tabular-nums">
                        {activeTrack.durationLabel}
                      </span>
                    </div>

                    {/* Minimal waveform & progress scrubber */}
                    <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#0B0B0D] border border-[#27272C]">
                      <div
                        className="h-full bg-[#9D6BFF] transition-all duration-150"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 rounded-lg border border-[#27272C] bg-[#0B0B0D] p-5">
                  <p className="text-[11px] font-medium tracking-[0.12em] text-[#919198]">
                    SPOKEN LINE / SCRIPT CUE
                  </p>
                  <p className="mt-2 font-serif text-xl italic leading-[1.6] text-[#F0EFEC]">
                    {activeTrack.scriptLine}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-[#919198]">
                    Direction: {activeTrack.directionNote}
                  </p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[#919198]">
                  <Volume2 className="h-3.5 w-3.5 shrink-0 text-[#C4A7FF]" aria-hidden="true" />
                  <span>
                    {hasRealAudio
                      ? 'Audio stream loaded and ready.'
                      : isPlaying
                        ? 'Reading cadence preview active — attach recorded .mp3 / .wav clip to enable live audio.'
                        : activeTrack.placeholderNote}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Chapter II: Creative Writing & Novel Development — The Green String */}
        <Reveal className="mt-16 border-t border-[#27272C] pt-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
            {/* Editorial Book Cover Plate */}
            <div className="min-w-0 lg:col-span-5">
              <div className="mx-auto max-w-[320px] overflow-hidden rounded-lg border border-[#27272C] bg-[#111114] p-5 lg:mx-0">
                <div className="relative flex aspect-[3/4] flex-col justify-between border border-[#27272C] bg-[#0B0B0D] p-7">
                  <div className="flex items-center justify-between text-[10px] tracking-[0.16em] text-[#919198]">
                    <span>SAY PUBLISHING</span>
                    <span className="tabular-nums">01</span>
                  </div>

                  {/* Minimal thread motif representing The Green String */}
                  <svg viewBox="0 0 220 180" className="my-4 w-full" aria-hidden="true">
                    <path
                      d="M16 146 C 58 140, 74 34, 114 82 C 148 124, 168 38, 206 54"
                      fill="none"
                      stroke="#9D6BFF"
                      strokeWidth="1.6"
                    />
                    <circle cx="16" cy="146" r="2.5" fill="#F0EFEC" />
                    <circle cx="206" cy="54" r="2.5" fill="#C4A7FF" />
                  </svg>

                  <div className="border-t border-[#27272C] pt-4">
                    <p className="font-serif text-3xl italic font-normal leading-tight text-[#F0EFEC]">
                      {greenString.title}
                    </p>
                    <p className="mt-2 text-[11px] tracking-[0.12em] text-[#919198]">
                      SAYEM QUADRI
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-center text-[11px] text-[#919198]">
                  Conceptual Edition Plate · Cover artwork forthcoming
                </p>
              </div>
            </div>

            {/* Editorial Reading Pane */}
            <div className="min-w-0 lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{greenString.label}</span>
              </div>
              <h3 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.9rem)] italic font-normal leading-[1.12] text-[#F0EFEC]">
                {greenString.title}
              </h3>
              <p className="mt-2 text-xs text-[#919198]">{greenString.status}</p>

              <div
                role="tablist"
                aria-label="The Green String reading tabs"
                className="mt-7 flex flex-wrap gap-2 border-b border-[#27272C] pb-4"
              >
                {(
                  [
                    { id: 'synopsis', label: 'Synopsis' },
                    { id: 'approach', label: 'Writing Notes' },
                    { id: 'excerpt', label: 'Reading Preview' },
                  ] as const
                ).map((tab) => {
                  const isSelected = literaryTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setLiteraryTab(tab.id)}
                      className={`min-h-[38px] rounded-md px-3.5 py-1.5 text-xs font-medium transition-colors ${
                        isSelected
                          ? 'bg-[#7C3AED] text-[#F0EFEC]'
                          : 'bg-[#111114] text-[#919198] hover:text-[#F0EFEC]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 min-h-[155px] space-y-4">
                {literaryTab === 'synopsis' && (
                  <p className="max-w-[60ch] font-serif text-xl leading-[1.68] text-[#F0EFEC]/95 sm:text-[22px]">
                    {greenString.synopsis}
                  </p>
                )}

                {literaryTab === 'approach' && (
                  <div className="max-w-[60ch] space-y-4">
                    {greenString.writingNotes.map((note) => (
                      <p key={note} className="text-[15.5px] leading-[1.75] text-[#919198]">
                        {note}
                      </p>
                    ))}
                  </div>
                )}

                {literaryTab === 'excerpt' && (
                  <div className="max-w-[60ch] space-y-4 rounded-lg border border-[#27272C] bg-[#111114] p-5">
                    <div>
                      <p className="text-xs font-medium tracking-[0.1em] text-[#C4A7FF]">
                        {greenString.readingSampleTitle}
                      </p>
                      <blockquote className="mt-2 font-serif text-xl italic leading-[1.65] text-[#F0EFEC]">
                        {greenString.readingSample}
                      </blockquote>
                    </div>
                    <div className="border-t border-[#27272C] pt-3">
                      <p className="text-xs leading-relaxed text-[#919198]">
                        {greenString.publishingNote}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t border-[#27272C] pt-5">
                <button
                  type="button"
                  onClick={() => onOpenProject('the-green-string')}
                  className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#F0EFEC] transition-colors hover:text-[#C4A7FF]"
                >
                  <span>Read full project brief</span>
                  <ArrowUpRight className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Chapter III: Film & Anime Story Analysis + Presentations */}
        <Reveal className="mt-16 border-t border-[#27272C] pt-12">
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-10">
            {/* Film & Anime Story Analysis */}
            <div className="min-w-0 rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-7 lg:col-span-6">
              <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
                <Film className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{storyAnalysis.label}</span>
              </div>
              <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#F0EFEC] sm:text-2xl">
                {storyAnalysis.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-[#919198]">
                {storyAnalysis.summary}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {storyAnalysis.studies.map((study, idx) => {
                  const isSelected = idx === activeStudyIdx;
                  return (
                    <button
                      key={study.id}
                      type="button"
                      onClick={() => setActiveStudyIdx(idx)}
                      aria-pressed={isSelected}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        isSelected
                          ? 'border-[#8B4DFF] bg-[#191329]'
                          : 'border-[#27272C] bg-[#0B0B0D] hover:border-[#8B4DFF]/45'
                      }`}
                    >
                      <span className="block text-[10px] font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
                        {study.code}
                      </span>
                      <span className="mt-1 block text-xs font-medium text-[#F0EFEC]">
                        {study.title}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 rounded-lg border border-[#27272C] bg-[#0B0B0D] p-5">
                <span className="text-[11px] font-medium tracking-[0.08em] text-[#C4A7FF]">
                  {activeStudy.medium}
                </span>
                <p className="mt-2 font-serif text-lg italic leading-relaxed text-[#F0EFEC]">
                  {activeStudy.thesis}
                </p>
                <ul className="mt-3 space-y-1.5 border-t border-[#27272C] pt-3 text-xs leading-relaxed text-[#919198]">
                  {activeStudy.notes.map((n) => (
                    <li key={n} className="flex items-baseline gap-2">
                      <span className="text-[#9D6BFF]" aria-hidden="true">—</span>
                      <span>{n}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Presentations & Communication */}
            <div className="flex min-w-0 flex-col justify-between rounded-xl border border-[#27272C] bg-[#111114] p-6 sm:p-7 lg:col-span-6">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium tracking-[0.12em] text-[#C4A7FF]">
                  <Presentation className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>{presentations.label}</span>
                </div>
                <h3 className="mt-3 text-xl font-semibold tracking-tight text-[#F0EFEC] sm:text-2xl">
                  {presentations.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#919198]">
                  {presentations.summary}
                </p>

                <div className="mt-6 space-y-3">
                  {presentations.items.map((deck) => (
                    <div
                      key={deck.id}
                      className="rounded-lg border border-[#27272C] bg-[#0B0B0D] p-4"
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[10px] font-medium tracking-[0.14em] text-[#C4A7FF] tabular-nums">
                          {deck.code}
                        </span>
                        <span className="text-[11px] text-[#919198]">
                          {deck.audienceContext}
                        </span>
                      </div>
                      <h4 className="mt-1.5 text-sm font-medium text-[#F0EFEC]">
                        {deck.title}
                      </h4>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#919198]">
                        {deck.structureSummary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 border-t border-[#27272C] pt-4">
                <button
                  type="button"
                  onClick={() => onOpenProject('aq-explains')}
                  className="inline-flex min-h-[40px] items-center gap-2 text-sm font-medium text-[#F0EFEC] transition-colors hover:text-[#C4A7FF]"
                >
                  <span>Explore AQ Explains decks & story scripts</span>
                  <ArrowUpRight className="h-4 w-4 text-[#C4A7FF]" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

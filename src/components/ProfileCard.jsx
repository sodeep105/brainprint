import { useState, useRef } from 'react'
import html2canvas from 'html2canvas'

const TYPES = {
  spark: {
    name: 'The Spark',
    icon: '⚡',
    description: 'You need the hook before the detail. Fast, visual, example-driven — or you\'re already gone.',
    color: 'from-yellow-500 to-orange-500',
    glow: 'rgba(234,179,8,0.15)',
  },
  architect: {
    name: 'The Architect',
    icon: '🏛️',
    description: 'You build understanding brick by brick. Give you the full structure and you\'ll master anything.',
    color: 'from-blue-500 to-indigo-600',
    glow: 'rgba(99,102,241,0.15)',
  },
  mapper: {
    name: 'The Mapper',
    icon: '🗺️',
    description: 'You need the big picture first. Show you the map, then walk you through it.',
    color: 'from-emerald-500 to-teal-600',
    glow: 'rgba(20,184,166,0.15)',
  },
  storyteller: {
    name: 'The Storyteller',
    icon: '📖',
    description: 'You learn through narrative. Make it relatable and it sticks forever.',
    color: 'from-pink-500 to-rose-600',
    glow: 'rgba(244,63,94,0.15)',
  },
}

function assignType({ modality, overwhelm_threshold, processing_order }) {
  if (modality === 'visual' && processing_order === 'example_first' && overwhelm_threshold === 'low')
    return 'spark'
  if (modality === 'verbal' && processing_order === 'theory_first' && overwhelm_threshold === 'high')
    return 'architect'
  if (modality === 'visual' && processing_order === 'theory_first')
    return 'mapper'
  if (modality === 'verbal' && processing_order === 'example_first')
    return 'storyteller'
  // Mixed cases — best-fit defaults
  if (modality === 'visual' && processing_order === 'example_first') return 'spark'
  if (modality === 'visual') return 'mapper'
  if (modality === 'verbal' && processing_order === 'theory_first') return 'architect'
  return 'storyteller'
}

const BADGE_LABELS = {
  modality: { visual: '👁 Visual', verbal: '📝 Verbal' },
  overwhelm_threshold: { low: '⚡ Low threshold', medium: '⚖️ Medium threshold', high: '🏋️ High threshold' },
  processing_order: { example_first: '💡 Examples first', theory_first: '📐 Theory first' },
}

const ANALOGY_DOMAINS = [
  { value: 'sports', label: '⚽ Sports' },
  { value: 'cooking', label: '🍳 Cooking' },
  { value: 'gaming', label: '🎮 Gaming' },
  { value: 'music', label: '🎵 Music' },
  { value: 'movies', label: '🎬 Movies' },
  { value: 'travel', label: '✈️ Travel' },
]

export default function ProfileCard({ profile, onContinue, onRetake }) {
  const typeKey = assignType(profile)
  const type = TYPES[typeKey]
  const [analogyDomain, setAnalogyDomain] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const shareCardRef = useRef(null)

  async function handleShare() {
    if (!shareCardRef.current) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, { backgroundColor: null, scale: 2 })
      const link = document.createElement('a')
      link.download = 'my-brainprint.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${type.glow} 0%, transparent 65%)` }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Header label */}
        <p className="text-center text-xs text-slate-500 font-semibold uppercase tracking-widest mb-8">
          Your Cognitive Profile
        </p>

        {/* Card */}
        <div className="rounded-3xl border border-[#2a2a2a] bg-[#1a1a1a] p-8 shadow-2xl text-center">
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-6 shadow-lg"
            style={{ background: `linear-gradient(135deg, ${type.glow.replace('0.15', '0.3')}, transparent)`, border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {type.icon}
          </div>

          {/* Type name */}
          <p className="text-slate-500 text-sm font-medium mb-1">You are</p>
          <h2 className={`text-4xl font-black mb-4 bg-gradient-to-r ${type.color} bg-clip-text text-transparent`}>
            {type.name}
          </h2>

          {/* Description */}
          <p className="text-slate-300 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
            {type.description}
          </p>

          {/* Trait badges */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <Badge label={BADGE_LABELS.modality[profile.modality]} />
            <Badge label={BADGE_LABELS.overwhelm_threshold[profile.overwhelm_threshold]} />
            <Badge label={BADGE_LABELS.processing_order[profile.processing_order]} />
          </div>

          {/* Analogy domain selector */}
          <div className="mb-8">
            <p className="text-xs text-slate-500 mb-3">
              What's your world? We'll explain things through it.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {ANALOGY_DOMAINS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setAnalogyDomain(analogyDomain === value ? null : value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-150"
                  style={
                    analogyDomain === value
                      ? { background: '#6d28d9', borderColor: '#a855f7', color: '#fff' }
                      : { background: 'transparent', borderColor: '#4b5563', color: '#9ca3af' }
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Share subtext */}
          <p className="text-xs text-slate-600 mb-8 tracking-wide">
            Share your type · #Brainprint
          </p>

          {/* CTA */}
          <button
            onClick={() => onContinue(analogyDomain)}
            className="group w-full py-4 rounded-2xl font-semibold text-base text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-900/30 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9f67ff 100%)' }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Transform Content for My Brain
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
          </button>

          {/* Share My Type */}
          <button
            onClick={handleShare}
            disabled={downloading}
            className="mt-3 w-full py-3 rounded-2xl text-sm font-medium border border-purple-600 text-purple-400 bg-transparent hover:bg-purple-950 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {downloading ? 'Downloading...' : '🖼️ Share My Type'}
          </button>

          {/* Retake */}
          <button
            onClick={onRetake}
            className="mt-4 w-full text-sm text-gray-500 hover:underline transition-colors"
          >
            ↺ Retake Quiz
          </button>
        </div>
      </div>

      {/* Hidden shareable card — rendered off-screen for html2canvas */}
      <div
        ref={shareCardRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: 0,
          width: '600px',
          height: '400px',
          background: '#0f0f0f',
          borderRadius: '24px',
          border: '2px solid #7c3aed',
          boxShadow: '0 0 60px rgba(124,58,237,0.3)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
          fontFamily: 'Inter, sans-serif',
          gap: '12px',
        }}
      >
        <div style={{ fontSize: '64px', lineHeight: 1 }}>{type.icon}</div>
        <div style={{ fontSize: '36px', fontWeight: 900, color: '#ffffff', letterSpacing: '-1px' }}>
          I am {type.name}
        </div>
        <div style={{ fontSize: '14px', color: '#94a3b8', textAlign: 'center', maxWidth: '420px', lineHeight: 1.6 }}>
          {type.description}
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
          {[BADGE_LABELS.modality[profile.modality], BADGE_LABELS.overwhelm_threshold[profile.overwhelm_threshold], BADGE_LABELS.processing_order[profile.processing_order]].map(label => (
            <span key={label} style={{ padding: '4px 12px', borderRadius: '999px', background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#94a3b8', fontSize: '12px' }}>
              {label}
            </span>
          ))}
        </div>
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
          <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: 600 }}>Find your type 🧠</div>
          <div style={{ fontSize: '11px', color: '#4a4a6a' }}>brainprint.vercel.app</div>
        </div>
      </div>
    </div>
  )
}

function Badge({ label }) {
  return (
    <span className="px-3 py-1 rounded-full bg-[#0f0f0f] border border-[#2a2a2a] text-slate-400 text-xs font-medium">
      {label}
    </span>
  )
}

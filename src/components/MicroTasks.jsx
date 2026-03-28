import { useState, useEffect, useRef } from 'react'

const QUANTUM_TEXT = `The phenomenon of quantum decoherence presents a fundamental challenge to
the superposition principle as described by the Schrödinger equation: when a quantum system
interacts with its environment, the off-diagonal elements of the density matrix rapidly approach
zero in the preferred basis, effectively collapsing the interference terms that characterize
purely quantum behavior. This process, governed by the von Neumann entropy and mediated through
entanglement with environmental degrees of freedom, explains the emergence of classical
probability distributions from underlying quantum amplitudes — yet the precise boundary at
which Hilbert space dynamics yields to Born rule statistics remains an open interpretational
question in the foundations of quantum mechanics.`

export default function MicroTasks({ onComplete }) {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({})
  const startTimeRef = useRef(null)

  // Task 2 timer
  useEffect(() => {
    if (step === 2) {
      startTimeRef.current = Date.now()
      const autoAdvance = setTimeout(() => {
        handleOverwhelm('high')
      }, 12000)
      return () => clearTimeout(autoAdvance)
    }
  }, [step])

  function handleModality(value) {
    setProfile(p => ({ ...p, modality: value }))
    setStep(2)
  }

  function handleOverwhelm(level) {
    let threshold = level
    if (!level) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      threshold = elapsed < 4 ? 'low' : elapsed <= 10 ? 'medium' : 'high'
    }
    setProfile(p => ({ ...p, overwhelm_threshold: threshold }))
    setStep(3)
  }

  function handleProcessing(value) {
    const finalProfile = { ...profile, processing_order: value }
    onComplete(finalProfile)
  }

  const progress = ((step - 1) / 3) * 100

  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Progress bar */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Task {step} of 3
          </span>
          <span className="text-xs text-slate-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#7c3aed] to-[#9f67ff] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {step === 1 && <Task1 onChoice={handleModality} />}
      {step === 2 && <Task2 onEscape={() => handleOverwhelm('low')} onContinue={() => handleOverwhelm(null)} />}
      {step === 3 && <Task3 onChoice={handleProcessing} />}
    </div>
  )
}

/* ── Task 1 ─────────────────────────────────────────────────── */
function Task1({ onChoice }) {
  return (
    <div className="screen-enter w-full max-w-3xl">
      <div className="text-center mb-8">
        <p className="text-xs text-[#7c3aed] font-semibold uppercase tracking-widest mb-2">Modality Check</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Which would you rather read right now?</h2>
        <p className="text-slate-500 text-sm">Click the one that feels more appealing</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Verbal card */}
        <button
          onClick={() => onChoice('verbal')}
          className="group text-left p-6 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#7c3aed] hover:bg-[#1f1a2e] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option A</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-slate-400">Paragraph</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            A bicycle works through the transfer of human energy into mechanical motion. When a rider
            pushes down on the pedals, that force travels through the chain to the rear wheel, which
            then rotates and propels the bicycle forward. The front wheel is steered by handlebars,
            which allow the rider to change direction. Balancing is maintained by the gyroscopic effect
            of the spinning wheels and by the rider making small steering adjustments. Gears allow the
            rider to optimize their pedaling effort for different terrains.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[#7c3aed] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Choose this</span>
            <span>→</span>
          </div>
        </button>

        {/* Visual card */}
        <button
          onClick={() => onChoice('visual')}
          className="group text-left p-6 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#7c3aed] hover:bg-[#1f1a2e] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option B</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-slate-400">Visual</span>
          </div>
          <div className="text-sm text-slate-300 space-y-2">
            <div className="font-semibold text-white mb-3">How a Bicycle Works</div>
            <div className="flex items-start gap-2"><span className="text-[#7c3aed] mt-0.5">▸</span><span><strong className="text-slate-200">Pedals →</strong> Chain → Rear wheel rotation</span></div>
            <div className="flex items-start gap-2"><span className="text-[#7c3aed] mt-0.5">▸</span><span><strong className="text-slate-200">Handlebars →</strong> Front wheel steering</span></div>
            <div className="flex items-start gap-2"><span className="text-[#7c3aed] mt-0.5">▸</span><span><strong className="text-slate-200">Balance →</strong> Gyroscopic effect + micro-corrections</span></div>
            <div className="flex items-start gap-2"><span className="text-[#7c3aed] mt-0.5">▸</span><span><strong className="text-slate-200">Gears →</strong> Match effort to terrain</span></div>
            <div className="mt-3 p-3 rounded-lg bg-[#0f0f1a] border border-[#2a2a3a] text-xs text-slate-400 font-mono">
              [Pedal Force] → Chain → [Wheel] → Forward Motion
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#7c3aed] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Choose this</span>
            <span>→</span>
          </div>
        </button>
      </div>
    </div>
  )
}

/* ── Task 2 ─────────────────────────────────────────────────── */
function Task2({ onEscape, onContinue }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  // After 12s auto-advance happens in parent; here we advance at 12 too
  useEffect(() => {
    if (elapsed >= 12) onContinue()
  }, [elapsed])

  const autoProgress = Math.min((elapsed / 12) * 100, 100)

  return (
    <div className="screen-enter w-full max-w-2xl">
      <div className="text-center mb-8">
        <p className="text-xs text-[#7c3aed] font-semibold uppercase tracking-widest mb-2">Overwhelm Check</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Just read naturally</h2>
        <p className="text-slate-500 text-sm">We'll track how long you spend — no right answer</p>
      </div>

      <div className="p-6 md:p-8 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] shadow-lg">
        <p className="text-slate-300 text-sm md:text-base leading-relaxed font-mono tracking-tight">
          {QUANTUM_TEXT}
        </p>
      </div>

      {/* Auto-advance bar */}
      <div className="mt-4 h-0.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <div
          className="h-full bg-[#3a3a4a] rounded-full transition-all duration-1000 linear"
          style={{ width: `${autoProgress}%` }}
        />
      </div>

      {/* Escape button — shown after 1s */}
      <div className="mt-6 flex justify-center">
        {elapsed >= 1 && (
          <button
            onClick={onEscape}
            className="text-xs text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-2"
          >
            I've read enough →
          </button>
        )}
      </div>
    </div>
  )
}

/* ── Task 3 ─────────────────────────────────────────────────── */
function Task3({ onChoice }) {
  return (
    <div className="screen-enter w-full max-w-3xl">
      <div className="text-center mb-8">
        <p className="text-xs text-[#7c3aed] font-semibold uppercase tracking-widest mb-2">Processing Order</p>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Which felt more natural to understand?</h2>
        <p className="text-slate-500 text-sm">Read both, then click the one that clicked faster</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Example first */}
        <button
          onClick={() => onChoice('example_first')}
          className="group text-left p-6 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#7c3aed] hover:bg-[#1f1a2e] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option A</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-slate-400">Example → Concept</span>
          </div>
          <div className="text-sm text-slate-300 space-y-3">
            <div className="p-3 rounded-lg bg-[#0f0f1a] border border-[#2a2a3a] text-slate-300 italic text-xs leading-relaxed">
              "Imagine you're trying to boil water in a pot with a small hole in it —
              the water escapes before it heats up enough. That's what compression loss feels like in data."
            </div>
            <p className="leading-relaxed text-xs">
              <strong className="text-white">Lossy compression</strong> reduces file size by permanently discarding
              some data — specifically the parts human perception is least sensitive to.
              It trades perfect accuracy for a much smaller file.
            </p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#7c3aed] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>This felt natural</span>
            <span>→</span>
          </div>
        </button>

        {/* Theory first */}
        <button
          onClick={() => onChoice('theory_first')}
          className="group text-left p-6 rounded-2xl border border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#7c3aed] hover:bg-[#1f1a2e] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Option B</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#2a2a2a] text-slate-400">Concept → Example</span>
          </div>
          <div className="text-sm text-slate-300 space-y-3">
            <p className="leading-relaxed text-xs">
              <strong className="text-white">Lossy compression</strong> reduces file size by permanently discarding
              some data — specifically the parts human perception is least sensitive to.
              It trades perfect accuracy for a much smaller file.
            </p>
            <div className="p-3 rounded-lg bg-[#0f0f1a] border border-[#2a2a3a] text-slate-300 italic text-xs leading-relaxed">
              "For example: a JPEG photo at 80% quality looks nearly identical to the original,
              but takes up 5× less disk space — because fine texture details were quietly removed."
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-[#7c3aed] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>This felt natural</span>
            <span>→</span>
          </div>
        </button>
      </div>
    </div>
  )
}

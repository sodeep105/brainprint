export default function Landing({ onStart }) {
  return (
    <div className="screen-enter min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background glow */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 flex flex-col items-center text-center max-w-xl">
        {/* Logo mark */}
        <div className="mb-8 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[#7c3aed] flex items-center justify-center text-xl shadow-lg shadow-purple-900/40">
            🧠
          </div>
        </div>

        {/* App name */}
        <h1 className="text-6xl md:text-7xl font-black tracking-tight mb-4 bg-gradient-to-br from-white via-purple-100 to-purple-300 bg-clip-text text-transparent leading-tight">
          Brainprint
        </h1>

        {/* Tagline */}
        <p className="text-xl md:text-2xl font-medium text-slate-300 mb-3 leading-snug">
          Discover how your brain learns.
          <br />
          Then actually use it.
        </p>

        {/* Subtext */}
        <p className="text-sm text-slate-500 mb-12 tracking-wide uppercase font-medium">
          45 seconds &nbsp;·&nbsp; No forms &nbsp;·&nbsp; No typing
        </p>

        {/* CTA */}
        <button
          onClick={onStart}
          className="group relative px-8 py-4 rounded-2xl font-semibold text-lg text-white overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40"
          style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9f67ff 100%)' }}
        >
          <span className="relative z-10 flex items-center gap-2">
            Discover My Type
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </span>
          {/* Shine */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500" />
        </button>

        {/* Trust bar */}
        <div className="mt-16 flex gap-8 text-slate-600 text-xs font-medium">
          <span>⚡ Instant results</span>
          <span>🔒 Nothing stored</span>
          <span>✦ AI-powered</span>
        </div>
      </div>
    </div>
  )
}

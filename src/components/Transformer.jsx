import { useState, useEffect, useRef } from 'react'
import mermaid from 'mermaid'

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'
const API_KEY = import.meta.env.VITE_GROQ_API_KEY

const TYPE_ICONS = { spark: '⚡', architect: '🏛️', mapper: '🗺️', storyteller: '📖' }
const TYPE_NAMES = { spark: 'The Spark', architect: 'The Architect', mapper: 'The Mapper', storyteller: 'The Storyteller' }

function assignTypeKey({ modality, overwhelm_threshold, processing_order }) {
  if (modality === 'visual' && processing_order === 'example_first' && overwhelm_threshold === 'low') return 'spark'
  if (modality === 'verbal' && processing_order === 'theory_first' && overwhelm_threshold === 'high') return 'architect'
  if (modality === 'visual' && processing_order === 'theory_first') return 'mapper'
  if (modality === 'verbal' && processing_order === 'example_first') return 'storyteller'
  if (modality === 'visual' && processing_order === 'example_first') return 'spark'
  if (modality === 'visual') return 'mapper'
  if (modality === 'verbal' && processing_order === 'theory_first') return 'architect'
  return 'storyteller'
}

async function groqCall(systemPrompt, userContent) {
  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userContent },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error ${res.status}: ${err}`)
  }
  const data = await res.json()
  return data.choices[0].message.content
}

mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: { darkMode: true, background: '#1a1a1a', primaryColor: '#7c3aed', primaryTextColor: '#e2e8f0', lineColor: '#7c3aed', secondaryColor: '#1f1a2e', tertiaryColor: '#0f0f0f' } })

const generateImageUrl = (text, learnerType) => {
  const cleanText = text.replace(/[^\w\s]/g, '').slice(0, 60).trim()
  const prompt = `Educational infographic about ${cleanText}, ${learnerType} learning style, flat design, dark background, purple accents, minimal, no text`
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=350&nologo=true&seed=${Date.now()}`
}

function MermaidDiagram({ code }) {
  const ref = useRef(null)
  const [error, setError] = useState(null)
  const [svg, setSvg] = useState('')

  useEffect(() => {
    if (!code || !ref.current) return
    setError(null)
    const id = `mermaid-${Date.now()}`
    mermaid.render(id, code)
      .then(({ svg }) => setSvg(svg))
      .catch(e => setError(e.message))
  }, [code])

  if (error) return (
    <div className="p-4 rounded-xl bg-[#1a0f0f] border border-red-900/40 text-red-400 text-xs font-mono">
      Diagram error: {error}
    </div>
  )
  if (!svg) return null

  return (
    <div
      ref={ref}
      className="mermaid-container p-4 rounded-xl bg-[#0f0f1a] border border-[#2a2a3a] overflow-x-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

function ScoreBar({ score, warning, reason }) {
  const [displayPct, setDisplayPct] = useState(0)
  const [displayScore, setDisplayScore] = useState(0)
  const animatedRef = useRef(false)

  const targetPct = (score / 10) * 100
  const color = score <= 3 ? '#22c55e' : score <= 6 ? '#eab308' : '#ef4444'
  const label = score <= 3 ? 'Easy' : score <= 6 ? 'Moderate' : 'Dense'

  useEffect(() => {
    if (animatedRef.current) return
    animatedRef.current = true
    const duration = 1200
    const start = performance.now()
    function frame(now) {
      const t = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplayPct(eased * targetPct)
      setDisplayScore(Math.round(eased * score))
      if (t < 1) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  }, [])

  return (
    <div className="p-4 rounded-2xl border bg-[#1a1a1a] mb-4"
      style={{ borderColor: warning ? 'rgba(239,68,68,0.3)' : '#2a2a2a' }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cognitive Load Score</span>
        <span className="text-sm font-bold tabular-nums" style={{ color }}>{displayScore}/10</span>
      </div>
      <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full"
          style={{ width: `${displayPct}%`, background: color, transition: 'none' }}
        />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color }}>{label}</span>
        {reason && <p className="text-xs text-slate-500 leading-relaxed text-right max-w-[70%]">{reason}</p>}
      </div>
      {warning && (
        <p className="mt-2 text-xs text-yellow-400">
          ⚠️ This is dense content. We've adapted it for your brain type.
        </p>
      )}
    </div>
  )
}

export default function Transformer({ profile, analogyDomain, onBack }) {
  const typeKey = assignTypeKey(profile)
  const [input, setInput] = useState('')
  const [status, setStatus] = useState('idle') // 'idle' | 'scoring' | 'transforming' | 'done' | 'error'
  const [score, setScore] = useState(null)
  const [transformed, setTransformed] = useState('')
  const [diagramCode, setDiagramCode] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState('transformed') // 'original' | 'transformed'
  const [pdfLoading, setPdfLoading] = useState(false)
  const [takeaways, setTakeaways] = useState(null) // null | 'loading' | string[]
  const [conceptMapCode, setConceptMapCode] = useState(null) // null | 'loading' | string
  const fileInputRef = useRef(null)

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
      const pages = []
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const content = await page.getTextContent()
        pages.push(content.items.map(item => item.str).join(' '))
      }
      setInput(pages.join('\n\n'))
    } catch (err) {
      setError(`PDF error: ${err.message}`)
    } finally {
      setPdfLoading(false)
      // reset so the same file can be re-uploaded if needed
      e.target.value = ''
    }
  }

  async function handleTransform() {
    if (!input.trim()) return
    setStatus('scoring')
    setScore(null)
    setTransformed('')
    setDiagramCode('')
    setTakeaways('loading')
    setConceptMapCode(null)
    setError('')
    setView('transformed')

    try {
      // Step 1: Cognitive load score
      const scoreRaw = await groqCall(
        'You are a text complexity analyzer. Analyze the provided text and return ONLY valid JSON with no markdown, no explanation, no code blocks. Return exactly: {"score": <number 1-10>, "warning": <true or false>, "reason": "<one sentence>"}',
        input
      )
      let scoreData
      try {
        // strip any markdown fences if present
        const clean = scoreRaw.replace(/```json?/gi, '').replace(/```/g, '').trim()
        scoreData = JSON.parse(clean)
      } catch {
        scoreData = { score: 5, warning: false, reason: 'Could not parse complexity score.' }
      }
      setScore(scoreData)
      setStatus('transforming')

      // Step 2: Transform
      const analogyInstruction = analogyDomain
        ? `- Use analogies exclusively from the ${analogyDomain} domain when explaining any concept. Make the analogy feel natural, not forced.`
        : ''
      const systemPrompt = `You are a cognitive style adapter. Transform the following content based on this learner profile: ${JSON.stringify(profile)}.

Rules:
- If modality is "visual": use bullet points, tables, and suggest a diagram description in [DIAGRAM: ...] tags
- If modality is "verbal": use flowing prose with clear topic sentences
- If processing_order is "example_first": always lead with a concrete example before any explanation
- If processing_order is "theory_first": lead with the concept, then examples
- If overwhelm_threshold is "low": break into very small chunks, hide secondary info using HTML <details><summary>Show more</summary>...</details> tags
- If overwhelm_threshold is "high": you can be comprehensive and detailed${analogyInstruction ? '\n' + analogyInstruction : ''}

If you include a [DIAGRAM: ...] tag, make the description detailed enough to render as a Mermaid flowchart.
Return only the transformed content — no preamble, no meta-commentary.`

      // Step 2b: Transform + takeaways in parallel
      const takeawaysPrompt = `Extract exactly 3 key takeaways from this content that are most important for a ${TYPE_NAMES[typeKey]} learner. Return JSON only, no markdown, no backticks: { "takeaways": ["string", "string", "string"] } Each takeaway max 15 words. Be specific, not generic.`
      const [transformedRaw, takeawaysRaw] = await Promise.all([
        groqCall(systemPrompt, input),
        groqCall('You are a precise summarizer.', takeawaysPrompt + '\n\nContent:\n' + input),
      ])
      setTransformed(transformedRaw)
      try {
        const parsed = JSON.parse(takeawaysRaw.replace(/```json?/gi, '').replace(/```/g, '').trim())
        setTakeaways(parsed.takeaways ?? [])
      } catch {
        setTakeaways([])
      }

      // Step 3: Extract and render diagram if present
      const diagramMatch = transformedRaw.match(/\[DIAGRAM:\s*([\s\S]*?)\]/i)
      if (diagramMatch) {
        const desc = diagramMatch[1].trim()
        try {
          const mermaidCode = await groqCall(
            'Convert the following diagram description into valid Mermaid.js flowchart syntax. Return ONLY the mermaid code, with no markdown fences, no explanation, nothing else. Start directly with "flowchart" or "graph".',
            desc
          )
          setDiagramCode(mermaidCode.replace(/```mermaid?/gi, '').replace(/```/g, '').trim())
        } catch {
          // diagram generation failed silently
        }
      }

      setStatus('done')

      // Visual-only enrichment — runs after text is shown, in parallel
      if (profile.modality === 'visual') {
        const cleanText = transformedRaw.replace(/\[DIAGRAM:[\s\S]*?\]/gi, '').replace(/[#*\[\]`]/g, '').trim()
        setConceptMapCode('loading')
        groqCall(
          'You are a diagram generator.',
          `Convert the key concepts and their relationships from this content into a Mermaid.js flowchart. Use LR direction. Max 8 nodes. Keep labels short (under 4 words). Return ONLY valid mermaid syntax starting with 'flowchart LR', nothing else, no backticks, no explanation:\n${cleanText}`
        ).then(code => {
          setConceptMapCode(code.replace(/```mermaid?/gi, '').replace(/```/g, '').trim())
        }).catch(() => {
          setConceptMapCode(null) // hide silently on failure
        })
      }
    } catch (e) {
      setError(e.message)
      setStatus('error')
    }
  }

  const displayTransformed = transformed.replace(/\[DIAGRAM:[\s\S]*?\]/gi, '').trim()

  return (
    <div className="screen-enter min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e1e] bg-[#0f0f0f] sticky top-0 z-20">
        <button
          onClick={onBack}
          className="text-slate-500 hover:text-white text-sm flex items-center gap-1 transition-colors"
        >
          ← Back
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1a1a1a] border border-[#2a2a2a]">
          <span className="text-base">{TYPE_ICONS[typeKey]}</span>
          <span className="text-xs text-slate-400 font-medium">{TYPE_NAMES[typeKey]}</span>
        </div>
        <div className="w-16" />
      </div>

      {/* Main layout */}
      <div className="flex-1 grid md:grid-cols-2 gap-0 min-h-0">
        {/* Left — Input */}
        <div className="flex flex-col border-r border-[#1e1e1e] p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Paste Content</h3>
            <span className="text-xs text-slate-600">{input.length} chars</span>
          </div>

          {/* PDF upload row */}
          <div className="flex items-center gap-3 mb-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfLoading}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-[#7c3aed]/50 text-[#a78bfa] bg-[#1f1a2e] hover:bg-[#2a1f3d] hover:border-[#7c3aed] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pdfLoading ? '⏳ Reading PDF…' : '📄 Upload PDF'}
            </button>
            <span className="text-xs text-slate-600">or paste text below</span>
          </div>

          <textarea
            className="flex-1 min-h-[300px] p-4 rounded-xl text-sm leading-relaxed text-slate-300 bg-[#1a1a1a] border border-[#2a2a2a] focus:border-[#7c3aed] transition-colors outline-none resize-none"
            placeholder="Paste any content here — an article, lecture notes, documentation, a research paper…"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button
            onClick={handleTransform}
            disabled={!input.trim() || status === 'scoring' || status === 'transforming'}
            className="mt-4 py-3.5 rounded-2xl font-semibold text-base text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-purple-900/30 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #9f67ff 100%)' }}
          >
            {status === 'scoring' && '⏳ Analyzing complexity…'}
            {status === 'transforming' && '🧠 Adapting to your profile…'}
            {(status === 'idle' || status === 'done' || status === 'error') && 'Transform for My Brain →'}
          </button>
        </div>

        {/* Right — Output */}
        <div className="flex flex-col p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              {view === 'transformed' ? 'Transformed Output' : 'Original Content'}
            </h3>
            {status === 'done' && (
              <div className="flex bg-[#1a1a1a] rounded-lg p-0.5 border border-[#2a2a2a] text-xs">
                <button
                  onClick={() => setView('transformed')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === 'transformed' ? 'bg-[#7c3aed] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Adapted
                </button>
                <button
                  onClick={() => setView('original')}
                  className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === 'original' ? 'bg-[#7c3aed] text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Original
                </button>
              </div>
            )}
          </div>

          {/* Score bar */}
          {score && <ScoreBar {...score} />}

          {/* Error */}
          {status === 'error' && (
            <div className="p-4 rounded-xl bg-[#1a0f0f] border border-red-900/40 text-red-400 text-sm">
              <strong>Error:</strong> {error}
              <br />
              <span className="text-xs text-slate-500 mt-1 block">Check that VITE_GROQ_API_KEY is set in your .env file.</span>
            </div>
          )}

          {/* Loading state */}
          {(status === 'scoring' || status === 'transforming') && (
            <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
              <p className="text-base font-medium text-slate-300">
                {
                  { spark: '⚡ Cutting the fluff...', architect: '🏛️ Building your structure...', mapper: '🗺️ Drawing your map...', storyteller: '📖 Finding your narrative...' }[typeKey]
                }
              </p>
              <div className="flex gap-2">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#7c3aed]"
                    style={{ animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          {status === 'done' && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {view === 'transformed' ? (
                <>
                  <KeyTakeaways takeaways={takeaways} learnerType={TYPE_NAMES[typeKey]} />
                  <WordCountBadge original={input} transformed={displayTransformed} />
                  <div
                    className="transformed-content text-sm"
                    dangerouslySetInnerHTML={{ __html: markdownToHtml(displayTransformed) }}
                  />
                  {diagramCode && (
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Generated Diagram</p>
                      <MermaidDiagram code={diagramCode} />
                    </div>
                  )}
                  {profile.modality === 'visual' && (
                    <>
                      <ConceptMap code={conceptMapCode} />
                      <VisualImageSection transformedText={displayTransformed} learnerType={TYPE_NAMES[typeKey]} />
                    </>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{input}</p>
              )}
            </div>
          )}

          {/* Idle state */}
          {status === 'idle' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-700">
              <div className="text-5xl mb-4 opacity-30">{TYPE_ICONS[typeKey]}</div>
              <p className="text-sm">Paste content on the left and click Transform</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Key Takeaways ──────────────────────────────────────────── */
function KeyTakeaways({ takeaways, learnerType }) {
  if (!takeaways) return null

  if (takeaways === 'loading') return (
    <div className="p-4 rounded-xl border border-purple-800 bg-purple-950/40 space-y-2 animate-pulse">
      <div className="h-3 bg-purple-900/60 rounded-full w-1/2" />
      <div className="h-3 bg-purple-900/60 rounded-full w-5/6" />
      <div className="h-3 bg-purple-900/60 rounded-full w-3/4" />
      <div className="h-3 bg-purple-900/60 rounded-full w-4/5" />
    </div>
  )

  if (!takeaways.length) return null

  return (
    <div className="p-4 rounded-xl border border-purple-800 bg-purple-950/40">
      <p className="text-xs font-semibold text-purple-400 mb-3">
        💡 Key Takeaways for {learnerType}
      </p>
      <ol className="space-y-2">
        {takeaways.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-200">
            <span className="text-purple-500 font-bold shrink-0">{i + 1}.</span>
            <span>{t}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── Word Count Reduction Badge ────────────────────────────── */
function WordCountBadge({ original, transformed }) {
  const countWords = str => str.trim().split(/\s+/).filter(Boolean).length
  const originalCount = countWords(original)
  const transformedCount = countWords(transformed)
  const reduction = Math.round((1 - transformedCount / originalCount) * 100)
  const reduced = reduction > 0

  return (
    <div
      className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
      style={reduced
        ? { background: 'rgba(20,83,45,0.5)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.2)' }
        : { background: 'rgba(76,29,149,0.4)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }
      }
    >
      {reduced
        ? `🧠 Cognitive load reduced by ${reduction}% · ${originalCount} → ${transformedCount} words`
        : `🧠 Content expanded for your learning style · ${originalCount} → ${transformedCount} words`
      }
    </div>
  )
}

/* ── Visual-only: Concept Map ───────────────────────────────── */
function ConceptMap({ code }) {
  if (!code) return null

  if (code === 'loading') return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">🗺️ Concept Map</p>
      <div className="w-full h-[180px] rounded-xl bg-[#1a1a1a] animate-pulse" />
    </div>
  )

  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">🗺️ Concept Map</p>
      <MermaidDiagram code={code} />
    </div>
  )
}

/* ── Visual-only: Pollinations image ────────────────────────── */
function VisualImageSection({ transformedText, learnerType }) {
  const [imageUrl, setImageUrl] = useState(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)

  useEffect(() => {
    if (transformedText && transformedText.length > 0) {
      setImageLoading(true)
      setImageError(false)
      setImageUrl(generateImageUrl(transformedText, learnerType))
    }
  }, [transformedText])

  function handleRegenerate() {
    setImageLoading(true)
    setImageError(false)
    setImageUrl(generateImageUrl(transformedText, learnerType) + '&seed=' + Date.now())
  }

  if (!transformedText) return null

  return (
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">🎨 Visual Summary</p>
      {imageLoading && !imageError && (
        <div className="w-full h-48 bg-gray-800 rounded-xl animate-pulse flex items-center justify-center">
          <span className="text-gray-500 text-sm">🎨 Generating visual summary...</span>
        </div>
      )}
      {imageUrl && !imageError && (
        <div>
          <img
            src={imageUrl}
            alt="Visual summary"
            className="rounded-xl w-full"
            onLoad={() => setImageLoading(false)}
            onError={() => { setImageError(true); setImageLoading(false) }}
          />
          <button
            onClick={handleRegenerate}
            className="mt-2 px-3 py-1.5 rounded-lg text-sm text-purple-400 border border-purple-600 hover:bg-purple-950 transition-colors"
          >
            🔄 Regenerate
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Minimal markdown → HTML converter ─────────────────────── */
function markdownToHtml(md) {
  if (!md) return ''

  // Handle tables as a block before line-by-line processing
  let html = md.replace(/(\|.+\|\n)+/g, (tableBlock) => {
    const rows = tableBlock.trim().split('\n')
    let out = '<table>'
    let headerDone = false
    for (const row of rows) {
      const cells = row.split('|').slice(1, -1).map(c => c.trim())
      const isSeparator = cells.every(c => /^[-:]+$/.test(c))
      if (isSeparator) { headerDone = true; continue }
      const tag = !headerDone ? 'th' : 'td'
      out += `<tr>${cells.map(c => `<${tag}>${c}</${tag}>`).join('')}</tr>`
      if (!headerDone) headerDone = true
    }
    return out + '</table>\n'
  })

  html = html
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    // Bold / italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```[\s\S]*?```/g, (match) => {
      const code = match.replace(/```\w*\n?/, '').replace(/```$/, '')
      return `<pre style="background:#0f0f1a;padding:12px;border-radius:8px;overflow-x:auto;font-size:12px;color:#a78bfa;border:1px solid #2a2a3a"><code>${escapeHtml(code)}</code></pre>`
    })
    // Inline code
    .replace(/`(.+?)`/g, '<code style="background:#0f0f1a;padding:2px 6px;border-radius:4px;font-size:0.85em;color:#a78bfa">$1</code>')
    // Unordered lists
    .replace(/^[\*\-] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ol>$&</ol>')
    // Paragraphs — wrap non-tagged lines
    .replace(/^(?!<[hupoltd]|<\/|<pre|<table|<details|<summary).+$/gm, '<p>$&</p>')
    // Clean up extra blank lines
    .replace(/\n{3,}/g, '\n\n')

  return html
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

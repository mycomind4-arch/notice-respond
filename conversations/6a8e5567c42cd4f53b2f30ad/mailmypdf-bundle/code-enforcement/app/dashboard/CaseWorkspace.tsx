'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

type Evidence = { id: string; name: string; type: string; size: number; added: string; extracted?: boolean; extraction?: string }
type CaseData = { address: string; caseNumber: string; jurisdiction: string; deadline: string; violations: string; evidence: Evidence[] }
type Extracted = { caseNumber: string | null; address: string | null; jurisdiction: string | null; deadlines: string[]; violationLines: string[] }

const emptyCase: CaseData = { address: '', caseNumber: '', jurisdiction: '', deadline: '', violations: '', evidence: [] }
function loadCase(): CaseData { if (typeof window === 'undefined') return emptyCase; try { return JSON.parse(localStorage.getItem('code-enforcement-case') || 'null') || emptyCase } catch { return emptyCase } }

export default function CaseWorkspace() {
  const [data, setData] = useState<CaseData>(loadCase)
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')
  const [analysis, setAnalysis] = useState<string[]>([])
  const [extracting, setExtracting] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<Extracted | null>(null)

  useEffect(() => { localStorage.setItem('code-enforcement-case', JSON.stringify(data)) }, [data])

  const daysRemaining = useMemo(() => {
    if (!data.deadline) return null
    const d = new Date(`${data.deadline}T23:59:59`)
    return Math.ceil((d.getTime() - Date.now()) / 86400000)
  }, [data.deadline])

  function update(key: keyof CaseData, value: string) { setData(prev => ({ ...prev, [key]: value })); setSaved(false) }

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    for (const file of Array.from(files)) {
      const id = `${file.name}-${file.size}-${Date.now()}-${Math.random()}`
      const evidence: Evidence = { id, name: file.name, type: file.type || 'unknown', size: file.size, added: new Date().toISOString() }
      setData(prev => ({ ...prev, evidence: [...prev.evidence, evidence] }))
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf') || file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(file.name)) {
        setExtracting(id)
        try {
          const form = new FormData(); form.append('file', file)
          const response = await fetch('/api/extract', { method: 'POST', body: form })
          const result = await response.json()
          if (!response.ok) throw new Error(result.error || 'Extraction failed')
          setSuggestions(result.facts)
          setData(prev => ({ ...prev, evidence: prev.evidence.map(item => item.id === id ? { ...item, extracted: true, extraction: JSON.stringify(result.facts) } : item) }))
          setNotice(`${file.name} extracted. Review the suggested facts before applying them.`)
        } catch (error) {
          setNotice(error instanceof Error ? error.message : 'Extraction failed. The original file remains preserved as evidence.')
        } finally { setExtracting(null) }
      } else {
        setNotice(`${file.name} preserved as evidence. Extraction for this format is not enabled yet.`)
      }
    }
  }

  function applySuggestions() {
    if (!suggestions) return
    setData(prev => ({
      ...prev,
      address: prev.address || suggestions.address || '',
      caseNumber: prev.caseNumber || suggestions.caseNumber || '',
      jurisdiction: prev.jurisdiction || suggestions.jurisdiction || '',
      violations: prev.violations || suggestions.violationLines.join('\n'),
    }))
    setSuggestions(null)
    setNotice('Suggested facts applied. Review each field against the source document before acting.')
    setSaved(false)
  }

  function runAnalysis() {
    const findings: string[] = []
    if (!data.address) findings.push('Property address is missing. Confirm the affected parcel before relying on case findings.')
    if (!data.jurisdiction) findings.push('Jurisdiction is missing. Local code and procedural rules cannot be selected yet.')
    if (!data.deadline) findings.push('No deadline has been confirmed from the case record.')
    else if ((daysRemaining ?? 99) < 0) findings.push('The entered deadline has passed. Verify the source document and any extensions immediately.')
    else if ((daysRemaining ?? 99) <= 7) findings.push(`The entered deadline is ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} away. Verify it against the source notice.`)
    if (!data.violations) findings.push('No alleged violation has been recorded yet.')
    if (!data.evidence.length) findings.push('No evidence has been attached. Add the notice first, then supporting records.')
    if (!findings.length) findings.push('Basic case completeness checks passed. This is not a legal conclusion; verify extracted facts and governing sources before acting.')
    setAnalysis(findings)
  }

  function resetCase() {
    if (!confirm('Clear this case workspace?')) return
    setData(emptyCase)
    setAnalysis([])
    setSuggestions(null)
    setNotice('Case cleared.')
    localStorage.removeItem('code-enforcement-case')
  }

  return (
    <div className="workspace">
      {/* Top nav */}
      <header className="landingNav" style={{ marginBottom: '20px' }}>
        <strong>My-CoMind <span>/ Code Enforcement</span></strong>
        <nav>
          <Link href="/">← Back</Link>
        </nav>
      </header>

      <section className="workspaceHero">
        <div>
          <h1>Your case workspace</h1>
          <p>Upload the notice, add supporting documents, review the extracted facts, and run completeness checks before responding.</p>
        </div>
        <label className="uploadButton">+ Add evidence
          <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" onChange={e => addFiles(e.target.files)} />
        </label>
      </section>

      {notice && <div className="notice">{notice}</div>}

      <div className="workspaceGrid">
        {/* Case facts form */}
        <section className="card formCard">
          <div className="section-title">
            <span>Case facts</span>
            <span className="pill">User confirmed</span>
          </div>
          <p className="muted intro">Extracted values are suggestions only. Review them against the source before saving or acting.</p>

          <label>Property address
            <input value={data.address} onChange={e => update('address', e.target.value)} placeholder="123 Main Street" />
          </label>

          <div className="twoCol">
            <label>Case / notice number
              <input value={data.caseNumber} onChange={e => update('caseNumber', e.target.value)} placeholder="CE-2026-0001" />
            </label>
            <label>Jurisdiction
              <input value={data.jurisdiction} onChange={e => update('jurisdiction', e.target.value)} placeholder="City / County" />
            </label>
          </div>

          <label>Compliance / response deadline
            <input type="date" value={data.deadline} onChange={e => update('deadline', e.target.value)} />
          </label>

          <label>Alleged violations
            <textarea value={data.violations} onChange={e => update('violations', e.target.value)} placeholder="Describe what the notice says is in violation. Keep the agency's wording where possible." />
          </label>

          <div className="formActions">
            <button className="btn primary" onClick={() => { setSaved(true); setNotice('Case facts saved locally in this browser.') }}>Save case</button>
            <button className="btn" onClick={resetCase}>Clear</button>
          </div>
          {saved && <div className="saved">✓ Saved locally</div>}
        </section>

        {/* Evidence panel */}
        <aside className="card evidenceCard">
          <div className="section-title">
            <span>Evidence</span>
            <span className="pill">{data.evidence.length} files</span>
          </div>
          <label className="dropzone">Drop files here or click to add
            <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.doc,.docx" onChange={e => addFiles(e.target.files)} />
          </label>
          {!data.evidence.length ? (
            <p className="muted empty">No evidence yet. The first document should normally be the notice, order, or citation.</p>
          ) : (
            <div className="evidenceList">
              {data.evidence.map(e => (
                <div className="evidenceItem" key={e.id}>
                  <div>
                    <strong>{e.name}</strong>
                    <small>{e.type || 'file'} · {Math.max(1, Math.round(e.size / 1024))} KB {e.extracted ? '· extracted' : ''} {extracting === e.id ? '· extracting…' : ''}</small>
                  </div>
                  <button className="remove" onClick={() => setData(prev => ({ ...prev, evidence: prev.evidence.filter(x => x.id !== e.id) }))}>Remove</button>
                </div>
              ))}
            </div>
          )}

          {suggestions && (
            <div className="suggestion">
              <strong>Extracted suggestions</strong>
              <p>Case: {suggestions.caseNumber || 'not found'} · Address: {suggestions.address || 'not found'} · Jurisdiction: {suggestions.jurisdiction || 'not found'}</p>
              {suggestions.deadlines.length > 0 && <p>Possible dates: {suggestions.deadlines.join(', ')}</p>}
              <button className="btn primary" onClick={applySuggestions}>Apply suggestions</button>
              <button className="btn" onClick={() => setSuggestions(null)}>Dismiss</button>
            </div>
          )}
        </aside>
      </div>

      {/* Completeness checks */}
      <section className="card analysisCard">
        <div className="section-title">
          <span>Completeness check</span>
          <button className="btn primary" onClick={runAnalysis}>Run checks</button>
        </div>
        <p className="muted">Checks whether the case has the minimum information needed. Does not provide legal conclusions.</p>
        {analysis.length ? (
          <div className="findings">
            {analysis.map((x, i) => (
              <div className="finding" key={i}>
                <span>{x.startsWith('Basic') ? '✓' : '!'}</span>
                <p>{x}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="analysisEmpty">Add the notice, confirm the case facts, and run checks.</div>
        )}
      </section>
    </div>
  )
}

import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

export const runtime = 'nodejs'

function firstMatch(text: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim()
  }
  return null
}

function extractFacts(text: string) {
  const normalized = text.replace(/\r/g, '').replace(/[ \t]+/g, ' ')
  const deadlines = [...normalized.matchAll(/(?:deadline|respond by|response due|compliance date|hearing date)[^\n:]*[:]?\s*([A-Z][a-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/gi)].map(m => m[1])
  const caseNumber = firstMatch(normalized, [/(?:case|case no\.?|case number|notice no\.?|citation)\s*(?:#|number|no\.?)?\s*[:\-]?\s*([A-Z0-9][A-Z0-9\-/]{2,})/i])
  const address = firstMatch(normalized, [/(?:property address|site address|premises|location)\s*[:\-]\s*([^\n]{8,100})/i])
  const jurisdiction = firstMatch(normalized, [/(?:jurisdiction|agency|department|city|county)\s*[:\-]\s*([^\n]{3,100})/i])
  const violationLines = normalized.split('\n').map(line => line.trim()).filter(line => /violation|violat|code section|ordinance|citation/i.test(line)).slice(0, 12)
  return { caseNumber, address, jurisdiction, deadlines, violationLines }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) return NextResponse.json({ error: 'A file is required.' }, { status: 400 })
    if (file.size > 15 * 1024 * 1024) return NextResponse.json({ error: 'Files must be 15 MB or smaller.' }, { status: 413 })

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      const parsed = await pdf(buffer)
      text = parsed.text || ''
    } else if (file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(file.name)) {
      text = buffer.toString('utf8')
    } else {
      return NextResponse.json({ error: 'This first extractor supports PDF and plain-text documents. The file can still be preserved as evidence.' }, { status: 415 })
    }

    const facts = extractFacts(text)
    return NextResponse.json({
      document: { name: file.name, size: file.size, type: file.type || 'application/octet-stream', extractedAt: new Date().toISOString(), characterCount: text.length },
      facts,
      provenance: { source: file.name, method: 'deterministic text extraction', note: 'Extracted values are suggestions. Confirm them against the source document before saving or acting.' },
    })
  } catch (error) {
    console.error('document extraction failed', error)
    return NextResponse.json({ error: 'The document could not be extracted. Preserve the original and verify it manually.' }, { status: 500 })
  }
}

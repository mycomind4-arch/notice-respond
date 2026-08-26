#!/usr/bin/env python3
"""Generate a full Next.js vertical app scaffold from a domain workflows file."""
import json, os, sys, textwrap

def generate(repo_path, product_name, accent_color, domain_file_path, workflow_type_name, workflow_type_id_type, workflow_import_path, engine_import_path=None):
    """Generate all the boilerplate files for a vertical repo."""
    
    os.makedirs(f"{repo_path}/app/workflows/[id]", exist_ok=True)
    os.makedirs(f"{repo_path}/app", exist_ok=True)
    
    # ── package.json ──
    pkg = {
        "name": product_name.lower().replace(' ', '-'),
        "version": "0.1.0",
        "private": True,
        "scripts": {
            "dev": "next dev",
            "build": "next build",
            "start": "next start",
            "typecheck": "tsc --noEmit",
            "test": "vitest run",
            "test:watch": "vitest",
            "lint": "next lint"
        },
        "dependencies": {
            "lucide-react": "^0.511.0",
            "next": "^15.3.0",
            "react": "^19.1.0",
            "react-dom": "^19.1.0"
        },
        "devDependencies": {
            "@types/node": "^22.15.0",
            "@types/react": "^19.1.0",
            "@types/react-dom": "^19.1.0",
            "typescript": "^5.8.0",
            "vitest": "^3.2.4"
        }
    }
    with open(f"{repo_path}/package.json", 'w') as f:
        json.dump(pkg, f, indent=2)
        f.write('\n')
    
    # ── tsconfig.json ──
    tsconfig = {
        "compilerOptions": {
            "target": "ES2017",
            "lib": ["dom", "dom.iterable", "esnext"],
            "allowJs": True,
            "skipLibCheck": True,
            "strict": True,
            "noEmit": True,
            "esModuleInterop": True,
            "module": "esnext",
            "moduleResolution": "bundler",
            "resolveJsonModule": True,
            "isolatedModules": True,
            "jsx": "preserve",
            "incremental": True,
            "plugins": [{"name": "next"}],
            "paths": {"@/*": ["./*"]}
        },
        "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
        "exclude": ["node_modules"]
    }
    with open(f"{repo_path}/tsconfig.json", 'w') as f:
        json.dump(tsconfig, f, indent=2)
        f.write('\n')
    
    with open(f"{repo_path}/next-env.d.ts", 'w') as f:
        f.write('/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n')
    
    # ── globals.css ──
    css = f"""*{{box-sizing:border-box}}
html{{scroll-behavior:smooth}}
body{{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,sans-serif;background:#061018;color:#f8fafc;-webkit-font-smoothing:antialiased}}
a{{text-decoration:none;color:inherit}}
.container{{max-width:1180px;margin:auto;padding:0 24px}}
.card{{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);border-radius:16px}}
.card:hover{{border-color:rgba({accent_color},.25);background:rgba(255,255,255,.06)}}
.muted{{color:#94a3b8}}
.eyebrow{{font-size:11px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:#{accent_color}}}
.btn{{display:inline-flex;align-items:center;gap:8px;border-radius:12px;padding:14px 28px;font-weight:600;font-size:15px;transition:all .2s;cursor:pointer;border:none}}
.btn-primary{{background:#{accent_color};color:#061018}}
.btn-primary:hover{{filter:brightness(1.1);transform:translateY(-1px)}}
.btn-secondary{{background:rgba(255,255,255,.06);color:#f8fafc;border:1px solid rgba(255,255,255,.12)}}
.btn-secondary:hover{{background:rgba(255,255,255,.1)}}
.badge{{display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}}
.badge-low{{background:rgba(34,197,94,.12);color:#4ade80;border:1px solid rgba(34,197,94,.2)}}
.badge-medium{{background:rgba(251,191,36,.12);color:#fcd34d;border:1px solid rgba(251,191,36,.2)}}
.badge-high{{background:rgba(251,146,60,.12);color:#fb923c;border:1px solid rgba(251,146,60,.2)}}
.badge-critical{{background:rgba(239,68,68,.12);color:#f87171;border:1px solid rgba(239,68,68,.2)}}
.badge-family{{background:rgba({accent_color},.1);color:#{accent_color};border:1px solid rgba({accent_color},.2)}}
.grid-workflows{{display:grid;gap:16px;grid-template-columns:repeat(auto-fill,minmax(320px,1fr))}}
.section{{padding:72px 0}}
.section-tight{{padding:48px 0}}
.divider{{border-top:1px solid rgba(255,255,255,.08)}}
.stat-card{{border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.03);border-radius:14px;padding:20px}}
.faq-item{{border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:20px;margin-bottom:12px;background:rgba(255,255,255,.02)}}
.faq-item h3{{margin:0 0 8px;font-size:16px;color:#e2e8f0}}
.faq-item p{{margin:0;font-size:14px;line-height:1.7;color:#94a3b8}}
.hero-gradient{{background:radial-gradient(ellipse at top,rgba({accent_color},.08) 0%,transparent 60%),radial-gradient(ellipse at bottom right,rgba({accent_color},.05) 0%,transparent 50%)}}
.pipeline-step{{display:flex;gap:14px;align-items:flex-start;padding:16px;border:1px solid rgba(255,255,255,.08);border-radius:12px;background:rgba(255,255,255,.02);transition:all .15s}}
.pipeline-step:hover{{border-color:rgba({accent_color},.2);background:rgba({accent_color},.03)}}
.pipeline-num{{font-size:12px;font-weight:800;color:#{accent_color};min-width:24px}}
.evidence-list{{list-style:none;padding:0;margin:0}}
.evidence-list li{{padding:8px 0;border-bottom:1px solid rgba(255,255,255,.06);font-size:14px;color:#cbd5e1}}
.evidence-list li:last-child{{border-bottom:none}}
.evidence-list li::before{{content:"";display:inline-block;width:6px;height:6px;border-radius:50%;background:#{accent_color};margin-right:12px;vertical-align:middle}}
@media(max-width:700px){{.container{{padding:0 18px}}.section{{padding:48px 0}}.grid-workflows{{grid-template-columns:1fr}}}}"""
    with open(f"{repo_path}/app/globals.css", 'w') as f:
        f.write(css)
    
    # ── layout.tsx ──
    layout = f"""import './globals.css'

export const metadata = {{
  title: '{product_name}',
  description: '{product_name} — focused workflows for responding to government decisions, denials, and notices. Upload the decision, organize evidence, draft a response, review, and mail with proof.',
  openGraph: {{
    title: '{product_name}',
    description: '{product_name} — focused workflows for responding to government decisions, denials, and notices.',
    type: 'website',
    siteName: '{product_name}',
  }},
  twitter: {{
    card: 'summary_large_image',
    title: '{product_name}',
    description: '{product_name} — focused workflows with document upload, analysis, response drafting, review, and mailing proof.',
  }},
  robots: {{ index: true, follow: true }},
}}

export default function RootLayout({{ children }}: {{ children: React.ReactNode }}) {{
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>{{children}}</body>
    </html>
  )
}}"""
    with open(f"{repo_path}/app/layout.tsx", 'w') as f:
        f.write(layout)

    # ── Domain workflow engine (if not already present) ──
    engine_path = engine_import_path or f'@/{domain_file_path.replace("domain/","domain/").replace(".ts","")}'
    
    # ── page.tsx (home) ──
    # We need the import path and types from the domain file
    home_page = textwrap.dedent(f'''\
import Link from 'next/link'
import {{ WORKFLOWS, type WorkflowFamily }} from '{workflow_import_path}'

export const metadata = {{
  title: '{product_name} | Decision, Denial & Appeal Workflows',
  description: '{product_name} — focused workflows for responding to government decisions, denials, and notices. Upload documents, organize evidence, draft a response, review, and mail with proof.',
}}

export default function Home() {{
  const totalWorkflows = WORKFLOWS.length
  const families = [...new Set(WORKFLOWS.map(w => w.family))] as WorkflowFamily[]
  const totalSearchVolume = WORKFLOWS.reduce((sum, w) => sum + w.monthlySearches, 0)

  return (
    <main>
      <header style={{{{borderBottom:'1px solid rgba(255,255,255,.08)',position:'sticky',top:0,background:'rgba(6,16,24,.85)',backdropFilter:'blur(12px)',zIndex:100}}}}>
        <div className="container" style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0'}}}}>
          <Link href="/" style={{{{fontWeight:800,fontSize:18,letterSpacing:'-.02em'}}}}>{product_name}</Link>
          <nav style={{{{display:'flex',gap:28,fontSize:14,color:'#94a3b8'}}}}>
            <Link href="/workflows">Workflows</Link>
            <a href="#how">How it works</a>
            <a href="#families">Categories</a>
            <a href="#status">Status</a>
          </nav>
        </div>
      </header>

      <section className="hero-gradient" style={{{{borderBottom:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container" style={{{{paddingTop:88,paddingBottom:88}}}}>
          <div className="eyebrow">{product_name.upper()} · {{totalWorkflows}} WORKFLOWS</div>
          <h1 style={{{{fontSize:'clamp(42px,7vw,80px)',lineHeight:1.02,fontWeight:800,letterSpacing:'-.03em',margin:'20px 0',maxWidth:900}}}}>
            Find the {{product_name.toLowerCase()}} workflow that matches your situation.
          </h1>
          <p style={{{{fontSize:'clamp(18px,2.5vw,22px)',lineHeight:1.6,color:'#94a3b8',maxWidth:740,margin:'0 0 36px'}}}}>
            Organize the decision, identify deadlines, connect evidence, build a factual response, review, and deliver with proof of mailing.
          </p>
          <div style={{{{display:'flex',gap:14,flexWrap:'wrap'}}}}>
            <Link href="/workflows" className="btn btn-primary">Browse all {{totalWorkflows}} workflows →</Link>
            <a href="#families" className="btn btn-secondary">Browse by category</a>
          </div>
          <div style={{{{display:'flex',gap:32,marginTop:48,flexWrap:'wrap'}}}}>
            <div><div style={{{{fontSize:32,fontWeight:800,color:'#{accent_color}'}}}}>{{totalWorkflows}}</div><div className="muted" style={{{{fontSize:13}}}}>Focused workflows</div></div>
            <div><div style={{{{fontSize:32,fontWeight:800,color:'#{accent_color}'}}}}>{{families.length}}</div><div className="muted" style={{{{fontSize:13}}}}>Categories</div></div>
            <div><div style={{{{fontSize:32,fontWeight:800,color:'#{accent_color}'}}}}>{{(totalSearchVolume/1000).toFixed(0)}}K</div><div className="muted" style={{{{fontSize:13}}}}>Monthly search volume</div></div>
            <div><div style={{{{fontSize:32,fontWeight:800,color:'#{accent_color}'}}}}>8</div><div className="muted" style={{{{fontSize:13}}}}>Pipeline stages</div></div>
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <div className="container">
          <div className="eyebrow">The 8-stage pipeline</div>
          <h2 style={{{{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,letterSpacing:'-.02em',margin:'12px 0 40px'}}}}>A structured response workflow</h2>
          <div style={{{{display:'grid',gap:16,gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))'}}}}>
            {{[
              ['01','Analyze','Identify the decision, stated reasons, dates, and review pathway.'],
              ['02','Organize','Connect documents and facts to each proposed response ground.'],
              ['03','Timeline','Build a chronological timeline of events, decisions, and deadlines.'],
              ['04','Evidence','Map supporting evidence and identify gaps in the record.'],
              ['05','Gaps','Surface missing documents, unsupported claims, and unresolved questions.'],
              ['06','Draft','Draft a factual response, appeal, or request based on documented facts.'],
              ['07','Review','Human review of the draft before any mailing or submission.'],
              ['08','Mail & Proof','Deliver the reviewed packet and preserve the filing and delivery record.'],
            ].map(([n,t,d]) => (
              <div className="card" style={{{{padding:24}}}} key={{n}}>
                <div style={{{{fontSize:12,fontWeight:800,color:'#{accent_color}'}}}}>{{n}}</div>
                <h3 style={{{{margin:'10px 0 8px',fontSize:18,fontWeight:700}}}}>{{t}}</h3>
                <p style={{{{margin:0,fontSize:14,lineHeight:1.6,color:'#94a3b8'}}}}>{{d}}</p>
              </div>
            ))}}
          </div>
        </div>
      </section>

      <section id="families" className="section" style={{{{borderTop:'1px solid rgba(255,255,255,.08)',borderBottom:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div className="eyebrow">Browse by category</div>
          <h2 style={{{{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,letterSpacing:'-.02em',margin:'12px 0 40px'}}}}>{{families.length}} workflow categories</h2>
          <div style={{{{display:'grid',gap:20,gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))'}}}}>
            {{families.map(family => {{
              const workflows = WORKFLOWS.filter(w => w.family === family)
              return (
                <Link key={{family}} href={{`/workflows?family=${{encodeURIComponent(family)}}`}} className="card" style={{{{padding:28,display:'block'}}}}>
                  <div style={{{{display:'flex',justifyContent:'space-between',alignItems:'center'}}}}>
                    <span className="badge badge-family">{{family}}</span>
                    <span style={{{{fontSize:13,color:'#94a3b8'}}}}>{{workflows.length}} workflows</span>
                  </div>
                  <div style={{{{marginTop:16,display:'flex',flexWrap:'wrap',gap:8}}}}>
                    {{workflows.slice(0,4).map(w => (
                      <span key={{w.id}} style={{{{fontSize:12,padding:'4px 10px',borderRadius:8,background:'rgba(255,255,255,.04)',color:'#cbd5e1'}}}}>{{w.name}}</span>
                    ))}}
                    {{workflows.length > 4 && <span style={{{{fontSize:12,padding:'4px 10px',color:'#{accent_color}'}}}}>+{{workflows.length - 4}} more</span>}}
                  </div>
                </Link>
              )
            }})}}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="eyebrow">Highest-value workflows</div>
          <h2 style={{{{fontSize:'clamp(28px,4vw,42px)',fontWeight:800,letterSpacing:'-.02em',margin:'12px 0 40px'}}}}>Start with the most-searched workflows</h2>
          <div className="grid-workflows">
            {{WORKFLOWS.slice().sort((a,b) => b.monthlySearches - a.monthlySearches).slice(0,9).map(w => (
              <Link key={{w.id}} href={{`/workflows/${{w.id}}`}} className="card" style={{{{padding:24,display:'block'}}}}>
                <div style={{{{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}}}>
                  <h3 style={{{{margin:0,fontSize:17,fontWeight:700,lineHeight:1.3}}}}>{{w.name}}</h3>
                  <span className={{`badge badge-${{w.risk.toLowerCase()}}`}}>{{w.risk}}</span>
                </div>
                <p style={{{{margin:'10px 0 0',fontSize:13,lineHeight:1.6,color:'#94a3b8'}}}}>{{w.description}}</p>
                <div style={{{{display:'flex',gap:16,marginTop:16}}}}>
                  <span style={{{{fontSize:12,color:'#{accent_color}'}}}}>{{w.monthlySearches.toLocaleString()}}/mo</span>
                  <span style={{{{fontSize:12,color:'#94a3b8'}}}}>${{w.cpc.toFixed(2)}} CPC</span>
                </div>
              </Link>
            ))}}
          </div>
          <div style={{{{textAlign:'center',marginTop:32}}}}>
            <Link href="/workflows" className="btn btn-secondary">See all {{totalWorkflows}} workflows →</Link>
          </div>
        </div>
      </section>

      <section id="status" className="section" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div className="card" style={{{{padding:36,borderColor:'rgba(251,191,36,.2)',background:'rgba(251,191,36,.03)'}}}}>
            <div className="eyebrow" style={{{{color:'#fcd34d'}}}}>Foundation stage</div>
            <h2 style={{{{margin:'12px 0',fontSize:24,fontWeight:700}}}}>The directory is ready; the execution engine is still being built.</h2>
            <p style={{{{margin:0,maxWidth:720,fontSize:15,lineHeight:1.7,color:'#94a3b8'}}}}>These pages are the master information architecture for {product_name}. We are not presenting unfinished workflows as fully operational. Each workflow will become executable as its product implementation is migrated into this repository.</p>
          </div>
        </div>
      </section>

      <footer style={{{{borderTop:'1px solid rgba(255,255,255,.08)',padding:'40px 0'}}}}>
        <div className="container" style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}}}>
          <div>
            <div style={{{{fontWeight:800,fontSize:16}}}}>{product_name}</div>
            <div style={{{{fontSize:13,color:'#94a3b8',marginTop:4}}}}>{{totalWorkflows}} workflows · {{families.length}} categories</div>
          </div>
          <div style={{{{fontSize:13,color:'#64748b'}}}}>{product_name} is not a law firm and does not provide legal advice.</div>
        </div>
      </footer>
    </main>
  )
}}''')
    with open(f"{repo_path}/app/page.tsx", 'w') as f:
        f.write(home_page)
    
    # ── workflows/page.tsx (hub) ──
    hub_page = textwrap.dedent(f'''\
import Link from 'next/link'
import {{ WORKFLOWS, type WorkflowFamily }} from '{workflow_import_path}'

const SITE_ORIGIN = 'https://{product_name.lower().replace(" ","-")}.pages.dev'

export function generateMetadata() {{
  return {{
    title: `{product_name} Workflows — All | {product_name}`,
    description: `Browse all {product_name} workflows organized by category. Upload the decision or notice, organize evidence, draft a response, review, and mail with proof.`,
    openGraph: {{
      title: `{product_name} Workflows`,
      description: `Problem-specific workflows with document upload, evidence organization, response drafting, review, and mailing proof.`,
      type: 'website',
      siteName: '{product_name}',
      url: SITE_ORIGIN + '/workflows',
    }},
    other: {{
      'application/ld+json': JSON.stringify({{
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: '{product_name} Workflows',
        itemListElement: WORKFLOWS.map((w, i) => ({{ '@type': 'ListItem', position: i + 1, name: w.name, url: SITE_ORIGIN + '/workflows/' + w.id }})),
      }}),
    }},
  }}
}}

export default function WorkflowsHub() {{
  const families = [...new Set(WORKFLOWS.map(w => w.family))] as WorkflowFamily[]
  return (
    <main>
      <header style={{{{borderBottom:'1px solid rgba(255,255,255,.08)',position:'sticky',top:0,background:'rgba(6,16,24,.85)',backdropFilter:'blur(12px)',zIndex:100}}}}>
        <div className="container" style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0'}}}}>
          <Link href="/" style={{{{fontWeight:800,fontSize:18,letterSpacing:'-.02em'}}}}>{product_name}</Link>
          <nav style={{{{display:'flex',gap:28,fontSize:14,color:'#94a3b8'}}}}>
            <Link href="/">Home</Link>
            {{families.map(f => <a key={{f}} href={{`#${{f.toLowerCase().replace(/[^a-z0-9]+/g,'-')}}`}}>{{f}}</a>)}}
          </nav>
        </div>
      </header>

      <section className="hero-gradient" style={{{{borderBottom:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container" style={{{{paddingTop:64,paddingBottom:56}}}}>
          <div className="eyebrow">ALL WORKFLOWS · {{WORKFLOWS.length}} TOTAL</div>
          <h1 style={{{{fontSize:'clamp(36px,6vw,64px)',lineHeight:1.05,fontWeight:800,letterSpacing:'-.02em',margin:'16px 0',maxWidth:820}}}}>
            Every workflow, organized by what you need to do.
          </h1>
          <p style={{{{fontSize:18,lineHeight:1.6,color:'#94a3b8',maxWidth:700,margin:'0 0 24px'}}}}>
            Each workflow has its own search intent, document requirements, evidence needs, and response structure.
          </p>
        </div>
      </section>

      {{families.map(family => {{
        const workflows = WORKFLOWS.filter(w => w.family === family)
        const slug = family.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        return (
          <section key={{family}} id={{slug}} className="section-tight" style={{{{borderBottom:'1px solid rgba(255,255,255,.06)'}}}}>
            <div className="container">
              <div style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}}}>
                <div>
                  <span className="badge badge-family">{{family}}</span>
                  <h2 style={{{{margin:'12px 0 0',fontSize:'clamp(24px,4vw,36px)',fontWeight:800,letterSpacing:'-.02em'}}}}>{{workflows.length}} {{family}} Workflows</h2>
                </div>
                <span style={{{{fontSize:13,color:'#64748b'}}}}>{{workflows.reduce((s,w) => s + w.monthlySearches, 0).toLocaleString()}} total monthly searches</span>
              </div>
              <div className="grid-workflows">
                {{workflows.map(w => (
                  <Link key={{w.id}} href={{`/workflows/${{w.id}}`}} className="card" style={{{{padding:22,display:'block'}}}}>
                    <div style={{{{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}}}>
                      <h3 style={{{{margin:0,fontSize:16,fontWeight:700,lineHeight:1.3}}}}>{{w.name}}</h3>
                      <span className={{`badge badge-${{w.risk.toLowerCase()}}`}}>{{w.risk}}</span>
                    </div>
                    <p style={{{{margin:'10px 0 0',fontSize:13,lineHeight:1.6,color:'#94a3b8'}}}}>{{w.description}}</p>
                    <div style={{{{display:'flex',gap:14,marginTop:14,paddingTop:14,borderTop:'1px solid rgba(255,255,255,.06)'}}}}>
                      <span style={{{{fontSize:12,color:'#{accent_color}',fontWeight:600}}}}>{{w.primaryKeyword}}</span>
                      <span style={{{{fontSize:12,color:'#64748b'}}}}>{{w.monthlySearches.toLocaleString()}}/mo</span>
                    </div>
                  </Link>
                ))}}
              </div>
            </div>
          </section>
        )
      }})}}

      <footer style={{{{borderTop:'1px solid rgba(255,255,255,.08)',padding:'40px 0'}}}}>
        <div className="container" style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}}}>
          <div>
            <Link href="/" style={{{{fontWeight:800,fontSize:16}}}}>{product_name}</Link>
            <div style={{{{fontSize:13,color:'#94a3b8',marginTop:4}}}}>{{WORKFLOWS.length}} workflows</div>
          </div>
          <div style={{{{fontSize:13,color:'#64748b'}}}}>{product_name} is not a law firm and does not provide legal advice.</div>
        </div>
      </footer>
    </main>
  )
}}''')
    with open(f"{repo_path}/app/workflows/page.tsx", 'w') as f:
        f.write(hub_page)

    # ── workflows/[id]/page.tsx (individual) ──
    # Determine the stage labels from the engine import if available
    stages_import = f"import {{ STAGES }} from '{engine_import_path}'\n" if engine_import_path else ""
    stages_use = "STAGES" if engine_import_path else "['analyze','organize','timeline','evidence','gaps','draft','review','mail-proof']"
    stages_desc = "['Identify the decision, stated reasons, dates, and review pathway.','Connect documents and facts to each proposed response ground.','Build a chronological timeline of events and deadlines.','Map supporting evidence and identify gaps.','Surface missing documents and unsupported claims.','Draft a factual response based on documented facts.','Human review of the draft before mailing.','Deliver the packet and preserve the filing record.']"
    
    detail_page = textwrap.dedent(f'''\
import Link from 'next/link'
import {{ notFound }} from 'next/navigation'
{{stages_import}}
import {{ workflowMap, WORKFLOWS, type {workflow_type_id_type} }} from '{workflow_import_path}'

const SITE_ORIGIN = 'https://{product_name.lower().replace(" ","-")}.pages.dev'
const STAGES = {stages_use}
const STAGE_DESCRIPTIONS = {stages_desc}

export function generateStaticParams() {{
  return WORKFLOWS.map(w => ({{ id: w.id }}))
}}

export async function generateMetadata({{ params }}: {{ params: Promise<{{ id: string }}> }}) {{
  const {{ id }} = await params
  const workflow = workflowMap[id as {workflow_type_id_type}]
  if (!workflow) return {{ title: '{product_name} Workflow' }}
  return {{
    title: `${{workflow.name}} | {product_name}`,
    description: workflow.description,
    keywords: [workflow.primaryKeyword, ...workflow.supportingKeywords],
    alternates: {{ canonical: `/workflows/${{workflow.id}}` }},
    openGraph: {{
      title: `${{workflow.name}} | {product_name}`,
      description: workflow.description,
      type: 'article',
      siteName: '{product_name}',
      url: `${{SITE_ORIGIN}}/workflows/${{workflow.id}}`,
    }},
    twitter: {{ card: 'summary', title: `${{workflow.name}} | {product_name}`, description: workflow.description }},
    other: {{
      'application/ld+json': JSON.stringify({{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: workflow.faqs.map(f => ({{ '@type': 'Question', name: f.q, acceptedAnswer: {{ '@type': 'Answer', text: f.a }} }})),
      }}),
    }},
  }}
}}

export default async function WorkflowPage({{ params }}: {{ params: Promise<{{ id: string }}> }}) {{
  const {{ id }} = await params
  const workflow = workflowMap[id as {workflow_type_id_type}]
  if (!workflow) notFound()

  const related = WORKFLOWS.filter(w => w.family === workflow.family && w.id !== workflow.id).slice(0, 4)
  const riskClass = `badge-${{workflow.risk.toLowerCase()}}`

  return (
    <main>
      <header style={{{{borderBottom:'1px solid rgba(255,255,255,.08)',position:'sticky',top:0,background:'rgba(6,16,24,.85)',backdropFilter:'blur(12px)',zIndex:100}}}}>
        <div className="container" style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'18px 0'}}}}>
          <Link href="/" style={{{{fontWeight:800,fontSize:18,letterSpacing:'-.02em'}}}}>{product_name}</Link>
          <nav style={{{{display:'flex',gap:28,fontSize:14,color:'#94a3b8'}}}}>
            <Link href="/workflows">All workflows</Link>
            <Link href="/">Home</Link>
          </nav>
        </div>
      </header>

      <div className="container" style={{{{paddingTop:20}}}}>
        <div style={{{{fontSize:13,color:'#64748b',display:'flex',gap:8,alignItems:'center'}}}}>
          <Link href="/" style={{{{color:'#64748b'}}}}>Home</Link><span>/</span>
          <Link href="/workflows" style={{{{color:'#64748b'}}}}>Workflows</Link><span>/</span>
          <span style={{{{color:'#94a3b8'}}}}>{{workflow.name}}</span>
        </div>
      </div>

      <section style={{{{paddingTop:32,paddingBottom:40}}}}>
        <div className="container">
          <div style={{{{display:'flex',gap:12,alignItems:'center',flexWrap:'wrap',marginBottom:16}}}}>
            <span className="badge badge-family">{{workflow.family}}</span>
            <span className={{`badge ${{riskClass}}`}}>{{workflow.risk}} RISK</span>
            {{workflow.requiresReview && <span style={{{{fontSize:12,color:'#94a3b8'}}}}>Human review required</span>}}
          </div>
          <h1 style={{{{fontSize:'clamp(36px,6vw,64px)',lineHeight:1.05,fontWeight:800,letterSpacing:'-.02em',margin:'0 0 20px',maxWidth:900}}}}>{{workflow.name}}</h1>
          <p style={{{{fontSize:'clamp(18px,2.5vw,22px)',lineHeight:1.6,color:'#94a3b8',maxWidth:760,margin:'0 0 32px'}}}}>{{workflow.description}}</p>
          <div style={{{{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:14,maxWidth:680}}}}>
            <div className="stat-card"><div className="muted" style={{{{fontSize:12}}}}>Monthly searches</div><div style={{{{fontSize:24,fontWeight:700,marginTop:4}}}}>{{workflow.monthlySearches.toLocaleString()}}</div></div>
            <div className="stat-card"><div className="muted" style={{{{fontSize:12}}}}>CPC</div><div style={{{{fontSize:24,fontWeight:700,marginTop:4}}}}>${{workflow.cpc.toFixed(2)}}</div></div>
            <div className="stat-card"><div className="muted" style={{{{fontSize:12}}}}>Competition</div><div style={{{{fontSize:24,fontWeight:700,marginTop:4}}}}>{{workflow.competition}}</div></div>
            <div className="stat-card"><div className="muted" style={{{{fontSize:12}}}}>Primary keyword</div><div style={{{{fontSize:15,fontWeight:600,marginTop:6,color:'#{accent_color}'}}}}>{{workflow.primaryKeyword}}</div></div>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div className="eyebrow">Workflow standard</div>
          <h2 style={{{{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,letterSpacing:'-.02em',margin:'12px 0 28px'}}}}>The 8-stage pipeline</h2>
          <div style={{{{display:'grid',gap:10,gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))'}}}}>
            {{STAGES.map((stage, i) => (
              <div className="pipeline-step" key={{stage}}>
                <span className="pipeline-num">{{String(i+1).padStart(2,'0')}}</span>
                <div>
                  <div style={{{{fontWeight:600,textTransform:'capitalize'}}}}>{{stage.replaceAll('-',' ')}}</div>
                  <div style={{{{fontSize:13,color:'#94a3b8',marginTop:2}}}}>{{STAGE_DESCRIPTIONS[i] || ''}}</div>
                </div>
              </div>
            ))}}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div style={{{{display:'grid',gap:20,gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))'}}}}>
            <div className="card" style={{{{padding:28}}}}>
              <div className="eyebrow">What you start with</div>
              <h3 style={{{{margin:'10px 0 16px',fontSize:20,fontWeight:700}}}}>Intake items</h3>
              <ul className="evidence-list">{{workflow.intake.map(item => <li key={{item}}>{{item}}</li>)}}</ul>
            </div>
            <div className="card" style={{{{padding:28}}}}>
              <div className="eyebrow">What you gather</div>
              <h3 style={{{{margin:'10px 0 16px',fontSize:20,fontWeight:700}}}}>Required evidence</h3>
              <ul className="evidence-list">{{workflow.requiredEvidence.map(item => <li key={{item}}>{{item}}</li>)}}</ul>
            </div>
            <div className="card" style={{{{padding:28}}}}>
              <div className="eyebrow">What you get</div>
              <h3 style={{{{margin:'10px 0 16px',fontSize:20,fontWeight:700}}}}>Outputs</h3>
              <ul className="evidence-list">{{workflow.outputs.map(item => <li key={{item}}>{{item}}</li>)}}</ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div className="eyebrow">Search intent cluster</div>
          <h3 style={{{{margin:'12px 0 20px',fontSize:22,fontWeight:700}}}}>This workflow targets</h3>
          <div style={{{{display:'flex',flexWrap:'wrap',gap:10}}}}>
            <span style={{{{padding:'8px 16px',borderRadius:10,background:'rgba({accent_color},.1)',color:'#{accent_color}',fontSize:13,fontWeight:600}}}}>{{workflow.primaryKeyword}} ({{workflow.monthlySearches.toLocaleString()}}/mo)</span>
            {{workflow.supportingKeywords.map(kw => <span key={{kw}} style={{{{padding:'8px 16px',borderRadius:10,background:'rgba(255,255,255,.04)',color:'#cbd5e1',fontSize:13}}}}>{{kw}}</span>)}}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div className="eyebrow">Safety guardrails</div>
          <h3 style={{{{margin:'12px 0 20px',fontSize:22,fontWeight:700}}}}>What this workflow will never do</h3>
          <div style={{{{display:'grid',gap:12}}}}>
            {{workflow.guardrails.map(rule => (
              <div key={{rule}} className="card" style={{{{padding:18,display:'flex',gap:12,alignItems:'flex-start'}}}}>
                <span style={{{{color:'#f87171',fontSize:18,fontWeight:700}}}}>&times;</span>
                <p style={{{{margin:0,fontSize:14,lineHeight:1.6,color:'#94a3b8'}}}}>{{rule}}</p>
              </div>
            ))}}
          </div>
        </div>
      </section>

      <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container" style={{{{maxWidth:800}}}}>
          <div className="eyebrow">Frequently asked questions</div>
          <h2 style={{{{fontSize:'clamp(24px,4vw,36px)',fontWeight:800,letterSpacing:'-.02em',margin:'12px 0 28px'}}}}>Common questions about {{workflow.name.toLowerCase()}}</h2>
          {{workflow.faqs.map((faq, i) => (
            <div key={{i}} className="faq-item"><h3>{{faq.q}}</h3><p>{{faq.a}}</p></div>
          ))}}
        </div>
      </section>

      {{related.length > 0 && (
        <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
          <div className="container">
            <div className="eyebrow">Related workflows</div>
            <h3 style={{{{margin:'12px 0 20px',fontSize:22,fontWeight:700}}}}>More in {{workflow.family}}</h3>
            <div style={{{{display:'grid',gap:14,gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))'}}}}>
              {{related.map(w => (
                <Link key={{w.id}} href={{`/workflows/${{w.id}}`}} className="card" style={{{{padding:18,display:'block'}}}}>
                  <h4 style={{{{margin:0,fontSize:15,fontWeight:600}}}}>{{w.name}}</h4>
                  <p style={{{{margin:'8px 0 0',fontSize:13,lineHeight:1.5,color:'#94a3b8'}}}}>{{w.description}}</p>
                </Link>
              ))}}
            </div>
          </div>
        </section>
      )}}

      <section className="section-tight" style={{{{borderTop:'1px solid rgba(255,255,255,.08)'}}}}>
        <div className="container">
          <div className="card" style={{{{padding:28,borderColor:'rgba(251,191,36,.2)',background:'rgba(251,191,36,.03)'}}}}>
            <strong style={{{{color:'#fcd34d'}}}}>Execution status:</strong>
            <span className="muted"> This vertical is still being implemented. The directory and search-intent page are live, but the interactive workflow is not yet presented as production-ready.</span>
          </div>
        </div>
      </section>

      <footer style={{{{borderTop:'1px solid rgba(255,255,255,.08)',padding:'40px 0'}}}}>
        <div className="container" style={{{{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16}}}}>
          <div>
            <Link href="/" style={{{{fontWeight:800,fontSize:16}}}}>{product_name}</Link>
            <div style={{{{fontSize:13,color:'#94a3b8',marginTop:4}}}}>{{WORKFLOWS.length}} workflows</div>
          </div>
          <div style={{{{fontSize:13,color:'#64748b'}}}}>{product_name} is not a law firm and does not provide legal advice.</div>
        </div>
      </footer>
    </main>
  )
}}''')
    with open(f"{repo_path}/app/workflows/[id]/page.tsx", 'w') as f:
        f.write(detail_page)

    print(f"✓ Generated scaffold for {product_name} at {repo_path}")

if __name__ == '__main__':
    print("Generator script ready. Call generate() from build-all.py")

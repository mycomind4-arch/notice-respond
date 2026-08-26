import Link from 'next/link'
import { notFound } from 'next/navigation'
import { INSURANCE_STAGES } from '@/domain/insurance-workflow-engine'
import { insuranceWorkflowMap, INSURANCE_WORKFLOWS, type InsuranceWorkflowId } from '@/domain/insurance-workflows'

export function generateStaticParams() { return INSURANCE_WORKFLOWS.map(workflow => ({ id: workflow.id })) }

export function generateMetadata({ params }: { params: { id: string } }) {
  const workflow = insuranceWorkflowMap[params.id as InsuranceWorkflowId]
  if (!workflow) return { title: 'Insurance Claims Workflow' }
  return { title: `${workflow.name} | Insurance Claims`, description: workflow.description }
}

export default function WorkflowPage({ params }: { params: { id: string } }) {
  const workflow = insuranceWorkflowMap[params.id as InsuranceWorkflowId]
  if (!workflow) notFound()
  return <main>
    <header style={{borderBottom:'1px solid #1e293b'}}><div className="container" style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:20,paddingBottom:20}}><Link href="/" style={{fontWeight:800}}>Insurance Claims</Link><Link href="/" className="muted">All workflows</Link></div></header>
    <section className="container" style={{paddingTop:64,paddingBottom:40}}>
      <div className="eyebrow">{workflow.risk} RISK · {workflow.primaryKeyword}</div>
      <h1 style={{fontSize:'clamp(40px,6vw,72px)',lineHeight:1.02,maxWidth:900,margin:'18px 0'}}>{workflow.name}</h1>
      <p className="muted" style={{fontSize:18,lineHeight:1.7,maxWidth:820}}>{workflow.description}</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginTop:28}}>
        <div className="card" style={{padding:18}}><div className="muted">Monthly searches</div><strong style={{fontSize:24}}>{workflow.monthlySearches.toLocaleString()}</strong></div>
        <div className="card" style={{padding:18}}><div className="muted">CPC</div><strong style={{fontSize:24}}>${workflow.cpc.toFixed(2)}</strong></div>
        <div className="card" style={{padding:18}}><div className="muted">Competition</div><strong style={{fontSize:24}}>{workflow.competition}</strong></div>
      </div>
    </section>
    <section className="container" style={{paddingBottom:80}}>
      <div style={{display:'grid',gridTemplateColumns:'1.4fr 1fr',gap:20}}>
        <div className="card" style={{padding:26}}>
          <div className="eyebrow">Workflow standard</div>
          <h2 style={{fontSize:28,margin:'10px 0 22px'}}>Claim → Coverage/Documents → Evidence → Timeline → Gaps → Response/Appeal → Review → Mail/Proof</h2>
          <div style={{display:'grid',gap:10}}>{INSURANCE_STAGES.map((stage,index)=><div key={stage} style={{display:'flex',gap:14,alignItems:'center',padding:'13px 14px',border:'1px solid #1e293b',borderRadius:12}}><span style={{fontSize:12,fontWeight:800,color:'#67e8f9'}}>{String(index+1).padStart(2,'0')}</span><span style={{textTransform:'capitalize'}}>{stage.replaceAll('-',' ')}</span></div>)}</div>
        </div>
        <div style={{display:'grid',gap:20}}>
          <div className="card" style={{padding:26}}><div className="eyebrow">Intake</div><ul>{workflow.intake.map(item=><li key={item} style={{margin:'9px 0'}}>{item}</li>)}</ul></div>
          <div className="card" style={{padding:26}}><div className="eyebrow">Required evidence</div><ul>{workflow.requiredEvidence.map(item=><li key={item} style={{margin:'9px 0'}}>{item}</li>)}</ul></div>
          <div className="card" style={{padding:26}}><div className="eyebrow">Outputs</div><ul>{workflow.outputs.map(item=><li key={item} style={{margin:'9px 0'}}>{item}</li>)}</ul></div>
        </div>
      </div>
      <div className="card" style={{padding:26,marginTop:20}}><div className="eyebrow">Guardrails</div>{workflow.guardrails.map(rule=><p key={rule} className="muted">{rule}</p>)}</div>
    </section>
  </main>
}

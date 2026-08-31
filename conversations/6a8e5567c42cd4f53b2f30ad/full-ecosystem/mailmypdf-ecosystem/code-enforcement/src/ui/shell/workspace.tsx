'use client'

import { useState, useMemo } from 'react'
import { colors, typography } from '../tokens/tokens'
import { CaseShell } from './case-shell'
import { CaseOverview } from '../case/overview'
import { Timeline } from '../timeline/timeline'
import { EvidenceCenter } from '../evidence/evidence-center'
import { FindingsCenter } from '../findings/findings-center'
import { ViolationList } from '../findings/violation-list'
import { PropertyPanel } from '../property/property-panel'
import { ActionCenter } from '../actions/action-center'
import { CommunicationsList } from '../communications/communications-list'
import { WorkflowProgress, WorkflowSelector } from '../workflows/workflow-progress'
import { ReviewPanel } from '../review/review-panel'
import type { CaseAreaView, FindingViewModel } from '../types/view-models'

// ─── FIXTURE DATA ───────────────────────────────────────────────────────────────
// The following import is DEVELOPMENT FIXTURE data only.
// In production, case data flows through the same view model interfaces from
// the entity/database layer. This fixture must never be used as default
// persisted case data.
// ──────────────────────────────────────────────────────────────────────────
import {
  fixtureCase, fixtureSidebar, fixtureOverview, fixtureTimeline,
  fixtureEvidence, fixtureFindings, fixtureViolations, fixtureProperty,
  fixtureActions, fixtureCommunications, fixtureWorkflowProgress,
  fixtureWorkflowOptions, fixtureReview,
} from '../fixtures/mckinleyville'

// ─── Main Workspace ───────────────────────────────────────────────────────────

export function CodeEnforcementWorkspace() {
  const [view, setView] = useState<CaseAreaView>('overview')

  return (
    <CaseShell
      context={fixtureCase}
      sidebarItems={fixtureSidebar}
      initialView={view}
      onContinue={() => setView('workflows')}
      onReviewFindings={() => setView('findings')}
    >
      <CaseShellContent view={view} onNavigate={setView} />
    </CaseShell>
  )
}

// ─── View Router ──────────────────────────────────────────────────────────────

function CaseShellContent({ view, onNavigate }: { view: CaseAreaView; onNavigate: (v: CaseAreaView) => void }) {
  // Find any findings that require human review
  const reviewFindings = useMemo(
    () => fixtureFindings.filter(f => f.humanReviewRequired),
    []
  )

  switch (view) {
    case 'overview':
      return <CaseOverview context={fixtureCase} data={fixtureOverview} onNavigate={(v) => onNavigate(v as CaseAreaView)} />

    case 'timeline':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Timeline</h2>
          <Timeline events={fixtureTimeline} />
        </div>
      )

    case 'violations':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Alleged Violations</h2>
          <ViolationList violations={fixtureViolations} />
        </div>
      )

    case 'evidence':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Evidence Center</h2>
          <EvidenceCenter items={fixtureEvidence} />
        </div>
      )

    case 'findings':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Findings & Discrepancies</h2>
          <FindingsCenter findings={fixtureFindings} />

          {/* High-Consequence Review — appears when findings require human review */}
          {reviewFindings.length > 0 && (
            <div style={{ marginTop: '32px' }}>
              <h2 style={{
                fontSize: typography.lg,
                fontWeight: typography.semibold,
                color: colors.statusHigh,
                marginBottom: '16px',
                borderLeft: `3px solid ${colors.statusHigh}`,
                paddingLeft: '12px',
              }}>
                High-Consequence Review
              </h2>
              <p style={{ fontSize: typography.sm, color: colors.textMuted, marginBottom: '16px', paddingLeft: '15px' }}>
                The following findings require human authorization before any document is sent.
              </p>
              <ReviewPanel data={fixtureReview} />
            </div>
          )}
        </div>
      )

    case 'property':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Property Intelligence</h2>
          <PropertyPanel info={fixtureProperty} />
        </div>
      )

    case 'actions':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Action Center</h2>
          <ActionCenter actions={fixtureActions} />
        </div>
      )

    case 'communications':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Communications</h2>
          <CommunicationsList communications={fixtureCommunications} />
        </div>
      )

    case 'workflows':
      return (
        <div>
          <h2 style={{ fontSize: typography.lg, fontWeight: typography.semibold, color: colors.textPrimary, marginBottom: '16px' }}>Workflow Progress</h2>
          <WorkflowProgress data={fixtureWorkflowProgress} />
          <div style={{ marginTop: '32px' }}>
            <h3 style={{ fontSize: typography.sm, fontWeight: typography.semibold, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>Available Workflows</h3>
            <WorkflowSelector options={fixtureWorkflowOptions} />
          </div>
        </div>
      )

    default:
      return null
  }
}

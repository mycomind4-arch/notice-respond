-- FairProcess: Policy Studio Tables (Phase 3)
-- Run this in the Supabase SQL Editor to create the PolicyRule and RuleChangelogEntry tables.

CREATE TABLE IF NOT EXISTS public.policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version INTEGER NOT NULL DEFAULT 1,
    jurisdiction TEXT NOT NULL DEFAULT 'humboldt',
    statute_reference TEXT NOT NULL,
    enabling_authority TEXT,
    category TEXT NOT NULL CHECK (category IN ('deadline','notice_requirement','documentation_requirement','inspection_requirement','other')),
    plain_language_description TEXT NOT NULL,
    trigger_event TEXT,
    comparison_event TEXT,
    comparison_operator TEXT CHECK (comparison_operator IN ('at_most','at_least','exactly','before','after')),
    threshold_value NUMERIC,
    threshold_unit TEXT CHECK (threshold_unit IN ('calendar_days','business_days')),
    severity_if_violated TEXT CHECK (severity_if_violated IN ('material_inconsistency','procedural_risk','documentation_gap')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','in_review','active','superseded','archived')),
    effective_start_date DATE,
    effective_end_date DATE,
    superseded_by UUID REFERENCES public.policy_rules(id),
    author TEXT,
    reviewer TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_modified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rule_changelog_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES public.policy_rules(id),
    version_number INTEGER NOT NULL,
    change_summary TEXT NOT NULL,
    enabling_authority_citation TEXT NOT NULL,
    changed_by TEXT,
    reviewed_by TEXT,
    published_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.policy_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rule_changelog_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage policy rules"
    ON public.policy_rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can manage changelog"
    ON public.rule_changelog_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Anon can read active rules"
    ON public.policy_rules FOR SELECT TO anon USING (status = 'active');

CREATE POLICY "Anon can read changelog"
    ON public.rule_changelog_entries FOR SELECT TO anon USING (true);

CREATE INDEX IF NOT EXISTS idx_policy_rules_jurisdiction ON public.policy_rules(jurisdiction);
CREATE INDEX IF NOT EXISTS idx_policy_rules_status ON public.policy_rules(status);
CREATE INDEX IF NOT EXISTS idx_policy_rules_statute ON public.policy_rules(statute_reference);
CREATE INDEX IF NOT EXISTS idx_rule_changelog_rule_id ON public.rule_changelog_entries(rule_id);

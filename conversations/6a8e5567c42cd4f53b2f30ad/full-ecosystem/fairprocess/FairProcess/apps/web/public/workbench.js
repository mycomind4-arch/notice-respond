// ─────────────────────────────────────────────────────────────────────────
// FairProcess Workbench — UI shell (extracted from the static mockup)
// This file is pure UI wiring: navigation + tab state. No network calls yet.
// ─────────────────────────────────────────────────────────────────────────

// ===== Navigation =====
document.querySelectorAll('.fp-nav-item').forEach(item => {
    item.addEventListener('click', function () {
        const page = this.dataset.page;
        if (!page) return;

        // Update nav
        document.querySelectorAll('.fp-nav-item').forEach(n => n.classList.remove('active'));
        this.classList.add('active');

        // Update pages
        document.querySelectorAll('.fp-page').forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + page);
        if (target) target.classList.add('active');

        // Hook: load real data for this page once wired up (see FP_DATA_SOURCES below)
        FairProcessWorkbench.loadPageData(page);
    });
});

// ===== Policy Studio Tabs =====
document.querySelectorAll('.fp-ps-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.fp-ps-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== Policy Studio Sidebar Tabs =====
document.querySelectorAll('.fp-ps-sidebar-tab').forEach(tab => {
    tab.addEventListener('click', function () {
        document.querySelectorAll('.fp-ps-sidebar-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== Policy Studio Rule Selection =====
document.querySelectorAll('.fp-ps-rule').forEach(rule => {
    rule.addEventListener('click', function () {
        document.querySelectorAll('.fp-ps-rule').forEach(r => r.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== Policy Studio Pagination =====
document.querySelectorAll('.fp-ps-page').forEach(page => {
    page.addEventListener('click', function () {
        if (this.textContent === '…') return;
        document.querySelectorAll('.fp-ps-page').forEach(p => p.classList.remove('active'));
        this.classList.add('active');
    });
});

// ===== Quick Actions =====
document.querySelectorAll('.fp-quick-item, .fp-workspace-btn, .fp-header-user, .fp-panel-link').forEach(el => {
    el.addEventListener('click', function (e) {
        e.stopPropagation();
        console.log('Clicked:', this.textContent.trim());
    });
});

// ===== Header buttons =====
document.querySelectorAll('.fp-header-btn').forEach(btn => {
    btn.addEventListener('click', function () {
        console.log('Header action clicked');
    });
});

// ─────────────────────────────────────────────────────────────────────────
// DATA WIRING SCAFFOLD
//
// Every page below currently renders hardcoded demo HTML. This manifest
// tracks which pages already have a real endpoint in packages/api-server,
// and which ones need a new route before they can go live. Fill in
// loadPageData() per page as you wire each one up — the nav click handler
// above already calls it on every page switch.
//
// Endpoints confirmed to exist today (packages/api-server/src/):
//   case-workflow-routes.ts   GET/POST  /api/cases
//                             GET       /api/cases/:id
//                             POST      /api/cases/:id/audit
//                             POST      /api/cases/:id/evidence
//                             GET       /api/audit/verify-chain
//                             GET/POST  /api/records-requests
//                             PATCH     /api/records-requests/:id  (check exact path in file)
//   policy-routes.ts         GET       /api/policies
//                             GET       /api/policies/:id
//                             POST      /api/policies
//                             PATCH     /api/policies/:id/activate
//   report-routes.ts         GET       /api/reports/:id
//                             GET       /api/reports/:id/markdown
//                             POST      /api/reports/:id/authorize
//                             POST      /api/reports/:id/publish
//
// No backend route exists yet for: communications, questions, analytics,
// settings. "Public Records" (recorder/assessor/GIS/court lookups) is also
// distinct from /api/records-requests (which is a FOIA-style request
// tracker) — that one likely needs the Playwright/Tyler Technologies
// recorder-portal work to back it, not a simple REST wrapper.
// ─────────────────────────────────────────────────────────────────────────
const FP_DATA_SOURCES = {
    dashboard: { status: 'needs-aggregation-endpoint', endpoint: null },
    cases: { status: 'ready', endpoint: '/api/cases' },
    timeline: { status: 'derive-from-case-audit', endpoint: '/api/cases/:id/audit' },
    evidence: { status: 'ready', endpoint: '/api/cases/:id/evidence' },
    communications: { status: 'no-endpoint-yet', endpoint: null },
    questions: { status: 'no-endpoint-yet', endpoint: null },
    reports: { status: 'ready', endpoint: '/api/reports/:id' },
    rules: { status: 'ready', endpoint: '/api/policies' },
    'policy-studio': { status: 'ready', endpoint: '/api/policies/:id' },
    'public-records': { status: 'needs-recorder-integration', endpoint: null },
    analytics: { status: 'no-endpoint-yet', endpoint: null },
    settings: { status: 'no-endpoint-yet', endpoint: null },
};

const FairProcessWorkbench = {
    dataSources: FP_DATA_SOURCES,

    // Called every time the user switches pages. Currently a no-op logger;
    // replace the body per-page with a real fetch() against the API once
    // the connection/token flow (see live.html/live.js) is threaded through.
    loadPageData(page) {
        const source = FP_DATA_SOURCES[page];
        if (!source) return;

        if (source.status === 'ready') {
            // TODO: fetch(source.endpoint, { headers: { Authorization: `Bearer ${token}` } })
            //   .then(...)
            //   .then(data => renderPage(page, data));
            console.log(`[workbench] "${page}" has a real endpoint (${source.endpoint}) — not wired yet.`);
        } else {
            console.log(`[workbench] "${page}" is still demo data (${source.status}).`);
        }
    },
};

console.log('FairProcess Workbench UI loaded (CSP-compliant, external files).');
console.log('📋 All pages: Dashboard, Cases, Timeline, Evidence, Communications, Questions, Reports, Rules & Statutes, Policy Studio, Public Records, Analytics, Settings');
console.log('⚖️ Data wiring status:', FP_DATA_SOURCES);

const state = {
  apiBase: "",
  aiBase: "",
  aiKey: "",
  token: "",
  me: null,
  cases: [],
  currentCaseId: null,
  currentCase: null,
  policies: [],
  currentPolicy: null,
  currentReportId: null,
  currentReport: null,
  markdown: "",
  noticeTimer: null,
  discoveryData: [],
  discoveryFilter: "all",
  discoverySearch: "",
  activeTab: "cases",
  rules: [],
  currentRule: null,
  ruleChangelog: [],
  ruleFilters: { jurisdiction: '', category: '', status: '', statute: '' },
  ruleEditorOpen: false,
  ruleImpactCases: [],
};

const CLASSIFICATION_LABELS = {
  confirmed_government_taking: "Confirmed government taking",
  tax_sale_after_code_enforcement: "Tax sale after code enforcement",
  possible_pressured_sale: "Possible pressured sale",
  ownership_change_after_notice_cause_unknown: "Ownership change — cause unknown",
  owner_retained_property: "Owner retained",
  not_code_enforcement: "Not code-enforcement",
};

const CLASSIFICATION_ICONS = {
  confirmed_government_taking: "⛔",
  tax_sale_after_code_enforcement: "🔔",
  possible_pressured_sale: "⚠",
  ownership_change_after_notice_cause_unknown: "↻",
  owner_retained_property: "✓",
  not_code_enforcement: "—",
};

const elements = {
  connectionPanel: byId("connection-panel"),
  connectionForm: byId("connection-form"),
  apiBase: byId("api-base"),
  aiBase: byId("ai-base"),
  aiKey: byId("ai-key"),
  accessToken: byId("access-token"),
  workspace: byId("cases-tab"),
  discoveryTab: byId("discovery-tab"),
  tabNav: byId("tab-nav"),
  disconnect: byId("disconnect-button"),
  identityName: byId("identity-name"),
  identityMeta: byId("identity-meta"),
  permissionList: byId("permission-list"),
  refreshCases: byId("refresh-cases"),
  createCaseForm: byId("create-case-form"),
  createCaseButton: byId("create-case-button"),
  caseCount: byId("case-count"),
  caseList: byId("case-list"),
  emptyCase: byId("empty-case"),
  caseContent: byId("case-content"),
  caseTitle: byId("case-title"),
  caseSubtitle: byId("case-subtitle"),
  caseStatus: byId("case-status"),
  caseApnCount: byId("case-apn-count"),
  caseExpectationCount: byId("case-expectation-count"),
  caseInstrumentCount: byId("case-instrument-count"),
  refreshCase: byId("refresh-case"),
  loadTrail: byId("load-trail"),
  expectationForm: byId("expectation-form"),
  expectationButton: byId("expectation-button"),
  policySelect: byId("policy-select"),
  policyStatus: byId("policy-status"),
  ruleSelect: byId("rule-select"),
  ruleDescription: byId("rule-description"),
  recorderForm: byId("recorder-form"),
  recorderButton: byId("recorder-button"),
  recorderFile: byId("recorder-file"),
  recorderCsv: byId("recorder-csv"),
  runAudit: byId("run-audit"),
  verifyChain: byId("verify-chain"),
  aiExtractBtn: byId("ai-extract-btn"),
  aiClassifyBtn: byId("ai-classify-btn"),
  aiDeadlineBtn: byId("ai-deadline-btn"),
  aiDocText: byId("ai-doc-text"),
  aiFactsResult: byId("ai-facts-result"),
  aiClassifyResult: byId("ai-classify-result"),
  aiDeadlineResult: byId("ai-deadline-result"),
  narrativeBtn: byId("narrative-btn"),
  ingestOrdinanceBtn: byId("ingest-ordinance-btn"),
  downloadPolicyBtn: byId("download-policy-btn"),
  ordinanceResult: byId("ordinance-result"),
  aiStatus: byId("ai-status"),
  chainResult: byId("chain-result"),
  reportSection: byId("report-section"),
  reportStatus: byId("report-status"),
  reportSummary: byId("report-summary"),
  reportWarnings: byId("report-warnings"),
  reportFindings: byId("report-findings"),
  downloadMarkdown: byId("download-markdown"),
  authorizeReport: byId("authorize-report"),
  publishReport: byId("publish-report"),
  trailSection: byId("trail-section"),
  auditTrail: byId("audit-trail"),
  notice: byId("notice"),
  discoveryCount: byId("discovery-count"),
  discoveryImportZone: byId("discovery-import-zone"),
  discoveryFile: byId("discovery-file"),
  discoveryContent: byId("discovery-content"),
  discoveryEmpty: byId("discovery-empty"),
  discoveryStats: byId("discovery-stats"),
  discoveryFilters: byId("discovery-filters"),
  discoverySearch: byId("discovery-search"),
  discoveryList: byId("discovery-list"),
  policyTab: byId('policy-tab'),
  ruleList: byId('rule-list'),
  ruleCount: byId('rule-count'),
  newRuleButton: byId('new-rule-button'),
  ruleFilterJurisdiction: byId('rule-filter-jurisdiction'),
  ruleFilterCategory: byId('rule-filter-category'),
  ruleFilterStatus: byId('rule-filter-status'),
  ruleFilterStatute: byId('rule-filter-statute'),
  ruleEditor: byId('rule-editor'),
  ruleEditorForm: byId('rule-editor-form'),
  ruleEditorTitle: byId('rule-editor-title'),
  ruleJurisdiction: byId('rule-jurisdiction'),
  ruleStatute: byId('rule-statute'),
  ruleAuthority: byId('rule-authority'),
  ruleCategory: byId('rule-category'),
  ruleDescription: byId('rule-description'),
  ruleTriggerEvent: byId('rule-trigger-event'),
  ruleComparisonEvent: byId('rule-comparison-event'),
  ruleOperator: byId('rule-operator'),
  ruleThreshold: byId('rule-threshold'),
  ruleUnit: byId('rule-unit'),
  ruleSeverity: byId('rule-severity'),
  rulePreview: byId('rule-preview'),
  saveRuleButton: byId('save-rule-button'),
  submitReviewButton: byId('submit-review-button'),
  publishRuleButton: byId('publish-rule-button'),
  cancelRuleButton: byId('cancel-rule-button'),
  ruleReviewer: byId('rule-reviewer'),
  ruleChangeSummary: byId('rule-change-summary'),
  ruleEffectiveDate: byId('rule-effective-date'),
  changelogList: byId('changelog-list'),
  impactPreview: byId('impact-preview'),
  impactCases: byId('impact-cases'),
  impactCount: byId('impact-count'),
  closeImpactButton: byId('close-impact-button'),
};

initializeDates();
setPermissionControls();
setupTabs();
setupDiscoveryImport();
setupPolicyStudio();

elements.connectionForm.addEventListener("submit", connect);
elements.disconnect.addEventListener("click", disconnect);
elements.refreshCases.addEventListener("click", () => runAction(elements.refreshCases, "Refreshing…", loadCases));
elements.createCaseForm.addEventListener("submit", createCase);
elements.refreshCase.addEventListener("click", () => runAction(elements.refreshCase, "Refreshing…", refreshCurrentCase));
elements.loadTrail.addEventListener("click", () => runAction(elements.loadTrail, "Loading…", loadAuditTrail));
elements.policySelect.addEventListener("change", () => runAction(null, "", loadSelectedPolicy));
elements.ruleSelect.addEventListener("change", renderSelectedRule);
elements.expectationForm.addEventListener("submit", addExpectation);
elements.recorderFile.addEventListener("change", readRecorderFile);
elements.recorderForm.addEventListener("submit", importRecorderCsv);
elements.runAudit.addEventListener("click", () => runAction(elements.runAudit, "Running…", runAudit));
elements.verifyChain.addEventListener("click", () => runAction(elements.verifyChain, "Verifying…", verifyAuditChain));
elements.aiExtractBtn.addEventListener("click", () => runAction(elements.aiExtractBtn, "Extracting…", extractFactsWithAi));
elements.aiClassifyBtn.addEventListener("click", () => runAction(elements.aiClassifyBtn, "Classifying…", classifyDocumentWithAi));
elements.aiDeadlineBtn?.addEventListener("click", () => runAction(elements.aiDeadlineBtn, "Checking…", checkDeadlinesWithAi));
elements.narrativeBtn?.addEventListener("click", () => runAction(elements.narrativeBtn, "Drafting…", draftNarrativeWithAi));
elements.ingestOrdinanceBtn?.addEventListener("click", () => runAction(elements.ingestOrdinanceBtn, "Ingesting…", ingestOrdinanceWithAi));
elements.downloadPolicyBtn?.addEventListener("click", downloadPolicyJson);
elements.downloadMarkdown.addEventListener("click", () => runAction(elements.downloadMarkdown, "Preparing…", downloadMarkdown));
elements.authorizeReport.addEventListener("click", () => runAction(elements.authorizeReport, "Authorizing…", authorizeReport));
elements.publishReport.addEventListener("click", () => runAction(elements.publishReport, "Publishing…", publishReport));

window.addEventListener("beforeunload", clearSensitiveState);

// ── Tab navigation ──────────────────────────────────────────────────────────

function setupTabs() {
  const buttons = document.querySelectorAll(".tab-button");
  for (const btn of buttons) {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  }
}

function switchTab(tab) {
  state.activeTab = tab;
  const buttons = document.querySelectorAll(".tab-button");
  for (const btn of buttons) {
    btn.classList.toggle("active", btn.dataset.tab === tab);
  }
  elements.workspace.hidden = tab !== "cases";
  elements.discoveryTab.hidden = tab !== "discovery";
  elements.policyTab.hidden = tab !== "policy";
  if (tab === "policy") loadRules();
}

// ── Discovery import ─────────────────────────────────────────────────────────

function setupDiscoveryImport() {
  const zone = elements.discoveryImportZone;

  zone.addEventListener("click", () => elements.discoveryFile.click());

  elements.discoveryFile.addEventListener("change", async () => {
    const file = elements.discoveryFile.files?.[0];
    if (file) await loadDiscoveryFile(file);
  });

  zone.addEventListener("dragover", (e) => {
    e.preventDefault();
    zone.classList.add("dragover");
  });

  zone.addEventListener("dragleave", () => zone.classList.remove("dragover"));

  zone.addEventListener("drop", async (e) => {
    e.preventDefault();
    zone.classList.remove("dragover");
    const file = e.dataTransfer?.files?.[0];
    if (file) await loadDiscoveryFile(file);
  });

  elements.discoverySearch.addEventListener("input", () => {
    state.discoverySearch = elements.discoverySearch.value.toLowerCase();
    renderDiscoveryList();
  });
}

async function loadDiscoveryFile(file) {
  if (file.size > 10_000_000) {
    showNotice("File too large (10 MB max)", "error");
    return;
  }
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      // Single property object
      state.discoveryData = [data];
    } else {
      state.discoveryData = data;
    }

    elements.discoveryImportZone.hidden = true;
    elements.discoveryEmpty.hidden = true;
    elements.discoveryContent.hidden = false;

    renderDiscoveryStats();
    renderDiscoveryFilters();
    renderDiscoveryList();

    elements.discoveryCount.textContent = String(state.discoveryData.length);
    showNotice(`Imported ${state.discoveryData.length} properties from CodeSale Finder`, "success");
  } catch (error) {
    showNotice(`Failed to parse JSON: ${error.message}`, "error");
  }
}

function renderDiscoveryStats() {
  const stats = {};
  for (const p of state.discoveryData) {
    const cls = p.classification || "unknown";
    stats[cls] = (stats[cls] || 0) + 1;
  }

  const tiles = [
    { label: "Total properties", value: state.discoveryData.length },
    { label: "Government takings", value: stats.confirmed_government_taking || 0 },
    { label: "Tax sales", value: stats.tax_sale_after_code_enforcement || 0 },
    { label: "Pressured sales", value: stats.possible_pressured_sale || 0 },
    { label: "Owner retained", value: stats.owner_retained_property || 0 },
  ];

  elements.discoveryStats.replaceChildren();
  for (const tile of tiles) {
    const div = document.createElement("div");
    div.className = "discovery-stat";
    const value = document.createElement("div");
    value.className = "stat-value";
    value.textContent = String(tile.value);
    const label = document.createElement("div");
    label.className = "stat-label";
    label.textContent = tile.label;
    div.append(value, label);
    elements.discoveryStats.append(div);
  }
}

function renderDiscoveryFilters() {
  const filters = [
    { key: "all", label: "All" },
    { key: "confirmed_government_taking", label: "Government taking" },
    { key: "tax_sale_after_code_enforcement", label: "Tax sale" },
    { key: "possible_pressured_sale", label: "Pressured sale" },
    { key: "ownership_change_after_notice_cause_unknown", label: "Cause unknown" },
    { key: "owner_retained_property", label: "Owner retained" },
  ];

  // Clear existing chips (keep search input)
  const existing = elements.discoveryFilters.querySelectorAll(".filter-chip");
  for (const chip of existing) chip.remove();

  for (const f of filters) {
    const chip = document.createElement("button");
    chip.className = "filter-chip" + (state.discoveryFilter === f.key ? " active" : "");
    chip.textContent = f.label;
    chip.addEventListener("click", () => {
      state.discoveryFilter = f.key;
      renderDiscoveryFilters();
      renderDiscoveryList();
    });
    elements.discoveryFilters.append(chip);
  }
}

function renderDiscoveryList() {
  let filtered = state.discoveryData;

  if (state.discoveryFilter !== "all") {
    filtered = filtered.filter((p) => p.classification === state.discoveryFilter);
  }

  if (state.discoverySearch) {
    filtered = filtered.filter((p) => {
      const apn = (p.apn || "").toLowerCase();
      const addr = (p.address || "").toLowerCase();
      const owner = (p.current_owner || p.grantor || "").toLowerCase();
      return apn.includes(state.discoverySearch) ||
        addr.includes(state.discoverySearch) ||
        owner.includes(state.discoverySearch);
    });
  }

  elements.discoveryList.replaceChildren();

  if (filtered.length === 0) {
    const msg = document.createElement("p");
    msg.className = "form-note";
    msg.textContent = "No properties match the current filters.";
    elements.discoveryList.append(msg);
    return;
  }

  for (const prop of filtered) {
    elements.discoveryList.append(propertyCard(prop));
  }
}

function propertyCard(prop) {
  const card = document.createElement("article");
  card.className = "property-card";

  // Header
  const header = document.createElement("div");
  header.className = "property-card-header";

  const titleWrap = document.createElement("div");
  const title = document.createElement("h3");
  title.textContent = prop.address || prop.apn || "Unknown property";
  const apn = document.createElement("div");
  apn.className = "apn";
  apn.textContent = `APN: ${prop.apn || "—"}`;
  titleWrap.append(title, apn);

  const badge = document.createElement("span");
  const cls = prop.classification || "unknown";
  badge.className = "classification-badge " + cls.replace(/_/g, "-");
  badge.textContent = `${CLASSIFICATION_ICONS[cls] || "?"} ${CLASSIFICATION_LABELS[cls] || cls}`;

  header.append(titleWrap, badge);
  card.append(header);

  // Meta grid
  const meta = document.createElement("div");
  meta.className = "property-meta";

  const metaItems = [
    { label: "First notice", value: prop.first_notice_date || "—" },
    { label: "Transfer date", value: prop.transfer_date || "—" },
    { label: "Transfer type", value: prop.transfer_type || "—" },
    { label: "Has lien", value: prop.has_lien ? "Yes" : "No" },
  ];

  for (const item of metaItems) {
    const wrap = document.createElement("div");
    wrap.className = "property-meta-item";
    const label = document.createElement("div");
    label.className = "meta-label";
    label.textContent = item.label;
    const value = document.createElement("div");
    value.className = "meta-value";
    value.textContent = item.value;
    wrap.append(label, value);
    meta.append(wrap);
  }
  card.append(meta);

  // Reasoning
  if (prop.reasoning) {
    const reasoning = document.createElement("div");
    reasoning.className = "property-reasoning";
    reasoning.textContent = prop.reasoning;
    card.append(reasoning);
  }

  // Actions
  const actions = document.createElement("div");
  actions.className = "property-actions";

  const createBtn = document.createElement("button");
  createBtn.className = "button button-primary";
  createBtn.textContent = "Create FairProcess case";
  createBtn.style.minHeight = "36px";
  createBtn.style.padding = "7px 14px";
  createBtn.style.fontSize = "12px";
  createBtn.addEventListener("click", () => createCaseFromDiscovery(prop));
  createBtn.disabled = !hasPermission("case:write");

  actions.append(createBtn);
  card.append(actions);

  return card;
}

function createCaseFromDiscovery(prop) {
  switchTab("cases");

  // Pre-fill the create case form
  const form = elements.createCaseForm;
  form.elements.namedItem("jurisdiction").value = "Humboldt County, California";
  form.elements.namedItem("agency").value = "Planning and Building";
  form.elements.namedItem("agencyCaseNumber").value = prop.related_case_number || "";
  const apns = form.elements.namedItem("apns");
  apns.value = prop.apn || "";

  // Open the create-case details if collapsed
  const details = document.querySelector(".create-case");
  if (details) details.open = true;

  showNotice(`Pre-filled case form for ${prop.apn || prop.address}`, "info");
  elements.createCaseForm.scrollIntoView({ behavior: "smooth", block: "center" });
}

// ── Utility functions ───────────────────────────────────────────────────────

function byId(id) {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required element: ${id}`);
  return element;
}

function initializeDates() {
  const today = new Date().toISOString().slice(0, 10);
  const caseDate = elements.createCaseForm.elements.namedItem("asOf");
  const searchDate = elements.recorderForm.elements.namedItem("searchedOn");
  if (caseDate instanceof HTMLInputElement) caseDate.value = today;
  if (searchDate instanceof HTMLInputElement) searchDate.value = today;
}

function normalizeApiBase(value) {
  const url = new URL(value);
  if (!new Set(["http:", "https:"]).has(url.protocol)) {
    throw new Error("API base URL must use HTTP or HTTPS");
  }
  url.hash = "";
  url.search = "";
  return url.href.replace(/\/$/, "");
}

async function api(path, options = {}) {
  if (!state.token) throw new Error("Connect to FairProcess first");

  const headers = new Headers({
    Accept: options.accept ?? "application/json",
    Authorization: `Bearer ${state.token}`,
  });
  if (options.body !== undefined) headers.set("Content-Type", "application/json");

  const response = await fetch(`${state.apiBase}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    credentials: "omit",
    cache: "no-store",
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(responseError(text, response.status));
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) return text ? JSON.parse(text) : null;
  return text;
}

async function aiApi(path, body) {
  if (!state.aiBase) throw new Error("AI worker URL not configured");
  const headers = new Headers({ "Content-Type": "application/json" });
  if (state.aiKey) headers.set("Authorization", `Bearer ${state.aiKey}`);
  const response = await fetch(`${state.aiBase}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: "omit",
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) throw new Error(responseError(text, response.status));
  return text ? JSON.parse(text) : null;
}

function responseError(text, status) {
  try {
    const parsed = JSON.parse(text);
    return parsed.message || parsed.error || `Request failed with status ${status}`;
  } catch {
    return text.trim() || `Request failed with status ${status}`;
  }
}

// ── Connection ───────────────────────────────────────────────────────────────

async function connect(event) {
  event.preventDefault();
  const submit = elements.connectionForm.querySelector('button[type="submit"]');
  const token = elements.accessToken.value.trim();

  await runAction(submit, "Verifying…", async () => {
    state.apiBase = normalizeApiBase(elements.apiBase.value.trim());
    state.aiBase = normalizeApiBase(elements.aiBase?.value?.trim() || "https://fairprocess-ai.mailmypdf.workers.dev");
    state.aiKey = elements.aiKey?.value?.trim() || "";
    state.token = token;
    try {
      state.me = await api("/api/me");
      elements.accessToken.value = "";
      renderIdentity();
      setPermissionControls();
      elements.connectionPanel.hidden = true;
      elements.workspace.hidden = false;
      elements.tabNav.hidden = false;
      elements.disconnect.hidden = false;
      await Promise.all([loadPolicies(), loadCases(), verifyAuditChain(false)]);
      showNotice("Connected to FairProcess", "success");
    } catch (error) {
      clearSensitiveState();
      throw error;
    }
  });
}

function disconnect() {
  clearSensitiveState();
  state.me = null;
  state.cases = [];
  state.currentCaseId = null;
  state.currentCase = null;
  state.policies = [];
  state.currentPolicy = null;
  state.currentReportId = null;
  state.currentReport = null;
  state.markdown = "";

  elements.workspace.hidden = true;
  elements.discoveryTab.hidden = true;
  elements.tabNav.hidden = true;
  elements.disconnect.hidden = true;
  elements.connectionPanel.hidden = false;
  elements.emptyCase.hidden = false;
  elements.caseContent.hidden = true;
  elements.reportSection.hidden = true;
  elements.trailSection.hidden = true;
  elements.caseList.replaceChildren();
  elements.permissionList.replaceChildren();
  elements.auditTrail.replaceChildren();
  elements.reportSummary.replaceChildren();
  elements.reportWarnings.replaceChildren();
  elements.reportFindings.replaceChildren();
  elements.identityName.textContent = "—";
  elements.identityMeta.textContent = "—";
  elements.caseCount.textContent = "0";
  elements.chainResult.textContent = "";
  setPermissionControls();
  showNotice("Disconnected. The access token and rendered case data were cleared.");
}

function clearSensitiveState() {
  state.token = "";
  state.aiKey = "";
  elements.accessToken.value = "";
  if (elements.aiKey) elements.aiKey.value = "";
}

function renderIdentity() {
  const me = state.me ?? {};
  elements.identityName.textContent = me.displayName || me.email || me.userId || "Provisioned user";
  elements.identityMeta.textContent = me.email || me.userId || "";
  elements.permissionList.replaceChildren();
  for (const role of arrayValue(me.roles)) {
    elements.permissionList.append(chip(role));
  }
}

function hasPermission(permission) {
  const permissions = arrayValue(state.me?.permissions);
  return permissions.includes("*") || permissions.includes(permission);
}

function setPermissionControls() {
  elements.createCaseButton.disabled = !hasPermission("case:write");
  elements.expectationButton.disabled = !hasPermission("case:write") || !state.currentCaseId;
  elements.recorderButton.disabled = !hasPermission("case:write") || !state.currentCaseId;
  elements.runAudit.disabled = !hasPermission("audit:run") || !state.currentCaseId;
  elements.loadTrail.disabled = !hasPermission("audit:read") || !state.currentCaseId;
  elements.verifyChain.disabled = !hasPermission("audit:read");
  elements.downloadMarkdown.disabled = !hasPermission("report:read") || !state.currentReportId;
  elements.authorizeReport.disabled = !hasPermission("report:authorize") || !state.currentReportId;
  elements.publishReport.disabled = !hasPermission("report:publish") || !state.currentReportId;
}

// ── Cases ───────────────────────────────────────────────────────────────────

async function loadCases() {
  const response = await api("/api/cases");
  state.cases = arrayValue(response?.cases);
  renderCases();
}

function renderCases() {
  elements.caseList.replaceChildren();
  elements.caseCount.textContent = String(state.cases.length);

  if (state.cases.length === 0) {
    const message = document.createElement("p");
    message.className = "form-note";
    message.textContent = "No cases were returned for this tenant.";
    elements.caseList.append(message);
    return;
  }

  for (const item of state.cases) {
    const id = caseId(item);
    if (!id) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "case-item";
    button.setAttribute("aria-current", String(id === state.currentCaseId));

    const title = document.createElement("strong");
    title.textContent = item.agency_case_number || item.agency || "Untitled case";
    const meta = document.createElement("span");
    const apns = arrayValue(item.apns);
    meta.textContent = [
      item.jurisdiction,
      apns.length > 0 ? `${apns.length} APN${apns.length > 1 ? "s" : ""}` : null,
      item.status,
    ].filter(Boolean).join(" · ");

    button.append(title, meta);
    button.addEventListener("click", () => selectCase(id));
    elements.caseList.append(button);
  }
}

async function createCase(event) {
  event.preventDefault();
  const submit = elements.createCaseForm.querySelector('button[type="submit"]');

  await runAction(submit, "Creating…", async () => {
    const form = new FormData(elements.createCaseForm);
    const apns = splitList(form.get("apns"));
    const body = {
      jurisdiction: form.get("jurisdiction"),
      agency: form.get("agency"),
      agencyCaseNumber: form.get("agencyCaseNumber"),
      asOf: form.get("asOf"),
      apns,
    };
    const response = await api("/api/cases", { method: "POST", body });
    const id = caseId(response);
    showNotice(`Created case ${id ?? ""}`.trim(), "success");
    elements.createCaseForm.reset();
    initializeDates();
    await loadCases();
    if (id) selectCase(id);
  });
}

async function selectCase(id) {
  state.currentCaseId = id;
  for (const item of state.caseList?.children ?? []) {
    const button = item;
    button.setAttribute?.("aria-current", String(caseId(state.cases.find((c) => caseId(c) === id)) === id));
  }
  renderCases();
  await refreshCurrentCase();
}

async function refreshCurrentCase() {
  if (!state.currentCaseId) throw new Error("No case selected");
  state.currentCase = await api(`/api/cases/${encodeURIComponent(state.currentCaseId)}`);
  renderCase();
  setPermissionControls();
}

function renderCase() {
  const c = state.currentCase ?? {};
  elements.emptyCase.hidden = true;
  elements.caseContent.hidden = false;

  elements.caseTitle.textContent = c.agency_case_number || c.agency || "Untitled case";
  elements.caseSubtitle.textContent = [
    c.jurisdiction,
    c.as_of,
  ].filter(Boolean).join(" · ");

  elements.caseStatus.textContent = c.status || "—";
  elements.caseApnCount.textContent = String(arrayValue(c.apns).length);
  elements.caseExpectationCount.textContent = String(arrayValue(c.expectations).length);
  elements.caseInstrumentCount.textContent = String(arrayValue(c.recorder_instruments).length);
}

// ── Policies ────────────────────────────────────────────────────────────────

async function loadPolicies() {
  const response = await api("/api/policies");
  const policies = arrayValue(response?.policies);
  elements.policySelect.replaceChildren();

  const ordered = [...policies].sort((a, b) => {
    if (a.activation_status !== b.activation_status) {
      return a.activation_status === "active" ? -1 : 1;
    }
    return (a.jurisdiction || "").localeCompare(b.jurisdiction || "");
  });

  for (const policy of ordered) {
    const label = [policy.jurisdiction, policy.policy_version, policy.activation_status]
      .filter(Boolean)
      .join(" · ");
    appendOption(elements.policySelect, policy.id, label || policy.id);
  }
  await loadSelectedPolicy();
}

async function loadSelectedPolicy() {
  const id = elements.policySelect.value;
  if (!id) {
    state.currentPolicy = null;
    elements.ruleSelect.replaceChildren();
    renderSelectedRule();
    return;
  }

  state.currentPolicy = await api(`/api/policies/${encodeURIComponent(id)}`);
  elements.policyStatus.textContent = state.currentPolicy.activation_status || "unknown status";
  elements.ruleSelect.replaceChildren();

  const rules = parseMaybeJson(state.currentPolicy.rules, []);
  for (const rule of arrayValue(rules)) {
    const label = [rule.citation, readableKind(rule.instrumentKind)].filter(Boolean).join(" — ");
    appendOption(elements.ruleSelect, rule.id, label || rule.id);
  }
  if (elements.ruleSelect.options.length === 0) {
    appendOption(elements.ruleSelect, "", "No rules in this bundle");
  }
  renderSelectedRule();
}

function selectedRule() {
  const rules = arrayValue(parseMaybeJson(state.currentPolicy?.rules, []));
  return rules.find((rule) => rule.id === elements.ruleSelect.value) ?? null;
}

function renderSelectedRule() {
  const rule = selectedRule();
  elements.ruleDescription.replaceChildren();
  if (!rule) {
    elements.ruleDescription.textContent = "Select an active policy bundle and rule.";
    return;
  }
  const lines = [
    readableKind(rule.instrumentKind),
    rule.triggerField ? `Trigger: ${rule.triggerField}` : null,
    Number.isFinite(rule.earliestCalendarDaysAfterTrigger)
      ? `Earliest recording: ${rule.earliestCalendarDaysAfterTrigger} calendar day(s) after trigger`
      : null,
    rule.sourceUrl || null,
  ].filter(Boolean);
  for (const line of lines) {
    const row = document.createElement("div");
    row.textContent = line;
    elements.ruleDescription.append(row);
  }
}

async function addExpectation(event) {
  event.preventDefault();
  if (!state.currentCaseId) throw new Error("Select a case first");
  const rule = selectedRule();
  if (!rule) throw new Error("Select a policy rule");

  await runAction(elements.expectationButton, "Adding…", async () => {
    const form = new FormData(elements.expectationForm);
    await api(`/api/cases/${encodeURIComponent(state.currentCaseId)}/expectations`, {
      method: "POST",
      body: compactObject({
        ruleId: rule.id,
        instrumentKind: rule.instrumentKind,
        servedOn: form.get("servedOn"),
        becameFinalOn: form.get("becameFinalOn"),
        resolvedOn: form.get("resolvedOn"),
      }),
    });
    elements.expectationForm.reset();
    await loadSelectedPolicy();
    await refreshCurrentCase();
    showNotice("Expected instrument added", "success");
  });
}

// ── Recorder import ─────────────────────────────────────────────────────────

async function readRecorderFile() {
  const file = elements.recorderFile.files?.[0];
  if (!file) return;
  if (file.size > 5_000_000) {
    elements.recorderFile.value = "";
    throw new Error("Recorder CSV must be 5 MB or smaller");
  }
  elements.recorderCsv.value = await file.text();
}

async function importRecorderCsv(event) {
  event.preventDefault();
  if (!state.currentCaseId) throw new Error("Select a case first");

  await runAction(elements.recorderButton, "Importing…", async () => {
    const form = new FormData(elements.recorderForm);
    const csv = String(form.get("csv") ?? "").trim();
    if (!csv) throw new Error("Recorder CSV content is required");

    const response = await api(`/api/cases/${encodeURIComponent(state.currentCaseId)}/recorder-csv`, {
      method: "POST",
      body: compactObject({
        csv,
        searchedOn: form.get("searchedOn"),
        source: form.get("source"),
        scope: form.get("scope"),
        notes: form.get("notes"),
      }),
    });

    elements.recorderCsv.value = "";
    elements.recorderFile.value = "";
    await refreshCurrentCase();
    showNotice(`Imported ${response.imported ?? 0} recorder instrument(s)`, "success");
  });
}

// ── Audit ───────────────────────────────────────────────────────────────────

async function runAudit() {
  if (!state.currentCaseId) throw new Error("Select a case first");
  const body = elements.policySelect.value
    ? { policyBundleId: elements.policySelect.value }
    : {};
  const response = await api(`/api/cases/${encodeURIComponent(state.currentCaseId)}/audit`, {
    method: "POST",
    body,
  });
  state.currentReportId = response.reportId;
  await loadReport();
  showNotice(`Audit generated ${response.findings ?? 0} finding(s)`, "success");
}

async function loadReport() {
  if (!state.currentReportId) return;
  state.currentReport = await api(`/api/reports/${encodeURIComponent(state.currentReportId)}`);
  state.markdown = typeof state.currentReport.report_markdown === "string"
    ? state.currentReport.report_markdown
    : "";
  renderReport();
  setPermissionControls();
}

function renderReport() {
  const row = state.currentReport ?? {};
  const report = parseMaybeJson(row.report_json, {});
  const summary = report.summary ?? parseMaybeJson(row.summary, {});
  const findings = arrayValue(report.findings);
  const warnings = arrayValue(report.warnings);

  elements.reportSection.hidden = false;
  elements.reportStatus.textContent = row.status || "generated";
  elements.reportSummary.replaceChildren();
  elements.reportWarnings.replaceChildren();
  elements.reportFindings.replaceChildren();

  for (const [key, value] of Object.entries(objectValue(summary))) {
    const item = document.createElement("span");
    item.className = "summary-chip";
    const label = document.createElement("span");
    label.textContent = readableKey(key);
    const strong = document.createElement("strong");
    strong.textContent = displayValue(value);
    item.append(label, strong);
    elements.reportSummary.append(item);
  }

  for (const warning of warnings) {
    const item = document.createElement("div");
    item.className = "warning-item";
    item.textContent = displayValue(warning);
    elements.reportWarnings.append(item);
  }

  if (findings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-note";
    empty.textContent = "The report contains no finding records.";
    elements.reportFindings.append(empty);
  }

  for (const finding of findings) {
    elements.reportFindings.append(findingCard(finding));
  }
}

function findingCard(finding) {
  const article = document.createElement("article");
  article.className = "finding-item";
  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = readableKind(finding.instrumentKind || finding.instrument_kind || finding.ruleId || "Finding");
  const status = document.createElement("span");
  status.className = "status-pill";
  status.textContent = finding.status || "review required";
  header.append(title, status);

  const explanation = document.createElement("p");
  explanation.textContent = finding.explanation || finding.message || "No explanation supplied.";

  const meta = document.createElement("div");
  meta.className = "finding-meta";
  meta.textContent = [finding.citation, finding.policyVersion, finding.sourceUrl]
    .filter(Boolean)
    .join(" · ");
  article.append(header, explanation, meta);
  return article;
}

async function downloadMarkdown() {
  if (!state.currentReportId) throw new Error("No report is loaded");
  if (!state.markdown) {
    state.markdown = await api(`/api/reports/${encodeURIComponent(state.currentReportId)}/markdown`, {
      accept: "text/markdown",
    });
  }
  const filename = `${state.currentCaseId || "fairprocess"}-integrity-report.md`;
  downloadText(state.markdown, filename, "text/markdown;charset=utf-8");
}

async function authorizeReport() {
  if (!state.currentReportId) throw new Error("No report is loaded");
  await api(`/api/reports/${encodeURIComponent(state.currentReportId)}/authorize`, {
    method: "POST",
    body: {},
  });
  await loadReport();
  showNotice("Report moved to human review", "success");
}

async function publishReport() {
  if (!state.currentReportId) throw new Error("No report is loaded");
  const confirmed = window.confirm(
    "Publish this authorized report? This consequential action is recorded in the audit chain.",
  );
  if (!confirmed) return;
  await api(`/api/reports/${encodeURIComponent(state.currentReportId)}/publish`, {
    method: "POST",
    body: {},
  });
  await loadReport();
  showNotice("Report published", "success");
}

// ── Audit trail ─────────────────────────────────────────────────────────────

async function loadAuditTrail() {
  if (!state.currentCaseId) throw new Error("Select a case first");
  const response = await api(`/api/cases/${encodeURIComponent(state.currentCaseId)}/audit-trail`);
  const events = arrayValue(response?.events);
  elements.auditTrail.replaceChildren();
  elements.trailSection.hidden = false;

  if (events.length === 0) {
    const empty = document.createElement("p");
    empty.className = "form-note";
    empty.textContent = "No audit events were returned for this case.";
    elements.auditTrail.append(empty);
    return;
  }

  for (const event of events) {
    const item = document.createElement("article");
    item.className = "trail-event";
    const time = document.createElement("time");
    time.dateTime = event.occurred_at || event.created_at || "";
    time.textContent = formatDateTime(event.occurred_at || event.created_at);
    const detail = document.createElement("div");
    const action = document.createElement("strong");
    action.textContent = readableKey(event.action || "event");
    const meta = document.createElement("span");
    meta.textContent = [event.actor, event.event_hash].filter(Boolean).join(" · ");
    detail.append(action, meta);
    item.append(time, detail);
    elements.auditTrail.append(item);
  }
}

// Store the last ingested policy for download
let lastIngestedPolicy = null;

async function ingestOrdinanceWithAi() {
  if (!state.aiBase) throw new Error("AI worker URL not configured — reconnect with AI worker URL");

  const text = document.getElementById("ordinance-text")?.value?.trim();
  if (!text || text.length < 50) throw new Error("Paste at least 50 characters of ordinance text");

  const jurisdiction = document.getElementById("ordinance-jurisdiction")?.value?.trim() || undefined;
  const agency = document.getElementById("ordinance-agency")?.value?.trim() || undefined;
  const sourceUrl = document.getElementById("ordinance-url")?.value?.trim() || undefined;

  elements.ordinanceResult.hidden = true;

  const result = await aiApi("/ai/ingest-ordinance", {
    ordinanceText: text,
    jurisdiction,
    agency,
    sourceUrl,
  });

  lastIngestedPolicy = result;
  elements.downloadPolicyBtn.disabled = false;
  elements.ordinanceResult.hidden = false;

  // Render the results
  const summaryHtml = result.summary
    ? `<div style="padding:0.6rem;border-radius:4px;background:rgba(0,0,0,0.03);margin-bottom:0.75rem;font-size:0.82rem;">${escHtml(result.summary)}</div>`
    : "";

  const warnings = result.warnings?.length
    ? `<div style="margin-bottom:0.75rem;font-size:0.8rem;color:#856400;">⚠ ${result.warnings.map(w => escHtml(w)).join(" · ")}</div>`
    : "";

  // Deadline rules table
  const deadlineRows = (result.deadlineRules || []).map(r => {
    return `<tr>
      <td style="font-size:0.78rem;padding:4px 8px;">${escHtml(r.citation || "—")}</td>
      <td style="font-size:0.78rem;padding:4px 8px;color:#666;">${escHtml(r.instrumentKind || "—")}</td>
      <td style="font-size:0.78rem;padding:4px 8px;">${escHtml(r.triggerField || "—")}</td>
      <td style="font-size:0.78rem;padding:4px 8px;">${r.earliestCalendarDaysAfterTrigger != null ? r.earliestCalendarDaysAfterTrigger + " days" : "—"}</td>
      <td style="font-size:0.78rem;padding:4px 8px;">${r.maximumCalendarDaysAfterTrigger != null ? r.maximumCalendarDaysAfterTrigger + " days" : "—"}</td>
      <td style="font-size:0.78rem;padding:4px 8px;">${r.recordingRequired ? "Yes" : "No"}</td>
    </tr>`;
  }).join("");

  const deadlineTable = deadlineRows
    ? `<div style="margin-bottom:0.75rem;">
        <strong style="font-size:0.78rem;color:#888;display:block;margin-bottom:0.3rem;">EXTRACTED DEADLINE RULES (${result.deadlineRules.length})</strong>
        <table style="width:100%;border-collapse:collapse;">
          <thead><tr style="border-bottom:2px solid #ddd;">
            <th style="text-align:left;padding:2px 8px;font-size:0.72rem;color:#888;">Citation</th>
            <th style="text-align:left;padding:2px 8px;font-size:0.72rem;color:#888;">Instrument</th>
            <th style="text-align:left;padding:2px 8px;font-size:0.72rem;color:#888;">Trigger</th>
            <th style="text-align:left;padding:2px 8px;font-size:0.72rem;color:#888;">Earliest</th>
            <th style="text-align:left;padding:2px 8px;font-size:0.72rem;color:#888;">Max</th>
            <th style="text-align:left;padding:2px 8px;font-size:0.72rem;color:#888;">Recording</th>
          </tr></thead>
          <tbody>${deadlineRows}</tbody>
        </table>
      </div>`
    : "";

  // Full rules list
  const fullRuleItems = (result.fullRules || []).map((r, i) => {
    return `<details style="margin-bottom:0.4rem;border:1px solid var(--border,#ddd);border-radius:4px;padding:0;">
      <summary style="font-size:0.82rem;padding:0.5rem;cursor:pointer;font-weight:600;">
        ${escHtml(r.citation || r.rule_id)} — ${escHtml(r.rule_type || "unknown")}
      </summary>
      <div style="padding:0.5rem;font-size:0.78rem;color:#555;">
        <p style="margin:0 0 0.3rem;"><strong>Name:</strong> ${escHtml(r.name || "—")}</p>
        <p style="margin:0 0 0.3rem;"><strong>Proceeding:</strong> ${escHtml(r.proceeding_type || "—")}</p>
        <p style="margin:0 0 0.3rem;"><strong>Severity:</strong> ${escHtml(r.severity || "—")}</p>
        <p style="margin:0 0 0.3rem;"><strong>Expression:</strong> ${escHtml(r.deterministic_expression || "—")}</p>
        ${r.source_excerpt ? `<p style="margin:0 0 0.3rem;"><strong>Source excerpt:</strong> <em>"${escHtml(r.source_excerpt.slice(0, 200))}${r.source_excerpt.length > 200 ? "…" : ""}"</em></p>` : ""}
        ${r.exceptions?.length ? `<p style="margin:0 0 0.3rem;"><strong>Exceptions:</strong> ${r.exceptions.map(e => escHtml(e)).join("; ")}</p>` : ""}
      </div>
    </details>`;
  }).join("");

  const fullRulesSection = fullRuleItems
    ? `<div style="margin-bottom:0.75rem;">
        <strong style="font-size:0.78rem;color:#888;display:block;margin-bottom:0.3rem;">FULL POLICY RULES (${result.fullRules.length})</strong>
        ${fullRuleItems}
      </div>`
    : "";

  elements.ordinanceResult.innerHTML = `
    <div style="padding:0.75rem;border:1px solid var(--border,#ddd);border-radius:6px;background:rgba(0,0,0,0.02);">
      <div style="display:flex;gap:0.5rem;align-items:center;margin-bottom:0.5rem;flex-wrap:wrap;">
        <span style="font-size:0.85rem;font-weight:600;">${escHtml(result.jurisdiction)}</span>
        <span style="font-size:0.78rem;color:#888;">${escHtml(result.agency || "")}</span>
        <span style="font-size:0.72rem;padding:2px 8px;border-radius:3px;background:rgba(202,138,4,0.15);color:#856400;">${escHtml(result.activationStatus || "legal_review_required")}</span>
      </div>
      ${summaryHtml}${warnings}${deadlineTable}${fullRulesSection}
      <p style="margin-top:0.4rem;font-size:0.75rem;color:#888;">AI-extracted draft — legal review required before activation. Use "Download policy JSON" to save the bundle.</p>
    </div>
  `;
}

function downloadPolicyJson() {
  if (!lastIngestedPolicy) return;
  const blob = new Blob([JSON.stringify({
    jurisdiction: lastIngestedPolicy.jurisdiction,
    policyVersion: lastIngestedPolicy.policyVersion,
    activationStatus: lastIngestedPolicy.activationStatus,
    rules: lastIngestedPolicy.deadlineRules,
    fullRules: lastIngestedPolicy.fullRules,
  }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = (lastIngestedPolicy.jurisdiction || "jurisdiction").replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
  a.download = `${safeName}-policy-bundle.json`;
  a.click();
  URL.revokeObjectURL(url);
}

async function draftNarrativeWithAi() {
  if (!state.aiBase) throw new Error("AI worker URL not configured — reconnect with AI worker URL");
  if (!state.currentReport) throw new Error("Run an audit first to generate a report");

  const purpose = document.getElementById("narrative-purpose")?.value || "internal_memo";
  const notes = document.getElementById("narrative-notes")?.value?.trim() || undefined;
  const narrativeResult = document.getElementById("narrative-result");
  if (!narrativeResult) return;

  narrativeResult.hidden = true;

  // Get the report JSON from the current report
  const reportJson = state.currentReport.report_json
    ? (typeof state.currentReport.report_json === "string"
        ? JSON.parse(state.currentReport.report_json)
        : state.currentReport.report_json)
    : state.currentReport;

  const caseCtx = state.currentCase ? {
    jurisdiction: state.currentCase.jurisdiction,
    agency: state.currentCase.agency,
    agencyCaseNumber: state.currentCase.agency_case_number,
  } : undefined;

  const result = await aiApi("/ai/audit-narrative", {
    reportJson,
    caseContext: caseCtx,
    purpose,
    additionalNotes: notes,
  });

  narrativeResult.hidden = false;

  const purposeLabels = {
    legal_filing: "Legal Filing",
    appeal_brief: "Appeal Brief",
    internal_memo: "Internal Memo",
    public_report: "Public Report",
  };

  const warnings = result.warnings?.length
    ? `<div style="margin-top:0.5rem;font-size:0.8rem;color:#856400;">⚠ ${result.warnings.join(" · ")}</div>`
    : "";

  narrativeResult.innerHTML = `
    <div style="padding:1rem;border:1px solid var(--border,#ddd);border-radius:6px;background:rgba(0,0,0,0.02);">
      <h4 style="font-size:1rem;margin-bottom:0.75rem;">${escHtml(result.title)} <span style="font-size:0.75rem;font-weight:normal;color:#888;">(${purposeLabels[purpose] || purpose})</span></h4>
      <div style="margin-bottom:0.75rem;">
        <strong style="font-size:0.78rem;color:#888;display:block;margin-bottom:0.2rem;">PROCEDURAL BACKGROUND</strong>
        <div style="font-size:0.85rem;line-height:1.5;white-space:pre-wrap;">${escHtml(result.proceduralBackground)}</div>
      </div>
      <div style="margin-bottom:0.75rem;">
        <strong style="font-size:0.78rem;color:#888;display:block;margin-bottom:0.2rem;">FINDINGS</strong>
        <div style="font-size:0.85rem;line-height:1.5;white-space:pre-wrap;">${escHtml(result.findings)}</div>
      </div>
      <div style="margin-bottom:0.5rem;">
        <strong style="font-size:0.78rem;color:#888;display:block;margin-bottom:0.2rem;">CONCLUSION</strong>
        <div style="font-size:0.85rem;line-height:1.5;white-space:pre-wrap;">${escHtml(result.conclusion)}</div>
      </div>
      ${warnings}
      <p style="margin-top:0.4rem;font-size:0.75rem;color:#888;">AI-drafted narrative — human review and authorization required before any filing or publication.</p>
    </div>
  `;
}

async function checkDeadlinesWithAi() {
  if (!state.aiBase) throw new Error("AI worker URL not configured — reconnect with AI worker URL");

  // Gather dates from the current case's expectations and form inputs
  const dates = {};

  // From expectation form inputs (if filled)
  const expForm = document.getElementById("expectation-form");
  if (expForm) {
    const formData = new FormData(expForm);
    const servedOn = formData.get("servedOn");
    const becameFinalOn = formData.get("becameFinalOn");
    const resolvedOn = formData.get("resolvedOn");
    if (servedOn) dates.servedOn = servedOn;
    if (becameFinalOn) dates.becameFinalOn = becameFinalOn;
    if (resolvedOn) dates.resolvedOn = resolvedOn;
  }

  // From the AI-extracted facts (if any date facts were extracted)
  // We also check for any elements with date values from the case

  // If we have no dates at all, try to get them from current case data
  if (Object.keys(dates).length === 0 && state.currentCase) {
    // Try to extract dates from case expectations/instruments
    const exp = state.currentCase.expectations || [];
    for (const e of exp) {
      if (e.served_on) dates.servedOn = e.served_on.slice(0, 10);
      if (e.became_final_on) dates.becameFinalOn = e.became_final_on.slice(0, 10);
      if (e.resolved_on) dates.resolvedOn = e.resolved_on.slice(0, 10);
    }
    // Check for recorded instruments
    const inst = state.currentCase.instruments || [];
    if (inst.length > 0 && inst[0].recorded_on) {
      dates.recordedOn = inst[0].recorded_on.slice(0, 10);
    }
  }

  if (Object.keys(dates).length === 0) {
    throw new Error("No dates available — fill in service date, finality date, or resolution date first");
  }

  elements.aiStatus.textContent = "Checking deadlines…";
  elements.aiDeadlineResult.hidden = true;

  const caseCtx = state.currentCase ? {
    jurisdiction: state.currentCase.jurisdiction,
    agency: state.currentCase.agency,
    agencyCaseNumber: state.currentCase.agency_case_number,
  } : undefined;

  const result = await aiApi("/ai/deadline-watchdog", {
    dates,
    caseContext: caseCtx,
  });

  elements.aiStatus.textContent = `Deadlines: ${result.missedCount} missed, ${result.criticalCount} critical, ${result.warningCount} warning, ${result.okCount} OK`;
  elements.aiDeadlineResult.hidden = false;

  const statusColors = {
    MISSED: "#dc2626",
    CRITICAL: "#ea580c",
    WARNING: "#ca8a04",
    OK: "#16a34a",
    AWAITING_TRIGGER: "#6b7280",
    NOT_APPLICABLE: "#9ca3af",
  };

  const statusBg = {
    MISSED: "rgba(220,38,38,0.08)",
    CRITICAL: "rgba(234,88,12,0.08)",
    WARNING: "rgba(202,138,4,0.08)",
    OK: "rgba(22,163,74,0.06)",
    AWAITING_TRIGGER: "rgba(107,114,128,0.06)",
    NOT_APPLICABLE: "rgba(156,163,175,0.06)",
  };

  const rows = result.deadlines.map(d => {
    const color = statusColors[d.status] || "#666";
    const bg = statusBg[d.status] || "transparent";
    return `<tr style="background:${bg};">
      <td style="font-size:0.78rem;padding:6px 8px;">${escHtml(d.citation)}</td>
      <td style="font-size:0.78rem;padding:6px 8px;color:#666;">${escHtml(d.instrumentKind)}</td>
      <td style="font-size:0.78rem;padding:6px 8px;">${d.triggerDate ? escHtml(d.triggerDate) : '<span style="color:#999;">not set</span>'}</td>
      <td style="font-size:0.78rem;padding:6px 8px;">${d.earliestRecordingDate ? escHtml(d.earliestRecordingDate) : '—'}</td>
      <td style="font-size:0.78rem;padding:6px 8px;">${d.latestRecordingDate ? escHtml(d.latestRecordingDate) : '—'}</td>
      <td style="font-size:0.78rem;padding:6px 8px;">${d.actualRecordingDate ? escHtml(d.actualRecordingDate) : '<span style="color:#999;">not located</span>'}</td>
      <td style="font-size:0.78rem;padding:6px 8px;font-weight:600;color:${color};">${d.status}</td>
      <td style="font-size:0.75rem;padding:6px 8px;color:#666;max-width:250px;">${escHtml(d.explanation)}</td>
    </tr>`;
  }).join("");

  const summary = result.summary
    ? `<div style="padding:0.6rem;border-radius:4px;background:rgba(0,0,0,0.03);margin-bottom:0.75rem;font-size:0.82rem;">${escHtml(result.summary)}</div>`
    : "";

  const warnings = result.warnings?.length
    ? `<div style="margin-top:0.5rem;font-size:0.8rem;color:#dc2626;">⚠ ${result.warnings.join(" · ")}</div>`
    : "";

  elements.aiDeadlineResult.innerHTML = `
    ${summary}
    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
      <thead><tr style="border-bottom:2px solid #ddd;">
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Citation</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Instrument</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Trigger Date</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Earliest Rec.</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Latest Rec.</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Actual Rec.</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Status</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.72rem;color:#888;">Explanation</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>${warnings}
    <p style="margin-top:0.4rem;font-size:0.75rem;color:#888;">Deadline computation is deterministic. AI writes the summary only. Human review required.</p>
  `;
}

async function classifyDocumentWithAi() {
  const text = elements.aiDocText.value.trim();
  if (!text) throw new Error("Paste document text first");
  if (!state.aiBase) throw new Error("AI worker URL not configured — reconnect with AI worker URL");

  const caseCtx = state.currentCase ? {
    jurisdiction: state.currentCase.jurisdiction,
    agency: state.currentCase.agency,
    agencyCaseNumber: state.currentCase.agency_case_number,
  } : undefined;

  elements.aiStatus.textContent = "Classifying…";
  elements.aiClassifyResult.hidden = true;

  const result = await aiApi("/ai/classify-document", {
    documentText: text,
    caseContext: caseCtx,
  });

  elements.aiStatus.textContent = `Classified: ${formatDocType(result.documentType)} (${Math.round((result.confidence ?? 0) * 100)}% confidence)`;
  elements.aiClassifyResult.hidden = false;

  const conf = Math.round((result.confidence ?? 0) * 100);
  const confColor = conf >= 90 ? "#1a7a1a" : conf >= 70 ? "#856400" : "#c00";

  let altTypes = "";
  if (result.alternativeTypes?.length) {
    const altRows = result.alternativeTypes.map(a => {
      const ac = Math.round((a.confidence ?? 0) * 100);
      return `<li>${formatDocType(a.type)} — ${ac}%</li>`;
    }).join("");
    altTypes = `<div style="font-size:0.8rem;color:#666;margin-bottom:0.4rem;">Alternatives: <ul style="margin:0.2rem 0;padding-left:1.2rem;">${altRows}</ul></div>`;
  }

  let signals = "";
  if (result.keySignals?.length) {
    signals = `<div style="font-size:0.8rem;color:#666;margin-bottom:0.4rem;">Key signals: ${result.keySignals.map(s => escHtml(s)).join(", ")}</div>`;
  }

  let metadata = "";
  const md = result.suggestedMetadata || {};
  const mdParts = [];
  if (md.caseNumber) mdParts.push(`<strong>Case #:</strong> ${escHtml(md.caseNumber)}`);
  if (md.apns?.length) mdParts.push(`<strong>APNs:</strong> ${md.apns.map(a => escHtml(a)).join(", ")}`);
  if (md.dates?.length) mdParts.push(`<strong>Dates:</strong> ${md.dates.map(d => escHtml(d.type) + " " + escHtml(d.value)).join(", ")}`);
  if (md.parties?.length) mdParts.push(`<strong>Parties:</strong> ${md.parties.map(p => escHtml(p)).join(", ")}`);
  if (md.monetaryAmounts?.length) mdParts.push(`<strong>Amounts:</strong> ${md.monetaryAmounts.map(a => escHtml(a.description) + " " + escHtml(a.amount)).join(", ")}`);
  if (mdParts.length) {
    metadata = `<div style="font-size:0.8rem;color:#444;margin-top:0.4rem;padding:0.5rem;background:rgba(0,0,0,0.03);border-radius:4px;">
      <strong style="font-size:0.75rem;color:#888;">Suggested metadata (review before use):</strong><br>${mdParts.join("<br>")}
    </div>`;
  }

  const warnings = result.warnings?.length
    ? `<div style="margin-top:0.5rem;font-size:0.8rem;color:#856400;">⚠ ${result.warnings.join(" · ")}</div>`
    : "";

  elements.aiClassifyResult.innerHTML = `
    <div style="padding:0.75rem;border:1px solid var(--border,#ddd);border-radius:6px;background:rgba(0,0,0,0.02);">
      <div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.5rem;">
        <span style="font-size:1.1rem;font-weight:600;">${formatDocType(result.documentType)}</span>
        <span style="font-size:0.85rem;font-weight:600;color:${confColor};">${conf}% confidence</span>
      </div>
      ${altTypes}${signals}${metadata}${warnings}
      <p style="margin-top:0.4rem;font-size:0.75rem;color:#888;">AI classification — human review required.</p>
    </div>
  `;
}

function formatDocType(t) {
  const labels = {
    notice_of_violation: "Notice of Violation",
    compliance_order: "Compliance Order",
    abatement_notice: "Abatement Notice",
    hearing_notice: "Hearing Notice",
    appeal_notice: "Appeal Notice",
    recorded_document: "Recorded Document",
    lien: "Lien",
    deed: "Deed",
    correspondence: "Correspondence",
    public_records_request: "Public Records Request",
    public_records_response: "Public Records Response",
    settlement_agreement: "Settlement Agreement",
    court_order: "Court Order",
    other: "Other / Unknown",
  };
  return labels[t] || t || "Unknown";
}

async function extractFactsWithAi() {
  const text = elements.aiDocText.value.trim();
  if (!text) throw new Error("Paste document text first");
  if (!state.aiBase) throw new Error("AI worker URL not configured — reconnect with AI worker URL");

  const caseCtx = state.currentCase ? {
    jurisdiction: state.currentCase.jurisdiction,
    agency: state.currentCase.agency,
    agencyCaseNumber: state.currentCase.agency_case_number,
  } : undefined;

  elements.aiStatus.textContent = "Extracting…";
  elements.aiFactsResult.hidden = true;

  const result = await aiApi("/ai/extract-facts", {
    documentText: text,
    caseContext: caseCtx,
  });

  elements.aiStatus.textContent = `${result.facts.length} fact(s) extracted · model: ${result.model?.split("/").pop() ?? "AI"}`;
  elements.aiFactsResult.hidden = false;

  if (result.facts.length === 0) {
    elements.aiFactsResult.innerHTML = '<p style="opacity:0.6;font-size:0.85rem;">No extractable facts found in the document text.</p>';
    if (result.warnings?.length) {
      elements.aiFactsResult.innerHTML += `<ul style="font-size:0.8rem;color:#c00;">${result.warnings.map(w => `<li>${w}</li>`).join("")}</ul>`;
    }
    return;
  }

  const rows = result.facts.map((f) => {
    const conf = Math.round((f.confidence ?? 0) * 100);
    const confColor = conf >= 90 ? "#1a7a1a" : conf >= 70 ? "#856400" : "#c00";
    return `<tr>
      <td style="font-size:0.78rem;color:#666;white-space:nowrap;">${f.factType}</td>
      <td style="font-size:0.85rem;font-weight:500;">${escHtml(String(f.normalizedValue ?? f.proposedValue))}</td>
      <td style="font-size:0.75rem;color:#888;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escHtml(f.excerpt ?? "")}">${escHtml(f.excerpt ?? "")}</td>
      <td style="font-size:0.78rem;color:${confColor};white-space:nowrap;">${conf}%</td>
    </tr>`;
  }).join("");

  const warnings = result.warnings?.length
    ? `<div style="margin-top:0.5rem;font-size:0.8rem;color:#856400;">⚠ ${result.warnings.join(" · ")}</div>`
    : "";

  elements.aiFactsResult.innerHTML = `
    <p style="font-size:0.78rem;color:#666;margin-bottom:0.4rem;">Review proposed facts — these are AI suggestions, not verified findings.</p>
    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
      <thead><tr style="border-bottom:1px solid #ddd;">
        <th style="text-align:left;padding:4px 8px 4px 0;font-size:0.75rem;color:#888;">Type</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.75rem;color:#888;">Value</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.75rem;color:#888;">Source excerpt</th>
        <th style="text-align:left;padding:4px 8px;font-size:0.75rem;color:#888;">Confidence</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>${warnings}
    <p style="margin-top:0.5rem;font-size:0.75rem;color:#888;">AI extracted. Human review required before use in audit chain.</p>
  `;
}

function escHtml(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}

async function verifyAuditChain(showSuccess = true) {
  if (!hasPermission("audit:read")) return;
  const response = await api("/api/audit-chain/verify");
  if (response?.verified) {
    elements.chainResult.textContent = "Chain verified";
    if (showSuccess) showNotice("Audit chain verified", "success");
  } else {
    elements.chainResult.textContent = "Chain verification failed";
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

async function runAction(button, label, fn) {
  const original = button?.textContent ?? "";
  if (button) {
    button.textContent = label;
    button.disabled = true;
  }
  try {
    await fn();
  } catch (error) {
    showNotice(error instanceof Error ? error.message : String(error), "error");
  } finally {
    if (button) {
      button.textContent = original;
      setPermissionControls();
    }
  }
}

function showNotice(message, tone = "info") {
  if (state.noticeTimer) window.clearTimeout(state.noticeTimer);
  elements.notice.textContent = message;
  elements.notice.dataset.tone = tone;
  elements.notice.hidden = false;
  state.noticeTimer = window.setTimeout(() => {
    elements.notice.hidden = true;
  }, 5500);
}

function chip(value) {
  const element = document.createElement("span");
  element.className = "permission-chip";
  element.textContent = value;
  return element;
}

function appendOption(select, value, label) {
  const option = document.createElement("option");
  option.value = value ?? "";
  option.textContent = label ?? value ?? "";
  select.append(option);
}

function caseId(item) {
  return item?.case_id || item?.id || null;
}

function compactObject(value) {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== null && item !== undefined && item !== ""),
  );
}

function splitList(value) {
  return String(value ?? "")
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function arrayValue(value) {
  return Array.isArray(value) ? value : [];
}

function objectValue(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function parseMaybeJson(value, fallback) {
  if (typeof value !== "string") return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function readableKind(value) {
  return readableKey(String(value ?? "").replace(/^humboldt-hcc-[^-]+-/, ""));
}

function readableKey(value) {
  return String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value) {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatDateTime(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? String(value) : date.toLocaleString();
}

function downloadText(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}


function notice(msg, tone = "info") {
  showNotice(msg, tone);
}

// ── Policy Studio ─────────────────────────────────────────────────────────

async function loadRules() {
  const params = new URLSearchParams();
  if (state.ruleFilters.jurisdiction) params.set('jurisdiction', state.ruleFilters.jurisdiction);
  if (state.ruleFilters.category) params.set('category', state.ruleFilters.category);
  if (state.ruleFilters.status) params.set('status', state.ruleFilters.status);
  if (state.ruleFilters.statute) params.set('statute', state.ruleFilters.statute);
  const qs = params.toString();
  const data = await api(`/api/rules${qs ? '?' + qs : ''}`);
  state.rules = data.rules || [];
  renderRuleLibrary();
  loadRuleChangelog();
}

function renderRuleLibrary() {
  if (elements.ruleCount) elements.ruleCount.textContent = state.rules.length;
  if (!elements.ruleList) return;
  if (state.rules.length === 0) {
    elements.ruleList.innerHTML = '<div class="empty-state">No rules yet. Click "New Rule" to create one.</div>';
    return;
  }
  const statusColors = {draft: 'badge-gray', in_review: 'badge-yellow', active: 'badge-green', superseded: 'badge-gray', archived: 'badge-gray'};
  elements.ruleList.innerHTML = state.rules.map(r => `
    <div class="rule-row" data-id="${r.id}">
      <div class="rule-row-main">
        <div class="rule-row-header">
          <span class="rule-statute">${escapeHtml(r.statute_reference || '')}</span>
          <span class="badge ${statusColors[r.status] || 'badge-gray'}">${(r.status || '').replace(/_/g, ' ')}</span>
        </div>
        <div class="rule-row-meta">
          <span>${escapeHtml(r.jurisdiction || '')}</span> · 
          <span>${(r.category || '').replace(/_/g, ' ')}</span> · 
          <span>${(r.comparison_operator || '').replace(/_/g, ' ')} ${r.threshold_value || ''} ${(r.threshold_unit || '').replace(/_/g, ' ')}</span>
        </div>
        <div class="rule-row-desc">${escapeHtml(r.plain_language_description || '')}</div>
      </div>
      <div class="rule-row-actions">
        ${r.status === 'draft' || r.status === 'in_review' ? `<button class="button button-sm" onclick="openRuleEditor('${r.id}')">Edit</button>` : ''}
        ${r.status === 'in_review' ? `<button class="button button-sm button-primary" onclick="publishRule('${r.id}')">Publish</button>` : ''}
        ${r.status === 'active' ? `<button class="button button-sm" onclick="previewImpact('${r.id}')">Impact</button>` : ''}
      </div>
    </div>
  `).join('');
}

function escapeHtml(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function openRuleEditor(ruleId) {
  state.currentRule = ruleId ? state.rules.find(r => r.id === ruleId) : null;
  if (elements.ruleEditor) elements.ruleEditor.hidden = false;
  if (elements.ruleEditorTitle) elements.ruleEditorTitle.textContent = ruleId ? 'Edit Rule' : 'New Rule';
  if (ruleId) {
    const data = await api(`/api/rules/${ruleId}`);
    if (elements.ruleJurisdiction) elements.ruleJurisdiction.value = data.jurisdiction || '';
    if (elements.ruleStatute) elements.ruleStatute.value = data.statute_reference || '';
    if (elements.ruleAuthority) elements.ruleAuthority.value = data.enabling_authority || '';
    if (elements.ruleCategory) elements.ruleCategory.value = data.category || 'deadline';
    if (elements.ruleDescription) elements.ruleDescription.value = data.plain_language_description || '';
    if (elements.ruleTriggerEvent) elements.ruleTriggerEvent.value = data.trigger_event || '';
    if (elements.ruleComparisonEvent) elements.ruleComparisonEvent.value = data.comparison_event || '';
    if (elements.ruleOperator) elements.ruleOperator.value = data.comparison_operator || 'at_most';
    if (elements.ruleThreshold) elements.ruleThreshold.value = data.threshold_value || '';
    if (elements.ruleUnit) elements.ruleUnit.value = data.threshold_unit || 'calendar_days';
    if (elements.ruleSeverity) elements.ruleSeverity.value = data.severity_if_violated || 'procedural_risk';
  } else {
    if (elements.ruleEditorForm) elements.ruleEditorForm.reset();
    if (elements.ruleJurisdiction) elements.ruleJurisdiction.value = 'Humboldt County, CA';
  }
  updatePlainEnglishPreview();
  // Show publish controls only for in_review rules
  if (elements.publishRuleButton) elements.publishRuleButton.hidden = !ruleId || state.currentRule?.status !== 'in_review';
  if (elements.submitReviewButton) elements.submitReviewButton.hidden = !ruleId || state.currentRule?.status !== 'draft';
}

function closeRuleEditor() {
  if (elements.ruleEditor) elements.ruleEditor.hidden = true;
  state.currentRule = null;
}

function updatePlainEnglishPreview() {
  if (!elements.rulePreview) return;
  const op = elements.ruleOperator?.value || 'at_most';
  const threshold = elements.ruleThreshold?.value || 'N';
  const unit = (elements.ruleUnit?.value || 'calendar_days').replace(/_/g, ' ');
  const trigger = elements.ruleTriggerEvent?.value || '[trigger event]';
  const comparison = elements.ruleComparisonEvent?.value || '[comparison event]';
  const severity = (elements.ruleSeverity?.value || 'procedural_risk').replace(/_/g, ' ');
  const opText = {at_most: 'within at most', at_least: 'at least', exactly: 'exactly', before: 'before', after: 'after'}[op] || op;
  elements.rulePreview.textContent = `This rule requires ${comparison} to occur ${opText} ${threshold} ${unit} of ${trigger}. A violation is classified as ${severity}.`;
}

async function saveRule() {
  const body = {
    jurisdiction: elements.ruleJurisdiction?.value || '',
    statuteReference: elements.ruleStatute?.value || '',
    enablingAuthority: elements.ruleAuthority?.value || undefined,
    category: elements.ruleCategory?.value || 'deadline',
    plainLanguageDescription: elements.ruleDescription?.value || '',
    triggerEvent: elements.ruleTriggerEvent?.value || '',
    comparisonEvent: elements.ruleComparisonEvent?.value || '',
    comparisonOperator: elements.ruleOperator?.value || 'at_most',
    thresholdValue: parseInt(elements.ruleThreshold?.value || '0', 10) || 0,
    thresholdUnit: elements.ruleUnit?.value || 'calendar_days',
    severityIfViolated: elements.ruleSeverity?.value || 'procedural_risk',
  };
  await runAction(elements.saveRuleButton, 'Saving…', async () => {
    if (state.currentRule) {
      await api(`/api/rules/${state.currentRule.id}`, {method: 'PATCH', body});
      notice('Rule updated');
    } else {
      const result = await api('/api/rules', {method: 'POST', body});
      state.currentRule = {id: result.id, status: 'draft'};
      notice('Draft rule created');
    }
    await loadRules();
    closeRuleEditor();
  });
}

async function submitRuleForReview() {
  if (!state.currentRule) return;
  await api(`/api/rules/${state.currentRule.id}/submit-review`, {method: 'POST'});
  notice('Rule submitted for review');  
  state.currentRule.status = 'in_review';
  if (elements.submitReviewButton) elements.submitReviewButton.hidden = true;
  if (elements.publishRuleButton) elements.publishRuleButton.hidden = false;
  await loadRules();
}

async function publishRule(ruleId) {
  const targetId = ruleId || state.currentRule?.id;
  if (!targetId) return;
  const reviewer = elements.ruleReviewer?.value || 'demo-reviewer';
  const changeSummary = elements.ruleChangeSummary?.value || 'Initial publication';
  const effectiveStartDate = elements.ruleEffectiveDate?.value || undefined;
  await api(`/api/rules/${targetId}/publish`, {method: 'POST', body: {reviewer, changeSummary, effectiveStartDate}});
  notice('Rule published');
  await loadRules();
  closeRuleEditor();
}

async function loadRuleChangelog() {
  const data = await api('/api/rules/changelog');
  state.ruleChangelog = data.entries || [];
  renderChangelog();
}

function renderChangelog() {
  if (!elements.changelogList) return;
  if (state.ruleChangelog.length === 0) {
    elements.changelogList.innerHTML = '<div class="empty-state">No changelog entries yet.</div>';
    return;
  }
  elements.changelogList.innerHTML = state.ruleChangelog.map(e => `
    <div class="changelog-entry">
      <div class="changelog-header">
        <span class="changelog-version">v${e.version_number}</span>
        <span class="changelog-statute">${escapeHtml(e.statute_reference || '')}</span>
        <span class="changelog-date">${e.published_at ? new Date(e.published_at).toLocaleDateString() : ''}</span>
      </div>
      <div class="changelog-summary">${escapeHtml(e.change_summary || '')}</div>
      <div class="changelog-meta">
        Authority: ${escapeHtml(e.enabling_authority_citation || '')} · 
        By ${escapeHtml(e.changed_by || '')} · Reviewed by ${escapeHtml(e.reviewed_by || '—')}
      </div>
    </div>
  `).join('');
}

async function previewImpact(ruleId) {
  const data = await api(`/api/rules/${ruleId}/impact-preview`, {method: 'POST'});
  state.ruleImpactCases = data.affectedCases || [];
  if (elements.impactCount) elements.impactCount.textContent = data.count !== undefined ? data.count : state.ruleImpactCases.length;
  if (elements.impactCases) {
    elements.impactCases.innerHTML = state.ruleImpactCases.map(c => `
      <div class="impact-case-row">
        <span>${escapeHtml(c.id || '')}</span> · 
        <span>${escapeHtml(c.jurisdiction || '')}</span> · 
        <span>${escapeHtml(c.agency_case_number || '')}</span>
      </div>
    `).join('') || '<div class="empty-state">No affected cases.</div>';
  }
  if (elements.impactPreview) elements.impactPreview.hidden = false;
}

function setupPolicyStudio() {
  if (elements.newRuleButton) elements.newRuleButton.addEventListener('click', () => openRuleEditor(null));
  if (elements.cancelRuleButton) elements.cancelRuleButton.addEventListener('click', closeRuleEditor);
  if (elements.saveRuleButton) elements.saveRuleButton.addEventListener('click', saveRule);
  if (elements.submitReviewButton) elements.submitReviewButton.addEventListener('click', submitRuleForReview);
  if (elements.publishRuleButton) elements.publishRuleButton.addEventListener('click', () => {
    if (state.currentRule) publishRule(state.currentRule.id);
  });
  if (elements.closeImpactButton) elements.closeImpactButton.addEventListener('click', () => { if (elements.impactPreview) elements.impactPreview.hidden = true; });
  if (elements.ruleEditorForm) {
    elements.ruleEditorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      saveRule();
    });
  }
  // Live preview
  ['ruleOperator','ruleThreshold','ruleUnit','ruleTriggerEvent','ruleComparisonEvent','ruleSeverity'].forEach(id => {
    if (elements[id]) elements[id].addEventListener('input', updatePlainEnglishPreview);
  });
  // Filters
  ['ruleFilterJurisdiction','ruleFilterCategory','ruleFilterStatus','ruleFilterStatute'].forEach(id => {
    if (elements[id]) elements[id].addEventListener('input', () => {
      state.ruleFilters.jurisdiction = elements.ruleFilterJurisdiction?.value || '';
      state.ruleFilters.category = elements.ruleFilterCategory?.value || '';
      state.ruleFilters.status = elements.ruleFilterStatus?.value || '';
      state.ruleFilters.statute = elements.ruleFilterStatute?.value || '';
      loadRules();
    });
  });
}

window.openRuleEditor = openRuleEditor;
window.publishRule = publishRule;
window.previewImpact = previewImpact;

/* ─────────────────────────────────────────────────────────────────────────
   FairProcess — Public Records Search & Timeline
   Searches Humboldt County public data sources by address and auto-populates
   a timeline of property events.
   
   Data source: Humboldt County GIS Parcel Layer (ArcGIS REST API)
   https://cty-gis-web.co.humboldt.ca.us/server/rest/services/Parcels/Parcels/MapServer/0
   ───────────────────────────────────────────────────────────────────────── */

(function () {
  "use strict";

  // ── ArcGIS REST endpoint for Humboldt County parcels ─────────────────────
  const PARCEL_URL = "https://cty-gis-web.co.humboldt.ca.us/server/rest/services/Parcels/Parcels/MapServer/0";
  const PARCEL_FIELDS = "APN_12,APN,FULLADDR,SITCITY,SITZIP,TRANDATE,ZONING,LOTSIZE,YEAR_BUILT,USECODE,LEGAL,LAT,LON,BKPG,JURIS";

  // ── DOM helpers ──────────────────────────────────────────────────────────
  const $ = (id) => document.getElementById(id);
  const el = {
    form: $("search-form"),
    input: $("search-address"),
    button: $("search-button"),
    loading: $("search-loading"),
    status: $("search-status"),
    error: $("search-error"),
    errorMessage: $("search-error-message"),
    results: $("search-results"),
    empty: $("search-empty"),
    propertySummary: $("property-summary"),
    statsRow: $("search-stats"),
    timeline: $("timeline-container"),
    sources: $("sources-container"),
    exportBtn: $("timeline-export"),
    nav: $("search-nav"),
    notice: $("notice"),
  };

  // ── State ─────────────────────────────────────────────────────────────────
  const state = {
    searching: false,
    address: "",
    results: null,
    activeFilter: "all",
  };

  // ── Source metadata ──────────────────────────────────────────────────────
  const SOURCE_LABELS = {
    assessor: "Assessor",
    recorder: "Recorder",
    code_enforcement: "Code Enforcement",
    ownership: "Ownership",
    unknown: "Other",
  };

  // ── UI helpers ────────────────────────────────────────────────────────────
  function showNotice(message, tone) {
    const n = el.notice;
    n.textContent = message;
    n.dataset.tone = tone || "info";
    n.hidden = false;
    clearTimeout(n._timer);
    n._timer = setTimeout(() => { n.hidden = true; }, 3500);
  }

  function setLoading(isLoading, status) {
    state.searching = isLoading;
    el.loading.hidden = !isLoading;
    el.results.hidden = isLoading;
    el.empty.hidden = isLoading || state.results !== null;
    el.button.disabled = isLoading;
    if (status) el.status.textContent = status;
  }

  function showError(message) {
    el.error.hidden = false;
    el.errorMessage.textContent = message;
    el.results.hidden = true;
  }

  function escHtml(s) {
    const d = document.createElement("div");
    d.textContent = String(s ?? "");
    return d.innerHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "—";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    } catch { return dateStr; }
  }

  function arcgisDateToISO(epochMs) {
    if (!epochMs || epochMs === 0) return "";
    try {
      return new Date(epochMs).toISOString().slice(0, 10);
    } catch { return ""; }
  }

  function useCodeLabel(code) {
    const labels = {
      11: "Single Family Residential",
      21: "Single Family Residential",
      50: "Residential",
      51: "Residential",
      52: "Residential",
      56: "Commercial",
      99: "Other / Vacant",
    };
    return labels[code] || `Use Code ${code}`;
  }

  function parseAddress(address) {
    const parts = address.trim().split(",").map(s => s.trim());
    const streetPart = parts[0] || address;
    const city = (parts[1] || "").replace(/,\s*CA\b/i, "").trim();
    const numMatch = streetPart.match(/^(\d+)/);
    const houseNum = numMatch ? numMatch[1] : "";
    const streetName = streetPart.replace(/^\d+\s*/, "").trim();
    return { houseNum, streetName, city, full: streetPart };
  }

  // ── Search ───────────────────────────────────────────────────────────────
  el.form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (state.searching) return;

    const address = el.input.value.trim();
    if (!address) return;

    state.address = address;
    el.error.hidden = true;

    setLoading(true, "Searching public records…");

    try {
      const results = await searchPublicRecords(address);
      state.results = results;

      setLoading(false);
      el.empty.hidden = true;
      el.results.hidden = false;

      renderResults(results);
      const eventCount = results.timeline.length;
      const sourceCount = results.sources.filter(s => s.status === "ok").length;
      showNotice(`Found ${eventCount} timeline event${eventCount !== 1 ? "s" : ""} from ${sourceCount} source${sourceCount !== 1 ? "s" : ""}`, "success");
    } catch (err) {
      setLoading(false);
      showError(err.message || "An unexpected error occurred");
    }
  });

  // ── Core search function ─────────────────────────────────────────────────
  async function searchPublicRecords(address) {
    const parsed = parseAddress(address);
    const timeline = [];
    const sources = [];
    let property = null;

    // 1. Assessor / GIS parcel lookup
    setLoading(true, "Querying Humboldt County GIS parcels…");

    try {
      // Build WHERE clause
      let whereClause;
      if (parsed.city) {
        const streetKey = parsed.streetName.split(" ")[0].toUpperCase();
        const cityUpper = parsed.city.toUpperCase();
        whereClause = `UPPER(FULLADDR) LIKE UPPER('%25${parsed.houseNum}%20${streetKey}%25') AND UPPER(SITCITY) LIKE UPPER('%25${cityUpper}%25')`;
      } else {
        whereClause = `UPPER(FULLADDR) LIKE UPPER('%25${encodeURIComponent(parsed.full)}%25')`;
      }

      let url = `${PARCEL_URL}/query?where=${whereClause}&outFields=${PARCEL_FIELDS}&f=json&resultRecordCount=10`;
      let response = await fetch(url);
      let data = await response.json();

      // Fallback 1: just house number + first word of street
      if (!data.features || data.features.length === 0) {
        if (parsed.houseNum) {
          const streetKey = parsed.streetName.split(" ")[0].toUpperCase();
          const fbWhere = `UPPER(FULLADDR) LIKE UPPER('%25${parsed.houseNum}%20${streetKey}%25')`;
          url = `${PARCEL_URL}/query?where=${fbWhere}&outFields=${PARCEL_FIELDS}&f=json&resultRecordCount=5`;
          response = await fetch(url);
          data = await response.json();
        }
      }

      // Fallback 2: just house number + Eureka
      if (!data.features || data.features.length === 0) {
        if (parsed.houseNum) {
          const lastWhere = `UPPER(FULLADDR) LIKE UPPER('%25${parsed.houseNum}%25')`;
          url = `${PARCEL_URL}/query?where=${lastWhere}&outFields=${PARCEL_FIELDS}&f=json&resultRecordCount=10`;
          response = await fetch(url);
          data = await response.json();
        }
      }

      if (data.features && data.features.length > 0) {
        // Find best match — prefer exact house number match
        let bestMatch = data.features[0];
        if (parsed.houseNum && data.features.length > 1) {
          const exact = data.features.find(f =>
            (f.attributes.FULLADDR || "").toUpperCase().startsWith(parsed.houseNum + " ")
          );
          if (exact) bestMatch = exact;
        }

        const attrs = bestMatch.attributes;
        const transferDate = arcgisDateToISO(attrs.TRANDATE);

        property = {
          apn: attrs.APN_12 || attrs.APN || "",
          address: attrs.FULLADDR || address,
          situs_city: attrs.SITCITY || "",
          situs_zip: attrs.SITZIP || "",
          ownership_date: transferDate,
          zoning: attrs.ZONING || "",
          lot_size: attrs.LOTSIZE || null,
          year_built: attrs.YEAR_BUILT || "",
          use_code: attrs.USECODE || null,
          legal_description: attrs.LEGAL || "",
          lat: attrs.LAT || null,
          lon: attrs.LON || null,
          book_page: attrs.BKPG || "",
          jurisdiction: attrs.JURIS || "",
          apn_source: "Humboldt County GIS Parcel Layer v13.5",
        };

        // Timeline event: parcel record
        timeline.push({
          date: transferDate || "",
          source: "assessor",
          title: "Parcel record found in county GIS",
          description: `APN: ${property.apn}, ${useCodeLabel(attrs.USECODE)}, Lot size: ${attrs.LOTSIZE || "—"} acres, Zoning: ${attrs.ZONING || "—"}`,
          apn: property.apn,
          url: "https://humboldtgov.org/2495/GISMapping",
        });

        // Timeline event: ownership transfer
        if (transferDate) {
          timeline.push({
            date: transferDate,
            source: "ownership",
            title: "Ownership transfer recorded",
            description: `Last transfer date on assessor record. APN: ${property.apn}${attrs.BKPG ? `, Book-Page: ${attrs.BKPG}` : ""}`,
            apn: property.apn,
            document_type: "Deed transfer",
            url: "https://gis.humboldtgov.org/",
          });
        }

        // Timeline event: structure built
        if (attrs.YEAR_BUILT && attrs.YEAR_BUILT.trim() !== "") {
          timeline.push({
            date: attrs.YEAR_BUILT + "-01-01",
            source: "assessor",
            title: `Structure built (${attrs.YEAR_BUILT})`,
            description: `Year built per assessor records. ${useCodeLabel(attrs.USECODE)}.`,
            apn: property.apn,
          });
        }

        sources.push({
          source: "assessor",
          name: "Humboldt County Assessor / GIS Parcel Data",
          url: "https://humboldtgov.org/2495/GISMapping",
          status: "ok",
          results_count: timeline.length,
          note: `Matched parcel: ${attrs.FULLADDR}, ${attrs.SITCITY}`,
        });
      } else {
        sources.push({
          source: "assessor",
          name: "Humboldt County Assessor / GIS Parcel Data",
          url: "https://humboldtgov.org/2495/GISMapping",
          status: "empty",
          note: "No parcel found for this address in Humboldt County GIS",
        });
      }
    } catch (err) {
      sources.push({
        source: "assessor",
        name: "Humboldt County Assessor / GIS Parcel Data",
        url: "https://humboldtgov.org/2495/GISMapping",
        status: "error",
        error: err.message,
      });
    }

    // 2. Recorder (no public API — point to manual search)
    setLoading(true, "Checking county recorder…");
    sources.push({
      source: "recorder",
      name: "Humboldt County Recorder",
      url: "https://www.humboldtgov.org/2717/Recorder",
      status: "empty",
      note: property?.apn
        ? `Search by APN: ${property.apn} at the county recorder's office. Book-Page ref: ${property.book_page || "—"}.`
        : "Recorder online search requires manual access at the county recorder's office.",
    });

    // 3. Code Enforcement (no public API — point to manual search)
    setLoading(true, "Checking code enforcement…");
    sources.push({
      source: "code_enforcement",
      name: "Humboldt County Code Enforcement",
      url: "https://humboldtgov.org/2447/Code-Enforcement",
      status: "empty",
      note: property?.apn
        ? `Contact Code Enforcement for records associated with APN ${property.apn}.`
        : "No public online search available. Contact the Code Enforcement division directly.",
    });

    // 4. Ownership history (via assessor data already retrieved)
    setLoading(true, "Building timeline…");
    const ownershipEvents = timeline.filter(e => e.source === "ownership");
    sources.push({
      source: "ownership",
      name: "Ownership History (via Assessor GIS)",
      url: "https://gis.humboldtgov.org/",
      status: ownershipEvents.length > 0 ? "ok" : "empty",
      results_count: ownershipEvents.length,
      note: ownershipEvents.length > 0
        ? "Transfer date found in assessor GIS data"
        : "No ownership transfer date found in assessor data",
    });

    return { address, property, timeline, sources };
  }

  // ── Render ────────────────────────────────────────────────────────────────
  function renderResults(data) {
    renderPropertySummary(data.property);
    renderStats(data);
    renderTimeline(data.timeline || []);
    renderSources(data.sources || []);
    el.exportBtn.hidden = false;
  }

  function renderPropertySummary(property) {
    if (!property) {
      el.propertySummary.innerHTML = `<div class="property-summary-card"><div class="label">No parcel found</div><div class="value">Property not in GIS</div></div>`;
      return;
    }

    const cards = [
      { label: "APN", value: property.apn || "Not found", sub: property.apn_source || "" },
      { label: "Address", value: property.address || state.address, sub: `${property.situs_city || ""} ${property.situs_zip || ""}`.trim() || "" },
      { label: "Last Transfer", value: property.ownership_date ? formatDate(property.ownership_date) : "No date", sub: property.zoning || "" },
      { label: "Lot Size", value: property.lot_size ? `${property.lot_size} acres` : "—", sub: useCodeLabel(property.use_code) },
      { label: "Year Built", value: property.year_built && property.year_built.trim() ? property.year_built : "—", sub: property.jurisdiction ? `Jurisdiction: ${property.jurisdiction}` : "" },
      { label: "Coordinates", value: property.lat && property.lon ? `${property.lat.toFixed(4)}, ${property.lon.toFixed(4)}` : "—", sub: property.book_page ? `Book-Page: ${property.book_page}` : "" },
    ];

    el.propertySummary.innerHTML = cards.map(c => `
      <div class="property-summary-card">
        <div class="label">${escHtml(c.label)}</div>
        <div class="value">${escHtml(c.value)}</div>
        ${c.sub ? `<div class="sub">${escHtml(c.sub)}</div>` : ""}
      </div>
    `).join("");
  }

  function renderStats(data) {
    const stats = {};
    (data.timeline || []).forEach(e => {
      const src = e.source || "unknown";
      if (!stats[src]) stats[src] = 0;
      stats[src]++;
    });

    const chips = Object.entries(stats).map(([src, count]) => {
      return `<div class="stat-chip source-${escHtml(src)}">
        <span class="count">${count}</span>
        <span>${escHtml(SOURCE_LABELS[src] || src)}</span>
      </div>`;
    });

    if (data.timeline?.length) {
      chips.unshift(`<div class="stat-chip">
        <span class="count">${data.timeline.length}</span>
        <span>Total events</span>
      </div>`);
    }

    el.statsRow.innerHTML = chips.join("");
  }

  function renderTimeline(events) {
    const sorted = [...events].sort((a, b) => {
      const da = new Date(a.date || "").getTime() || 0;
      const db = new Date(b.date || "").getTime() || 0;
      return db - da;
    });

    if (sorted.length === 0) {
      el.timeline.innerHTML = `<p style="color:var(--muted);text-align:center;padding:32px;">No timeline events found for this address.</p>`;
      return;
    }

    el.timeline.innerHTML = sorted.map(e => {
      const src = e.source || "unknown";
      const date = formatDate(e.date);
      const title = escHtml(e.title || e.event_type || "Event");
      const desc = e.description ? `<p class="timeline-desc">${escHtml(e.description)}</p>` : "";
      const metaParts = [];

      if (e.instrument_number) metaParts.push(`<span>Inst: ${escHtml(e.instrument_number)}</span>`);
      if (e.apn) metaParts.push(`<span>APN: ${escHtml(e.apn)}</span>`);
      if (e.party) metaParts.push(`<span>Party: ${escHtml(e.party)}</span>`);
      if (e.document_type) metaParts.push(`<span>Type: ${escHtml(e.document_type)}</span>`);
      if (e.url) metaParts.push(`<a href="${escHtml(e.url)}" target="_blank" rel="noopener">View source →</a>`);

      return `
        <div class="timeline-item" data-source="${escHtml(src)}">
          <div class="timeline-dot source-${escHtml(src)}"></div>
          <div class="timeline-content">
            <div class="timeline-date">
              ${escHtml(date)}
              <span class="timeline-source-badge source-${escHtml(src)}">${escHtml(SOURCE_LABELS[src] || src)}</span>
            </div>
            <div class="timeline-title">${title}</div>
            ${desc}
            ${metaParts.length ? `<div class="timeline-meta">${metaParts.join("")}</div>` : ""}
          </div>
        </div>
      `;
    }).join("");
  }

  function renderSources(sources) {
    if (!sources.length) {
      el.sources.innerHTML = `<p style="color:var(--muted);">No source data available.</p>`;
      return;
    }

    el.sources.innerHTML = sources.map(s => {
      const status = s.status || "ok";
      const statusClass = status === "error" ? "error" : status === "empty" ? "empty" : "ok";
      return `
        <div class="source-item">
          <div class="source-item-header">
            <strong>${escHtml(s.name || s.source || "Unknown source")}</strong>
            <span class="source-status ${statusClass}">${escHtml(status)}</span>
          </div>
          ${s.url ? `<div class="source-item-url"><a href="${escHtml(s.url)}" target="_blank" rel="noopener">${escHtml(s.url)}</a></div>` : ""}
          ${s.results_count !== undefined ? `<div class="source-item-meta">${s.results_count} result${s.results_count !== 1 ? "s" : ""}${s.note ? ` — ${escHtml(s.note)}` : ""}</div>` : ""}
          ${s.note && s.results_count === undefined ? `<div class="source-item-meta">${escHtml(s.note)}</div>` : ""}
          ${s.error ? `<div class="source-item-meta" style="color:var(--red);">${escHtml(s.error)}</div>` : ""}
        </div>
      `;
    }).join("");
  }

  // ── Source filter nav ────────────────────────────────────────────────────
  el.nav.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-source]");
    if (!btn) return;

    el.nav.querySelectorAll("[data-source]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.source;
    state.activeFilter = filter;

    const items = el.timeline.querySelectorAll(".timeline-item");
    items.forEach(item => {
      if (filter === "all" || item.dataset.source === filter) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  });

  // ── Export ────────────────────────────────────────────────────────────────
  el.exportBtn.addEventListener("click", () => {
    if (!state.results) return;
    const blob = new Blob([JSON.stringify(state.results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fairprocess-search-${state.address.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice("Timeline exported as JSON", "success");
  });

  // ── Example chips ─────────────────────────────────────────────────────────
  document.querySelectorAll(".example-chip").forEach(chip => {
    chip.addEventListener("click", () => {
      el.input.value = chip.dataset.address;
      el.form.dispatchEvent(new Event("submit"));
    });
  });

  // ── Keyboard shortcut: focus search with "/" ─────────────────────────────
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== el.input) {
      e.preventDefault();
      el.input.focus();
    }
  });

})();

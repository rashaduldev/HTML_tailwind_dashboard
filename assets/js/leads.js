(() => {
  const source = window.CRM_PIPELINE_DATA;
  const storageKey = "uvlab-crm-deals-v1";
  const saved = localStorage.getItem(storageKey);
  let deals;
  try { deals = saved ? JSON.parse(saved) : structuredClone(source.deals); }
  catch { deals = structuredClone(source.deals); }

  const state = { query: "", stage: "all", owner: "all", sort: "recent", view: "kanban", page: 1, pageSize: 6, editingId: null };
  const $ = (selector) => document.querySelector(selector);
  const money = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
  const shortMoney = (value) => value >= 1000000 ? `$${(value / 1000000).toFixed(2)}M` : `$${Math.round(value / 1000)}K`;
  const dateText = (date) => new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${date}T12:00:00`));
  const stageById = (id) => source.stages.find((stage) => stage.id === id);
  const ownerById = (id) => source.owners.find((owner) => owner.id === id);
  const escapeHtml = (text = "") => String(text).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  const save = () => localStorage.setItem(storageKey, JSON.stringify(deals));

  function filteredDeals() {
    const q = state.query.trim().toLowerCase();
    const result = deals.filter((deal) => {
      const matchesQuery = !q || [deal.company, deal.contact, deal.email, deal.title, deal.source, ...deal.tags].join(" ").toLowerCase().includes(q);
      return matchesQuery && (state.stage === "all" || deal.stage === state.stage) && (state.owner === "all" || deal.owner === state.owner);
    });
    return result.sort((a, b) => {
      if (state.sort === "value-desc") return b.value - a.value;
      if (state.sort === "value-asc") return a.value - b.value;
      if (state.sort === "due") return a.due.localeCompare(b.due);
      return b.id - a.id;
    });
  }

  function initializeSelects() {
    source.stages.forEach((stage) => {
      $("#stageFilter").insertAdjacentHTML("beforeend", `<option value="${stage.id}">${stage.label}</option>`);
      $("#modalStage").insertAdjacentHTML("beforeend", `<option value="${stage.id}">${stage.label}</option>`);
    });
    source.owners.forEach((owner) => {
      $("#ownerFilter").insertAdjacentHTML("beforeend", `<option value="${owner.id}">${owner.name}</option>`);
      $("#modalOwner").insertAdjacentHTML("beforeend", `<option value="${owner.id}">${owner.name}</option>`);
    });
  }

  function renderMetrics() {
    const open = deals.filter((deal) => deal.stage !== "closed");
    const openValue = open.reduce((sum, deal) => sum + deal.value, 0);
    const weighted = open.reduce((sum, deal) => sum + deal.value * deal.probability / 100, 0);
    const won = deals.filter((deal) => deal.stage === "closed").reduce((sum, deal) => sum + deal.value, 0);
    const metrics = [
      ["Open pipeline", shortMoney(openValue), "Trending up 12.4%", "circle-dollar-sign", "#9A4CCA", "bg-purple-50 dark:bg-purple-500/10"],
      ["Active deals", String(open.length), `${deals.filter((d) => d.activity.includes("today")).length} need attention`, "briefcase-business", "#3B82F6", "bg-blue-50 dark:bg-blue-500/10"],
      ["Weighted forecast", shortMoney(weighted), "Based on probability", "chart-no-axes-combined", "#F59E0B", "bg-amber-50 dark:bg-amber-500/10"],
      ["Closed won", shortMoney(won), "This sales period", "trophy", "#10B981", "bg-emerald-50 dark:bg-emerald-500/10"],
    ];
    $("#metrics").innerHTML = metrics.map(([label, value, note, icon, color, bg]) => `<article class="p-4 border border-gray-100 dark:border-gray-800 rounded-xl"><div class="flex items-start justify-between"><div><p class="text-xs text-gray-500">${label}</p><p class="text-xl font-bold mt-1 primary-text">${value}</p></div><span class="w-9 h-9 grid place-items-center rounded-lg ${bg}" style="color:${color}"><i data-lucide="${icon}" class="w-4 h-4"></i></span></div><p class="text-[11px] text-gray-500 mt-3">${note}</p></article>`).join("");
  }

  function cardMarkup(deal) {
    const owner = ownerById(deal.owner);
    return `<article draggable="true" data-deal-id="${deal.id}" class="deal-card bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4" tabindex="0">
      <div class="flex justify-between gap-2"><span class="text-[10px] font-semibold uppercase tracking-wide text-gray-400">#DL-${deal.id}</span><button data-edit="${deal.id}" class="p-1 -mr-1 -mt-1 text-gray-400 hover:text-purpleMain rounded" aria-label="Edit ${escapeHtml(deal.title)}"><i data-lucide="more-horizontal" class="w-4 h-4"></i></button></div>
      <h3 class="font-semibold text-sm mt-2">${escapeHtml(deal.title)}</h3><p class="text-xs text-gray-500 mt-1">${escapeHtml(deal.company)}</p>
      <div class="flex flex-wrap gap-1 mt-3">${deal.tags.map((tag) => `<span class="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-[10px] text-gray-500 rounded-full">${escapeHtml(tag)}</span>`).join("")}</div>
      <div class="flex items-end justify-between mt-4"><div><p class="font-bold text-sm">${money(deal.value)}</p><p class="text-[10px] text-gray-400 mt-1">Close ${dateText(deal.due)}</p></div><span title="${owner.name}" class="w-7 h-7 rounded-full grid place-items-center text-[9px] font-bold text-white" style="background:${owner.color}">${owner.initials}</span></div>
      <div class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-1.5 text-[10px] text-gray-500"><i data-lucide="activity" class="w-3 h-3"></i>${escapeHtml(deal.activity)}</div>
    </article>`;
  }

  function renderKanban(items) {
    $("#kanbanView").innerHTML = source.stages.map((stage) => {
      const stageDeals = items.filter((deal) => deal.stage === stage.id);
      const total = stageDeals.reduce((sum, deal) => sum + deal.value, 0);
      return `<section class="kanban-column bg-gray-50 dark:bg-gray-800/60 rounded-xl p-3"><header class="flex items-start justify-between px-1 py-1 mb-3"><div><div class="flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full" style="background:${stage.color}"></span><h2 class="text-sm font-semibold">${stage.label}</h2><span class="px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-[10px]">${stageDeals.length}</span></div><p class="text-[11px] text-gray-500 mt-1 ml-[18px]">${money(total)}</p></div><button data-add-stage="${stage.id}" class="p-1 text-gray-400 hover:text-purpleMain" aria-label="Add deal to ${stage.label}"><i data-lucide="plus" class="w-4 h-4"></i></button></header><div class="drop-zone min-h-[180px] rounded-lg space-y-3 p-0.5 transition" data-stage="${stage.id}">${stageDeals.map(cardMarkup).join("")}${stageDeals.length ? "" : `<div class="h-32 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg grid place-items-center text-xs text-gray-400">Drop a deal here</div>`}</div></section>`;
    }).join("");
    bindDragAndDrop();
  }

  function renderList(items) {
    const pageCount = Math.max(1, Math.ceil(items.length / state.pageSize));
    state.page = Math.min(state.page, pageCount);
    const paged = items.slice((state.page - 1) * state.pageSize, state.page * state.pageSize);
    $("#dealTableBody").innerHTML = paged.map((deal) => {
      const stage = stageById(deal.stage); const owner = ownerById(deal.owner);
      return `<tr class="hover:bg-gray-50 dark:hover:bg-gray-800/60"><td class="px-4 py-3"><p class="font-semibold">${escapeHtml(deal.title)}</p><p class="text-xs text-gray-500 mt-0.5">${escapeHtml(deal.company)} · ${escapeHtml(deal.contact)}</p></td><td class="px-4 py-3"><span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs bg-gray-100 dark:bg-gray-800"><span class="w-1.5 h-1.5 rounded-full" style="background:${stage.color}"></span>${stage.label}</span></td><td class="px-4 py-3 font-semibold">${money(deal.value)}</td><td class="px-4 py-3"><div class="flex items-center gap-2"><span class="w-7 h-7 rounded-full grid place-items-center text-[9px] font-bold text-white" style="background:${owner.color}">${owner.initials}</span><span>${owner.name}</span></div></td><td class="px-4 py-3 text-gray-500">${dateText(deal.due)}</td><td class="px-4 py-3"><div class="flex items-center gap-2"><div class="w-16 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700"><div class="h-full rounded-full bg-purpleMain" style="width:${deal.probability}%"></div></div><span class="text-xs">${deal.probability}%</span></div></td><td class="px-4 py-3 text-right"><button data-edit="${deal.id}" class="p-2 text-gray-400 hover:text-purpleMain"><i data-lucide="pencil" class="w-4 h-4"></i></button></td></tr>`;
    }).join("");
    const first = items.length ? (state.page - 1) * state.pageSize + 1 : 0;
    const last = Math.min(state.page * state.pageSize, items.length);
    $("#pagination").innerHTML = `<span class="text-xs text-gray-500">Showing ${first}–${last} of ${items.length}</span><div class="flex gap-1"><button data-page="prev" ${state.page === 1 ? "disabled" : ""} class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40"><i data-lucide="chevron-left" class="w-4 h-4"></i></button><span class="px-3 py-2 text-xs">Page ${state.page} of ${pageCount}</span><button data-page="next" ${state.page === pageCount ? "disabled" : ""} class="p-2 border border-gray-200 dark:border-gray-700 rounded-lg disabled:opacity-40"><i data-lucide="chevron-right" class="w-4 h-4"></i></button></div>`;
  }

  function render() {
    const items = filteredDeals();
    renderMetrics(); renderKanban(items); renderList(items);
    $("#resultsMeta").textContent = `${items.length} ${items.length === 1 ? "deal" : "deals"} · ${money(items.reduce((sum, deal) => sum + deal.value, 0))} total value`;
    $("#emptyState").classList.toggle("hidden", items.length > 0);
    $("#kanbanView").classList.toggle("hidden", state.view !== "kanban" || !items.length);
    $("#listView").classList.toggle("hidden", state.view !== "list" || !items.length);
    $("#clearFilters").classList.toggle("hidden", !state.query && state.stage === "all" && state.owner === "all");
    lucide.createIcons();
  }

  function bindDragAndDrop() {
    document.querySelectorAll("[draggable=true]").forEach((card) => {
      card.addEventListener("dragstart", (event) => { event.dataTransfer.setData("text/plain", card.dataset.dealId); event.dataTransfer.effectAllowed = "move"; card.classList.add("dragging"); });
      card.addEventListener("dragend", () => { card.classList.remove("dragging"); document.querySelectorAll(".drag-over").forEach((zone) => zone.classList.remove("drag-over")); });
    });
    document.querySelectorAll(".drop-zone").forEach((zone) => {
      zone.addEventListener("dragover", (event) => { event.preventDefault(); zone.classList.add("drag-over"); });
      zone.addEventListener("dragleave", (event) => { if (!zone.contains(event.relatedTarget)) zone.classList.remove("drag-over"); });
      zone.addEventListener("drop", (event) => {
        event.preventDefault(); const id = Number(event.dataTransfer.getData("text/plain")); const deal = deals.find((item) => item.id === id);
        if (deal && deal.stage !== zone.dataset.stage) { const oldStage = stageById(deal.stage).label; deal.stage = zone.dataset.stage; deal.probability = { prospect: 20, qualified: 45, proposal: 65, negotiation: 85, closed: 100 }[deal.stage]; deal.activity = `Moved from ${oldStage} just now`; save(); showToast(`${deal.company} moved to ${stageById(deal.stage).label}`); render(); }
      });
    });
  }

  function openModal(stage = "prospect", deal = null) {
    state.editingId = deal?.id || null; const form = $("#dealForm"); form.reset();
    $("#modalTitle").textContent = deal ? "Edit deal" : "Add new deal";
    form.querySelector('[type="submit"]').textContent = deal ? "Save changes" : "Create deal";
    if (deal) ["title", "company", "contact", "value", "due", "stage", "owner"].forEach((key) => { form.elements[key].value = deal[key]; });
    else { form.elements.stage.value = stage; form.elements.owner.value = source.owners[0].id; form.elements.due.value = "2026-10-15"; }
    $("#dealModal").classList.remove("hidden"); $("#dealModal").classList.add("flex"); setTimeout(() => form.elements.title.focus(), 50);
  }
  function closeModal() { $("#dealModal").classList.add("hidden"); $("#dealModal").classList.remove("flex"); state.editingId = null; }
  function showToast(message) { const toast = document.createElement("div"); toast.className = "toast flex items-center gap-2 bg-[#001846] dark:bg-purpleMain text-white text-sm px-4 py-3 rounded-lg shadow-xl"; toast.innerHTML = `<i data-lucide="check-circle-2" class="w-4 h-4"></i>${escapeHtml(message)}`; $("#toastRegion").appendChild(toast); lucide.createIcons(); setTimeout(() => toast.remove(), 3200); }

  $("#globalSearch").addEventListener("input", (event) => { state.query = event.target.value; state.page = 1; render(); });
  $("#stageFilter").addEventListener("change", (event) => { state.stage = event.target.value; state.page = 1; render(); });
  $("#ownerFilter").addEventListener("change", (event) => { state.owner = event.target.value; state.page = 1; render(); });
  $("#sortFilter").addEventListener("change", (event) => { state.sort = event.target.value; render(); });
  $("#clearFilters").addEventListener("click", () => { state.query = ""; state.stage = "all"; state.owner = "all"; $("#globalSearch").value = ""; $("#stageFilter").value = "all"; $("#ownerFilter").value = "all"; render(); });
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => { state.view = button.dataset.view; document.querySelectorAll("[data-view]").forEach((item) => item.classList.toggle("active", item === button)); render(); }));
  document.addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]"); const add = event.target.closest("[data-add-stage]"); const page = event.target.closest("[data-page]");
    if (edit) openModal(undefined, deals.find((deal) => deal.id === Number(edit.dataset.edit)));
    if (add) openModal(add.dataset.addStage);
    if (page) { state.page += page.dataset.page === "next" ? 1 : -1; render(); }
  });
  $("#pagination").addEventListener("click", () => {});
  $("#addDealButton").addEventListener("click", () => openModal());
  document.querySelectorAll("[data-close-modal]").forEach((button) => button.addEventListener("click", closeModal));
  $("#dealModal").addEventListener("click", (event) => { if (event.target === $("#dealModal")) closeModal(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeModal(); });
  $("#dealForm").addEventListener("submit", (event) => {
    event.preventDefault(); const values = Object.fromEntries(new FormData(event.currentTarget)); const existing = deals.find((deal) => deal.id === state.editingId);
    if (existing) { Object.assign(existing, values, { value: Number(values.value), probability: existing.stage === values.stage ? existing.probability : ({ prospect: 20, qualified: 45, proposal: 65, negotiation: 85, closed: 100 }[values.stage]), activity: "Updated just now" }); showToast(`${values.company} was updated`); }
    else { deals.unshift({ id: Math.max(...deals.map((deal) => deal.id), 100) + 1, ...values, value: Number(values.value), email: "contact@company.com", probability: ({ prospect: 20, qualified: 45, proposal: 65, negotiation: 85, closed: 100 }[values.stage]), source: "Manual", activity: "Created just now", tags: ["New"] }); showToast(`${values.company} added to the pipeline`); }
    save(); closeModal(); render();
  });

  const sidebar = $("#mobileSidebar"); const overlay = $("#sidebarOverlay");
  $("#toggleSidebar").addEventListener("click", () => { if (window.innerWidth < 768) { sidebar.classList.toggle("-translate-x-[120%]"); overlay.classList.toggle("hidden"); } else { sidebar.classList.toggle("md:hidden"); } });
  overlay.addEventListener("click", () => { sidebar.classList.add("-translate-x-[120%]"); overlay.classList.add("hidden"); });
  $("#themeToggle").addEventListener("click", () => { document.documentElement.classList.toggle("dark"); localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light"; updateThemeIcon(); });
  function updateThemeIcon() { $("#themeIcon").setAttribute("data-lucide", document.documentElement.classList.contains("dark") ? "moon" : "sun"); lucide.createIcons(); }

  initializeSelects(); updateThemeIcon(); render();
})();

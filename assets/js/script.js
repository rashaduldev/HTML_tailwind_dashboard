// Initialize Lucide icons (common across all files)
lucide.createIcons();

// --- Sidebar Submenu Functionality (from all files, consolidated) ---
// Consolidated toggleSubmenu to avoid duplicates
function toggleSubmenu(el) {
  document
    .querySelectorAll(".sidebar-item")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
  const submenu = document.getElementById("submenu");
  if (submenu.classList.contains("hidden")) {
    submenu.classList.remove("hidden");
    submenu.style.maxHeight = submenu.scrollHeight + "px";
  } else {
    submenu.style.maxHeight = "0";
    setTimeout(() => submenu.classList.add("hidden"), 300);
  }
}

// Generic accordion handler for every arrow-based sidebar section.
function toggleSection(el, submenuId) {
  const submenu = document.getElementById(submenuId);
  if (!submenu) return;
  const willOpen = submenu.classList.contains("hidden");

  document.querySelectorAll(".sidebar-submenu").forEach((menu) => {
    if (menu !== submenu) menu.classList.add("hidden");
  });
  document.querySelectorAll(".sidebar-item").forEach((item) => {
    if (item !== el) item.classList.remove("active");
  });

  submenu.classList.toggle("hidden", !willOpen);
  el.classList.toggle("active", willOpen);
  const chevron = el.querySelector(".section-chevron");
  if (chevron) chevron.classList.toggle("rotate-180", willOpen);
  if (typeof lucide !== "undefined") lucide.createIcons();
}

// Set active state for sidebar items
function setActive(el) {
  document
    .querySelectorAll(".sidebar-item")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
}

// --- Theme Toggle Functionality (from all files, consolidated) ---
if (localStorage.theme === "dark") {
  document.documentElement.classList.add("dark");
}
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
function updateIcon() {
  themeIcon.setAttribute(
    "data-lucide",
    document.documentElement.classList.contains("dark") ? "moon" : "sun"
  );
  lucide.createIcons();
}
themeToggle.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  localStorage.theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  updateIcon();
});
updateIcon();

// --- Sidebar Toggle Functionality (from all files, consolidated) ---
const toggleBtn = document.getElementById("toggleSidebar");
const sidebar = document.getElementById("mobileSidebar");
const overlay = document.getElementById("sidebarOverlay");
const mainContent = document.querySelector("main");
const container = document.querySelector(".md\\:min-w-\\[1440px\\]");
let isSidebarHidden = false;

toggleBtn.addEventListener("click", () => {
  if (window.innerWidth < 768) {
    // Mobile: Toggle drawer
    sidebar.classList.toggle("-translate-x-full");
    overlay.classList.toggle("hidden");
  } else {
    // Large devices: Toggle sidebar visibility
    isSidebarHidden = !isSidebarHidden;
    sidebar.classList.toggle("sidebar-hidden", isSidebarHidden);
    mainContent.classList.toggle("main-full-width", isSidebarHidden);
    container.classList.toggle("mx-20", !isSidebarHidden);
    container.classList.toggle("mx-6", isSidebarHidden);
  }
});

overlay.addEventListener("click", () => {
  sidebar.classList.add("-translate-x-full");
  overlay.classList.add("hidden");
});

// --- Search Bar Toggle Functionality (from all files, consolidated) ---
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");
searchToggle.addEventListener("click", () => {
  if (window.innerWidth < 640) {
    searchInput.classList.toggle("hidden");
    searchInput.focus();
  }
});

// --- Chart Functionality (from first file only) ---
// Data for Line Chart (full year)
const fullSalesData = [
  28000, 18000, 22000, 17000, 20000, 34233, 25000, 20000, 11000, 16000, 23000,
  22000,
];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// Data for Stacked Bar Chart (full range)
const fullDates = [
  "7/12",
  "8/12",
  "9/12",
  "10/12",
  "11/12",
  "12/12",
  "13/12",
  "14/12",
  "15/12",
  "16/12",
  "17/12",
  "19/12",
];
const fullAppleData = [
  150, 100, 50, 200, 250, 300, 100, 150, 200, 100, 150, 100,
];
const fullSamsungData = [
  100, 150, 200, 100, 50, 100, 150, 200, 100, 150, 100, 150,
];
const fullMotorolaData = [50, 50, 50, 100, 100, 50, 50, 50, 100, 100, 50, 100];

// Sample data for 6 months and 3 months
const sixMonthsSalesData = [20000, 34233, 25000, 20000, 11000, 16000];
const sixMonths = ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const threeMonthsSalesData = [25000, 20000, 11000];
const threeMonths = ["Oct", "Nov", "Dec"];
const sixMonthsAppleData = [100, 150, 200, 100, 150, 100];
const sixMonthsSamsungData = [150, 200, 100, 150, 100, 150];
const sixMonthsMotorolaData = [50, 50, 100, 100, 50, 50];
const threeMonthsAppleData = [200, 100, 150];
const threeMonthsSamsungData = [100, 150, 100];
const threeMonthsMotorolaData = [100, 50, 50];

let currentChart;

const getChange = (index, data) => {
  if (index === 0) return "";
  const prev = data[index - 1];
  const curr = data[index];
  const change = (((curr - prev) / prev) * 100).toFixed(0);
  return change >= 0 ? `+${change}%` : `${change}%`;
};

const renderChart = (type = "line", range = "12 months") => {
  const canvas = document.getElementById("lineChart");
  const ctx = canvas.getContext("2d");

  // Destroy existing chart before creating new one
  if (currentChart) {
    currentChart.destroy();
  }

  // Determine data and labels based on chart type and range
  let labels, datasets;
  if (type === "line") {
    if (range === "12 months") {
      labels = months;
      datasets = [
        {
          label: "Sales",
          data: fullSalesData,
          backgroundColor: ctx.createLinearGradient(0, 0, 0, 400),
          borderColor: "#3b82f6",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3b82f6",
          pointBorderWidth: 2,
        },
      ];
    } else if (range === "6 months") {
      labels = sixMonths;
      datasets = [
        {
          label: "Sales",
          data: sixMonthsSalesData,
          backgroundColor: ctx.createLinearGradient(0, 0, 0, 400),
          borderColor: "#3b82f6",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3b82f6",
          pointBorderWidth: 2,
        },
      ];
    } else if (range === "3 months") {
      labels = threeMonths;
      datasets = [
        {
          label: "Sales",
          data: threeMonthsSalesData,
          backgroundColor: ctx.createLinearGradient(0, 0, 0, 400),
          borderColor: "#3b82f6",
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#3b82f6",
          pointBorderWidth: 2,
        },
      ];
    }
    datasets[0].backgroundColor.addColorStop(0, "rgba(59, 130, 246, 0.2)");
    datasets[0].backgroundColor.addColorStop(1, "rgba(59, 130, 246, 0)");
  } else if (type === "bar") {
    if (range === "12 months") {
      labels = fullDates;
      datasets = [
        {
          label: "Apple",
          data: fullAppleData,
          backgroundColor: "#9A4CCA",
          stack: "Stack 0",
        },
        {
          label: "Samsung",
          data: fullSamsungData,
          backgroundColor: "#D2B0FF",
          stack: "Stack 0",
        },
        {
          label: "Motorola",
          data: fullMotorolaData,
          backgroundColor: "#F8D3FF",
          stack: "Stack 0",
        },
      ];
    } else if (range === "6 months") {
      labels = fullDates.slice(5, 11);
      datasets = [
        {
          label: "Apple",
          data: sixMonthsAppleData,
          backgroundColor: "#9A4CCA",
          stack: "Stack 0",
        },
        {
          label: "Samsung",
          data: sixMonthsSamsungData,
          backgroundColor: "#D2B0FF",
          stack: "Stack 0",
        },
        {
          label: "Motorola",
          data: sixMonthsMotorolaData,
          backgroundColor: "#F8D3FF",
          stack: "Stack 0",
        },
      ];
    } else if (range === "3 months") {
      labels = fullDates.slice(8, 11);
      datasets = [
        {
          label: "Apple",
          data: threeMonthsAppleData,
          backgroundColor: "#9A4CCA",
          stack: "Stack 0",
        },
        {
          label: "Samsung",
          data: threeMonthsSamsungData,
          backgroundColor: "#D2B0FF",
          stack: "Stack 0",
        },
        {
          label: "Motorola",
          data: threeMonthsMotorolaData,
          backgroundColor: "#F8D3FF",
          stack: "Stack 0",
        },
      ];
    }
  }

  currentChart = new Chart(ctx, {
    type,
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      barThickness: 20,
      maxBarThickness: 20,
      plugins: {
        legend: {
          display: type === "bar",
          position: "top",
          labels: { color: "#666" },
        },
        tooltip: {
          backgroundColor: "#fff",
          titleColor: "#000",
          bodyColor: "#000",
          borderColor: "#eee",
          borderWidth: 1,
          padding: 10,
          displayColors: type === "bar",
          callbacks: {
            title: (context) =>
              type === "line"
                ? `${context[0].label}, 2024 Sales`
                : context[0].label,
            label: (context) => {
              if (type === "line") {
                const value = `$${context.raw.toLocaleString()}`;
                const index = context.dataIndex;
                const data =
                  type === "line"
                    ? range === "12 months"
                      ? fullSalesData
                      : range === "6 months"
                      ? sixMonthsSalesData
                      : threeMonthsSalesData
                    : [];
                const change = getChange(index, data);
                return `${value} ${
                  index === 5 && range === "12 months"
                    ? "+24%"
                    : change
                    ? `(${change})`
                    : ""
                }`;
              } else {
                return `${context.dataset.label}: ${context.raw}`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#666" },
        },
        y: {
          beginAtZero: true,
          grid: { color: "#f0f0f0" },
          ticks: {
            color: "#666",
            callback: (value) =>
              type === "line" ? `$${(value / 1000).toFixed(0)}k` : value,
          },
          stacked: type === "bar",
        },
      },
    },
  });
};

// Initial chart render
renderChart("line", "12 months");

// Dropdown change handlers for chart
document.getElementById("chartTypeSelector").addEventListener("change", (e) => {
  const range =
    document.querySelector("select:nth-child(2)").value || "12 months";
  renderChart(e.target.value, range);
});

document
  .querySelector("select:nth-child(2)")
  .addEventListener("change", (e) => {
    const type = document.getElementById("chartTypeSelector").value || "line";
    renderChart(type, e.target.value);
  });

// Pie Chart
const pieCtx = document.getElementById("pieChart").getContext("2d");
new Chart(pieCtx, {
  type: "doughnut",
  data: {
    labels: ["ERP", "HRM", "DMS", "CRM", "DAM"],
    datasets: [
      {
        label: "Assistance",
        data: [25, 30, 20, 15, 10],
        backgroundColor: [
          "#3b82f6",
          "#f97316",
          "#10b981",
          "#8b5cf6",
          "#facc15",
        ],
        borderWidth: 0,
        cutout: "70%",
      },
    ],
  },
  options: { plugins: { legend: { display: false } } },
});

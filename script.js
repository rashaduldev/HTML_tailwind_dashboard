lucide.createIcons();

// Sidebar submenu
function toggleSubmenu(el) {
  document
    .querySelectorAll(".sidebar-item")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
  const submenu = document.getElementById("submenu");
  if (submenu.classList.contains("hidden")) {
    submenu.classList.remove("block", "hidden");
    submenu.style.maxHeight = submenu.scrollHeight + "px";
  } else {
    submenu.style.maxHeight = "0";
    setTimeout(() => submenu.classList.add("hidden"), 300);
  }
}

function toggleSection(el, submenuId) {
  const submenu = document.getElementById(submenuId);
  if (!submenu) return;
  const isHidden = submenu.classList.contains("hidden");
  document.querySelectorAll(".sidebar-submenu").forEach((menu) => {
    if (menu !== submenu) menu.classList.add("hidden");
  });
  submenu.classList.toggle("hidden", !isHidden);
  document.querySelectorAll(".sidebar-item").forEach((item) => item.classList.remove("active"));
  el.classList.toggle("active", isHidden);
  if (typeof lucide !== "undefined") lucide.createIcons();
}

function setActive(el) {
  document
    .querySelectorAll(".sidebar-item")
    .forEach((i) => i.classList.remove("active"));
  el.classList.add("active");
}

// Line Chart
const lineCanvas = document.getElementById("lineChart");
const lineCtx = lineCanvas.getContext("2d");
const gradient = lineCtx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, "rgba(59, 130, 246, 0.2)");
gradient.addColorStop(1, "rgba(59, 130, 246, 0)");
const salesData = [
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
function getChange(index) {
  if (index === 0) return "";
  const prev = salesData[index - 1];
  const curr = salesData[index];
  const change = (((curr - prev) / prev) * 100).toFixed(0);
  return change >= 0 ? `+${change}%` : `${change}%`;
}
new Chart(lineCtx, {
  type: "line",
  data: {
    labels: months,
    datasets: [
      {
        label: "Sales",
        data: salesData,
        borderColor: "#3b82f6",
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        borderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointBackgroundColor: "#ffffff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
      },
    ],
  },
  options: {
    responsive: true,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#000",
        bodyColor: "#000",
        borderColor: "#eee",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (context) => `${context[0].label}, 2024 Sales`,
          label: (context) => {
            const value = `$${context.raw.toLocaleString()}`;
            const index = context.dataIndex;
            const change = getChange(index);
            return `${value} ${
              index === 5 ? "+24%" : change ? `(${change})` : ""
            }`;
          },
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: "#666" } },
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0" },
        ticks: {
          color: "#666",
          callback: (value) => `$${(value / 1000).toFixed(0)}k`,
        },
      },
    },
  },
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

// Theme toggle
if (localStorage.theme === "dark")
  document.documentElement.classList.add("dark");
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

// Sidebar toggle
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

// Search bar toggle (mobile)
const searchToggle = document.getElementById("searchToggle");
const searchInput = document.getElementById("searchInput");
searchToggle.addEventListener("click", () => {
  if (window.innerWidth < 640) {
    searchInput.classList.toggle("hidden");
    searchInput.focus();
  }
});

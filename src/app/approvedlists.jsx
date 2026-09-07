<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Approved Lists</title>

  <script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>

  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      background: #f5f7fa;
      color: #222;
    }

    /* ===== FIXED HEADER (NO FIXED HEIGHT) ===== */
    header {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      z-index: 300;
      background: #ffffff;
      padding: 18px 0 12px;
      border-bottom: 2px solid #e3e6ee;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }

    .header-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    header img {
      height: 64px;
      margin-bottom: 4px;
    }

    header h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 600;
      letter-spacing: 0.4px;
    }

    /* ===== FIXED MAIN TABS ===== */
    .main-tabs {
      position: fixed;
      left: 0;
      width: 100%;
      background: #fff;
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 10px 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      z-index: 250;
    }

    /* ===== FIXED GOV TABS ===== */
    .gov-tabs {
      position: fixed;
      left: 0;
      width: 100%;
      background: #fff;
      display: flex;
      justify-content: center;
      gap: 12px;
      padding: 10px 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      z-index: 240;
    }

    .main-tabs button,
    .gov-tabs button {
      padding: 10px 20px;
      font-size: 14px;
      border-radius: 6px;
      background: #f0f3fa;
      border: 1px solid #c8ccd8;
      cursor: pointer;
      transition: 0.2s;
    }

    .main-tabs button:hover,
    .gov-tabs button:hover {
      background: #dfe4ef;
    }

    .main-tabs button.active,
    .gov-tabs button.active {
      background: #2f6fde;
      color: #fff;
      border-color: #2f6fde;
    }

    /* ===== FIXED SEARCH BAR ===== */
    .search-bar {
      position: fixed;
      left: 0;
      width: 100%;
      background: #fff;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
      z-index: 230;
    }

    #search {
      width: 35%;
      padding: 8px;
      font-size: 14px;
      border-radius: 6px;
      border: 1px solid #c8ccd8;
    }

    #clearSearch {
      padding: 8px 14px;
      font-size: 14px;
      border-radius: 6px;
      background: #e9edf5;
      border: 1px solid #c8ccd8;
      cursor: pointer;
      transition: 0.2s;
    }

    #clearSearch:hover {
      background: #dfe4ef;
    }

    /* ===== CONTENT AREA (DYNAMIC PADDING APPLIED IN JS) ===== */
    .container {
      padding: 40px; /* JS will override padding-top dynamically */
    }

    /* ===== TABLE ===== */
    table {
      width: 100%;
      border-collapse: collapse;
      background: #ffffff;
      border-radius: 4px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      margin: 0 auto;
    }

    th, td {
      border: 1px solid #d0d4dc;
      padding: 6px 8px;
      font-size: 12px;
    }

    th {
      background: #f0f3fa;
      font-weight: 600;
      cursor: pointer;
      user-select: none;
    }

    th:hover {
      background: #e2e8f5;
    }

    tr:nth-child(even) td {
      background: #f9fbff;
    }

    tr:hover td {
      background: #eaf2ff;
    }

    /* ===== PDF SECTION ===== */
    .pdf-section {
      background: #ffffff;
      border-radius: 4px;
      padding: 12px 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .pdf-group {
      margin-bottom: 16px;
    }

    .pdf-group h3 {
      margin: 8px 0 6px;
      font-size: 14px;
      font-weight: 600;
      border-bottom: 1px solid #e0e4ec;
      padding-bottom: 4px;
    }

    .pdf-group ul {
      list-style: none;
      padding-left: 0;
      margin: 0;
    }

    .pdf-group li {
      margin: 4px 0;
      font-size: 13px;
    }

    .pdf-group a {
      color: #2f6fde;
      text-decoration: none;
    }

    .pdf-group a:hover {
      text-decoration: underline;
    }

    .hidden { display: none; }
  </style>
</head>

<body>
  <header>
    <div class="header-inner">
      <img src="Chargers_RC_Logo_2026_Signature.png" alt="Chargers RC Logo" />
      <h1>Approved Lists</h1>
    </div>
  </header>

  <div class="main-tabs">
    <button class="active" data-cat="Batteries">Batteries</button>
    <button data-cat="Motors">Motors</button>
    <button data-cat="ESCs">Blinky ESCs</button>
    <button data-cat="PDFs">PDFs</button>
  </div>

  <div class="gov-tabs">
    <button class="active" data-gov="IFMAR">IFMAR</button>
    <button data-gov="BRCA">BRCA</button>
    <button data-gov="ROAR">ROAR</button>
    <button data-gov="RCRA">RCRA</button>
  </div>

  <div class="search-bar">
    <input type="text" id="search" placeholder="Search (e.g. Coyote 4600)..." />
    <button id="clearSearch">Clear</button>
  </div>

  <div class="container">
    <table id="resultsTable">
      <thead></thead>
      <tbody></tbody>
    </table>

    <div id="pdfContainer" class="pdf-section hidden"></div>
  </div>
  <script>
/* ===== SAFE DATE CONVERSION ===== */
function excelSerialToDate(value) {
  if (typeof value !== "number") return value;
  if (value < 30000 || value > 60000) return value;

  const excelEpoch = new Date(1899, 11, 30);
  const date = new Date(excelEpoch.getTime() + value * 86400000);

  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

/* ===== FIXED ELEMENT STACKING ===== */
function positionFixedElements() {
  const header = document.querySelector("header");
  const mainTabsEl = document.querySelector(".main-tabs");
  const govTabsEl = document.querySelector(".gov-tabs");
  const searchBar = document.querySelector(".search-bar");
  const container = document.querySelector(".container");

  const headerH = header.offsetHeight;
  const mainTabsH = mainTabsEl.offsetHeight;
  const govTabsH = govTabsEl.offsetHeight;
  const searchBarH = searchBar.offsetHeight;

  mainTabsEl.style.top = headerH + "px";
  govTabsEl.style.top = (headerH + mainTabsH) + "px";
  searchBar.style.top = (headerH + mainTabsH + govTabsH) + "px";

  container.style.paddingTop =
    (headerH + mainTabsH + govTabsH + searchBarH + 20) + "px";
}

window.addEventListener("load", positionFixedElements);
window.addEventListener("resize", positionFixedElements);

/* ===== ELEMENT REFERENCES ===== */
const mainTabs = document.querySelectorAll(".main-tabs button");
const govTabs = document.querySelectorAll(".gov-tabs button");
const searchInput = document.getElementById("search");
const clearSearchBtn = document.getElementById("clearSearch");
const tableHead = document.querySelector("#resultsTable thead");
const tableBody = document.querySelector("#resultsTable tbody");
const pdfContainer = document.getElementById("pdfContainer");

let currentCategory = "Batteries";
let currentGov = "IFMAR";

let workbooks = { Batteries: null, Motors: null, ESCs: null };
let sheetDataCache = { Batteries: {}, Motors: {}, ESCs: {} };

let sortState = {};

const fileMap = {
  Batteries: "ChargersRC-Approved-Battery-Lists.xlsx",
  Motors: "ChargersRC-Approved-Motor-Lists.xlsx",
  ESCs: "ChargersRC-Approved-Blinky-Lists.xlsx"
};

/* ===== PDF MAP ===== */
const pdfMap = {
  BRCA: {
    "Battery Lists": [
      "2026 BRCA 2S Stick LiPo List 23-26 v1 p1111.pdf",
      "2026 BRCA Archive 2S Saddle LiPo List 09-26 v13 p1111.pdf",
      "2026 BRCA Archive 2S Stick LiPo List 17-22 v13 p1111.pdf"
    ],
    "ESC Lists": [
      "BRCA BLINKY LIST V6.50 - 01.03.26.pdf"
    ],
    "Motor Lists": [
      "EB Brushless Motors Archive. All Wind Classes 2025 v1 06.01.25 p1.pdf",
      "EB Brushless Motors Archive. No photos. Modified to 31.12.10.pdf",
      "EB Brushless Motors Modified 2026 v3 01.06.26 p2.pdf",
      "EB Brushless Motors Spec. 10.5T - 2026 v1 02.03.26.pdf",
      "EB Brushless Motors Spec. 13.5T - 2026 v3 01.06.26 p1.pdf",
      "EB Brushless Motors Spec. 17.5T - 2026 v3 01.06.26 p1.pdf",
      "EB Brushless Motors Spec. 21.5T - 2026 v3 01.06.26 p1.pdf"
    ]
  },

  IFMAR: {
    "Battery Lists": [
      "IFMAR-Battery-Approval-List-2026-V1.pdf"
    ],
    "Motor Lists": [
      "2026-IFMAR-13.5T-Spec.-Motor-Homologation-List-v1-Final.-01.02.26.pdf",
      "2026-IFMAR-17.5T-Spec.-Motor-Homologation-List-v1-Final.-01.02.26.pdf",
      "2026-IFMAR-Modified-Motor-Homologation-List-v1-Final.-01.02.26.pdf"
    ]
  },

  RCRA: {
    "Battery Lists": [
      "RCRA Approval Battery List.pdf"
    ]
  },

  ROAR: {
    "Battery Lists": [
      "roarracingcomapprovalsprint_lipobatteryphp.pdf"
    ],
    "ESC Lists": [
      "ROAR Racing.pdf"
    ],
    "Motor Lists": [
      "roarracingcomapprovalsprint_brushlessmotorsphp.pdf"
    ]
  }
};

/* ===== CLEAR SEARCH ===== */
clearSearchBtn.addEventListener("click", () => {
  searchInput.value = "";
  if (currentCategory !== "PDFs") renderCurrentView();
});

/* ===== MAIN CATEGORY TABS ===== */
mainTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    mainTabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentCategory = btn.dataset.cat;

    if (currentCategory === "PDFs") {
      document.getElementById("resultsTable").classList.add("hidden");
      pdfContainer.classList.remove("hidden");
      renderPdfLinks();
    } else {
      document.getElementById("resultsTable").classList.remove("hidden");
      pdfContainer.classList.add("hidden");
      ensureWorkbookLoaded(currentCategory);
    }
  });
});

/* ===== GOVERNING BODY TABS ===== */
govTabs.forEach(btn => {
  btn.addEventListener("click", () => {
    govTabs.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    currentGov = btn.dataset.gov;

    if (currentCategory === "PDFs") {
      renderPdfLinks();
    } else {
      renderCurrentView();
    }
  });
});

/* ===== LOAD EXCEL WORKBOOK ===== */
function ensureWorkbookLoaded(category) {
  if (workbooks[category]) {
    renderCurrentView();
    return;
  }

  const fileName = fileMap[category];

  fetch(fileName)
    .then(res => res.arrayBuffer())
    .then(buf => {
      const wb = XLSX.read(buf, { type: "array", raw: true });
      workbooks[category] = wb;
      sheetDataCache[category] = {};

      wb.SheetNames.forEach(sheetName => {
        const sheet = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

        let headerRowIndex = -1;
        for (let i = 0; i < rows.length; i++) {
          const nonEmpty = rows[i].filter(v => String(v).trim() !== "");
          if (nonEmpty.length > 1) {
            headerRowIndex = i;
            break;
          }
        }
        if (headerRowIndex === -1) return;

        const headers = rows[headerRowIndex];
        const dataRows = rows.slice(headerRowIndex + 1).filter(r =>
          r.some(v => String(v).trim() !== "")
        );

        let objects = dataRows.map(r => {
          const obj = {};
          headers.forEach((h, idx) => {
            const key = String(h).trim() || `Col${idx + 1}`;
            let cell = r[idx] ?? "";
            obj[key] = excelSerialToDate(cell);
          });
          return obj;
        });

        const columnsToRemove = [];
        headers.forEach((h, idx) => {
          const key = String(h).trim() || `Col${idx + 1}`;
          const allEmpty = objects.every(row => String(row[key]).trim() === "");
          if (allEmpty) columnsToRemove.push(key);
        });

        objects = objects.map(row => {
          columnsToRemove.forEach(col => delete row[col]);
          return row;
        });

        if (sheetName.includes("IFMAR")) sheetDataCache[category]["IFMAR"] = objects;
        if (sheetName.includes("BRCA")) sheetDataCache[category]["BRCA"] = objects;
        if (sheetName.includes("ROAR")) sheetDataCache[category]["ROAR"] = objects;
        if (sheetName.includes("RCRA")) sheetDataCache[category]["RCRA"] = objects;
      });

      renderCurrentView();
    });
}

/* ===== RENDER CURRENT VIEW ===== */
function renderCurrentView() {
  const sheets = sheetDataCache[currentCategory] || {};
  const rows = sheets[currentGov] || [];
  const term = searchInput.value.toLowerCase();

  let filtered = rows;
  if (term) {
    filtered = rows.filter(row => {
      const rowText = Object.values(row).join(" ").toLowerCase();
      return term.split(" ").every(t => rowText.includes(t));
    });
  }

  renderTable(filtered);
}

/* ===== RENDER TABLE ===== */
function renderTable(data) {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (!data || data.length === 0) return;

  const headerRow = document.createElement("tr");
  Object.keys(data[0]).forEach(col => {
    const th = document.createElement("th");
    th.textContent = col;

    th.addEventListener("click", () => {
      const asc = sortState[col] !== true;
      sortState[col] = asc;

      data.sort((a, b) => {
        const A = String(a[col]).toLowerCase();
        const B = String(b[col]).toLowerCase();
        return asc ? A.localeCompare(B) : B.localeCompare(A);
      });

      renderTable(data);
    });

    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  data.forEach(row => {
    const tr = document.createElement("tr");
    Object.values(row).forEach(val => {
      const td = document.createElement("td");
      td.textContent = val;
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

/* ===== RENDER PDF LINKS ===== */
function renderPdfLinks() {
  pdfContainer.innerHTML = "";

  const govData = pdfMap[currentGov];
  if (!govData) {
    pdfContainer.textContent = "No PDF links available for " + currentGov + ".";
    return;
  }

  // PDFs tab → show ALL PDFs for this gov-body, grouped by folder
  if (currentCategory === "PDFs") {
    Object.keys(govData).forEach(folderName => {
      const files = govData[folderName];
      if (!files || files.length === 0) return;

      const group = document.createElement("div");
      group.className = "pdf-group";

      const header = document.createElement("h3");
      header.textContent = folderName;
      group.appendChild(header);

      const list = document.createElement("ul");

      files.forEach(file => {
        const li = document.createElement("li");
        const a = document.createElement("a");

        a.href = file;              // <— FIXED
        a.textContent = file;
        a.target = "_blank";

        li.appendChild(a);
        list.appendChild(li);
      });

      group.appendChild(list);
      pdfContainer.appendChild(group);
    });

    return;
  }

  // Batteries / ESCs / Motors tabs → show only that category’s PDFs
  const folderName = {
    Batteries: "Battery Lists",
    ESCs: "ESC Lists",
    Motors: "Motor Lists"
  }[currentCategory];

  const files = folderName ? govData[folderName] : null;

  if (!files || files.length === 0) {
    pdfContainer.textContent = `No PDF files for ${currentGov} → ${folderName || currentCategory}.`;
    return;
  }

  const group = document.createElement("div");
  group.className = "pdf-group";

  const header = document.createElement("h3");
  header.textContent = folderName;
  group.appendChild(header);

  const list = document.createElement("ul");

  files.forEach(file => {
    const li = document.createElement("li");
    const a = document.createElement("a");

    a.href = file;                 // <— FIXED
    a.textContent = file;
    a.target = "_blank";

    li.appendChild(a);
    list.appendChild(li);
  });

  group.appendChild(list);
  pdfContainer.appendChild(group);
}

/* ===== SEARCH INPUT ===== */
searchInput.addEventListener("input", () => {
  if (currentCategory !== "PDFs") renderCurrentView();
});

/* ===== INITIAL LOAD ===== */
ensureWorkbookLoaded("Batteries");
  </script>
</body>
</html>

/**
 * detail.js — 详情页逻辑
 * 按 .stylereference 结构：breadcrumb、paper-title、authors、abstract-block、metatable、submission history；侧栏 PDF 等保留空链接外观
 */

(function () {
  const DATA_URL = "data/papers.json";
  const CONTAINER_ID = "paper-detail";
  const SIDEBAR_PDF_ID = "sidebar-download-pdf";

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id") || "";
  }

  function escapeHtml(s) {
    if (s == null) return "";
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (s == null) return "";
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function formatDate(s) {
    if (!s) return "";
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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
    return (
      days[d.getDay()] +
      ", " +
      d.getDate() +
      " " +
      months[d.getMonth()] +
      " " +
      d.getFullYear() +
      " 00:00:00 UTC"
    );
  }

  function renderNotFound() {
    return (
      '<div class="paper-not-found">' +
      "<h2>Paper not found</h2>" +
      "<p>未找到该论文，或 ID 无效。</p>" +
      '<a href="index.html">返回首页</a>' +
      "</div>"
    );
  }

  function renderDetail(paper) {
    const authors = Array.isArray(paper.authors) ? paper.authors : [];
    const authorsHtml = authors
      .map(function (a) {
        return '<a href="#">' + escapeHtml(a) + "</a>";
      })
      .join(", ");
    const keywords = Array.isArray(paper.keywords) ? paper.keywords : [];
    const subjectsStr = keywords
      .map(function (k) {
        return escapeHtml(k);
      })
      .join("; ");
    const pdfUrl = paper.pdf_url || "assets/pdf/sample.pdf";

    let html = "";
    html += '<div class="header-breadcrumbs">';
    html += '<a href="index.html">Home</a> &gt; ' + escapeHtml(paper.id);
    html += "</div>";
    html += '<h1 class="paper-title">';
    html += escapeHtml(paper.title);
    html += "</h1>";
    html += '<div class="detail-authors">';
    html += authorsHtml;
    html += "</div>";
    html += '<div class="abstract-block">';
    html += '<span class="abstract-prefix">Abstract:</span>';
    html +=
      '<p class="abstract-text">' + escapeHtml(paper.abstract || "") + "</p>";
    html += "</div>";
    html += '<table class="metatable">';
    html += '<tr><td class="table-label">Comments:</td><td>—</td></tr>';
    if (subjectsStr) {
      html +=
        '<tr><td class="table-label">Subjects:</td><td>' +
        subjectsStr +
        "</td></tr>";
    }
    html +=
      '<tr><td class="table-label">Cite as:</td><td><a href="#">' +
      escapeHtml(paper.id) +
      "</a></td></tr>";
    html +=
      '<tr><td class="table-label">&nbsp;</td><td>(or <a href="#">' +
      escapeHtml(paper.id) +
      "v1</a> for this version)</td></tr>";
    if (paper.doi) {
      html +=
        '<tr><td class="table-label">&nbsp;</td><td><a href="' +
        escapeAttr(paper.doi) +
        '" target="_blank" rel="noopener">' +
        escapeHtml(paper.doi) +
        "</a></td></tr>";
    }
    html += "</table>";
    html += '<div class="submission-history-block">';
    html += "<h3>Submission history</h3>";
    html +=
      "<p>From: " +
      escapeHtml(authors[0] || "—") +
      ' [<a href="#">View email</a>]<br>';
    html +=
      "<strong>[v1]</strong> " +
      escapeHtml(formatDate(paper.date)) +
      " (150 KB)</p>";
    html += "</div>";
    if (paper.content) {
      html += '<div class="abstract-block" style="margin-top: 20px">';
      html += '<span class="abstract-prefix">Content:</span>';
      html += '<p class="abstract-text">' + escapeHtml(paper.content) + "</p>";
      html += "</div>";
    }
    return html;
  }

  function run() {
    const container = document.getElementById(CONTAINER_ID);
    const sidebarPdf = document.getElementById(SIDEBAR_PDF_ID);
    if (!container) return;

    const id = getIdFromUrl().trim();
    if (!id) {
      container.innerHTML = renderNotFound();
      return;
    }

    container.innerHTML = '<p class="loading">正在加载论文信息…</p>';

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then(function (data) {
        const list = Array.isArray(data) ? data : [];
        const paper = list.find(function (p) {
          return p.id === id;
        });
        if (paper) {
          container.innerHTML = renderDetail(paper);
          if (sidebarPdf) {
            const pdfUrl = paper.pdf_url || "assets/pdf/sample.pdf";
            sidebarPdf.href = pdfUrl;
            sidebarPdf.target = "_blank";
            sidebarPdf.rel = "noopener";
            sidebarPdf.download = "";
          }
        } else {
          container.innerHTML = renderNotFound();
        }
      })
      .catch(function () {
        container.innerHTML = renderNotFound();
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();

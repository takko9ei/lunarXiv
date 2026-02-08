/**
 * detail.js — 详情页逻辑
 * 1. 从 window.location.search 解析 id (?id=xxx)
 * 2. fetch data/papers.json，查找对应 id
 * 3. 渲染详情 DOM；若未找到则显示 "Paper not found" + 返回首页链接
 */

(function () {
  const DATA_URL = 'data/papers.json';
  const CONTAINER_ID = 'paper-detail';

  function getIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id') || '';
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
  }

  function escapeAttr(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function renderNotFound() {
    return (
      '<div class="paper-not-found">' +
        '<h2>Paper not found</h2>' +
        '<p>未找到该论文，或 ID 无效。</p>' +
        '<a href="index.html">返回首页</a>' +
      '</div>'
    );
  }

  function renderDetail(paper) {
    const authorsStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : '';
    const keywords = Array.isArray(paper.keywords) ? paper.keywords : [];
    const keywordsHtml = keywords.length
      ? keywords.map(function (k) { return '<span>' + escapeHtml(k) + '</span>'; }).join('')
      : '';

    let html = '';
    html += '<h1 class="detail-title">' + escapeHtml(paper.title) + '</h1>';
    html += '<div class="detail-meta">';
    html += '<span class="authors">' + escapeHtml(authorsStr) + '</span>';
    html += ' · <span class="date">' + escapeHtml(paper.date || '') + '</span>';
    if (paper.doi) {
      html += ' · <a href="' + escapeAttr(paper.doi) + '" target="_blank" rel="noopener">DOI</a>';
    }
    html += '</div>';

    html += '<div class="detail-section"><h2>Abstract</h2><p>' + escapeHtml(paper.abstract || '') + '</p></div>';
    if (keywordsHtml) {
      html += '<div class="detail-section"><h2>Keywords</h2><div class="keywords">' + keywordsHtml + '</div></div>';
    }
    html += '<div class="detail-section"><h2>Content</h2><p>' + escapeHtml(paper.content || '') + '</p></div>';

    const pdfUrl = paper.pdf_url || 'assets/pdf/sample.pdf';
    html += '<div class="detail-actions">';
    html += '<a href="' + escapeAttr(pdfUrl) + '" class="btn" target="_blank" rel="noopener" download>Download PDF</a>';
    html += ' <a href="index.html">← 返回列表</a>';
    html += '</div>';

    return html;
  }

  function run() {
    const container = document.getElementById(CONTAINER_ID);
    if (!container) return;

    const id = getIdFromUrl().trim();
    if (!id) {
      container.innerHTML = renderNotFound();
      return;
    }

    container.innerHTML = '<p class="loading">正在加载论文信息…</p>';

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load data');
        return res.json();
      })
      .then(function (data) {
        const list = Array.isArray(data) ? data : [];
        const paper = list.find(function (p) { return p.id === id; });
        if (paper) {
          container.innerHTML = renderDetail(paper);
        } else {
          container.innerHTML = renderNotFound();
        }
      })
      .catch(function () {
        container.innerHTML = renderNotFound();
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

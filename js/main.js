/**
 * main.js — 主页逻辑
 * 1. fetch data/papers.json
 * 2. 分页计算（每页 10 条）
 * 3. URL 参数 ?page=2 控制当前页
 * 4. 渲染论文列表 Block + 底部分页（Previous / Page x of y / Next）
 */

(function () {
  const PAGE_SIZE = 10;
  const LIST_ID = 'paper-list';
  const PAGINATION_ID = 'pagination';
  const DATA_URL = 'data/papers.json';
  const ABSTRACT_MAX_LEN = 150;

  let allPapers = [];

  function getPageFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const p = parseInt(params.get('page'), 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }

  function setPageInUrl(page) {
    const url = new URL(window.location.href);
    url.searchParams.set('page', String(page));
    window.history.replaceState({}, '', url.pathname + '?' + url.searchParams.toString());
  }

  function truncate(str, maxLen) {
    if (!str || str.length <= maxLen) return str || '';
    return str.slice(0, maxLen).trim() + '…';
  }

  function renderPaperCard(paper) {
    const abstractText = truncate(paper.abstract, ABSTRACT_MAX_LEN);
    const authorsStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : '';
    const detailUrl = 'detail.html?id=' + encodeURIComponent(paper.id);
    const pdfUrl = paper.pdf_url || 'assets/pdf/sample.pdf';

    return (
      '<div class="paper-card">' +
        '<h2 class="paper-title"><a href="' + detailUrl + '">' + escapeHtml(paper.title) + '</a></h2>' +
        '<div class="paper-meta">' +
          '<span class="authors">' + escapeHtml(authorsStr) + '</span>' +
          '<span class="date">' + escapeHtml(paper.date || '') + '</span>' +
        '</div>' +
        '<p class="paper-abstract">' + escapeHtml(abstractText) + '</p>' +
        '<div class="paper-actions">' +
          (paper.doi ? '<a href="' + escapeAttr(paper.doi) + '" target="_blank" rel="noopener">DOI</a>' : '') +
          '<a href="' + escapeAttr(pdfUrl) + '" class="btn" target="_blank" rel="noopener" download>PDF</a>' +
        '</div>' +
      '</div>'
    );
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

  function renderList(papers, currentPage, totalPages) {
    const listEl = document.getElementById(LIST_ID);
    if (!listEl) return;

    if (!papers.length) {
      listEl.innerHTML = '<p class="loading">暂无论文。</p>';
      return;
    }

    const html = papers.map(function (p) { return renderPaperCard(p); }).join('');
    listEl.innerHTML = html;
  }

  function renderPagination(currentPage, totalPages) {
    const wrap = document.getElementById(PAGINATION_ID);
    if (!wrap) return;

    if (totalPages <= 0) {
      wrap.innerHTML = '';
      return;
    }

    const prevPage = currentPage - 1;
    const nextPage = currentPage + 1;
    const base = document.querySelector('base') ? document.querySelector('base').href : (window.location.pathname.replace(/\/[^/]*$/, '') || '') + '/';
    const prevHref = prevPage >= 1 ? 'index.html?page=' + prevPage : null;
    const nextHref = nextPage <= totalPages ? 'index.html?page=' + nextPage : null;

    let html = '';
    if (prevHref) {
      html += '<a href="' + prevHref + '">Previous</a>';
    } else {
      html += '<span class="disabled">Previous</span>';
    }
    html += '<span class="page-info">Page ' + currentPage + ' of ' + totalPages + '</span>';
    if (nextHref) {
      html += '<a href="' + nextHref + '">Next</a>';
    } else {
      html += '<span class="disabled">Next</span>';
    }
    wrap.innerHTML = html;
  }

  function run() {
    const listEl = document.getElementById(LIST_ID);
    if (!listEl) return;

    listEl.innerHTML = '<p class="loading">正在加载论文列表…</p>';

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load papers');
        return res.json();
      })
      .then(function (data) {
        allPapers = Array.isArray(data) ? data : [];
        const totalPages = Math.max(1, Math.ceil(allPapers.length / PAGE_SIZE));
        let page = getPageFromUrl();
        if (page > totalPages) page = totalPages;
        setPageInUrl(page);

        const start = (page - 1) * PAGE_SIZE;
        const slice = allPapers.slice(start, start + PAGE_SIZE);
        renderList(slice, page, totalPages);
        renderPagination(page, totalPages);
      })
      .catch(function () {
        listEl.innerHTML = '<p class="loading">加载失败，请稍后重试。</p>';
        document.getElementById(PAGINATION_ID).innerHTML = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

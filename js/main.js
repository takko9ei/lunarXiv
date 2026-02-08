/**
 * main.js — 主页逻辑
 * 按 .stylereference 结构：列表项（identifier、format-links、tag、title、authors、abstract、submission）、分页
 */

(function () {
  const PAGE_SIZE = 10;
  const LIST_ID = 'paper-list';
  const PAGINATION_ID = 'pagination';
  const PAGINATION_BOTTOM_ID = 'pagination-bottom';
  const PAGE_TITLE_ID = 'page-title';
  const DATA_URL = 'data/papers.json';
  const ABSTRACT_MAX_LEN = 450;

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

  function formatDate(s) {
    if (!s) return '';
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];
    return d.getDate() + ' ' + months[d.getMonth()] + ', ' + d.getFullYear();
  }

  function renderResultItem(paper, startIndex) {
    const detailUrl = 'detail.html?id=' + encodeURIComponent(paper.id);
    const pdfUrl = paper.pdf_url || 'assets/pdf/sample.pdf';
    const abstractText = truncate(paper.abstract, ABSTRACT_MAX_LEN);
    const authors = Array.isArray(paper.authors) ? paper.authors : [];
    const keywords = Array.isArray(paper.keywords) ? paper.keywords : [];
    const primaryTag = keywords[0];
    const secondaryTags = keywords.slice(1, 3);

    let html = '<li class="result-item">';
    html += '<div class="list-identifier">';
    html += '<a href="' + detailUrl + '" class="arxiv-id-link">' + escapeHtml(paper.id) + '</a>';
    html += ' <span class="format-links">[<a href="' + escapeAttr(pdfUrl) + '" target="_blank" rel="noopener">pdf</a>, <a href="#">ps</a>, <a href="#">other</a>]</span>';
    if (keywords.length) {
      html += ' <div class="tag-container">';
      if (primaryTag) html += '<span class="tag">' + escapeHtml(primaryTag) + '</span>';
      secondaryTags.forEach(function (k) {
        html += '<span class="tag secondary">' + escapeHtml(k) + '</span>';
      });
      html += '</div>';
    }
    html += '</div>';
    html += '<div class="list-title">' + escapeHtml(paper.title) + '</div>';
    html += '<div class="list-authors"><span class="meta-label">Authors:</span> ';
    html += authors.map(function (a) {
      return '<a href="#" class="author-name">' + escapeHtml(a) + '</a>';
    }).join(', ');
    html += '</div>';
    html += '<p class="abstract">';
    html += '<span class="abstract-prefix">Abstract:</span> ' + escapeHtml(abstractText);
    html += ' <a href="' + detailUrl + '">▽ More</a></p>';
    html += '<div class="submission-history">';
    html += '<span class="meta-label">Submitted</span> ' + escapeHtml(formatDate(paper.date)) + '; ';
    html += '<span class="meta-label">originally announced</span> ' + (paper.date ? paper.date.slice(0, 7).replace(/-/, ' ') : '') + '.';
    html += '</div>';
    html += '</li>';
    return html;
  }

  function renderPagination(currentPage, totalPages) {
    const prevPage = currentPage - 1;
    const nextPage = currentPage + 1;
    let listHtml = '';
    const maxNumLinks = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxNumLinks - 1);
    if (endPage - startPage < maxNumLinks - 1) startPage = Math.max(1, endPage - maxNumLinks + 1);
    for (let i = startPage; i <= endPage; i++) {
      const href = i === currentPage ? '#' : 'index.html?page=' + i;
      const cls = 'page-link' + (i === currentPage ? ' active' : '');
      listHtml += '<li><a href="' + (i === currentPage ? '#' : ('index.html?page=' + i)) + '" class="' + cls + '">' + i + '</a></li>';
    }
    if (endPage < totalPages) listHtml += '<li>...</li>';
    const prevHref = prevPage >= 1 ? 'index.html?page=' + prevPage : '#';
    const nextHref = nextPage <= totalPages ? 'index.html?page=' + nextPage : '#';
    const prevCls = prevPage >= 1 ? 'page-link' : 'page-link disabled';
    const nextCls = nextPage <= totalPages ? 'page-link' : 'page-link disabled';
    const html =
      '<ul class="pagination-list">' + listHtml + '</ul>' +
      (prevPage >= 1 ? '<a href="index.html?page=' + prevPage + '" class="page-link">Previous</a>' : '<span class="' + prevCls + '">Previous</span>') +
      ' <a href="' + nextHref + '" class="' + nextCls + '">Next</a>';
    return html;
  }

  function run() {
    const listEl = document.getElementById(LIST_ID);
    const titleEl = document.getElementById(PAGE_TITLE_ID);
    if (!listEl) return;

    listEl.innerHTML = '<li class="loading">正在加载论文列表…</li>';

    fetch(DATA_URL)
      .then(function (res) {
        if (!res.ok) throw new Error('Failed to load papers');
        return res.json();
      })
      .then(function (data) {
        allPapers = Array.isArray(data) ? data : [];
        const total = allPapers.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        let page = getPageFromUrl();
        if (page > totalPages) page = totalPages;
        setPageInUrl(page);

        const start = (page - 1) * PAGE_SIZE;
        const slice = allPapers.slice(start, start + PAGE_SIZE);

        const from = total === 0 ? 0 : start + 1;
        const to = Math.min(start + PAGE_SIZE, total);
        if (titleEl) titleEl.innerHTML = 'Showing ' + from + '–' + to + ' of <span id="total-count">' + total + '</span> results';

        if (!slice.length) {
          listEl.innerHTML = '<li class="loading">暂无论文。</li>';
        } else {
          listEl.setAttribute('start', String(start + 1));
          listEl.innerHTML = slice.map(function (p, i) { return renderResultItem(p, start + i); }).join('');
        }

        const paginationHtml = renderPagination(page, totalPages);
        const paginationEl = document.getElementById(PAGINATION_ID);
        const paginationBottomEl = document.getElementById(PAGINATION_BOTTOM_ID);
        if (paginationEl) paginationEl.innerHTML = paginationHtml;
        if (paginationBottomEl) paginationBottomEl.innerHTML = paginationHtml;
      })
      .catch(function () {
        listEl.innerHTML = '<li class="loading">加载失败，请稍后重试。</li>';
        var paginationEl = document.getElementById(PAGINATION_ID);
        var paginationBottomEl = document.getElementById(PAGINATION_BOTTOM_ID);
        if (paginationEl) paginationEl.innerHTML = '';
        if (paginationBottomEl) paginationBottomEl.innerHTML = '';
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();

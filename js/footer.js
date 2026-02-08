/**
 * footer.js — 页脚弹窗
 * 为带 data-modal 的链接绑定点击事件，显示对应内容的弹窗；About / Copyright / Contact / Post
 */

(function () {
  const MODAL_ID = "footer-modal";
  const BODY_CLASS = "footer-modal-body";

  const contents = {
    about:
      "<p>这是一件《超时空辉夜姬》的粉丝作品，由 ameato9ei 编写。</p>" +
      "<p>请注意，本站发表的所有文章、研究数据及结论均为创作或想象产物，并非真实的科学研究报告。本站及站内内容与现实世界中任何真实的学术机构、政府团体、公司或科研组织均无任何关联。请读者务必注意区分虚构内容与现实科学。</p>" +
      "<p>特别注意，如果你看到这，请举起双臂高呼三声彩辉99。</p>" +
      "<p>GitHub 仓库地址：<a href=\"https://github.com/takko9ei/lunarXiv\" target=\"_blank\" rel=\"noopener\">https://github.com/takko9ei/lunarXiv</a></p>",
    copyright: "<p>2026 · 「超かぐや姫！」fanwork by ameato9ei</p>",
    contact:
      "<p>Contact me:</p>" +
      "<p>QQ：2575639107<br>小红书：hifianatomia0107<br>Twitter：ameato9ei</p>",
    post:
      "<p>如果你想投稿…</p>" +
      "<p>请把（伪）论文写好、排版后，在邮件里发给我，我审核后发布！</p>" +
      "<p>邮箱：<a href=\"mailto:lzh310@outlook.com\">lzh310@outlook.com</a></p>",
  };

  function openModal(id) {
    const content = contents[id];
    if (!content) return;
    const modal = document.getElementById(MODAL_ID);
    const body = modal && modal.querySelector("." + BODY_CLASS);
    if (!modal || !body) return;
    body.innerHTML = content;
    modal.setAttribute("aria-hidden", "false");
    modal.classList.add("is-open");
  }

  function closeModal() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    modal.classList.remove("is-open");
  }

  function init() {
    const modal = document.getElementById(MODAL_ID);
    if (!modal) return;

    document.querySelectorAll("a[data-modal]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        openModal(a.getAttribute("data-modal"));
      });
    });

    modal.querySelector(".footer-modal-close").addEventListener("click", closeModal);
    modal.querySelector(".footer-modal-overlay").addEventListener("click", closeModal);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

(() => {
  "use strict";

  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  onReady(() => {
    if (document.documentElement.dataset.gymMobileUx === "ready") return;
    document.documentElement.dataset.gymMobileUx = "ready";
    document.documentElement.classList.add("gym-mobile-ux");

    const body = document.body;
    const page = body.dataset.page || "";
    const header = document.getElementById("siteHeader");
    const nav = document.getElementById("primaryNav");
    const toggle = document.getElementById("navToggle");

    // ---------------------------------------------------------------
    // Mobile navigation + backdrop
    // ---------------------------------------------------------------
    let backdrop = document.querySelector(".mobile-menu-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("button");
      backdrop.type = "button";
      backdrop.className = "mobile-menu-backdrop";
      backdrop.setAttribute("aria-label", "Menü schließen");
      document.body.appendChild(backdrop);
    }

    const closeMenu = () => {
      if (!nav || !toggle) return;
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      backdrop.classList.remove("is-visible");
      body.classList.remove("mobile-nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Menü öffnen");
    };

    const openMenu = () => {
      if (!nav || !toggle) return;
      nav.classList.add("is-open");
      toggle.classList.add("is-open");
      backdrop.classList.add("is-visible");
      body.classList.add("mobile-nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Menü schließen");
      header?.classList.remove("is-mobile-hidden");
    };

    if (toggle && nav) {
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        nav.classList.contains("is-open") ? closeMenu() : openMenu();
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      backdrop.addEventListener("click", closeMenu);

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 980) closeMenu();
      }, { passive: true });
    }

    // ---------------------------------------------------------------
    // Header shrinks/hides while scrolling down on phones
    // ---------------------------------------------------------------
    let lastY = window.scrollY;
    let ticking = false;

    const updateHeader = () => {
      const y = window.scrollY;
      if (header) {
        header.classList.toggle("is-scrolled", y > 18);

        if (window.innerWidth <= 760 && !nav?.classList.contains("is-open")) {
          const delta = y - lastY;
          if (y > 150 && delta > 8) {
            header.classList.add("is-mobile-hidden");
          } else if (delta < -6 || y < 80) {
            header.classList.remove("is-mobile-hidden");
          }
        } else {
          header.classList.remove("is-mobile-hidden");
        }
      }
      lastY = y;
      ticking = false;
    };

    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(updateHeader);
        ticking = true;
      }
    }, { passive: true });
    updateHeader();

    // ---------------------------------------------------------------
    // Mobile bottom navigation — omitted on the focused coaching form
    // ---------------------------------------------------------------
    if (page !== "coaching") {
      const tabbar = document.createElement("nav");
      tabbar.className = "mobile-tabbar";
      tabbar.setAttribute("aria-label", "Mobile Schnellnavigation");

      const current = location.pathname.split("/").pop() || "index.html";
      const active = {
        home: current === "" || current === "index.html",
        exercises: current === "exercises.html",
        blog: current === "blog.html" || /^blog[1-7]\.html$/.test(current),
      };

      tabbar.innerHTML = `
        <a class="mobile-tab ${active.home ? "is-active" : ""}" href="${page === "home" ? "#home" : "index.html#home"}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/></svg>
          <span>Start</span>
        </a>
        <a class="mobile-tab ${active.exercises ? "is-active" : ""}" href="exercises.html">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9h3v6H4V9Zm13 0h3v6h-3V9ZM7 11h10v2H7v-2ZM2 10h2v4H2v-4Zm18 0h2v4h-2v-4Z"/></svg>
          <span>Übungen</span>
        </a>
        <a class="mobile-tab ${active.blog ? "is-active" : ""}" href="blog.html">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 5h10V6H7v2Zm0 4h10v-2H7v2Zm0 4h7v-2H7v2Z"/></svg>
          <span>Blog</span>
        </a>
        <button class="mobile-tab mobile-tab--more" type="button" aria-label="Mehr Navigation öffnen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
          <span>Mehr</span>
        </button>
      `;

      document.body.appendChild(tabbar);

      tabbar.querySelector(".mobile-tab--more")?.addEventListener("click", () => {
        header?.classList.remove("is-mobile-hidden");
        window.scrollTo({ top: Math.max(0, window.scrollY - 1), behavior: "auto" });
        setTimeout(openMenu, 30);
      });
    }

    // ---------------------------------------------------------------
    // Article: reading progress + native share button
    // ---------------------------------------------------------------
    const article = document.querySelector(".article-container--premium");
    if (article) {
      const progress = document.createElement("div");
      progress.className = "article-reading-progress";
      progress.setAttribute("aria-hidden", "true");
      progress.innerHTML = '<span class="article-reading-progress__bar"></span>';
      document.body.appendChild(progress);
      const bar = progress.firstElementChild;

      const updateReadingProgress = () => {
        const rect = article.getBoundingClientRect();
        const articleTop = window.scrollY + rect.top;
        const articleHeight = article.offsetHeight;
        const start = articleTop - 90;
        const end = articleTop + articleHeight - window.innerHeight;
        const ratio = end <= start ? 1 : Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));
        bar.style.transform = `scaleX(${ratio})`;
      };

      window.addEventListener("scroll", updateReadingProgress, { passive: true });
      window.addEventListener("resize", updateReadingProgress, { passive: true });
      updateReadingProgress();

      const bottomNav = document.querySelector(".article-bottom-nav");
      if (bottomNav && !bottomNav.querySelector(".article-share-button")) {
        const share = document.createElement("button");
        share.type = "button";
        share.className = "article-share-button";
        share.innerHTML = '<span aria-hidden="true">↗</span> Teilen';

        share.addEventListener("click", async () => {
          const payload = { title: document.title, url: location.href };
          try {
            if (navigator.share) {
              await navigator.share(payload);
              return;
            }
            if (navigator.clipboard?.writeText) {
              await navigator.clipboard.writeText(location.href);
              share.innerHTML = '<span aria-hidden="true">✓</span> Link kopiert';
              setTimeout(() => {
                share.innerHTML = '<span aria-hidden="true">↗</span> Teilen';
              }, 1800);
              return;
            }
          } catch (_) {}

          const temp = document.createElement("input");
          temp.value = location.href;
          document.body.appendChild(temp);
          temp.select();
          try { document.execCommand("copy"); } catch (_) {}
          temp.remove();
          share.innerHTML = '<span aria-hidden="true">✓</span> Link kopiert';
          setTimeout(() => {
            share.innerHTML = '<span aria-hidden="true">↗</span> Teilen';
          }, 1800);
        });

        const topLink = bottomNav.querySelector(".article-top-link");
        topLink ? topLink.before(share) : bottomNav.appendChild(share);
      }
    }

    // ---------------------------------------------------------------
    // Exercises: keep search visible, collapse advanced filters on phones
    // ---------------------------------------------------------------
    const exerciseControls = document.querySelector(".exlib-controls--premium");
    if (exerciseControls) {
      const filterGrid = exerciseControls.querySelector(".exlib-filter-grid");
      const searchWrap = exerciseControls.querySelector(".exlib-search-wrap--premium");

      if (filterGrid && searchWrap && !exerciseControls.querySelector(".mobile-filter-toggle")) {
        const filterButton = document.createElement("button");
        filterButton.type = "button";
        filterButton.className = "mobile-filter-toggle";
        filterButton.setAttribute("aria-expanded", "false");
        filterButton.innerHTML = `
          <span class="mobile-filter-toggle__icon" aria-hidden="true">☷</span>
          <span class="mobile-filter-toggle__text">Filter anzeigen</span>
          <span class="mobile-filter-toggle__chevron" aria-hidden="true">⌄</span>
        `;
        searchWrap.insertAdjacentElement("afterend", filterButton);

        const syncFilterState = () => {
          const mobile = window.matchMedia("(max-width: 700px)").matches;
          if (!mobile) {
            exerciseControls.classList.remove("mobile-filter-collapsed");
            filterButton.setAttribute("aria-expanded", "true");
            filterButton.querySelector(".mobile-filter-toggle__text").textContent = "Filter";
            return;
          }

          if (!exerciseControls.dataset.mobileFilterInit) {
            exerciseControls.dataset.mobileFilterInit = "1";
            exerciseControls.classList.add("mobile-filter-collapsed");
          }

          const collapsed = exerciseControls.classList.contains("mobile-filter-collapsed");
          filterButton.setAttribute("aria-expanded", String(!collapsed));
          filterButton.querySelector(".mobile-filter-toggle__text").textContent =
            collapsed ? "Filter anzeigen" : "Filter ausblenden";
        };

        filterButton.addEventListener("click", () => {
          exerciseControls.classList.toggle("mobile-filter-collapsed");
          syncFilterState();
        });

        window.addEventListener("resize", syncFilterState, { passive: true });
        syncFilterState();
      }
    }

    // ---------------------------------------------------------------
    // Whole-card tap behavior for blog cards (without hijacking buttons)
    // ---------------------------------------------------------------
    document.querySelectorAll(".blog-card").forEach((card) => {
      const link = card.querySelector(".read-more");
      if (!link) return;

      card.classList.add("is-tappable");
      card.setAttribute("tabindex", "0");

      const open = () => { location.href = link.href; };

      card.addEventListener("click", (event) => {
        if (event.target.closest("a, button, input, select, textarea")) return;
        open();
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          if (event.target.closest("a, button, input, select, textarea")) return;
          event.preventDefault();
          open();
        }
      });
    });

    // ---------------------------------------------------------------
    // Lightweight reveal for pages that do not already use animations
    // ---------------------------------------------------------------
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches && "IntersectionObserver" in window) {
      const revealTargets = document.querySelectorAll(
        ".article-figure, .guide-card, .blog-card, .exlib-muscle, .bmr-onepiece"
      );

      revealTargets.forEach((el) => el.classList.add("mobile-reveal"));

      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.08, rootMargin: "0px 0px -24px 0px" });

      revealTargets.forEach((el) => observer.observe(el));
    }
  });
})();
/**
 * cangxi-promo — 应用逻辑 (IIFE 封装，不污染全局)
 */
(function(SITE) {
  'use strict';

  var currentPage = 0;

  /* ===== DOM REFS ===== */
  var $ = function(id) { return document.getElementById(id); };
  var loader   = $('loader');
  var loaderBar = $('loaderBar');
  var loaderPct = $('loaderPct');
  var mainNav  = $('mainNav');
  var navBack  = $('navBack');
  var page0    = $('page-0');
  var lightbox = $('lightbox');
  var lbImg    = $('lightboxImg');
  var lbCap    = $('lightboxCap');

  /* ===== LOADER ===== */
  function initLoader() {
    var imgs = document.querySelectorAll('img[src]');
    var total = imgs.length;
    var loaded = 0;

    function update() {
      var p = Math.round(loaded / total * 100);
      loaderBar.style.width = p + '%';
      loaderPct.textContent = p + '%';
      if (loaded >= total) {
        setTimeout(function() {
          loader.classList.add('done');
          document.body.style.overflow = '';
        }, 300);
      }
    }

    if (total === 0) { loader.classList.add('done'); document.body.style.overflow = ''; return; }

    imgs.forEach(function(img) {
      if (img.complete) { loaded++; update(); }
      else {
        img.addEventListener('load', function() { loaded++; update(); });
        img.addEventListener('error', function() { loaded++; update(); });
      }
    });

    // Safety: force dismiss after 8s
    setTimeout(function() {
      if (!loader.classList.contains('done')) {
        loaderBar.style.width = '100%';
        loaderPct.textContent = '100%';
        setTimeout(function() { loader.classList.add('done'); document.body.style.overflow = ''; }, 300);
      }
    }, 8000);
  }

  /* ===== RENDER ===== */

  // --- Home Page (page-0) ---
  function renderHome() {
    var page = $('page-0');
    if (!page) return;

    // Sections
    var secsHTML = SITE.sections.map(function(s) {
      var bodyHTML = s.body.map(function(p) { return '<p>' + p + '</p>'; }).join('');
      var quoteHTML = s.quote ? '<div class="sec-card-quote">' + s.quote + '</div>' : '';
      return '<div class="sec-card reveal">'
        + '<div class="sec-card-head">'
        + '<span class="sec-card-num">' + s.num + '</span>'
        + '<span class="sec-card-title">' + s.title + '</span>'
        + '</div>'
        + '<div class="sec-card-body">' + bodyHTML + quoteHTML + '</div>'
        + '</div>';
    }).join('');

    var charsHTML = SITE.people.map(function(p) {
      var avatar = '';
      if (p.avatarType === 'image') {
        avatar = '<img src="' + p.avatarSrc + '" class="char-card-avatar" alt="' + p.avatarAlt + '" loading="lazy">';
      } else {
        avatar = '<div class="char-card-avatar placeholder">' + p.avatarChar + '</div>';
      }
      return '<div class="char-card reveal" data-go="' + p.id + '">'
        + avatar
        + '<div class="char-card-info">'
        + '<div class="char-card-name">' + p.name + '</div>'
        + '<div class="char-card-tag">' + p.tag + '</div>'
        + '<div class="char-card-desc">' + p.desc + '</div>'
        + '</div>'
        + '<span class="char-card-arrow">&#x203A;</span>'
        + '</div>';
    }).join('');

    page.innerHTML =
      '<div class="hero">'
      + '<div class="hero-bg"><img src="' + SITE.meta.heroBg + '" alt="' + SITE.meta.heroBgAlt + '"></div>'
      + '<div class="hero-content">'
      + '<div class="hero-series">' + SITE.meta.seriesBadge + '</div>'
      + '<h1>' + SITE.meta.heroTitle + '<span class="em">' + SITE.meta.heroTitleEm + '</span></h1>'
      + '<p class="sub">' + SITE.meta.heroSub + '</p>'
      + '</div>'
      + '</div>'
      + '<div class="intro-quote reveal">' + SITE.intro.html + '</div>'
      + '<div class="sections">' + secsHTML + '</div>'
      + '<div class="char-section">'
      + '<div class="char-section-title">人物纪实</div>'
      + '<div class="char-cards">' + charsHTML + '</div>'
      + '</div>'
      + '<div class="ending reveal">' + SITE.ending.html + '</div>'
      + '<div class="footer">' + SITE.meta.footer + '</div>';
  }

  // --- Person Page (page-1/2) ---
  function renderPerson(person) {
    var pid = person.id;
    var page = $('page-' + pid);
    if (!page) return;

    var poemHTML = '';
    if (person.poems) {
      poemHTML = person.poems.map(function(poem, i) {
        var fullHTML = '';
        if (poem.hasMore) {
          var uid = 'poem-' + pid + '-' + i;
          fullHTML = '<div class="poem-full" id="' + uid + '"><div class="poem-full-inner" style="white-space:pre-line">' + poem.full + '</div></div>'
            + '<div class="poem-toggle" data-poem="' + uid + '">展开全文 ▼</div>';
        }
        return '<div class="poem-card reveal">'
          + '<div class="title">' + poem.title + '</div>'
          + '<div class="verse">' + poem.preview + fullHTML + '</div>'
          + '<div class="divider"></div>'
          + '</div>';
      }).join('');
    }

    var pullHTML = '';
    if (person.pullQuote) {
      pullHTML = '<div class="poet-pull reveal"><p>' + person.pullQuote + '</p><div class="attr">' + person.pullAttr + '</div></div>';
    }

    var extraBioHTML = '';
    if (person.extraBio) {
      extraBioHTML = '<div class="person-bio reveal">' + person.extraBio + '</div>';
    }

    var galleryHTML = '';
    if (person.gallery) {
      galleryHTML = '<div class="gallery">' + person.gallery.map(function(row) {
        return '<div class="gallery-row">' + row.rows.map(function(item) {
          return '<div class="gallery-item reveal" data-lightbox="' + item.src + '" data-lightbox-cap="' + item.cap + '">'
            + '<img src="' + item.src + '" alt="' + item.alt + '" loading="lazy">'
            + '<div class="cap">' + item.cap + '</div>'
            + '</div>';
        }).join('') + '</div>';
      }).join('') + '</div>';
    }

    var timelineHTML = '';
    if (person.timeline) {
      timelineHTML = '<div class="timeline">' + person.timeline.map(function(t) {
        return '<div class="tl-item tl-reveal"><span class="year">' + t.year + '</span>' + t.text + '</div>';
      }).join('') + '</div>';
    }

    var storyHTML = '';
    if (person.storyTitle && person.storyBody) {
      storyHTML = '<div class="person-story reveal"><h3>' + person.storyTitle + '</h3>'
        + person.storyBody.map(function(p) { return '<p>' + p + '</p>'; }).join('')
        + '</div>';
    }

    page.innerHTML =
      '<div class="page-header">'
      + '<h2>' + person.headerTitle + '</h2>'
      + '<p class="tagline">' + person.headerTagline + '</p>'
      + '</div>'
      + '<div class="person-bio reveal">' + person.bio + '</div>'
      + poemHTML
      + pullHTML
      + extraBioHTML
      + galleryHTML
      + storyHTML
      + timelineHTML
      + '<div class="footer" style="padding-top:8px">' + SITE.meta.footer + '</div>';
  }

  /* ===== NAVIGATION ===== */
  function goPage(n) {
    if (n === currentPage) return;

    if (n === 0) {
      mainNav.classList.add('dark');
      mainNav.classList.remove('light');
    } else {
      mainNav.classList.remove('dark');
    }
    navBack.classList.toggle('visible', n !== 0);

    var oldP = $('page-' + currentPage);
    var newP = $('page-' + n);

    if (n !== 0 && !newP.hasAttribute('data-rendered')) {
      var person = SITE.people[n - 1];
      renderPerson(person);
      newP.setAttribute('data-rendered', '1');
    }

    oldP.classList.remove('active');
    oldP.classList.add('page-exit');
    setTimeout(function() { oldP.classList.remove('page-exit'); }, 500);
    newP.classList.add('active');
    newP.scrollTop = 0;
    currentPage = n;

    // Re-bind observers for freshly rendered content
    bindReveal();
    bindTimeline();
    bindLazyImages();
    bindPoemToggles();
    bindCharCards();
    bindGallery();
  }

  /* ===== LIGHTBOX ===== */
  function openLightbox(src, cap) {
    lbImg.src = src;
    lbCap.textContent = cap || '';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  /* ===== POEM TOGGLE ===== */
  function togglePoem(el) {
    var uid = el.getAttribute('data-poem');
    var full = document.getElementById(uid);
    if (!full) return;
    if (full.classList.contains('open')) {
      full.classList.remove('open');
      el.textContent = '展开全文 ▼';
    } else {
      full.classList.add('open');
      el.textContent = '收起 ▲';
    }
  }

  /* ===== INTERSECTION OBSERVERS ===== */

  function bindReveal() {
    var reveals = document.querySelectorAll('.reveal:not(.observed)');
    if (!reveals.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function(el) {
      el.classList.add('observed');
      observer.observe(el);
    });
  }

  function bindTimeline() {
    var items = document.querySelectorAll('.tl-reveal:not(.tl-observed)');
    if (!items.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(function(el) {
      el.classList.add('tl-observed');
      observer.observe(el);
    });
  }

  function bindLazyImages() {
    var imgs = document.querySelectorAll('img[loading="lazy"]:not(.lazy-bound)');
    if (!imgs.length) return;
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(function(img) {
      img.classList.add('lazy-bound');
      observer.observe(img);
    });
  }

  /* ===== EVENT DELEGATION ===== */
  function bindCharCards() {
    var cards = document.querySelectorAll('.char-card:not(.card-bound)');
    cards.forEach(function(card) {
      card.classList.add('card-bound');
      card.addEventListener('click', function() {
        var n = parseInt(card.getAttribute('data-go'));
        if (!isNaN(n)) goPage(n);
      });
    });
  }

  function bindGallery() {
    var items = document.querySelectorAll('.gallery-item:not(.gallery-bound)');
    items.forEach(function(item) {
      item.classList.add('gallery-bound');
      item.addEventListener('click', function() {
        var src = item.getAttribute('data-lightbox');
        var cap = item.getAttribute('data-lightbox-cap');
        openLightbox(src, cap);
      });
    });
  }

  function bindPoemToggles() {
    var toggles = document.querySelectorAll('.poem-toggle:not(.toggle-bound)');
    toggles.forEach(function(toggle) {
      toggle.classList.add('toggle-bound');
      toggle.addEventListener('click', function() { togglePoem(toggle); });
    });
  }

  /* ===== NAV SCROLL EFFECT ===== */
  page0.addEventListener('scroll', function() {
    if (currentPage !== 0) return;
    if (this.scrollTop > 200) {
      mainNav.classList.remove('dark');
      mainNav.style.background = 'rgba(250,246,241,.95)';
    } else {
      mainNav.classList.add('dark');
      mainNav.style.background = 'rgba(250,246,241,.88)';
    }
  });

  /* ===== GLOBAL LISTENERS ===== */
  navBack.addEventListener('click', function() { goPage(0); });
  lightbox.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) closeLightbox();
  });

  /* ===== INIT ===== */
  renderHome();
  initLoader();
  bindReveal();
  bindLazyImages();
  bindCharCards();

  // Expose goPage for potential inline use
  window.goPage = goPage;

})(window.SITE);

(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function show(nextIndex) {
      index = nextIndex % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        show(index + 1);
      }, 5600);
    }
  });

  document.querySelectorAll('[data-search-area]').forEach(function (area) {
    var input = area.querySelector('[data-search-input]');
    var sort = area.querySelector('[data-sort-select]');
    var cardsWrap = area.querySelector('[data-cards-wrap]');
    var cards = Array.prototype.slice.call(area.querySelectorAll('.movie-card, .rank-item'));
    var empty = area.querySelector('[data-empty-state]');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      var keyword = normalize(input ? input.value : '');
      var visibleCount = 0;

      cards.forEach(function (card) {
        var text = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-region')
        ].join(' '));
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.style.display = visible ? '' : 'none';
        if (visible) {
          visibleCount += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('show', visibleCount === 0);
      }
    }

    function sortCards() {
      if (!cardsWrap || !sort) {
        return;
      }

      var mode = sort.value;
      cards.sort(function (a, b) {
        var yearA = parseInt(a.getAttribute('data-year') || '0', 10);
        var yearB = parseInt(b.getAttribute('data-year') || '0', 10);
        var titleA = a.getAttribute('data-title') || '';
        var titleB = b.getAttribute('data-title') || '';

        if (mode === 'old') {
          return yearA - yearB || titleA.localeCompare(titleB, 'zh-Hans-CN');
        }

        if (mode === 'title') {
          return titleA.localeCompare(titleB, 'zh-Hans-CN');
        }

        return yearB - yearA || titleA.localeCompare(titleB, 'zh-Hans-CN');
      });

      cards.forEach(function (card) {
        cardsWrap.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener('input', filterCards);
    }

    if (sort) {
      sort.addEventListener('change', function () {
        sortCards();
        filterCards();
      });
    }

    sortCards();
    filterCards();
  });
})();

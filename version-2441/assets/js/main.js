(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    current = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === current);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === current);
    });
  }

  function startHero() {
    if (slides.length <= 1) {
      return;
    }

    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      var index = Number(dot.getAttribute('data-hero-dot')) || 0;
      window.clearInterval(timer);
      showSlide(index);
      startHero();
    });
  });

  startHero();

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var input = panel.querySelector('[data-filter-input]');
    var select = panel.querySelector('[data-filter-year]');
    var scope = panel.parentElement || document;
    var items = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .rank-row'));

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = select ? select.value : '';

      items.forEach(function (item) {
        var text = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-genre') || '',
          item.getAttribute('data-type') || '',
          item.textContent || ''
        ].join(' ').toLowerCase();
        var itemYear = Number(item.getAttribute('data-year')) || 0;
        var matchesQuery = !query || text.indexOf(query) !== -1;
        var matchesYear = true;

        if (year) {
          if (year === '2021') {
            matchesYear = itemYear <= 2021;
          } else {
            matchesYear = String(itemYear) === year;
          }
        }

        item.classList.toggle('is-hidden', !(matchesQuery && matchesYear));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
        applyFilter();
      }
    }

    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });
})();

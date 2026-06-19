(function () {
  var menuButton = document.querySelector(".menu-button");
  var mobileMenu = document.querySelector(".mobile-menu");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      var open = mobileMenu.hasAttribute("hidden");
      if (open) {
        mobileMenu.removeAttribute("hidden");
      } else {
        mobileMenu.setAttribute("hidden", "");
      }
      menuButton.setAttribute("aria-expanded", String(open));
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
  var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
  var currentSlide = 0;
  var heroTimer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === currentSlide);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("active", i === currentSlide);
    });
  }

  function startHero() {
    if (slides.length < 2) {
      return;
    }
    heroTimer = window.setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot) {
    dot.addEventListener("click", function () {
      var index = Number(dot.getAttribute("data-hero-dot") || 0);
      window.clearInterval(heroTimer);
      showSlide(index);
      startHero();
    });
  });

  startHero();

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getQuery(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function setupPanel(panel) {
    var input = panel.querySelector(".site-search-input");
    var year = panel.querySelector(".year-filter");
    var cards = Array.prototype.slice.call(panel.querySelectorAll(".movie-card"));
    var empty = panel.querySelector(".empty-state");
    var categoryValue = "";
    var typeValue = "";

    if (input) {
      input.value = getQuery("q");
    }

    function setActive(kind, value) {
      var chips = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-kind="' + kind + '"]'));
      chips.forEach(function (chip) {
        chip.classList.toggle("active", chip.getAttribute("data-filter-value") === value);
      });
    }

    function apply() {
      var q = normalize(input ? input.value : "");
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var title = normalize(card.getAttribute("data-title"));
        var genre = normalize(card.getAttribute("data-genre"));
        var tags = normalize(card.getAttribute("data-tags"));
        var region = normalize(card.getAttribute("data-region"));
        var category = normalize(card.getAttribute("data-category"));
        var type = normalize(card.getAttribute("data-type"));
        var cardYear = Number(card.getAttribute("data-year") || 0);
        var haystack = title + " " + genre + " " + tags + " " + region + " " + category + " " + type + " " + cardYear;
        var passQuery = !q || haystack.indexOf(q) !== -1;
        var passCategory = !categoryValue || haystack.indexOf(normalize(categoryValue)) !== -1;
        var passType = !typeValue || type.indexOf(normalize(typeValue)) !== -1;
        var passYear = true;

        if (yearValue === "older") {
          passYear = cardYear > 0 && cardYear < 2020;
        } else if (yearValue) {
          passYear = String(cardYear) === yearValue;
        }

        var pass = passQuery && passCategory && passType && passYear;
        card.hidden = !pass;
        if (pass) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    panel.addEventListener("click", function (event) {
      var chip = event.target.closest("[data-filter-kind]");
      if (!chip) {
        return;
      }
      var kind = chip.getAttribute("data-filter-kind");
      var value = chip.getAttribute("data-filter-value") || "";
      if (kind === "category") {
        categoryValue = value;
      }
      if (kind === "type") {
        typeValue = value;
      }
      setActive(kind, value);
      apply();
    });

    if (input) {
      input.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    apply();
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]")).forEach(setupPanel);
})();

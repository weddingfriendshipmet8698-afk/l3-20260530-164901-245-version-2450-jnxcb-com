(function () {
    function selectAll(selector, parent) {
        return Array.prototype.slice.call((parent || document).querySelectorAll(selector));
    }

    function text(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initSiteSearch() {
        selectAll(".site-search").forEach(function (form) {
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                var input = form.querySelector("input");
                var query = input ? input.value.trim() : "";
                var target = "./search.html";
                if (query) {
                    target += "?q=" + encodeURIComponent(query);
                }
                window.location.href = target;
            });
        });
    }

    function initHero() {
        var carousel = document.querySelector(".hero-carousel");
        if (!carousel) {
            return;
        }
        var slides = selectAll(".hero-slide", carousel);
        var dots = selectAll(".hero-dot", carousel);
        var index = 0;
        var timer = null;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }
        var prev = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        if (prev) {
            prev.addEventListener("click", function () {
                show(index - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                start();
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
                start();
            });
        });
        carousel.addEventListener("mouseenter", stop);
        carousel.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initRails() {
        selectAll("[data-rail]").forEach(function (rail) {
            var name = rail.getAttribute("data-rail");
            selectAll("[data-rail-control='" + name + "']").forEach(function (button) {
                button.addEventListener("click", function () {
                    var direction = button.getAttribute("data-direction") === "prev" ? -1 : 1;
                    rail.scrollBy({ left: direction * 330, behavior: "smooth" });
                });
            });
        });
    }

    function initFilters() {
        selectAll(".filter-form").forEach(function (form) {
            var scopeSelector = form.getAttribute("data-target") || ".filter-scope";
            var scope = document.querySelector(scopeSelector);
            if (!scope) {
                return;
            }
            var input = form.querySelector(".search-input");
            var typeSelect = form.querySelector(".type-select");
            var regionSelect = form.querySelector(".region-select");
            var yearSelect = form.querySelector(".year-select");
            var cards = selectAll(".movie-card", scope);
            function apply() {
                var query = text(input && input.value);
                var type = text(typeSelect && typeSelect.value);
                var region = text(regionSelect && regionSelect.value);
                var year = text(yearSelect && yearSelect.value);
                cards.forEach(function (card) {
                    var haystack = text([
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-year")
                    ].join(" "));
                    var visible = true;
                    if (query && haystack.indexOf(query) === -1) {
                        visible = false;
                    }
                    if (type && text(card.getAttribute("data-type")) !== type) {
                        visible = false;
                    }
                    if (region && text(card.getAttribute("data-region")).indexOf(region) === -1) {
                        visible = false;
                    }
                    if (year && text(card.getAttribute("data-year")) !== year) {
                        visible = false;
                    }
                    card.classList.toggle("is-filtered-out", !visible);
                });
            }
            [input, typeSelect, regionSelect, yearSelect].forEach(function (field) {
                if (field) {
                    field.addEventListener("input", apply);
                    field.addEventListener("change", apply);
                }
            });
            form.addEventListener("submit", function (event) {
                event.preventDefault();
                apply();
            });
            var params = new URLSearchParams(window.location.search);
            var q = params.get("q");
            if (q && input) {
                input.value = q;
            }
            apply();
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        initMenu();
        initSiteSearch();
        initHero();
        initRails();
        initFilters();
    });
})();

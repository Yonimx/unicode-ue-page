/*
 * UniCode UE landing page: the menu, scroll effects, sparkles and the
 * gameplay clip. The page works without this file; it only adds motion.
 */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---- Links from js/config.js ----
  var links = window.UNICODE_LINKS || {};
  document.querySelectorAll("[data-link]").forEach(function (a) {
    var url = links[a.getAttribute("data-link")];
    if (url) a.href = url;
  });

  // ---- Menu (phones) ----
  var nav = document.querySelector("[data-nav]");
  var toggle = document.querySelector("[data-nav-toggle]");
  var menu = document.getElementById("nav-menu");

  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("is-open", open);
  }
  if (nav && toggle && menu) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    menu.addEventListener("click", function (event) {
      if (event.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") setMenu(false);
    });
  }

  // ---- Scrolling: solid menu bar, and the campus art moving slower ----
  var art = document.querySelector("[data-parallax]");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle("is-scrolled", y > 24);
    if (art && !reduceMotion && y < window.innerHeight * 1.3) {
      art.style.transform = "translate3d(0," + (y * 0.35).toFixed(1) + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(onScroll);
    }
  }, { passive: true });
  onScroll();

  // ---- Reveal sections as they scroll into view ----
  var revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealables.forEach(function (el) { revealer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  // ---- Sparkles: small cyan and yellow pixels floating up ----
  var sparkleBox = document.querySelector("[data-sparkles]");
  if (sparkleBox && !reduceMotion) {
    var count = window.innerWidth < 700 ? 14 : 28;
    for (var i = 0; i < count; i++) {
      var s = document.createElement("span");
      var big = Math.random() < 0.3;
      s.style.left = (Math.random() * 100).toFixed(2) + "%";
      s.style.top = (12 + Math.random() * 80).toFixed(2) + "%";
      s.style.setProperty("--z", big ? "6px" : "4px");
      s.style.setProperty("--col", Math.random() < 0.65 ? "#5ce1e6" : "#f8c93e");
      s.style.setProperty("--o", (0.35 + Math.random() * 0.5).toFixed(2));
      s.style.setProperty("--d", (4 + Math.random() * 5).toFixed(2) + "s");
      s.style.setProperty("--delay", (-Math.random() * 9).toFixed(2) + "s");
      sparkleBox.appendChild(s);
    }
  }

  // ---- Gameplay clip ----
  // Plays on its own (muted, looping) once it scrolls into view, pauses when
  // it scrolls away, and lights the step it is on. If media/gameplay.mp4
  // isn't there yet, the still image stays and the controls stay hidden.
  var player = document.querySelector("[data-player]");
  if (player) {
    var video = player.querySelector("[data-video]");
    var source = video.querySelector("source");
    var controls = player.querySelector("[data-controls]");
    var toggleButton = player.querySelector("[data-toggle]");
    var progress = player.querySelector("[data-progress]");
    var steps = Array.prototype.slice.call(document.querySelectorAll("[data-step]"));
    var ready = false;
    var userPaused = false;

    var markReady = function () {
      if (ready) return;
      ready = true;
      player.classList.add("has-video");
      controls.hidden = false;
      steps.forEach(function (b) { b.disabled = false; });
      showPlaying(!video.paused);
    };

    var showPlaying = function (playing) {
      toggleButton.classList.toggle("is-paused", !playing);
      toggleButton.setAttribute("aria-label", playing ? "Pause the clip" : "Play the clip");
    };

    var play = function () {
      var attempt = video.play();
      if (attempt && attempt.catch) attempt.catch(function () { showPlaying(false); });
    };

    video.addEventListener("loadeddata", markReady);
    video.addEventListener("play", function () { showPlaying(true); });
    video.addEventListener("pause", function () { showPlaying(false); });
    if (source) {
      source.addEventListener("error", function () { player.classList.add("no-video"); });
    }

    toggleButton.addEventListener("click", function () {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        video.pause();
      }
    });

    video.addEventListener("timeupdate", function () {
      if (video.duration) {
        progress.style.width = (video.currentTime / video.duration * 100).toFixed(2) + "%";
      }
      var current = 0;
      steps.forEach(function (b, index) {
        if (video.currentTime >= parseFloat(b.getAttribute("data-start") || "0")) current = index;
      });
      steps.forEach(function (b, index) {
        var on = index === current;
        b.classList.toggle("is-active", on);
        if (on) b.setAttribute("aria-current", "step");
        else b.removeAttribute("aria-current");
      });
    });

    steps.forEach(function (b) {
      b.addEventListener("click", function () {
        if (!ready) return;
        video.currentTime = parseFloat(b.getAttribute("data-start") || "0");
        userPaused = false;
        play();
      });
    });

    var startLoading = function () {
      if (video.getAttribute("preload") === "none") {
        video.setAttribute("preload", "auto");
        video.load();
      }
    };

    if ("IntersectionObserver" in window) {
      var watcher = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            startLoading();
            if (!reduceMotion && !userPaused) play();
          } else if (!video.paused) {
            video.pause();
          }
        });
      }, { threshold: 0.35 });
      watcher.observe(player);
    } else {
      startLoading();
    }
  }
})();

/*
 * UniCode UE landing page: the menu, scroll effects, sparkles, the gameplay
 * clip, the How to play pictures and the glide from the first screen to the
 * clip. The page works without this file; it only adds motion.
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

  // ---- How to play: the picture follows the step you're reading ----
  // The step crossing a band a little above the middle of the screen is the
  // current one. Clicking a step picks it too.
  var how = document.querySelector("[data-how]");
  if (how && "IntersectionObserver" in window) {
    var howSteps = Array.prototype.slice.call(how.querySelectorAll("[data-how-step]"));
    var howFrames = Array.prototype.slice.call(how.querySelectorAll("[data-how-frame]"));
    var showStep = function (index) {
      howSteps.forEach(function (step, i) { step.classList.toggle("is-active", i === index); });
      howFrames.forEach(function (frame, i) {
        frame.classList.toggle("is-active", i === index);
        if (i === index) frame.removeAttribute("aria-hidden");
        else frame.setAttribute("aria-hidden", "true");
      });
    };
    var stepWatcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) showStep(howSteps.indexOf(entry.target));
      });
    }, { rootMargin: "-38% 0px -52% 0px" });
    howSteps.forEach(function (step, i) {
      stepWatcher.observe(step);
      step.addEventListener("click", function () { showStep(i); });
    });
    showStep(0);
    how.classList.add("is-live");
  }

  // ---- From the first screen to the clip ----
  // On computers, scrolling down anywhere on the first screen glides straight
  // to the clip section, and scrolling up from the top of that section glides
  // back. Everywhere else scrolling is normal. Phones and tablets (no mouse)
  // and visitors who ask for less motion keep normal scrolling.
  var clipSection = document.getElementById("gameplay");
  var mouse = window.matchMedia("(hover: hover) and (pointer: fine)");
  if (clipSection && !reduceMotion) {
    var gliding = false;
    var glideStart = 0;
    var glideDest = 0;
    var retries = 0;
    var lastWheel = 0;
    var pending = 0;
    var settleTimer = 0;
    var restTimer = 0;

    // The scroll position that puts the clip section's title just under the
    // menu bar: the same spot the #gameplay link lands on (see the
    // scroll-margin-top on #gameplay in style.css).
    var clipTop = function () {
      var pad = parseFloat(window.getComputedStyle(clipSection).paddingTop) || 0;
      var bar = nav ? nav.offsetHeight : 0;
      return Math.round(clipSection.getBoundingClientRect().top + window.scrollY + pad - bar - 20);
    };

    // Stays "gliding" until the page stops moving and the wheel goes quiet,
    // so the rest of a trackpad swipe doesn't carry on past the stop.
    var settle = function () {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(function () {
        var now = Date.now();
        if (now - lastWheel < 200 && now - glideStart < 1600) {
          settle();
          return;
        }
        // The browser's own scroll (when it won't let the wheel be stopped)
        // can cut the glide short. If that left the page between the two
        // screens, finish the glide.
        var y = window.scrollY;
        if (Math.abs(y - glideDest) > 4 && y > 2 && y < clipTop() - 2 && retries < 2) {
          retries += 1;
          glideTo(glideDest, true);
          return;
        }
        retries = 0;
        gliding = false;
      }, 160);
    };

    var glideTo = function (y, again) {
      if (!again) retries = 0;
      gliding = true;
      glideStart = Date.now();
      glideDest = y;
      window.scrollTo({ top: y, behavior: "smooth" });
      settle();
    };

    // 1 to glide down to the clip, -1 to glide up to the first screen,
    // 0 for normal scrolling.
    var glideWay = function (direction) {
      var y = window.scrollY;
      var target = clipTop();
      if (direction > 0 && y < target - 2) return 1;
      if (direction < 0 && y > 2 && y <= target + 2) return -1;
      return 0;
    };

    window.addEventListener("wheel", function (event) {
      if (!mouse.matches || event.ctrlKey) return;
      var now = Date.now();
      if (now - lastWheel > 250) pending = 0;
      lastWheel = now;
      if (gliding) {
        event.preventDefault();
        return;
      }
      var dy = event.deltaY * (event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? window.innerHeight : 1);
      var way = glideWay(dy);
      if (!way) {
        pending = 0;
        return;
      }
      event.preventDefault();
      pending += dy;
      if (Math.abs(pending) < 12) return; // a light brush on a trackpad
      pending = 0;
      glideTo(way > 0 ? clipTop() : 0);
    }, { passive: false });

    window.addEventListener("keydown", function (event) {
      if (!mouse.matches || event.altKey || event.ctrlKey || event.metaKey) return;
      var t = event.target;
      if (t && t.closest && t.closest("input, textarea, select, button, video, [contenteditable]")) return;
      var direction = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }[event.key] || 0;
      if (event.key === " ") direction = event.shiftKey ? -1 : 1;
      if (!direction) return;
      if (gliding) {
        event.preventDefault();
        return;
      }
      var way = glideWay(direction);
      if (!way) return;
      event.preventDefault();
      glideTo(way > 0 ? clipTop() : 0);
    });

    // Scrolling up out of the clip section can stop between the two screens.
    // When the wheel stops there, finish the move to the nearer one.
    window.addEventListener("scroll", function () {
      if (gliding) {
        settle();
        return;
      }
      clearTimeout(restTimer);
      restTimer = setTimeout(function () {
        if (gliding || !mouse.matches || Date.now() - lastWheel > 600) return;
        var y = window.scrollY;
        var target = clipTop();
        if (y > 2 && y < target - 2) glideTo(y < target / 2 ? 0 : target);
      }, 180);
    }, { passive: true });
  }
})();

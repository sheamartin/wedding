// ====== CONFIG ======
const WEDDING_DATE_ISO = "2026-06-27T16:30:00"; // ceremony time (local venue time)

// Add your gallery photos here (paths relative to site root)
const GALLERY = [
  { src: "assets/gallery/Aruba.jpeg", caption: "Engagement session" },
  { src: "assets/gallery/Cowboy.jpeg", caption: "A moment we’ll always keep" },
  { src: "assets/gallery/Bogota.jpeg", caption: "Just us" },
  { src: "assets/gallery/Friendsmas.jpeg", caption: "The vibes" },
  { src: "assets/gallery/NYC.jpeg", caption: "Love looks good" },
  { src: "assets/gallery/VegasUsher.jpeg", caption: "On the way to forever" },
{ src: "assets/gallery/Aruba.jpeg", caption: "Engagement session" },
  { src: "assets/gallery/Cowboy.jpeg", caption: "A moment we’ll always keep" },
  { src: "assets/gallery/Bogota.jpeg", caption: "Just us" },
  { src: "assets/gallery/Friendsmas.jpeg", caption: "The vibes" },
  { src: "assets/gallery/NYC.jpeg", caption: "Love looks good" },
  { src: "assets/gallery/VegasUsher.jpeg", caption: "On the way to forever" },
];

// ====== Helpers ======
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function pad2(n) {
  return String(Math.max(0, Math.floor(n))).padStart(2, "0");
}

function safeParseInt(v, fallback = 0) {
  const n = Number.parseInt(String(v), 10);
  return Number.isFinite(n) ? n : fallback;
}
// ===== RSVP Guest Rules =====
const FORM_PLUS1 = "https://docs.google.com/forms/d/e/1FAIpQLSdGU7IQnaVBbI-ks1V0UuLi2nzJNHX2qQtBYetlYcpJS2Y5ZQ/viewform?embedded=true";

const FORM_NO_PLUS1 = "https://docs.google.com/forms/d/e/1FAIpQLSccZJHXMzN8yUpobMfQdOYHBXQF0dVGjpCiJNug_4vrR5betg/viewform?embedded=true";

// Normalize names so "Mark Martin", " mark  martin ", "MARK MARTIN" match
function normalizeName(s) {
  return String(s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Bulk guest list — paste-only zone
 * Names must be First Last (exact spelling).
 */
const GUEST_NAMES_NO_PLUS1 = `
Chanel Acee
Sia Andrews
Quadarius Bennett
Cameran Botts
Tahir Boykins
Susan Bracey
Victor Bracey
Nina Bracey
Neeice Bryant
Zandra Bryant
Chynna Bush
Denzel Caldwell
Ayanna Campbell
Jacqueline Clark
Torey Clark
Karen Clark
Fata Dukuly
Jeohn Favors
Marsha Ford
Morgan Franklin
Jennifer Freeman
Anthony Freeman
Barbara Freeman
Michael Freeman
Robin Freeman
Princess Fuller
Corey Gaither
Gail Garrett
Betty Girma-Wilkins
Elvin Green
Angie Gruner
Emily Gruner
Darlene Gutherie
Yasmin Hall
Saxton Hall
Destiny Hampton
Dominique Harris
Casey Hayward
Shantell Hinton
Ryan Jemison
Paulette Jones-Therrell
Erin Keels
London Keyes
Joy Legaux
Ann Legeaux
Larry Legeaux
Cierra Lockett
Jamal Love
Marcus Lucus
Kaye Lucus
Micah Lucus
Tawana Mackey
Gee Mackey
Brandon Mackey
Permethiys Mackey
Yvette Martin
Mark Martin
Chantz Martin
Lauren Marve-Samuels
Chris Marve-Samuels
Daisy McDowell
Robert Mobley
Letitia Mobley
Lauren Mobley
Gwendolyn Morgan
Phyllis Murphy
Charles Murphy
Bex Mvula
Alvera Nelson
Pamela Nwaoko
Bri Perry
Hubert Price
Tonia Price
Mandi Samek
Greg Samek
Russel Sheppard
Ryant Sheppard
Anthony Smith
Mishaun Smith
Brad Spielberger
Ronique Stewart
Will Stewart
Verlee Thompson
Troy Thompson
Jack Tolson
Audrey Toson
Whitney Tucker
Paige Turner
Sandra Umutesi
JD Victrum
Barbara Victrum
Michele Victrum
Antonio Victrum
Alisha Washington
Arthurine Weekes
Terik Weekes
Charles Weems
Tonya Weems
Drew Wilkins
Steve Wilkins
Dawn Wilkins
Jonathan Williams
Chauneice Yaegley
Henry Yaegley
Bundrea Conway
Paulette Peacock
Francesca Amiker
Nazharie Brandon
Girtha Burks
Trevor Burton
Sierra Davis
Rio Dixon
Brendan Fountaine
Rich Freeman
Thomasena Gaither
Joelle Gomez
Andre Hal
Ruth Henry
MJ Johnson
Alexis Jones
Lisa Keels
Darryl Keels
Hamida Labi
Marsha Lockett
Imani Love
Collin Mack
Rosemary Maddox
Tom Maddox
Ariane Moss
LaRue Nelson
Janice Nelson
Doris Rudolph
Lisa Snerl
Xiomara Trotman
Sierra White
PJ White
Raeonda Williams
Kayla Winston
`;

const GUEST_NAMES_PLUS1 = `
Sherman Bonds
Nicole Bryant
Edwin Corbitt
Francisca Dallass
Marquess Dotts
Nile Freeman
Machumu Freeman
Julie Gomez
Russell Harrell
Andrea Jaramillo
Joshua Jasper
Marlon Jones
Racquel Martin
Brittany Melvin
Abbie Petty
Megan Piphus
Titilayo Rasaki
Dayana Sarkisova
Shaun Scott
Kristen Sheft
Maudine Taylor
Von Thompson
Jori Turner
Aida Vajzovic
John Victrum
Ted Wells
Jacquesline Bolaji
James Franklin
Sheila Sparks
Kevin Warren
`;

// Build rules map (used by the RSVP logic)
const GUEST_RULES = (() => {
  const rules = {};
  const addList = (text, rule) =>
    text.split("\n").map(s => s.trim()).filter(Boolean).forEach(name => {
      rules[normalizeName(name)] = { ...rule };
    });

  addList(GUEST_NAMES_NO_PLUS1, { maxGuests: 1, plusOneAllowed: false });
  addList(GUEST_NAMES_PLUS1, { maxGuests: 2, plusOneAllowed: true });
  return rules;
})();


// Optional default rule when name isn't recognized
const DEFAULT_RULE = { maxGuests: 1, plusOneAllowed: false };

// ====== Smooth scrolling (only for same-page anchors like #rsvp) ======
function setupSmoothScroll() {
  const links = $$('a[href^="#"]');
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;

      const target = document.getElementById(id.slice(1));
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      // close mobile nav
      const mobileNav = $("#mobileNav");
      const menuBtn = $("#menuBtn");
      if (mobileNav && !mobileNav.hidden) {
        mobileNav.hidden = true;
        menuBtn?.setAttribute("aria-expanded", "false");
      }
      history.replaceState(null, "", id);
    });
  });
}

// ====== Mobile menu toggle ======
function setupMobileMenu() {
  const btn = $("#menuBtn");
  const nav = $("#mobileNav");
  if (!btn || !nav) return;

  btn.addEventListener("click", () => {
    const isOpen = !nav.hidden;
    nav.hidden = isOpen;
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
}

// ====== Countdown (only if elements exist) ======
function setupCountdown() {
  const dd = $("#dd"), hh = $("#hh"), mm = $("#mm"), ss = $("#ss");
  if (!dd || !hh || !mm || !ss) return;

  const weddingMs = new Date(WEDDING_DATE_ISO).getTime();
  if (!Number.isFinite(weddingMs)) {
    dd.textContent = hh.textContent = mm.textContent = ss.textContent = "00";
    return;
  }

  function tick() {
    const now = Date.now();
    const diff = Math.max(0, weddingMs - now);

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (3600 * 24));
    const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    dd.textContent = String(days);
    hh.textContent = pad2(hours);
    mm.textContent = pad2(minutes);
    ss.textContent = pad2(seconds);
  }

  tick();
  setInterval(tick, 1000);
}

// ====== RSVP (localStorage) ======
const RSVP_KEY = "wedding_rsvps_v1";

function loadRsvps() {
  try {
    const raw = localStorage.getItem(RSVP_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveRsvps(items) {
  localStorage.setItem(RSVP_KEY, JSON.stringify(items));
}

function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderRsvps() {
  const box = $("#rsvpList");
  const itemsEl = $("#rsvpItems");
  if (!box || !itemsEl) return;

  const rsvps = loadRsvps();
  if (rsvps.length === 0) {
    box.hidden = true;
    itemsEl.innerHTML = "";
    return;
  }

  box.hidden = false;
  itemsEl.innerHTML = rsvps
    .slice()
    .reverse()
    .map((r) => {
      const when = new Date(r.createdAt).toLocaleString();
      const guests = safeParseInt(r.guests, 1);
      return `
        <div class="card" style="margin:10px 0; background: rgba(0,0,0,.12);">
          <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
            <strong>${escapeHtml(r.name)}</strong>
            <span class="muted">${escapeHtml(when)}</span>
          </div>
          <div class="muted">${escapeHtml(r.email)}</div>
          <div style="margin-top:6px;">
            <strong>${r.attending === "yes" ? "Attending" : "Not attending"}</strong>
            • Guests: ${guests}
          </div>
          ${r.diet ? `<div class="muted" style="margin-top:6px;">Diet: ${escapeHtml(r.diet)}</div>` : ""}
          ${r.note ? `<div class="muted" style="margin-top:6px;">Note: ${escapeHtml(r.note)}</div>` : ""}
        </div>
      `;
    })
    .join("");
}

function setupRsvp() {
  const form = $("#rsvpForm");
  const status = $("#formStatus");
  const viewBtn = $("#viewRsvpsBtn");
  const clearBtn = $("#clearRsvpsBtn");
const iframe = document.getElementById("googleRsvpForm");

  if (!form || !status) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    status.textContent = "";

    const fd = new FormData(form);
    const name = String(document.getElementById("guestLookup")?.value || "").trim();
const lookupEl = document.getElementById("guestLookup");
const isValidGuest = lookupEl?.dataset?.guestValid === "1";
const isConfirmed = lookupEl?.dataset?.guestConfirmed === "1";

if (!isValidGuest) {
  status.textContent = "We couldn’t find your name. Please enter your first and last name exactly as on the invitation.";
  return;
if (document.getElementById("googleRsvpForm")) return;
}


const plusOneAttending = String(fd.get("plusOneAttending") || "").trim();
    const email = String(fd.get("email") || "").trim();
    const attending = String(fd.get("attending") || "");
    const guests = safeParseInt(fd.get("guests"), 1);
    const diet = String(fd.get("diet") || "").trim();
    const note = String(fd.get("note") || "").trim();

    if (!name || !email || !attending) {
      status.textContent = "Please fill out name, email, and attendance.";
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      status.textContent = "Please enter a valid email.";
      return;
    }
    if (guests < 1 || guests > 6) {
      status.textContent = "Guest count must be between 1 and 6.";
      return;
    }

    const rsvps = loadRsvps();
    rsvps.push({
      name,
      email,
      attending,
      guests,
      diet,
      note,
      createdAt: new Date().toISOString(),
    });
    saveRsvps(rsvps);

    form.reset();
    const g = form.querySelector('input[name="guests"]');
    if (g) g.value = "1";

    status.textContent = "RSVP saved! (Stored on this device/browser.)";
    renderRsvps();
  });

  viewBtn?.addEventListener("click", () => {
    renderRsvps();
    const box = $("#rsvpList");
    if (box && !box.hidden) box.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  clearBtn?.addEventListener("click", () => {
    localStorage.removeItem(RSVP_KEY);
    renderRsvps();
  });

  renderRsvps();
}

// ====== FAQ accordion ======
function setupAccordion() {
  const acc = $('[data-accordion]');
  if (!acc) return;

  const buttons = $$(".accBtn", acc);
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      if (!(panel instanceof HTMLElement)) return;

      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      panel.hidden = open;

      buttons.forEach((other) => {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        const p = other.nextElementSibling;
        if (p instanceof HTMLElement) p.hidden = true;
      });
    });
  });
}

// ====== Copy registry ======
function setupCopyRegistry() {
  const btn = $("#copyRegistryBtn");
  const input = $("#registryUrl");
  const status = $("#copyStatus");
  if (!btn || !input || !status) return;

  btn.addEventListener("click", async () => {
    status.textContent = "";
    try {
      await navigator.clipboard.writeText(input.value);
      status.textContent = "Copied!";
    } catch {
      input.select();
      document.execCommand("copy");
      status.textContent = "Copied!";
    }
  });
}

// ====== Gallery + Lightbox ======
function setupGallery() {
  const grid = $("#galleryGrid");
  if (!grid) return;

    // Build thumbnails
  grid.innerHTML = GALLERY.map((p, idx) => {
    const tilt = (-1.4 + Math.random() * 2.8).toFixed(2); // -1.4deg to +1.4deg
    return `
      <button class="galleryItem" style="--tilt:${tilt}deg" type="button" data-idx="${idx}"
              aria-label="Open photo ${idx + 1}">
        <img src="${p.src}" alt="${escapeHtml(p.caption || `Photo ${idx + 1}`)}" loading="lazy" />
        <div class="galleryCap">${escapeHtml(p.caption || "")}</div>
      </button>
    `;
  }).join("");



  const lb = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCap = $("#lightboxCaption");
  const closeBtn = $("#lightboxClose");
  const prevBtn = $("#lightboxPrev");
  const nextBtn = $("#lightboxNext");

  if (!lb || !lbImg || !lbCap || !closeBtn || !prevBtn || !nextBtn) return;

  let current = 0;

  function openAt(i) {
    current = (i + GALLERY.length) % GALLERY.length;
    const item = GALLERY[current];
    lbImg.src = item.src;
    lbImg.alt = item.caption || `Photo ${current + 1}`;
    lbCap.textContent = item.caption || "";
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbImg.src = "";
  }
  // Prev / Next buttons
  prevBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAt(current - 1);
  });

  nextBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    openAt(current + 1);
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-idx]");
    if (!btn) return;
    const idx = Number(btn.getAttribute("data-idx"));
    if (Number.isFinite(idx)) openAt(idx);
  });

  closeBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
  close();
});

// Close if you click anywhere in the overlay EXCEPT the image or navigation buttons
lb.addEventListener("click", (e) => {
  const clickedImage = e.target === lbImg;
  const clickedNav = e.target.closest?.(".lightboxNav");
  const clickedClose = e.target.closest?.(".lightboxClose");
  if (!clickedImage && !clickedNav && !clickedClose) close();
});

  window.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") openAt(current - 1);
    if (e.key === "ArrowRight") openAt(current + 1);
  });
}
function setupTwinklingLights() {
  const container = document.querySelector(".floaters");
  if (!container) return;

  // Controls
  const MAX_ON_SCREEN = 28;       // how many lights can exist at once
  const SPAWN_EVERY_MS = 350;     // lower = denser
  let timer = null;

  function spawnLight() {
    // cap
    const current = container.querySelectorAll(".twinkle").length;
    if (current >= MAX_ON_SCREEN) return;

    const el = document.createElement("div");
    el.className = "twinkle";

    // Randomize: x position, size, opacity, speed, delay, twinkle speed
    const x = Math.random() * 100;              // vw
    const s = 3 + Math.random() * 6;            // px (3–9)
    const a = 0.45 + Math.random() * 0.45;      // 0.45–0.9
    const dur = 10 + Math.random() * 14;        // seconds (10–24)
    const delay = Math.random() * 0.8;          // seconds (near-immediate)
    const pulse = 1.8 + Math.random() * 2.4;    // seconds (1.8–4.2)

    el.style.setProperty("--x", `${x}vw`);
    el.style.setProperty("--s", `${s}px`);
    el.style.setProperty("--a", `${a}`);
    el.style.setProperty("--dur", `${dur}s`);
    el.style.setProperty("--delay", `${delay}s`);
    el.style.setProperty("--pulse", `${pulse}s`);

    container.appendChild(el);

    // Remove after fall completes (dur + delay + buffer)
    const lifetime = (dur + delay) * 1000 + 600;
    setTimeout(() => el.remove(), lifetime);
  }

  function start() {
    // clear any old
    container.innerHTML = "";
    clearInterval(timer);

    // kickstart so you see lights immediately
    for (let i = 0; i < Math.min(MAX_ON_SCREEN, 12); i++) spawnLight();

    timer = setInterval(spawnLight, SPAWN_EVERY_MS);
  }

  start();

  // restart cleanly if user leaves/returns
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) start();
  });

  window.addEventListener("beforeunload", () => clearInterval(timer));
}

  function setupRsvpGuestRules() {
  const lookup = document.getElementById("guestLookup");
  const guestStatus = document.getElementById("guestStatus");
  const confirmBtn = document.getElementById("confirmGuestBtn");
  const editBtn = document.getElementById("editGuestBtn");
  const rsvpFields = document.getElementById("rsvpFields");
  const iframe = document.getElementById("googleRsvpForm");

  // Only run on RSVP page
  if (!lookup || !guestStatus || !confirmBtn || !rsvpFields) return;

  // state
  lookup.dataset.guestValid = "0";
  lookup.dataset.guestConfirmed = "0";

  function setConfirmed(on) {
    lookup.dataset.guestConfirmed = on ? "1" : "0";
    lookup.readOnly = on;

    confirmBtn.hidden = on;
    if (editBtn) editBtn.hidden = !on;

    rsvpFields.hidden = !on;
  }

  function setValid(valid, msg) {
    lookup.dataset.guestValid = valid ? "1" : "0";
    guestStatus.textContent = msg;
    confirmBtn.disabled = !valid;
  }

  function onLookupChange() {
    // If they edit after confirming, lock again
    if (lookup.dataset.guestConfirmed === "1") {
      setConfirmed(false);
      if (iframe) iframe.src = "";
    }

    const raw = String(lookup.value || "").trim();
    if (!raw) {
      setValid(false, "Enter your first and last name exactly as on the invitation.");
      return;
    }

    const rule = GUEST_RULES[normalizeName(raw)];
    if (!rule) {
      setValid(false, "Name not found. Please enter your first and last name exactly as on the invitation.");
      return;
    }

    setValid(true, `Invitation found for: ${raw}`);
  }

  confirmBtn.addEventListener("click", () => {
    if (lookup.dataset.guestValid !== "1") return;

    const rawName = String(lookup.value || "").trim();
    const rule = GUEST_RULES[normalizeName(rawName)] || DEFAULT_RULE;

    setConfirmed(true);
    guestStatus.textContent = `Confirmed: ${rawName}`;

    if (iframe) {
      iframe.src = rule.plusOneAllowed ? FORM_PLUS1 : FORM_NO_PLUS1;
    }
  });

  editBtn?.addEventListener("click", () => {
    setConfirmed(false);
    if (iframe) iframe.src = "";
    lookup.focus();
    guestStatus.textContent = "Edit your name, then confirm again.";
  });

  // initial UI
  setConfirmed(false);
  setValid(false, "Enter your first and last name exactly as on the invitation.");
  lookup.addEventListener("input", onLookupChange);
}


function setupHomeAudio() {
  const audio = document.getElementById("homeAudio");
  const btn = document.getElementById("audioToggleBtn");
  const status = document.getElementById("audioStatus");

  if (!audio || !btn || !status) return;

  const KEY = "home_audio_enabled_v1";

  function setUi(isPlaying) {
    btn.textContent = isPlaying ? "Pause music" : "Play music";
    status.textContent = isPlaying ? "On" : "Off";
  }

  async function playAudio() {
    try {
      audio.muted = false;
      audio.volume = 0.5;

      const p = audio.play();
      if (p && typeof p.then === "function") await p;

      localStorage.setItem(KEY, "1");
      setUi(true);
      return true;
    } catch (e) {
      // Most commonly: NotAllowedError (no user gesture on this page yet)
      setUi(false);
      return false;
    }
  }

  function pauseAudio() {
    audio.pause();
    localStorage.setItem(KEY, "0");
    setUi(false);
  }

  // Button toggle always works (user gesture)
  btn.addEventListener("click", async () => {
    if (audio.paused) await playAudio();
    else pauseAudio();
  });

  const saved = localStorage.getItem(KEY) === "1";

  // Default UI state
  setUi(false);

  if (saved) {
    // 1) Try immediately on page load (sometimes allowed in desktop browsers)
    playAudio().then((ok) => {
      if (ok) return;

      // 2) If blocked, start as soon as the user clicks ANYWHERE on this page
      const startOnFirstTap = async () => {
        document.removeEventListener("pointerdown", startOnFirstTap);
        await playAudio();
      };

      // pointerdown triggers earlier than click and works on mobile
      document.addEventListener("pointerdown", startOnFirstTap, { once: true });
    });
  }
}

function setupHotelSlideshow() {
  const img = document.getElementById("hotelSlideImg");
  const cap = document.getElementById("hotelSlideCaption");
  const prev = document.getElementById("hotelPrevBtn");
  const next = document.getElementById("hotelNextBtn");
  const dotsWrap = document.getElementById("hotelSlideDots");

  // Only run on pages that have the slideshow
  if (!img || !cap || !prev || !next || !dotsWrap) return;

  // ✅ Put your hotel photos + captions here
  const SLIDES = [
    { src: "assets/hotels/everhome_suites.png", caption: "Everhome Suites — approx. 10–15 minutes" },
    { src: "assets/hotels/hotel2.jpg", caption: "Hotel Name — approx. 15–20 minutes" },
    { src: "assets/hotels/hotel3.jpg", caption: "Another option — great for groups" },
  ];

  let i = 0;

  function renderDots() {
    dotsWrap.innerHTML = SLIDES.map((_, idx) =>
      `<span class="slideDot ${idx === i ? "active" : ""}" data-idx="${idx}"></span>`
    ).join("");
  }

  function show(idx) {
    i = (idx + SLIDES.length) % SLIDES.length;
    img.src = SLIDES[i].src;
    cap.textContent = SLIDES[i].caption;
    renderDots();
  }

  prev.addEventListener("click", () => show(i - 1));
  next.addEventListener("click", () => show(i + 1));

  dotsWrap.addEventListener("click", (e) => {
    const dot = e.target.closest("[data-idx]");
    if (!dot) return;
    const idx = Number(dot.getAttribute("data-idx"));
    if (Number.isFinite(idx)) show(idx);
  });

  show(0);
}

function setupVideoPosterReset() {
  const videos = document.querySelectorAll(".mediaVideo"); // ✅ matches your HTML

  videos.forEach((video) => {
    video.addEventListener("ended", () => {
      video.pause();
      video.currentTime = 0;

      // Force poster to show again
      video.removeAttribute("src");  // optional safety
      video.load();
    });
  });
}

// ====== Init ======
function init() {
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  setupMobileMenu();
  setupSmoothScroll();
  setupCountdown();

setupHomeAudio();

setupRsvpGuestRules();  
  setupAccordion();
  setupCopyRegistry();
  setupGallery();

setupTwinklingLights();
setupHotelSlideshow();
setupVideoPosterReset();
}

document.addEventListener("DOMContentLoaded", init);

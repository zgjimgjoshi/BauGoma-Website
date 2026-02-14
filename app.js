/* ===== Helpers ===== */
const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => [...parent.querySelectorAll(sel)];

/* ===== Sticky menu toggle (mobile) ===== */
const navToggle = $("#navToggle");
const navMenu = $("#navMenu");

navToggle?.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

$$(".nav__link").forEach(link => {
  link.addEventListener("click", () => {
    if (navMenu.classList.contains("is-open")) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
});

document.querySelectorAll('a[href="#top"]').forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});


/* ===== Scroll progress bar ===== */
const progressBar = $("#progressBar");
const onScroll = () => {
  const doc = document.documentElement;
  const scrollTop = doc.scrollTop;
  const scrollHeight = doc.scrollHeight - doc.clientHeight;
  const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
  progressBar.style.width = `${p}%`;
};
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

/* ===== Reveal on scroll (IntersectionObserver) ===== */
const revealEls = $$(".reveal");
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("is-visible");
  });
}, { threshold: 0.14 });

revealEls.forEach(el => io.observe(el));

/* ===== Animated counters ===== */
const counters = $$("[data-count]");
let counted = false;

const countUp = (el, target, duration = 900) => {
  const start = performance.now();
  const from = 0;
  const tick = (now) => {
    const t = Math.min((now - start) / duration, 1);
    // easeOutCubic
    const eased = 1 - Math.pow(1 - t, 3);
    const val = Math.floor(from + (target - from) * eased);
    el.textContent = val.toLocaleString();
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

const counterIO = new IntersectionObserver((entries) => {
  const seen = entries.some(e => e.isIntersecting);
  if (seen && !counted) {
    counted = true;
    counters.forEach(el => countUp(el, Number(el.dataset.count)));
  }
}, { threshold: 0.35 });

counters.forEach(el => counterIO.observe(el));

/* ===== Hero slider ===== */
const track = $("#sliderTrack");
const slides = $$(".slide", track);
const prev = $("#prevSlide");
const next = $("#nextSlide");
const dotsWrap = $("#sliderDots");

let idx = 0;
let autoTimer;

const setSlide = (i) => {
  idx = (i + slides.length) % slides.length;
  track.style.transform = `translateX(${-idx * 100}%)`;
  $$(".dotbtn", dotsWrap).forEach((d, di) => d.classList.toggle("is-active", di === idx));
};

const buildDots = () => {
  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.className = "dotbtn" + (i === 0 ? " is-active" : "");
    b.type = "button";
    b.setAttribute("aria-label", `Go to slide ${i + 1}`);
    b.addEventListener("click", () => {
      setSlide(i);
      restartAuto();
    });
    dotsWrap.appendChild(b);
  });
};

const restartAuto = () => {
  clearInterval(autoTimer);
  autoTimer = setInterval(() => setSlide(idx + 1), 5000);
};

buildDots();
setSlide(0);
restartAuto();

prev?.addEventListener("click", () => { setSlide(idx - 1); restartAuto(); });
next?.addEventListener("click", () => { setSlide(idx + 1); restartAuto(); });

/* ===== Products filter ===== */
const chips = $$(".chip");
const productGrid = $("#productGrid");
const cards = $$(".card", productGrid);

const applyFilter = (tag) => {
  chips.forEach(c => {
    const active = c.dataset.filter === tag;
    c.classList.toggle("is-active", active);
    c.setAttribute("aria-selected", String(active));
  });

  cards.forEach(card => {
    const tags = (card.dataset.tags || "").split(/\s+/).filter(Boolean);
    const show = tag === "all" || tags.includes(tag);
    card.style.display = show ? "" : "none";
  });
};

chips.forEach(chip => {
  chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
});

/* ===== Product modal ===== */
const productModal = $("#productModal");
const modalTitle = $("#modalTitle");
const modalSpec = $("#modalSpec");
const modalImg = $("#modalImg");
const closeProduct = $("#closeProduct");
const modalClose2 = $("#modalClose2");
const modalQuote = $("#modalQuote");

/* ===== Quote modal ===== */
const quoteModal = $("#quoteModal");
const openQuote = $("#openQuote");
const closeQuote = $("#closeQuote");
const closeQuote2 = $("#closeQuote2");
const goToForm = $("#goToForm");

const openDialog = (dlg) => {
  if (!dlg) return;
  if (typeof dlg.showModal === "function") dlg.showModal();
  else dlg.setAttribute("open", ""); // fallback (older browsers)
};

const closeDialog = (dlg) => {
  if (!dlg) return;
  if (typeof dlg.close === "function") dlg.close();
  else dlg.removeAttribute("open");
};

cards.forEach(card => {
  card.addEventListener("click", () => {
    modalTitle.textContent = card.dataset.title || "Product";
    modalSpec.textContent = card.dataset.spec || "";
    modalImg.src = card.dataset.img || "";
    modalImg.alt = `${modalTitle.textContent} image`;
    openDialog(productModal);
  });
});

closeProduct?.addEventListener("click", () => closeDialog(productModal));
modalClose2?.addEventListener("click", () => closeDialog(productModal));

openQuote?.addEventListener("click", () => openDialog(quoteModal));
closeQuote?.addEventListener("click", () => closeDialog(quoteModal));
closeQuote2?.addEventListener("click", () => closeDialog(quoteModal));

/* modal Quote => jump to form */
const quoteForm = $("#quoteForm");
const notes = quoteForm?.elements?.notes;

modalQuote?.addEventListener("click", () => {
  closeDialog(productModal);
  openDialog(quoteModal);
});

goToForm?.addEventListener("click", () => {
  closeDialog(quoteModal);
  $("#contact").scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => notes?.focus(), 450);
});

/* ===== Form UX (front-end only) ===== */
const formStatus = $("#formStatus");
const fillDemo = $("#fillDemo");

quoteForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  emailjs.send("service_b2esi67", "template_8hzizlp", {
    name: quoteForm.name.value,
    company: quoteForm.company.value,
    email: quoteForm.email.value,
    numri: quoteForm.numri.value,
    application: quoteForm.application.value,
    qty: quoteForm.qty.value,
    notes: quoteForm.notes.value
  })
  .then(() => {
    formStatus.textContent = "✅ Kërkesa u dërgua me sukses!";
    quoteForm.reset();
  })
  .catch(() => {
    formStatus.textContent = "❌ Gabim në dërgim.";
  });
});


fillDemo?.addEventListener("click", () => {
  quoteForm.name.value = "Alex";
  quoteForm.company.value = "SiteWorks Ltd.";
  quoteForm.email.value = "alex@siteworks.com";
  quoteForm.numri.value = "+31 6 12345678";
  quoteForm.application.value = "Excavator";
  quoteForm.qty.value = "8";
  quoteForm.notes.value = "Machine: CAT 320. Need wheels/rims with corrosion-resistant coating. Please confirm bolt pattern + offset options.";
  formStatus.textContent = "";
});

/* ===== Footer year ===== */
$("#year").textContent = String(new Date().getFullYear());

/* ===== Close dialogs on backdrop click (nice UX) ===== */
[productModal, quoteModal].forEach(dlg => {
  dlg?.addEventListener("click", (e) => {
    const rect = dlg.getBoundingClientRect();
    const inDialog =
      rect.top <= e.clientY && e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX && e.clientX <= rect.left + rect.width;

    if (!inDialog) closeDialog(dlg);
  });
});

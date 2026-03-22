const body = document.body;
const loader = document.querySelector(".page-loader");
const cursor = document.querySelector(".cursor-dot");
const progress = document.querySelector(".scroll-progress");
const revealItems = document.querySelectorAll(".reveal, .section-rule");
const navLinks = document.querySelectorAll(".site-nav a");
const mobileNav = document.querySelector(".mobile-nav");
const mobileLinks = document.querySelectorAll(".mobile-nav a");
const menuToggle = document.querySelector(".menu-toggle");
const sections = [...document.querySelectorAll("main section[id]")];
const interactiveItems = document.querySelectorAll("a, button, input, textarea, .project-panel[data-href]");
const timelineFeature = document.querySelector(".timeline-feature");
const detailToggle = document.querySelector(".detail-toggle");
const portrait = document.querySelector(".portrait-frame");
const contactForm = document.querySelector(".contact-form");
const projectPanels = document.querySelectorAll(".project-panel[data-href]");

const updateProgress = () => {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progress.style.transform = `scaleX(${ratio})`;
};

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
);

revealItems.forEach(item => revealObserver.observe(item));

const navObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const current = `#${entry.target.id}`;
      navLinks.forEach(link => {
        link.classList.toggle("is-active", link.getAttribute("href") === current);
      });
    });
  },
  { threshold: 0.5 }
);

sections.forEach(section => navObserver.observe(section));

if (menuToggle && mobileNav) {
  menuToggle.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    mobileNav.classList.toggle("is-open", !open);
    body.classList.toggle("nav-open", !open);
  });
}

mobileLinks.forEach(link => {
  link.addEventListener("click", () => {
    mobileNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    body.classList.remove("nav-open");
  });
});

if (detailToggle && timelineFeature) {
  detailToggle.addEventListener("click", () => {
    const open = timelineFeature.classList.toggle("is-open");
    detailToggle.setAttribute("aria-expanded", String(open));
    detailToggle.textContent = open ? "Close detail drawer" : "Open detail drawer";
  });
}

if (cursor) {
  window.addEventListener("mousemove", event => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  });

  interactiveItems.forEach(item => {
    item.addEventListener("mouseenter", () => cursor.classList.add("is-hovering"));
    item.addEventListener("mouseleave", () => cursor.classList.remove("is-hovering"));
  });
}

window.addEventListener("scroll", updateProgress);

if (portrait) {
  window.addEventListener("scroll", () => {
    const offset = window.scrollY * 0.06;
    portrait.style.transform = `translateY(${offset}px)`;
  });
}

const openProjectPanel = (panel, event) => {
  const href = panel?.dataset?.href;
  if (!href) return;

  if (event?.target?.closest("a, button, input, textarea, select, label")) return;

  const selectedText = window.getSelection?.()?.toString?.() ?? "";
  if (selectedText.trim()) return;

  const useNewTab = panel.dataset.newTab === "true";
  if (useNewTab) {
    window.open(href, "_blank", "noopener,noreferrer");
  } else {
    window.location.href = href;
  }
};

projectPanels.forEach(panel => {
  panel.addEventListener("click", event => {
    if (event.button !== 0) return;
    openProjectPanel(panel, event);
  });

  panel.addEventListener("keydown", event => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openProjectPanel(panel, event);
  });
});

if (contactForm) {
  const submitButton = contactForm.querySelector('button[type="submit"]');
  let isSubmitting = false;
  const defaultButtonHtml = submitButton ? submitButton.innerHTML : "";

  contactForm.addEventListener("submit", async event => {
    event.preventDefault();
    if (isSubmitting) return;

    const endpoint = contactForm.getAttribute("action") || "";
    if (!endpoint) {
      if (submitButton) {
        submitButton.textContent = "Missing endpoint";
        window.setTimeout(() => {
          submitButton.innerHTML = defaultButtonHtml || "Send Message";
        }, 1400);
      }
      return;
    }

    isSubmitting = true;
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    try {
      const formData = new FormData(contactForm);
      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Formspree error: ${response.status}`);
      }

      contactForm.reset();
      if (submitButton) {
        submitButton.textContent = "Message sent";
      }

      window.setTimeout(() => {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = defaultButtonHtml || "Send Message";
        }
      }, 2200);
    } catch {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Try again";
        window.setTimeout(() => {
          submitButton.innerHTML = defaultButtonHtml || "Send Message";
        }, 1600);
      }
    } finally {
      isSubmitting = false;
    }
  });
}

window.addEventListener("load", () => {
  updateProgress();
  window.setTimeout(() => {
    loader.classList.add("is-hidden");
    body.classList.remove("is-loading");
    body.classList.add("is-ready");
  }, 450);
});

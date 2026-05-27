// SMK Ventures:page bootstrap

// --- Vanta.js HALO background (purple base, black bg) ---
window.addEventListener("DOMContentLoaded", () => {
    if (window.VANTA && window.VANTA.HALO) {
        window.VANTA.HALO({
            el: "#vanta-bg",
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            baseColor: 0x9950DC,
            backgroundColor: 0x000000,
            amplitudeFactor: 1.0,
            size: 1.2,
        });
    }

    // Footer year
    const y = document.getElementById("footer-year");
    if (y) y.textContent = new Date().getFullYear();

    // Active nav-link highlight on scroll
    const links = document.querySelectorAll(".nav-link");
    const sections = ["home", "about", "contact"]
        .map((id) => document.getElementById(id))
        .filter(Boolean);

    const setActive = (id) => {
        links.forEach((l) => {
            l.classList.toggle(
                "active",
                l.getAttribute("href") === `#${id}`
            );
        });
    };

    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) setActive(e.target.id);
            });
        },
        { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));

    // Soft glow that follows the cursor inside each feature card
    document.querySelectorAll(".feature-card").forEach((card) => {
        const glow = card.querySelector(".visual-glow");
        if (!glow) return;
        const visual = card.querySelector(".feature-visual");
        card.addEventListener("mousemove", (e) => {
            const r = visual.getBoundingClientRect();
            const mx = ((e.clientX - r.left) / r.width) * 100;
            const my = ((e.clientY - r.top) / r.height) * 100;
            glow.style.setProperty("--mx", `${mx}%`);
            glow.style.setProperty("--my", `${my}%`);
        });
    });

    // --- Custom smooth scroll (easeInOutCubic, ~1.2s) for in-page anchors ---
    const easeInOutCubic = (t) =>
        t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    function smoothScrollTo(targetY, duration = 1200) {
        const startY = window.scrollY;
        const distance = targetY - startY;
        if (Math.abs(distance) < 1) return;
        const startTime = performance.now();
        function step(now) {
            const t = Math.min((now - startTime) / duration, 1);
            window.scrollTo(0, startY + distance * easeInOutCubic(t));
            if (t < 1) requestAnimationFrame(step);
        }
        // Disable native smooth-scroll for the duration of this animation
        const htmlEl = document.documentElement;
        const prev = htmlEl.style.scrollBehavior;
        htmlEl.style.scrollBehavior = "auto";
        requestAnimationFrame(step);
        setTimeout(() => { htmlEl.style.scrollBehavior = prev; }, duration + 50);
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
            const id = a.getAttribute("href").slice(1);
            if (!id) return;
            const target = document.getElementById(id);
            if (!target) return;
            e.preventDefault();
            smoothScrollTo(target.getBoundingClientRect().top + window.scrollY);
        });
    });

    // --- Progressive darken: opacity goes 0 → 1 as you scroll into contact ---
    const darken = document.getElementById("bg-darken");
    const contact = document.getElementById("contact");

    function updateDarken() {
        if (!darken) return;
        const vh = window.innerHeight;
        // Start darkening near the bottom of hero, fully dark when the
        // contact section's top reaches roughly the viewport center.
        const fadeStart = vh * 0.6;         // px scrolled
        let ratio;
        if (contact) {
            const cTop = contact.getBoundingClientRect().top + window.scrollY;
            const fadeEnd = cTop - vh * 0.35;
            ratio = (window.scrollY - fadeStart) / Math.max(fadeEnd - fadeStart, 1);
        } else {
            const max = document.documentElement.scrollHeight - vh;
            ratio = (window.scrollY - fadeStart) / Math.max(max - fadeStart, 1);
        }
        const clamped = Math.max(0, Math.min(1, ratio));
        darken.style.setProperty("--d", clamped.toFixed(3));
    }

    let scrollTick = false;
    window.addEventListener("scroll", () => {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(() => {
            updateDarken();
            scrollTick = false;
        });
    });
    window.addEventListener("resize", updateDarken);
    updateDarken();

    // --- Contact modal ---
    const modal = document.getElementById("contact-modal");
    const openContact = () => {
        if (!modal) return;
        modal.hidden = false;
        // Next frame so the transition runs
        requestAnimationFrame(() => {
            modal.classList.add("open");
            darken && darken.style.setProperty("--m", "1");
            document.body.classList.add("modal-open");
        });
    };
    const closeContact = () => {
        if (!modal) return;
        modal.classList.remove("open");
        darken && darken.style.setProperty("--m", "0");
        document.body.classList.remove("modal-open");
        setTimeout(() => { modal.hidden = true; }, 350);
    };

    document.querySelectorAll("[data-open-contact]").forEach((b) =>
        b.addEventListener("click", openContact)
    );
    document.querySelectorAll("[data-close-contact]").forEach((b) =>
        b.addEventListener("click", closeContact)
    );
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && modal && !modal.hidden) closeContact();
    });

    const contactForm = modal && modal.querySelector(".contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault(); // backend not wired up yet
        });
    }
});

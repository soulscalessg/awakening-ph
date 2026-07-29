"use client";

import Link from "next/link";
import { FormEvent, Fragment, ReactNode, useEffect, useMemo, useState } from "react";
import {
  BuildingIcon,
  CalendarIcon,
  FacebookIcon,
  LoginIcon,
  MapPinIcon,
  ScheduleCalendarIcon,
  SidebarToggleIcon,
  TicketIcon,
} from "./AwakeningIcons";

type Page =
  | "home"
  | "schedules"
  | "registration"
  | "login"
  | "organizations"
  | "community";

type PublicSchedule = {
  id: string;
  event_at: string;
  venue: string;
  city?: string | null;
  capacity?: number | null;
  status: string;
};

const fallbackSchedules: PublicSchedule[] = [
  { id: "aug-15-manila", event_at: "2026-08-15T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled" },
  { id: "sep-19-manila", event_at: "2026-09-19T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled" },
  { id: "oct-10-manila", event_at: "2026-10-10T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled" },
  { id: "nov-21-manila", event_at: "2026-11-21T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled" },
  { id: "dec-05-manila", event_at: "2026-12-05T09:00:00+08:00", venue: "House of Transformation, Ayala the 30th, Pasig", city: "Manila", status: "scheduled" },
];

function formatScheduleDate(eventAt: string, includeWeekday = true) {
  return new Intl.DateTimeFormat("en-PH", {
    ...(includeWeekday ? { weekday: "long" as const } : {}),
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(new Date(eventAt));
}

function scheduleOptionLabel(schedule: PublicSchedule) {
  const place = schedule.city || schedule.venue;
  return `${formatScheduleDate(schedule.event_at, false)} · ${place}`;
}

function usePublicSchedules() {
  const [schedules, setSchedules] = useState<PublicSchedule[]>(fallbackSchedules);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/public-schedules", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Schedules unavailable");
        const result = (await response.json()) as { data?: PublicSchedule[] };
        if (active && result.data?.length) {
          setSchedules(result.data);
          setLive(true);
        }
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  return { schedules, live };
}

function AmbientLights() {
  return (
    <div className="ambient-lights" aria-hidden="true">
      <span /><span /><span /><span /><span />
    </div>
  );
}

function Shell({
  active,
  children,
  initialLoading = false,
}: {
  active?: Page;
  children: ReactNode;
  initialLoading?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className={`site-shell ${initialLoading ? "is-initial-loading" : ""}`}>
      <AmbientLights />
      <header className="topbar">
        <button
          className="mobile-menu"
          type="button"
          aria-label="Toggle sidebar"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">Toggle sidebar</span>
          <SidebarToggleIcon />
        </button>
        <Link className="brand" href="/" aria-label="Awakening home">
          <img src="/awakening/logo-transparent-2026.png" alt="Awakening" />
        </Link>
        <Link className="login-pill" href="/login">
          <span className="login-icon"><LoginIcon /></span>
          <span>Log In</span>
        </Link>
      </header>

      <aside className={`sidebar ${menuOpen ? "is-open" : ""}`}>
        <nav aria-label="Main navigation">
          <Link
            className={active === "schedules" ? "active" : ""}
            href="/latest-schedules"
          >
            <span className="nav-icon"><CalendarIcon /></span>
            <span className="nav-label">Latest Schedules</span>
          </Link>
          <Link
            className={active === "registration" ? "active" : ""}
            href="/registration"
          >
            <span className="nav-icon"><TicketIcon /></span>
            <span className="nav-label">Secure My Slot</span>
          </Link>
          <Link
            className={active === "organizations" ? "active" : ""}
            href="/awakening-for-organizations"
          >
            <span className="nav-icon"><BuildingIcon /></span>
            <span className="nav-label">Awakening For Organizations</span>
          </Link>
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <img src="/awakening/logo-transparent-2026.png" alt="Awakening" />
          <p>Philippines as a FIRST-WORLD country.</p>
        </div>
        <ul className="socials" aria-label="Social media">
          <li><a href="https://www.facebook.com/search/top?q=Awakened%20Nation" target="_blank" rel="noreferrer" aria-label="Awakened Nation on Facebook"><FacebookIcon /></a></li>
        </ul>
      </div>
    </footer>
  );
}

function HomePage() {
  const carouselImages = [
    "/awakening/carousel/facilitator.jpeg",
    "/awakening/carousel/community.jpeg",
    "/awakening/carousel/audience.jpeg",
    "/awakening/carousel/group-hug.jpeg",
    "/awakening/carousel/emotional-hug.jpeg",
    "/awakening/carousel/full-community.jpeg",
    "/awakening/carousel/flag.jpeg",
  ];
  const partnerImages = [
    ["/awakening/partners/play-club.jpeg", "Pink Play Club"],
    ["/awakening/partners/empowerment.png", "Empowerment"],
    ["/awakening/partners/soulpreneur.png", "Soulpreneur Oasis"],
    ["/awakening/partners/aliliw.jpeg", "8 Aliliw Botanika"],
    ["/awakening/partners/metrotech.png", "Metrotech Rental Solutions"],
    ["/awakening/partners/iam-plus.png", "I Am Plus"],
    ["/awakening/partners/cyndi-kate.png", "Cyndi Kate Society"],
  ];
  const communityVideos = [
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/aa34b595-f42c-449d-8309-491c4e0a4f99.mp4",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/490d34cf-7d52-480d-9fa2-88c173352932.mp4",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/c8266825-2cb7-4c56-b158-6bf0f0864f89.mp4",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/0a34890f-a3c9-4069-9a09-c715cf1813c5.mp4",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/c713ce2c-0759-4551-9bb1-882b2be72f85.qt",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/1ed840a4-b86f-479c-8c78-76c54dc3996d.qt",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/da058278-4dfc-4c36-bd5d-88d0c1dd4a1a.qt",
    "https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/ec5d8d82-650f-48a6-90d5-58e58335e0aa.mp4",
  ];
  const { schedules: publicSchedules } = usePublicSchedules();
  const nextSchedule = publicSchedules[0];
  const [activeSlide, setActiveSlide] = useState(4);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [introVisible, setIntroVisible] = useState(true);
  const [countdown, setCountdown] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveSlide((slide) => (slide + 1) % carouselImages.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [carouselImages.length]);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const root = document.documentElement;

    if (!reducedMotion) root.classList.add("awakening-intro-lock");

    const contentTimer = window.setTimeout(
      () => setInitialLoadComplete(true),
      reducedMotion ? 0 : 650,
    );
    const introTimer = window.setTimeout(
      () => {
        setIntroVisible(false);
        root.classList.remove("awakening-intro-lock");
      },
      reducedMotion ? 80 : 2450,
    );

    return () => {
      window.clearTimeout(contentTimer);
      window.clearTimeout(introTimer);
      root.classList.remove("awakening-intro-lock");
    };
  }, []);

  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>(
      ".home-2026 [data-home-reveal]",
    );
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
    );

    revealElements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const nextSession = new Date(nextSchedule.event_at).getTime();
    const updateCountdown = () => {
      const remaining = Math.max(0, nextSession - Date.now());
      const days = Math.floor(remaining / 86_400_000);
      const hours = Math.floor((remaining / 3_600_000) % 24);
      const minutes = Math.floor((remaining / 60_000) % 60);
      const seconds = Math.floor((remaining / 1_000) % 60);
      setCountdown({
        days: String(days).padStart(2, "0"),
        hours: String(hours).padStart(2, "0"),
        minutes: String(minutes).padStart(2, "0"),
        seconds: String(seconds).padStart(2, "0"),
      });
    };

    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timer);
  }, [nextSchedule.event_at]);

  const filmLoading = !initialLoadComplete;

  return (
    <div className="home-2026">
      {introVisible && (
        <div className="home-intro" role="status" aria-label="Awakening is opening">
          <div className="home-intro-orbit" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className="home-intro-copy">
            <span className="home-intro-kicker">A guided moment to</span>
            <img
              src="/awakening/logo-transparent-2026.png"
              alt="Awakening — The Emotional Reset Experience"
            />
            <p>Breathe in. Let go. Begin again.</p>
          </div>
          <div className="home-intro-line" aria-hidden="true"><span /></div>
          <button
            className="home-intro-skip"
            type="button"
            onClick={() => {
              setIntroVisible(false);
              setInitialLoadComplete(true);
              document.documentElement.classList.remove("awakening-intro-lock");
            }}
          >
            Skip intro
          </button>
        </div>
      )}
      <Shell active="home" initialLoading={!initialLoadComplete}>
      <section className="source-hero">
        <video
          className="source-hero-video"
          src="https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/b2e46684-6e4b-46da-baa5-c3f9b4d44879.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="source-hero-shade" />
        <div className="home-hero-aura" aria-hidden="true"><span /></div>
        <div className="home-hero-meta" aria-hidden="true">
          <span>Philippines</span><span>Emotional reset · 2026</span>
        </div>
        <div className="source-hero-inner">
          <Link className="eyebrow-link" href="/latest-schedules">
            <b>NEW</b> See our next schedules →
          </Link>
          <img
            className="hero-logo"
            src="/awakening/logo-transparent-2026.png"
            alt="Awakening — The Emotional Reset Experience"
          />
          <p>
            If you’ve been stuck, overthinking, or just surviving… this is where
            you reset.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/registration">
              Join The Next Session
            </Link>
            <Link className="button secondary" href="/be-part-of-awakening">
              Be Part of the Program
            </Link>
          </div>
        </div>
        <a className="home-scroll-cue" href="#experience">
          <span aria-hidden="true" /> Explore the experience
        </a>
      </section>

      <section className="source-film" id="experience" data-home-reveal>
        <video
          src="https://assets.softr-files.com/applications/997cb2bf-c7eb-4897-a6f9-3ffa4629c279/assets/2273d90c-8e51-4248-8f81-f81c9f164e5c.mp4"
          autoPlay
          muted
          loop
          playsInline
          aria-label="Time to feel, time to awaken"
        />
        {filmLoading && (
          <div className="source-film-loader" role="progressbar" aria-label="Loading video">
            <span className="source-loader-spinner" />
          </div>
        )}
      </section>

      <section className="source-partners" data-home-reveal>
        <p>COMMUNITY PARTNERS</p>
        <div className="source-partner-row" aria-label="Community partners">
          <div className="source-partner-track">
            {[...partnerImages, ...partnerImages].map(([src, alt], index) => (
              <img src={src} alt={alt} key={`${src}-${index}`} />
            ))}
          </div>
        </div>
      </section>

      <section className="source-countdown" data-home-reveal>
        <div className="source-countdown-shade" />
        <div className="source-countdown-content">
          <span className="home-section-kicker">Your next reset begins in</span>
          <h1>Next Schedule</h1>
          <div className="source-countdown-grid" aria-label="Countdown">
            <div><strong>{countdown.days}</strong><span>DAYS</span></div>
            <div><strong>{countdown.hours}</strong><span>HOURS</span></div>
            <div><strong>{countdown.minutes}</strong><span>MINUTES</span></div>
            <div><strong>{countdown.seconds}</strong><span>SECONDS</span></div>
          </div>
          <p>{formatScheduleDate(nextSchedule.event_at, false)} · {nextSchedule.venue}</p>
          <Link className="home-text-link" href="/registration">Reserve this date <span>↗</span></Link>
        </div>
      </section>

      <section className="source-carousel" aria-label="Awakening experience gallery" data-home-reveal>
        <div className="home-section-heading">
          <span className="home-section-kicker">Inside the experience</span>
          <h2>Real people. Real release.<br /><em>A room that moves with you.</em></h2>
        </div>
        <div className="source-carousel-frame">
          <img key={carouselImages[activeSlide]} src={carouselImages[activeSlide]} alt="Awakening experience" />
          <div className="home-gallery-index">0{activeSlide + 1} <span>/ 0{carouselImages.length}</span></div>
          <div className="home-gallery-controls">
            <button type="button" aria-label="Previous photo" onClick={() => setActiveSlide((slide) => (slide - 1 + carouselImages.length) % carouselImages.length)}>←</button>
            <button type="button" aria-label="Next photo" onClick={() => setActiveSlide((slide) => (slide + 1) % carouselImages.length)}>→</button>
          </div>
        </div>
        <div className="source-carousel-dots" aria-label="Choose gallery image">
          {carouselImages.map((image, index) => (
            <button
              type="button"
              className={activeSlide === index ? "active" : ""}
              aria-label={`Show photo ${index + 1}`}
              aria-current={activeSlide === index ? "true" : undefined}
              onClick={() => setActiveSlide(index)}
              key={image}
            />
          ))}
        </div>
      </section>

      <section className="source-programs" data-home-reveal>
        <span className="home-section-kicker">A growing ecosystem</span>
        <h2>Programs We Are Connected To</h2>
        <div className="program-grid">
          <article>
            <img src="/awakening/program-1.png" alt="Discovery" />
          </article>
          <article>
            <img src="/awakening/program-2.png" alt="Breakthrough" />
          </article>
          <article>
            <img src="/awakening/program-3.png" alt="Soulpreneur Oasis" />
          </article>
        </div>
      </section>

      <section className="source-video-grid" aria-label="Awakening community videos" data-home-reveal>
        {communityVideos.map((src) => (
          <video src={src} autoPlay muted loop playsInline key={src} />
        ))}
      </section>

      <section className="source-act-now" data-home-reveal>
        <span className="home-section-kicker">This is your moment</span>
        <h2>You already know if you need this.</h2>
        <p>The only question is: Are you going to act now?</p>
        <Link href="/registration">
          Secure My Slot
        </Link>
      </section>

      <section className="source-tickets" data-home-reveal>
        <span className="home-section-kicker">One day. A different direction.</span>
        <h2>Get Tickets To Next Session</h2>
        <div className="ticket-card">
          <div className="price">
            PHP 1,499 <small>/ ticket</small>
          </div>
          <ul>
            <li>Full-day Awakening Emotional Reset Experience</li>
            <li>Guided breakthrough and deep reflection sessions</li>
            <li>Safe, facilitated environment for real conversations</li>
            <li>Clarity and direction integration session</li>
            <li>Exclusive participant kit (notebook + wristband)</li>
          </ul>
          <Link className="source-reserve-button" href="/registration">
            Reserve My Slot Now
          </Link>
        </div>
      </section>

      <section className="source-organization" data-home-reveal>
        <div className="source-organization-card">
          <div className="source-organization-copy">
          <h2>Bring Awakening To Your Organization</h2>
          <p>Everything you need to bring your ideas to life.</p>
          <div className="button-row">
            <Link className="button primary" href="/awakening-for-organizations">
              Bring This To My Team
            </Link>
            <a
              className="button secondary"
              href="https://www.messenger.com/t/1036694216194763"
            >
              Talk To Us
            </a>
          </div>
          </div>
          <img src="/awakening/cta-grid.svg" alt="" />
        </div>
      </section>

      <section className="source-join" data-home-reveal>
        <h2>How Do You Want To Be Part Of Awakening?</h2>
        <p>
          Whether you want to serve, partner, support, or bring this to your team
          there’s a place for you here.
        </p>
        <Link href="/be-part-of-awakening">
          Learn More
        </Link>
      </section>

      <Footer />
      </Shell>
    </div>
  );
}

function SchedulesPage() {
  const { schedules, live } = usePublicSchedules();

  return (
    <Shell active="schedules">
      <section className="schedules-page">
        <div className="schedule-glow violet" />
        <div className="schedule-glow blue" />
        <div className="schedules-content">
          <header className="schedules-heading">
            <span className="schedules-live-state"><i />{live ? "Live schedule" : "Upcoming schedule"}</span>
            <h1>Awakening: An Emotional Reset Experience</h1>
            <p>
              Join us for a powerful reset that breaks old patterns and moves
              you forward.
            </p>
          </header>
          <div className="schedule-list">
            {schedules.map((schedule, index) => (
              <article
                className="schedule-card"
                key={schedule.id}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="schedule-card-wash" />
                <div className="schedule-card-content">
                  <div className="schedule-detail">
                    <div className="schedule-icon calendar">
                      <ScheduleCalendarIcon />
                    </div>
                    <div>
                      <span>Date &amp; Time</span>
                      <strong>{formatScheduleDate(schedule.event_at)}</strong>
                    </div>
                  </div>
                  <div className="schedule-detail">
                    <div className="schedule-icon map-pin">
                      <MapPinIcon />
                    </div>
                    <div>
                      <span>Venue</span>
                      <strong>{schedule.venue}</strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </Shell>
  );
}

function RegistrationProgress({ step }: { step: number }) {
  const labels = ["Ticket", "Details", "Payment", "Confirm"];
  return (
    <ol className="source-progress" aria-label="Registration progress">
      {labels.map((label, index) => {
        const number = index + 1;
        const complete = step > number;
        const active = step === number;
        return (
        <Fragment key={label}>
        {index > 0 && <span className={`source-progress-line ${step >= number ? "is-complete" : ""}`} aria-hidden="true" />}
        <li
          className={`${complete ? "is-complete" : ""} ${active ? "is-active" : ""}`}
          aria-current={active ? "step" : undefined}
        >
          <span className="source-progress-marker">
            {complete ? <span className="source-check">✓</span> : number}
          </span>
          <small>{label}</small>
        </li>
        </Fragment>
      )})}
    </ol>
  );
}

function RegistrationPage() {
  const { schedules: publicSchedules } = usePublicSchedules();
  const [step, setStep] = useState(1);
  const [schedule, setSchedule] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState<"gcash" | "bank" | "">("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = useMemo(() => 1499 * quantity, [quantity]);

  function advanceTo(nextStep: number) {
    setError("");
    setScheduleOpen(false);
    setStep(nextStep);
  }

  async function confirmRegistration() {
    if (!referenceNumber.trim() || !proofFile) {
      setError("Please complete all payment fields");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const response = await fetch("/api/public-registration", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          event_date: schedule,
          quantity,
          total_amount: total,
          payment_method: method,
          payment_reference: referenceNumber,
          payment_proof_name: proofFile.name,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to submit your registration.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to submit right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="registration-2026">
      <Shell active="registration">
      <main className="source-registration">
        <section className="source-registration-hero">
          <div className="source-registration-hero-glow" aria-hidden="true" />
          <div className="registration-orbit" aria-hidden="true"><span /><span /></div>
          <div className="registration-hero-meta" aria-hidden="true">
            <span>Awakening Philippines</span>
            <span>Guided registration · 01—04</span>
          </div>
          <div className="source-registration-hero-content">
            <span className="source-registration-kicker"><span aria-hidden="true">✣</span> Your reset starts here</span>
            <img src="/awakening/logo-transparent-2026.png" alt="Awakening — The Emotional Reset Experience" />
            <h1>Reserve your place in the room.</h1>
            <p>A thoughtful four-step path from choosing your date to confirming your seat.</p>
          </div>
        </section>

        <div className="source-progress-wrap">
          <div className="registration-progress-label">
            <span>Registration journey</span>
            <strong>{submitted ? "Complete" : `Step ${step} of 4`}</strong>
          </div>
          <RegistrationProgress step={submitted ? 5 : step} />
        </div>

        <section className="source-registration-content">
          <aside className="registration-ticket-panel">
            <div className="registration-ticket-brand">
              <span>AWAKENING / ADMIT ONE</span>
              <b aria-hidden="true">✣</b>
            </div>
            <div className="registration-ticket-copy">
              <small>Your invitation to</small>
              <h2>Pause.<br /><em>Feel.</em><br />Begin again.</h2>
              <p>One guided day in a safe room built for honest reflection, release, and renewed direction.</p>
            </div>
            <dl className="registration-ticket-details">
              <div><dt>Session</dt><dd>{schedule || "Choose your date"}</dd></div>
              <div><dt>Guests</dt><dd>{quantity} {quantity === 1 ? "ticket" : "tickets"}</dd></div>
              <div><dt>Total</dt><dd>PHP {total.toLocaleString("en-PH")}</dd></div>
            </dl>
            <div className="registration-ticket-footer">
              <span>Secure registration</span>
              <span aria-hidden="true">PH · 2026</span>
            </div>
          </aside>

          <div className="registration-form-stage" key={submitted ? "complete" : step}>
          {!submitted && step === 1 && (
            <article className="source-form-card source-ticket-card">
              <div className="source-form-inner">
                <header className="source-form-heading">
                  <h2>Choose Your Experience</h2>
                  <p>Select your preferred date and number of tickets</p>
                </header>

                <div className="source-field source-select-field">
                  <label id="event-date-label">Event Date &amp; Location</label>
                  <div className="source-select-wrap">
                    <button
                      type="button"
                      className="source-select-trigger"
                      role="combobox"
                      aria-labelledby="event-date-label"
                      aria-expanded={scheduleOpen}
                      aria-controls="registration-date-options"
                      onClick={() => setScheduleOpen((open) => !open)}
                    >
                      <span>{schedule ? `🇵🇭 ${schedule} — PHP 1,499` : "Select your preferred date"}</span>
                      <span className="source-chevron" aria-hidden="true">⌄</span>
                    </button>
                    {scheduleOpen && (
                      <div className="source-select-menu" id="registration-date-options" role="listbox">
                        {publicSchedules.map((item) => {
                          const option = scheduleOptionLabel(item);
                          return (
                          <button
                            type="button"
                            role="option"
                            aria-selected={schedule === option}
                            className={schedule === option ? "is-selected" : ""}
                            key={option}
                            onClick={() => {
                              setSchedule(option);
                              setScheduleOpen(false);
                            }}
                          >
                            🇵🇭 {option} — PHP 1,499
                            {schedule === option && <span aria-hidden="true">✓</span>}
                          </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="source-ticket-summary">
                  <div className="source-ticket-top">
                    <div className="source-ticket-price">
                      <span>Price per ticket</span>
                      <strong>PHP 1499.00</strong>
                    </div>
                    <div className="source-quantity-row">
                      <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</button>
                      <div><span>Quantity</span><strong>{quantity}</strong></div>
                      <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => value + 1)}>+</button>
                    </div>
                  </div>
                  <div className="source-total-row">
                    <span>Total Amount</span>
                    <strong>PHP {total.toFixed(2)}</strong>
                  </div>
                </div>

                <button type="button" className="source-primary-button source-full-button" disabled={!schedule || quantity < 1} onClick={() => advanceTo(2)}>
                  Continue to Details
                </button>
              </div>
            </article>
          )}

          {!submitted && step === 2 && (
            <article className="source-form-card source-details-card">
              <div className="source-form-inner">
                <header className="source-form-heading">
                  <h2>Your Information</h2>
                  <p>We&apos;ll use this to send your confirmation</p>
                </header>
                <div className="source-input-stack">
                  <label className="source-field">Full Name *<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Juan Dela Cruz" /></label>
                  <label className="source-field">Email Address *<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="juan@example.com" /></label>
                  <label className="source-field">Contact Number *<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+63 912 345 6789" /></label>
                </div>
                <div className="source-form-actions">
                  <button type="button" className="source-secondary-button" onClick={() => advanceTo(1)}>Back</button>
                  <button type="button" className="source-primary-button" disabled={!name || !email || !phone} onClick={() => advanceTo(3)}>Continue to Payment</button>
                </div>
              </div>
            </article>
          )}

          {!submitted && step === 3 && (
            <article className="source-form-card source-payment-card">
              <div className="source-form-inner">
                <header className="source-form-heading">
                  <h2>Choose Payment Method</h2>
                  <p>Scan the QR code to complete your payment</p>
                </header>
                <div className="source-payment-grid">
                  <button type="button" className={method === "gcash" ? "is-selected" : ""} onClick={() => setMethod("gcash")}>
                    {method === "gcash" && <span className="source-payment-check" aria-hidden="true">✓</span>}
                    <span className="source-qr-frame"><img src="/awakening/gcash-payment-qr.png" alt="GCash QR Code" /></span>
                    <strong>GCash</strong><small>Scan to Pay</small>
                  </button>
                  <button type="button" className={method === "bank" ? "is-selected" : ""} onClick={() => setMethod("bank")}>
                    {method === "bank" && <span className="source-payment-check" aria-hidden="true">✓</span>}
                    <span className="source-qr-frame"><img src="/awakening/bank-transfer-qr.png" alt="Bank Transfer QR Code" /></span>
                    <strong>Bank Transfer</strong><small>Enter Bank Details</small>
                  </button>
                </div>
                <div className="source-form-actions">
                  <button type="button" className="source-secondary-button" onClick={() => advanceTo(2)}>Back</button>
                  <button type="button" className="source-primary-button" disabled={!method} onClick={() => advanceTo(4)}>I&apos;ve Paid</button>
                </div>
              </div>
            </article>
          )}

          {!submitted && step === 4 && (
            <div className="source-confirm-stack">
              <article className="source-form-card source-scan-card">
                <div className="source-form-inner">
                  <header className="source-form-heading source-centered-heading"><h2>Haven&apos;t paid yet? Scan or Enter Details</h2></header>
                  <div className="source-mini-qr-grid">
                    <div><span className="source-mini-qr"><img src="/awakening/gcash-payment-qr.png" alt="GCash QR Code" /></span><strong>GCash</strong></div>
                    <div><span className="source-mini-qr"><img src="/awakening/bank-transfer-qr.png" alt="Bank Transfer QR Code" /></span><strong>Bank Transfer</strong></div>
                  </div>
                  <p className="source-pay-total">Total to pay: <strong>PHP {total.toFixed(2)}</strong></p>
                </div>
              </article>

              <article className="source-form-card source-summary-card">
                <div className="source-form-inner">
                  <header className="source-form-heading"><h2>Registration Summary</h2></header>
                  <div className="source-summary-list">
                    <div><span>Name</span><strong>{name}</strong></div>
                    <div><span>Email</span><strong>{email}</strong></div>
                    <div><span>Contact</span><strong>{phone}</strong></div>
                    <div><span>Event Date</span><strong>{schedule}</strong></div>
                    <div><span>Quantity</span><strong>{quantity} ticket(s)</strong></div>
                    <div className="source-summary-total"><span>Total Amount</span><strong>PHP {total.toFixed(2)}</strong></div>
                  </div>
                </div>
              </article>

              <article className="source-form-card source-proof-card">
                <div className="source-form-inner">
                  <header className="source-form-heading">
                    <h2>Submit Payment Proof</h2>
                    <p>Upload your payment confirmation to complete registration</p>
                  </header>
                  <div className="source-proof-tip">💡 Make sure your reference number matches your payment receipt to avoid delays</div>
                  <div className="source-input-stack">
                    <label className="source-field">Reference Number *<input value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} placeholder="Enter your payment reference number" /></label>
                    <label className="source-field source-file-field">Proof of Payment *<input type="file" accept="image/*" onChange={(event) => setProofFile(event.target.files?.[0] ?? null)} /></label>
                  </div>
                  {error && <div className="source-error" role="alert">{error}</div>}
                  <div className="source-form-actions">
                    <button type="button" className="source-secondary-button" onClick={() => advanceTo(3)}>Back</button>
                    <button type="button" className="source-primary-button" disabled={submitting} onClick={() => void confirmRegistration()}>{submitting ? "Saving Registration…" : "Confirm Registration"}</button>
                  </div>
                  <p className="source-verification-note">Your slot will be confirmed after payment verification</p>
                </div>
              </article>
            </div>
          )}

          {submitted && (
            <article className="source-form-card source-success-card">
              <div className="source-form-inner">
                <div className="source-success-icon" aria-hidden="true">✓</div>
                <h2>Registration Submitted!</h2>
                <p>Your registration has been received successfully.</p>
                <p>Please wait for confirmation. We&apos;ll review your payment and confirm your slot.</p>
              </div>
            </article>
          )}
          </div>
        </section>
      </main>
      </Shell>
    </div>
  );
}

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/platform-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to log in.");
        return;
      }

      const requestedPath = new URLSearchParams(window.location.search).get("next");
      window.location.href = requestedPath?.startsWith("/platform")
        ? requestedPath
        : "/platform";
    } catch {
      setError("Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Shell active="login">
      <section className="login-page">
        <form className="login-card" onSubmit={submit}>
          <span className="source-login-logo-space" aria-hidden="true" />

          <header className="source-login-heading">
            <h1>Operations Platform</h1>
            <p>Authorized access only</p>
          </header>
          <label>
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
              autoFocus
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="source-login-error" role="alert">{error}</p>}

          <button className="source-login-submit" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </Shell>
  );
}

function OrganizationsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function submitOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/public-organization-application", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          business_name: data.get("business_name"),
          industry: data.get("industry"),
          employee_count: data.get("employee_count"),
          discovery_source: data.get("discovery_source"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(result.error ?? "Unable to send your inquiry right now.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Unable to send your inquiry right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="organization-2026">
      <Shell active="organizations">
        <main className="organization-business-page">
          <section className="organization-business-hero">
            <div className="organization-business-image" aria-hidden="true">
              <img src="/awakening/carousel/full-community.jpeg" alt="" />
            </div>
            <div className="organization-business-shade" />
            <div className="organization-business-copy">
              <span className="home-section-kicker">Awakening for organizations</span>
              <h1>Bring the reset<br /><em>into your workplace.</em></h1>
              <p>A facilitated emotional reset for founders, leadership teams, and organizations ready to create healthier conversations and clearer direction.</p>
              <div className="organization-business-points">
                <span>Leadership alignment</span><span>Team connection</span><span>Culture reset</span>
              </div>
            </div>
          </section>

          <section className="organization-inquiry-section">
            <div className="organization-inquiry-intro">
              <span className="home-section-kicker">Start the conversation</span>
              <h2>Tell us about your organization.</h2>
              <p>Share a few details and the Awakening team will contact you to explore the right experience for your people.</p>
              <div className="organization-process">
                <div><b>01</b><span>Tell us about your team</span></div>
                <div><b>02</b><span>We shape the right format</span></div>
                <div><b>03</b><span>Bring Awakening to your people</span></div>
              </div>
            </div>

            {submitted ? (
              <div className="organization-form-card organization-form-success" role="status">
                <span aria-hidden="true">✓</span>
                <h2>Your inquiry is with us.</h2>
                <p>The Awakening team will review your organization details and reach out to continue the conversation.</p>
                <Link href="/">Return to Awakening</Link>
              </div>
            ) : (
              <form className="organization-form-card" onSubmit={submitOrganization}>
                <header><span>Business inquiry</span><strong>All fields marked * are required</strong></header>
                <div className="organization-field-grid">
                  <label>Owner / CEO name *<input name="name" required placeholder="Your full name" /></label>
                  <label>Business name *<input name="business_name" required placeholder="Company or organization" /></label>
                  <label>Work email *<input name="email" type="email" required placeholder="you@company.com" /></label>
                  <label>Contact number *<input name="phone" required placeholder="+63" /></label>
                  <label>Industry<input name="industry" placeholder="Your industry" /></label>
                  <label>Team size<input name="employee_count" type="number" min="1" placeholder="Number of employees" /></label>
                </div>
                <label className="organization-wide-field">How did you hear about Awakening?
                  <select name="discovery_source" defaultValue="">
                    <option value="" disabled>Select an option</option>
                    <option>Facebook</option><option>Friend or colleague</option><option>Previous participant</option><option>Awakening event</option><option>Other</option>
                  </select>
                </label>
                {error && <p className="source-error" role="alert">{error}</p>}
                <button type="submit" disabled={submitting}>{submitting ? "Sending inquiry…" : "Start the conversation"}<span>↗</span></button>
                <small>Your information is securely saved to the Awakening operations platform.</small>
              </form>
            )}
          </section>
        </main>
        <Footer />
      </Shell>
    </div>
  );
}

function CommunityPage() {
  return (
    <Shell active="community">
      <section className="community-page">
        <div>
          <span className="section-kicker">BE PART OF AWAKENING</span>
          <h1>There’s a place for you in this movement.</h1>
          <p>
            Serve at a session, bring the experience to your team, become a
            community partner, or help someone you care about find their reset.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/registration">
              Join a Session
            </Link>
            <Link
              className="button secondary"
              href="/awakening-for-organizations"
            >
              Bring It To My Team
            </Link>
          </div>
        </div>
      </section>
      <section className="community-gallery">
        <img src="/awakening/gallery-1.jpeg" alt="Awakening session" />
        <img src="/awakening/gallery-2.jpeg" alt="Awakening community" />
        <img src="/awakening/gallery-3.jpeg" alt="Awakening reflection" />
      </section>
      <Footer />
    </Shell>
  );
}

export function AwakeningApp({ page }: { page: Page }) {
  if (page === "home") return <HomePage />;
  if (page === "schedules") return <SchedulesPage />;
  if (page === "registration") return <RegistrationPage />;
  if (page === "login") return <LoginPage />;
  if (page === "organizations") return <OrganizationsPage />;
  return <CommunityPage />;
}

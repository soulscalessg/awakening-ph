import assert from "node:assert/strict";
import test from "node:test";

const applicationRoot = new URL("../", import.meta.url);

async function render(pathname = "/", init = {}) {
  const workerUrl = new URL("dist/server/index.js", applicationRoot);
  workerUrl.searchParams.set(
    "test",
    `${pathname.replaceAll("/", "-")}-${process.pid}-${Date.now()}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost"), {
      headers: { accept: "text/html", ...init.headers },
      ...init,
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

async function renderedHtml(pathname) {
  const response = await render(pathname);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  return response.text();
}

test("server-renders the finished Awakening home page and metadata", async () => {
  const html = await renderedHtml("/");

  assert.match(
    html,
    /<title>Awakening PH — The Emotional Reset Experience<\/title>/i,
  );
  assert.match(html, /If you’ve been stuck, overthinking, or just surviving/);
  assert.match(html, /Join The Next Session/);
  assert.match(html, /Get Tickets To Next Session/);
  assert.match(html, /\/og-awakening\.png/);
  assert.match(
    html,
    /rel="canonical" href="https:\/\/awakening-ph-official\.soulscalegroup\.workers\.dev\/"/i,
  );
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /Awakening Philippines/);
  assert.match(html, /<html lang="en-PH"/i);
  assert.match(html, /<h1[^>]*>Awakening PH — The Emotional Reset Experience<\/h1>/i);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("publishes crawl directives and a public-only sitemap", async () => {
  const robotsResponse = await render("/robots.txt", {
    headers: { accept: "text/plain" },
  });
  assert.equal(robotsResponse.status, 200);
  const robots = await robotsResponse.text();
  assert.match(robots, /Allow: \//);
  assert.match(robots, /Disallow: \/api\//);
  assert.match(robots, /Disallow: \/platform\//);
  assert.match(
    robots,
    /Sitemap: https:\/\/awakening-ph-official\.soulscalegroup\.workers\.dev\/sitemap\.xml/,
  );

  const sitemapResponse = await render("/sitemap.xml", {
    headers: { accept: "application/xml" },
  });
  assert.equal(sitemapResponse.status, 200);
  const sitemap = await sitemapResponse.text();
  assert.match(
    sitemap,
    /https:\/\/awakening-ph-official\.soulscalegroup\.workers\.dev\/latest-schedules/,
  );
  assert.match(
    sitemap,
    /https:\/\/awakening-ph-official\.soulscalegroup\.workers\.dev\/registration/,
  );
  assert.doesNotMatch(sitemap, /\/platform/);
  assert.doesNotMatch(sitemap, /\/login/);
});

test("uses unique metadata for each public conversion route", async () => {
  const routes = [
    ["/latest-schedules", /Upcoming Emotional Reset Schedules \| Awakening PH/],
    ["/registration", /Reserve Your Awakening Session \| Awakening PH/],
    ["/awakening-for-organizations", /Awakening for Organizations \| Awakening PH/],
    ["/be-part-of-awakening", /Be Part of Awakening \| Awakening PH/],
  ];

  for (const [pathname, title] of routes) {
    const html = await renderedHtml(pathname);
    assert.match(html, title);
    assert.match(
      html,
      new RegExp(`https://awakening-ph-official\\.soulscalegroup\\.workers\\.dev${pathname}`),
    );
  }
});

test("server-renders every public product route", async () => {
  const routes = [
    ["/latest-schedules", /Awakening: An Emotional Reset Experience/],
    ["/registration", /Choose Your Experience/],
    ["/login", /Operations Platform/],
    ["/awakening-for-organizations", /Bring the reset/],
    ["/be-part-of-awakening", /There’s a place for you in this movement/],
  ];

  for (const [pathname, expectedContent] of routes) {
    const html = await renderedHtml(pathname);
    assert.match(html, expectedContent);
    assert.match(html, /Latest Schedules/);
    assert.match(html, /Secure My Slot/);
  }
});

test("registration starts with an accessible ticket-selection step", async () => {
  const html = await renderedHtml("/registration");

  assert.match(html, /aria-label="Registration progress"/);
  assert.match(html, /aria-current="step"/);
  assert.match(html, /role="combobox"/);
  assert.match(html, /Select your preferred date/);
  assert.match(html, /Continue to Details/);
});

test("publishes the complete new schedule batch with international and multi-day dates", async () => {
  const html = await renderedHtml("/latest-schedules");

  for (const destination of [
    "Olongapo",
    "La Union",
    "Tarlac",
    "United Kingdom",
    "Koronadal",
    "Singapore",
    "Tagaytay",
    "Quezon",
  ]) {
    assert.match(html, new RegExp(destination));
  }
  assert.match(html, /October 26–31, 2026/);
  assert.match(html, /November 20–23, 2026/);
});

test("protects the operations platform behind the admin login", async () => {
  for (const pathname of [
    "/platform",
    "/platform/registration-center",
    "/platform/applications/organizations",
  ]) {
    const response = await render(pathname);
    assert.ok([302, 303, 307, 308].includes(response.status));
    assert.match(response.headers.get("location") ?? "", /\/login\?next=\/platform$/);
  }

  const login = await renderedHtml("/login");
  assert.match(login, /Operations Platform/);
  assert.match(login, /Authorized access only/);
  assert.match(login, /Enter your username/);
});

test("protects database APIs and fails safely before Supabase is configured", async () => {
  const protectedResponse = await render("/api/platform-data/contacts", {
    headers: { accept: "application/json" },
  });
  assert.equal(protectedResponse.status, 401);

  const registrationResponse = await render("/api/public-registration", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test Registrant",
      email: "test@example.com",
      phone: "+63 900 000 0000",
      event_date: "August 15 - Manila",
    }),
  });
  assert.equal(registrationResponse.status, 503);
  assert.match(await registrationResponse.text(), /not configured/i);

  const scheduleResponse = await render("/api/public-schedules", {
    headers: { accept: "application/json" },
  });
  assert.equal(scheduleResponse.status, 503);

  const organizationResponse = await render("/api/public-organization-application", {
    method: "POST",
    headers: { accept: "application/json", "content-type": "application/json" },
    body: JSON.stringify({
      name: "Test Business Owner",
      email: "owner@example.com",
      phone: "+63 900 000 0000",
      business_name: "Test Organization",
    }),
  });
  assert.equal(organizationResponse.status, 503);
  assert.match(await organizationResponse.text(), /not configured/i);
});

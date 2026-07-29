import assert from "node:assert/strict";
import test from "node:test";

const applicationRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("dist/server/index.js", applicationRoot);
  workerUrl.searchParams.set(
    "test",
    `${pathname.replaceAll("/", "-")}-${process.pid}-${Date.now()}`,
  );
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(new URL(pathname, "http://localhost"), {
      headers: { accept: "text/html" },
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
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
  assert.doesNotMatch(html, /codex-preview/);
});

test("server-renders every public product route", async () => {
  const routes = [
    ["/latest-schedules", /Awakening: An Emotional Reset Experience/],
    ["/registration", /Choose Your Experience/],
    ["/login", /Welcome back/],
    ["/awakening-for-organizations", /Welcome back/],
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

test("server-renders the recreated operations platform", async () => {
  const platform = await renderedHtml("/platform");
  assert.match(platform, /System Information/);
  assert.match(platform, /Hybrid/);
  assert.match(platform, /Sales &amp; Administration/);

  const registrations = await renderedHtml("/platform/registration-center");
  assert.match(registrations, /REGISTRATION CENTER/);
  assert.match(registrations, /Total Tickets Sold/);
  assert.match(registrations, /REGISTRATION MANAGER/);

  const applications = await renderedHtml("/platform/applications/organizations");
  assert.match(applications, /Awakening for Organizations Applications/);
});

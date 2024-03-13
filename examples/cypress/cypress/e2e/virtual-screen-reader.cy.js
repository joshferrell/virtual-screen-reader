/// <reference types="cypress" />

function injectVirtualScreenReader(window) {
  window.document.write(
    `<script type="module">import { virtual } from "https://unpkg.com/@guidepup/virtual-screen-reader"; window.virtual = virtual;</script>`
  );
}

function startVirtualScreenReader(cy) {
  return cy.window({ log: false }).then(async (window) => {
    await window.virtual.start({
      container: window.document.body,
      displayCursor: Cypress.browser.isHeaded,
    });
  });
}

function navigateToEndOfDocument(cy) {
  return cy.window({ log: false }).then({ timeout: 30000 }, async (window) => {
    while ((await window.virtual.lastSpokenPhrase()) !== "end of document") {
      cy.log(await window.virtual.lastSpokenPhrase());
      await window.virtual.next();
    }
  });
}

function getSpokenPhraseLog(cy) {
  return cy.window({ log: false }).then(async (window) => {
    const spokenPhraseLog = await window.virtual.spokenPhraseLog();

    return cy.wrap(spokenPhraseLog, { log: false });
  });
}

function stopVirtualScreenReader(cy) {
  return cy.window({ log: false }).then(async (window) => {
    await window.virtual.stop();
  });
}

describe("Virtual Screen Reader", () => {
  it("should match expected screen reader output for https://guidepup.dev/", () => {
    cy.visit("https://guidepup.dev/", {
      onBeforeLoad: injectVirtualScreenReader,
    });

    startVirtualScreenReader(cy);
    navigateToEndOfDocument(cy);

    getSpokenPhraseLog(cy).should("deep.equal", [
      "document",
      "region, Skip to main content",
      "navigation, Main",
      "link, Guidepup",
      "link, Docs",
      "link, API",
      "link, GitHub",
      "end of navigation, Main",
      "main",
      "region",
      "heading, Guidepup, level 1",
      "paragraph",
      "Screen reader driver for test automation",
      "end of paragraph",
      "link, Get Started",
      "end of region",
      "region",
      "heading, Reliable automation for your screen reader a11y workflows through JavaScript, level 2",
      "paragraph",
      "With Guidepup you can automate your screen reader test workflows the same you as would for mouse or keyboard based scenarios, no sweat!",
      "end of paragraph",
      "end of region",
      "region",
      "heading, Full control, level 3",
      "paragraph",
      "If VoiceOver or NVDA have a keyboard command, then Guidepup supports it.",
      "end of paragraph",
      "heading, Mirrors real user experience, level 3",
      "paragraph",
      "Assert on what users really do and hear when using screen readers.",
      "end of paragraph",
      "heading, Framework agnostic, level 3",
      "paragraph",
      "Run with Jest, with Playwright, as an independent script, no vendor lock-in.",
      "end of paragraph",
      "end of region",
      "region",
      "link, Get Started",
      "link, GitHub",
      "end of region",
      "end of main",
      "contentinfo",
      "Docs",
      "list",
      "listitem, level 1, position 1, set size 2",
      "link, Getting Started",
      "end of listitem, level 1, position 1, set size 2",
      "listitem, level 1, position 2, set size 2",
      "link, API Reference",
      "end of listitem, level 1, position 2, set size 2",
      "end of list",
      "Community",
      "list",
      "listitem, level 1, position 1, set size 2",
      "link, Twitter",
      "end of listitem, level 1, position 1, set size 2",
      "listitem, level 1, position 2, set size 2",
      "link, GitHub Issues",
      "end of listitem, level 1, position 2, set size 2",
      "end of list",
      "GitHub",
      "list",
      "listitem, level 1, position 1, set size 7",
      "link, @guidepup/guidepup",
      "end of listitem, level 1, position 1, set size 7",
      "listitem, level 1, position 2, set size 7",
      "link, @guidepup/playwright",
      "end of listitem, level 1, position 2, set size 7",
      "listitem, level 1, position 3, set size 7",
      "link, @guidepup/virtual-screen-reader",
      "end of listitem, level 1, position 3, set size 7",
      "listitem, level 1, position 4, set size 7",
      "link, @guidepup/jest",
      "end of listitem, level 1, position 4, set size 7",
      "listitem, level 1, position 5, set size 7",
      "link, @guidepup/setup",
      "end of listitem, level 1, position 5, set size 7",
      "listitem, level 1, position 6, set size 7",
      "link, guidepup/setup-action",
      "end of listitem, level 1, position 6, set size 7",
      "listitem, level 1, position 7, set size 7",
      "link, guidepup/aria-at-tests",
      "end of listitem, level 1, position 7, set size 7",
      "end of list",
      "Copyright © 2024 Craig Morten.",
      "end of contentinfo",
      "end of document",
    ]);

    stopVirtualScreenReader(cy);
  });
});

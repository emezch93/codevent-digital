// ══════════════════════════════════════════════════════════
// CODEVENT DIGITAL — ENROLLMENT LINK
// Update ONLY the line below if your Google Form link ever changes.
// Every "Start Free" button across the site reads from here.
// ══════════════════════════════════════════════════════════
const ENROLLMENT_LINK = "https://forms.gle/RkB3o7SKx1Uqan6x5";

document.querySelectorAll('[data-enroll-link]').forEach(el => {
  el.href = ENROLLMENT_LINK;
  el.target = "_blank";
  el.rel = "noopener";
});

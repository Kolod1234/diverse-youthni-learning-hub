(() => {
  const panel = document.getElementById("loading-panel");
  const progress = document.getElementById("loading-progress");
  const message = document.getElementById("loading-message");
  const status = document.querySelector('[data-testid="unity-status"]');
  const canvas = document.getElementById("unity-canvas");

  if (!panel || !progress || !message || !status || !canvas) return;

  let fallbackTimer = 0;

  const revealScienceCentre = () => {
    if (panel.hidden) return;
    status.textContent = "Ready";
    panel.hidden = true;
    canvas.focus({ preventScroll: true });
  };

  const scheduleRevealAfterCompletedLoad = () => {
    const complete = Number(progress.value) >= 0.999 || /100%/.test(message.textContent || "");
    if (!complete || fallbackTimer) return;
    fallbackTimer = window.setTimeout(revealScienceCentre, 8000);
  };

  const observer = new MutationObserver(scheduleRevealAfterCompletedLoad);
  observer.observe(progress, { attributes: true, attributeFilter: ["value"] });
  observer.observe(message, { childList: true, characterData: true, subtree: true });

  window.addEventListener("science-centre.ready", () => {
    if (fallbackTimer) window.clearTimeout(fallbackTimer);
    revealScienceCentre();
  });

  scheduleRevealAfterCompletedLoad();
})();

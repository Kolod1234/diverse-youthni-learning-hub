// Tutor checkpoint dialogue boxes are injected into lesson HTML by the
// insertTutorCheckpoints backend function. The lesson players render that
// HTML as static markup, so the interactivity is provided by this single
// document-level delegated listener. It is registered once, on import, from
// src/main.jsx so every player that renders lesson rich text gets it.

/* global document, window */
if (typeof document !== 'undefined' && !window.__tutorCheckpointInit) {
  window.__tutorCheckpointInit = true;
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('.tutor-checkpoint-option') : null;
    if (!btn) return;
    const box = btn.closest('.tutor-checkpoint');
    if (!box || box.dataset.answered === '1') return;
    box.dataset.answered = '1';
    const isRight = btn.dataset.correct === '1';
    btn.classList.add(isRight ? 'is-correct' : 'is-wrong');
    if (!isRight) {
      box
        .querySelectorAll('.tutor-checkpoint-option[data-correct="1"]')
        .forEach((el) => el.classList.add('is-reveal'));
    }
    box.querySelectorAll('.tutor-checkpoint-option').forEach((el) => {
      el.disabled = true;
    });
    const fb = box.querySelector('.tutor-checkpoint-feedback');
    if (fb) {
      fb.hidden = false;
      fb.classList.add(isRight ? 'is-correct' : 'is-wrong');
      fb.textContent = btn.dataset.feedback || '';
    }
  });
}
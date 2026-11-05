// Keyboard access for elements that act like buttons but aren't <button>s.
// Pair with role="button" tabIndex={0}: Enter or Space on the element itself fires its onClick.
// Keys pressed inside a child (e.g. typing in a field) are left alone.
export function activateOnKey(event) {
  if (event.target !== event.currentTarget) return;
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    event.currentTarget.click();
  }
}

/**
 * @param {Element} container
 * @param {string} event
 * @param {string} selector
 * @param {(ev: Event, target: Element) => void|Promise<void>} listener
 * @returns {() => void} Cleanup function
 */
export function addEventListener(container, event, selector, listener) {
  /** @param {Event & { target: Element }} ev */
  const handler = (ev) => {
    const target = get(ev.target, selector);
    if (!!target) {
      listener(ev, target);
    }
  };

  container.addEventListener(event, handler);

  return () => {
    container.removeEventListener(event, handler);
  };
}

/**
 * @param {Element} target
 * @param {string} selector
 * @returns {Element | null}
 */
function get(target, selector) {
  while (!target.matches(selector)) {
    if (!target.parentElement) {
      return null;
    }

    target = target.parentElement;
  }

  return target;
}

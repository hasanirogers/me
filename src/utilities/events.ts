export const emitEvent = (element: HTMLElement, name: string, detail: any, bubbles = true, composed = true) => {
  element.dispatchEvent(
    new CustomEvent(name, { bubbles, composed, detail }),
  );
};

// CURSOR EM ELEMENTOS CONTENTEDITABLE, COMO POSIÇÃO NO TEXTO DO ELEMENTO

export interface SelectionOffsets {
  start: number;
  end: number;
}

function offsetOf(element: Node, node: Node, offset: number): number {
  const range = document.createRange();

  range.selectNodeContents(element);
  range.setEnd(node, offset);

  return range.toString().length;
}

export function getSelectionOffsets(
  element: HTMLElement
): SelectionOffsets | null {
  const selection = window.getSelection();

  if (!selection || !selection.rangeCount) return null;

  const range = selection.getRangeAt(0);

  if (!element.contains(range.startContainer)) return null;

  return {
    start: offsetOf(element, range.startContainer, range.startOffset),
    end: offsetOf(element, range.endContainer, range.endOffset),
  };
}

export function setCaret(element: HTMLElement, offset: number): void {
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node: Text | null;

  range.selectNodeContents(element);
  range.collapse(false);

  while ((node = walker.nextNode() as Text | null)) {
    if (remaining <= node.length) {
      range.setStart(node, remaining);
      range.collapse(true);
      break;
    }

    remaining -= node.length;
  }

  const selection = window.getSelection();

  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}

export function focusAt(element: HTMLElement, offset: number): void {
  element.focus();
  setCaret(element, offset);
}

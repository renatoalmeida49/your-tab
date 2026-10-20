// CURSOR EM ELEMENTOS CONTENTEDITABLE, COMO POSIÇÃO NO TEXTO DO ELEMENTO

function offsetOf(element, node, offset) {
  const range = document.createRange();

  range.selectNodeContents(element);
  range.setEnd(node, offset);

  return range.toString().length;
}

export function getSelectionOffsets(element) {
  const selection = window.getSelection();

  if (!selection.rangeCount) return null;

  const range = selection.getRangeAt(0);

  if (!element.contains(range.startContainer)) return null;

  return {
    start: offsetOf(element, range.startContainer, range.startOffset),
    end: offsetOf(element, range.endContainer, range.endOffset),
  };
}

export function setCaret(element, offset) {
  const range = document.createRange();
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node;

  range.selectNodeContents(element);
  range.collapse(false);

  while ((node = walker.nextNode())) {
    if (remaining <= node.length) {
      range.setStart(node, remaining);
      range.collapse(true);
      break;
    }

    remaining -= node.length;
  }

  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

export function focusAt(element, offset) {
  element.focus();
  setCaret(element, offset);
}

// CONTRATO ENTRE O EDITOR (Home) E CADA PARTE DA MÚSICA (Tab, Verse, TextField)

export type Direction = "up" | "down";

export interface MoveCursorPayload {
  direction: Direction;
  index: number;
  column: number;
}

export interface NewTextFieldPayload {
  index: number;
}

export interface FocusTarget {
  direction: Direction;
  column: number;
}

// TODA PARTE SABE RECEBER O CURSOR VINDO DA PARTE DE CIMA OU DE BAIXO
export interface FocusablePart {
  focusAt(target: FocusTarget): void;
}

// emits TIPADOS: O PAYLOAD É CONFERIDO NO $emit E NO HANDLER DO Home
export const partEmits = {
  newTextField: (payload: NewTextFieldPayload) => payload.index >= 0,
  moveCursor: (payload: MoveCursorPayload) => payload.index >= 0,
};

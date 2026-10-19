<template>
  <div
    class="tab"
    contenteditable
    spellcheck="false"
    @keydown="change"
    @beforeinput="edit"
    @input="sync"
    @blur="sync"
  >
    <pre ref="pre"></pre>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { getSelectionOffsets, setCaret } from "@/core/caret";
import {
  cursorToPosition,
  eraseBackward,
  eraseForward,
  eraseRange,
  firstColumn,
  overwrite,
  pasteBlock,
  positionToCursor,
} from "@/core/tab";

function clean(text) {
  return text.replace(/^\n+|\n+$/g, "");
}

export default {
  name: "Tab",

  emits: ["newTextField", "moveCursor"],

  props: {
    partId: { type: String, required: true },
    info: { type: Object, required: true },
    songIndex: { type: Number, required: true },
  },

  mounted() {
    this.render(clean(this.info.text));
  },

  // CONTENTEDITABLE NÃO É REATIVO: ATUALIZA QUANDO O STORE MUDA POR FORA
  // (EX: DESFAZER, TROCA DE AFINAÇÃO)
  watch: {
    "info.text"(text) {
      if (clean(text) != this.text()) this.render(clean(text));
    },
  },

  methods: {
    ...mapActions("songStructure", ["updatePart"]),

    // innerText: CONTA <br> COMO QUEBRA DE LINHA (ALGUNS TECLADOS E COLAGENS
    // NATIVAS INSEREM <br> EM VEZ DE "\n")
    text() {
      return this.$refs.pre.innerText;
    },

    render(text, position) {
      this.$refs.pre.textContent = text;

      if (position != null) setCaret(this.$refs.pre, position);
    },

    save(text) {
      this.updatePart({ id: this.partId, info: { text } });
    },

    sync() {
      if (!this.$refs.pre) return;

      const text = this.text();

      // NORMALIZA PARA UM ÚNICO NÓ DE TEXTO, QUE É O QUE O CURSOR ESPERA
      if (text != this.$refs.pre.textContent) this.render(text);

      this.save(text);
    },

    selection() {
      const text = this.text();
      const offsets = getSelectionOffsets(this.$refs.pre) || {
        start: 0,
        end: 0,
      };

      return {
        text,
        ...offsets,
        cursor: positionToCursor(text, offsets.start),
      };
    },

    // TODA EDIÇÃO PASSA POR AQUI: ESCREVER SOBRESCREVE O TRAÇO, APAGAR VOLTA
    // O TRAÇO. ASSIM AS CORDAS NUNCA DESALINHAM
    edit(event) {
      const { text, start, end, cursor } = this.selection();
      const hasRange = start != end;
      let result;

      switch (event.inputType) {
        case "insertText":
        case "insertReplacementText": {
          const data = event.data || event.dataTransfer?.getData("text/plain");

          if (!data) return event.preventDefault();

          const base = hasRange
            ? eraseRange(text, start, end)
            : { text, cursor };
          result = overwrite(base.text, base.cursor, data);
          break;
        }

        case "insertFromPaste":
          result = pasteBlock(
            text,
            cursor,
            event.dataTransfer?.getData("text/plain") || ""
          );
          break;

        case "deleteContentBackward":
        case "deleteWordBackward":
          result = hasRange
            ? eraseRange(text, start, end)
            : eraseBackward(text, cursor);
          break;

        case "deleteContentForward":
        case "deleteWordForward":
          result = hasRange
            ? eraseRange(text, start, end)
            : eraseForward(text, cursor);
          break;

        case "deleteByCut":
          result = eraseRange(text, start, end);
          break;

        // COMPOSIÇÃO (TECLADOS DE CELULAR/IME) NÃO PODE SER CANCELADA: O
        // TEXTO É SALVO NO EVENTO input
        case "insertCompositionText":
          return;

        // QUEBRAS DE LINHA, ARRASTAR TEXTO, DESFAZER NATIVO...: BLOQUEADOS
        default:
          return event.preventDefault();
      }

      event.preventDefault();

      this.render(result.text, cursorToPosition(result.text, result.cursor));
      this.save(result.text);
    },

    change(event) {
      if (event.key == "Enter") {
        this.$emit("newTextField", { index: this.songIndex });

        event.preventDefault();
        return;
      }

      if (event.key != "ArrowUp" && event.key != "ArrowDown") return;

      const { text, cursor } = this.selection();
      const lastLine = text.split("\n").length - 1;
      const leaving =
        (event.key == "ArrowUp" && cursor.line == 0) ||
        (event.key == "ArrowDown" && cursor.line == lastLine);

      if (!leaving) return;

      this.$emit("moveCursor", {
        direction: event.key == "ArrowUp" ? "up" : "down",
        index: this.songIndex,
        column: cursor.column,
      });

      event.preventDefault();
    },

    // ENTRANDO PELAS SETAS: DE CIMA CAI NA PRIMEIRA CORDA, DE BAIXO NA ÚLTIMA
    focusAt({ direction, column }) {
      const text = this.text();
      const rows = text.split("\n");
      const line = direction == "down" ? 0 : rows.length - 1;
      const safeColumn = Math.max(column, firstColumn(rows[line]));

      this.$el.focus();
      setCaret(
        this.$refs.pre,
        cursorToPosition(text, { line, column: safeColumn })
      );
    },
  },
};
</script>

<template>
  <div class="text-field">
    <div
      class="text-field__input"
      ref="input"
      :id="idInputTag"
      spellcheck="false"
      @keydown="change"
      @input="sync"
      @blur="validate"
      @focus="changePlaceholder"
      role="textbox"
      contenteditable
      :placeholder="placeholder && $t(placeholder)"
    ></div>

    <!-- mousedown.prevent: CLICAR NA OPÇÃO NÃO TIRA O FOCO DO CAMPO (O blur
         FECHARIA O SELETOR ANTES DO CLIQUE) -->
    <div
      class="text-field__select"
      :class="{ show: showSelect }"
      role="listbox"
      data-pdf-hide
    >
      <p class="text-field__select-title">
        {{ $t("components.textField.insert") }}
      </p>
      <div
        v-for="(option, index) in options"
        :key="option.type"
        class="text-field__option"
        :class="{ show: index === selectedOption }"
        role="option"
        :aria-selected="index === selectedOption"
        @mouseenter="selectedOption = index"
        @mousedown.prevent="insertOption(index)"
      >
        <span class="text-field__option-icon">
          <component :is="option.icon" :size="16" />
        </span>
        <span>
          <strong>{{ $t(option.label) }}</strong>
          <small>{{ $t(option.hint) }}</small>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, type PropType } from "vue";
import { mapActions, mapState } from "pinia";
import { useSongStore } from "@/stores/song";
import { focusAt, getSelectionOffsets } from "@/core/caret";
import { partOptions } from "@/core/config/parts";
import { partEmits, type Direction, type FocusTarget } from "@/types/editor";
import type { TextInfo } from "@/types/song";

// PARTES QUE O "/" OFERECE PARA INSERIR
const options = ["tab", "verse"].map((type) =>
  partOptions.find((option) => option.type == type)!
);

export default defineComponent({
  name: "TextField",

  emits: partEmits,

  props: {
    partId: { type: String, required: true },
    // Readonly: A MÚSICA SÓ MUDA PELAS ACTIONS DO STORE
    info: { type: Object as PropType<Readonly<TextInfo>>, required: true },
    songIndex: { type: Number, required: true },
  },

  data() {
    return {
      showSelect: false,
      selectedOption: 0,
      options,
      placeholder: "",
    };
  },

  mounted() {
    this.input().innerText = this.info.text;

    if (this.focusId == this.partId) this.input().focus();

    this.input().addEventListener("paste", (event: ClipboardEvent) => {
      event.preventDefault();
      const paste = event.clipboardData?.getData("text") ?? "";

      const array = paste.split("\n");

      array.map((line, index) => {
        if (index == 0) {
          this.input().innerText = line;
          this.setText(line);
          return;
        }

        this.addContentBetweenParts({
          component: "textField",
          content: line,
          index: this.songIndex + index,
        });
      });
    });
  },

  // CONTENTEDITABLE NÃO É REATIVO: ATUALIZA QUANDO O STORE MUDA POR FORA
  watch: {
    "info.text"(text: string) {
      if (text != this.input().innerText) this.input().innerText = text;
    },
  },

  computed: {
    ...mapState(useSongStore, ["focusId"]),

    idInputTag() {
      return `input-${this.partId}`;
    },
  },

  methods: {
    ...mapActions(useSongStore, [
      "removeContent",
      "addContentBetweenParts",
      "updatePart",
    ]),

    input(): HTMLElement {
      return this.$refs.input as HTMLElement;
    },

    setText(text: string) {
      this.updatePart({ id: this.partId, info: { text } });
    },

    sync() {
      if (!this.input()) return;

      this.setText(this.input().innerText.replace(/\n$/, ""));
    },

    focusAt({ column }: FocusTarget) {
      const length = this.input().innerText.length;

      focusAt(this.input(), Math.min(column, length));
    },

    remove() {
      this.removeContent(this.songIndex);
    },

    change(event: KeyboardEvent) {
      // MOSTRAR SELECT PARA ADICIONAR PARTE
      if (event.key == "/") {
        this.showSelect = true;
        this.selectedOption = 0;

        event.preventDefault();
      }

      // ESC FECHA O SELECT
      if (event.key == "Escape" && this.showSelect) {
        this.showSelect = false;

        event.preventDefault();
      }

      // NAVEGA NO SELECT OU MOVE O CURSOR PRA CIMA/BAIXO
      if (event.key == "ArrowUp") {
        if (this.showSelect) {
          this.moveSelection(-1);
        } else {
          this.moveCursor("up");
        }

        event.preventDefault();
      }

      if (event.key == "ArrowDown") {
        if (this.showSelect) {
          this.moveSelection(1);
        } else {
          this.moveCursor("down");
        }

        event.preventDefault();
      }

      // ADICIONA NOVO TEXT FIELD
      if (event.key == "Enter") {
        if (!this.showSelect) {
          this.$emit("newTextField", { index: this.songIndex });
        } else {
          this.insertOption(this.selectedOption);
        }

        event.preventDefault();
      }

      // BACKSPACE OU DELETE
      if (event.key == "Backspace" || event.key == "Delete") {
        this.checkRemove();
      }
    },

    // O VERSO (ACORDES) ENTRA ACIMA DA LETRA; A TAB, ABAIXO
    insertOption(index: number) {
      const partToAdd = this.options[index].type;

      this.addContentBetweenParts({
        component: partToAdd,
        index: partToAdd == "verse" ? this.songIndex : this.songIndex + 1,
      });

      this.showSelect = false;
    },

    moveSelection(step: number) {
      const total = this.options.length;

      this.selectedOption = (this.selectedOption + step + total) % total;
    },

    moveCursor(direction: Direction) {
      const offsets = getSelectionOffsets(this.input());

      this.$emit("moveCursor", {
        direction,
        index: this.songIndex,
        column: offsets ? offsets.start : 0,
      });
    },

    checkRemove() {
      if (this.info.text.length == 0) {
        this.remove();
      }
    },

    changePlaceholder() {
      this.placeholder = "components.textField.placeholder";
    },

    validate() {
      this.placeholder = "";
      this.showSelect = false;
      this.sync();
    },
  },
});
</script>

<style lang="scss">
.text-field {
  width: 100%;

  &__input {
    display: flex;
    align-items: center;
    width: 100%;
    height: auto;
    padding: 3px;
    min-height: 30px;
    border: 1px solid transparent;
    border-radius: var(--radius-sm);
    white-space: pre-wrap;
    font-family: var(--font-mono);
    font-size: var(--text-mono);
    // SEM LIGADURAS: "|-" E "--" PRECISAM APARECER COMO DIGITADOS
    font-variant-ligatures: none;

    // SÓ A COR MUDA NO FOCO: UMA BORDA NOVA EMPURRARIA O TEXTO 1px
    &:focus {
      outline: none;
      border-color: var(--color-border);
    }

    &[placeholder]:empty:before {
      content: attr(placeholder);
      color: var(--color-text-subtle);
    }
  }

  &__select {
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 30;
    min-width: 260px;
    margin-top: var(--space-1);
    padding: var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    box-shadow: var(--shadow-lg);
    font-family: var(--font-ui);
    visibility: hidden;

    &.show {
      visibility: inherit;
      animation: dropdown-in var(--duration-fast) ease-out;
    }
  }

  &__select-title {
    padding: var(--space-1) var(--space-2);
    color: var(--color-text-subtle);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2);
    border-radius: var(--radius-sm);
    cursor: pointer;

    strong,
    small {
      display: block;
      line-height: 1.3;
    }

    strong {
      font-size: var(--text-sm);
    }

    small {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
    }

    &.show {
      background: var(--color-surface-hover);
    }
  }

  &__option-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    color: var(--color-accent);
  }
}
</style>

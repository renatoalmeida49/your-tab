<template>
  <div class="home">
    <div
      id="song"
      class="home__song"
      :class="{ 'home__song--selecting': selecting }"
    >
      <TabHeader />

      <VueDraggable
        :model-value="song"
        @update:model-value="moveParts"
        @start="startMove"
        handle=".song-content__move"
      >
        <SongContent
          v-for="(part, index) in song"
          :key="part.id"
          :contentIndex="index"
          :isLast="index == song.length - 1"
          :type="part.type"
          :selected="selectedParts.includes(part.id)"
        >
          <component
            :is="componentFor(part.type)"
            :ref="partRef(part.id)"
            :partId="part.id"
            :info="part.info"
            :songIndex="index"
            @newTextField="newTextField"
            @moveCursor="moveCursor"
            @join="join"
          ></component>
        </SongContent>
      </VueDraggable>

      <EmptyState v-if="!song.length" @add="addContent" />

      <!-- CLICAR ABAIXO DA ÚLTIMA PARTE CRIA UM CAMPO DE TEXTO -->
      <div v-else class="home__tail" @click="newContent"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, markRaw, nextTick } from "vue";
import { mapActions, mapState } from "pinia";
import type { SortableEvent } from "sortablejs";
import { useSongStore } from "@/stores/song";
import { useUiStore } from "@/stores/ui";
import { selectsAll } from "@/core/caret";
import {
  blocksInSpan,
  blocksToText,
  moveBlocks,
  partText,
  rangeIds,
  type VerticalSpan,
} from "@/core/blocks";
import type { Part, PartType } from "@/types/song";
import type {
  Direction,
  FocusablePart,
  JoinPayload,
  MoveCursorPayload,
  NewTextFieldPayload,
} from "@/types/editor";
import { VueDraggable } from "vue-draggable-plus";
import EmptyState from "@/components/empty-state/index.vue";
import TabHeader from "@/components/tab-header/index.vue";
import Tab from "@/components/tab/index.vue";
import Verse from "@/components/verse/index.vue";
import TextField from "@/components/text-field/index.vue";

// FORA DO data(): COMPONENTES NÃO DEVEM VIRAR OBJETOS REATIVOS NO VUE 3
const componentList: Record<PartType, unknown> = {
  tab: Tab,
  verse: Verse,
  textField: TextField,
};

// ARRASTO QUE COMEÇA FORA DAS LINHAS (MARGEM, FIM DA FOLHA): QUANTOS PIXELS
// ATÉ VIRAR SELEÇÃO, PARA UM CLIQUE TREMIDO CONTINUAR SENDO CLIQUE
const DRAG_THRESHOLD = 4;

// "FIM DA LINHA": OS focusAt LIMITAM A COLUNA AO TAMANHO DO TEXTO
const LINE_END = Number.MAX_SAFE_INTEGER;

interface Drag {
  // EM COORDENADAS DA PÁGINA (pageY): A FOLHA PODE ROLAR DURANTE O ARRASTO
  startY: number;
  // LINHA ONDE O ARRASTO COMEÇOU (null: FORA DAS LINHAS)
  index: number | null;
  // JÁ SAIU DA LINHA E VIROU SELEÇÃO DE BLOCOS?
  active: boolean;
}

function isEditable(target: HTMLElement): boolean {
  return (
    ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) ||
    target.isContentEditable
  );
}

export default defineComponent({
  name: "Home",

  components: {
    EmptyState,
    VueDraggable,
    TabHeader,
  },

  data() {
    return {
      // REFERÊNCIAS AOS COMPONENTES DAS PARTES, PARA MOVER O CURSOR ENTRE ELAS
      partRefs: markRaw({}) as Record<string, FocusablePart>,
      // PONTAS DA SELEÇÃO DE BLOCOS: ÂNCORA FIXA, head ANDA COM Shift+SETAS
      anchor: null as number | null,
      head: null as number | null,
      drag: null as Drag | null,
      selecting: false,
      // PARTE QUE A ALÇA ESTÁ ARRASTANDO
      movingId: null as string | null,
    };
  },

  computed: {
    ...mapState(useSongStore, { song: "parts" }),
    ...mapState(useUiStore, ["selectedParts", "overlayOpen"]),
  },

  mounted() {
    window.addEventListener("mousedown", this.handleMouseDown);
    window.addEventListener("keydown", this.handleSelectionKeys);
    document.addEventListener("copy", this.copySelection);
    document.addEventListener("cut", this.copySelection);
  },

  beforeUnmount() {
    window.removeEventListener("mousedown", this.handleMouseDown);
    window.removeEventListener("keydown", this.handleSelectionKeys);
    document.removeEventListener("copy", this.copySelection);
    document.removeEventListener("cut", this.copySelection);
    this.stopDrag();
    this.clearSelection();
  },

  methods: {
    ...mapActions(useSongStore, [
      "addContent",
      "addContentBetweenParts",
      "mergeWithNext",
      "removeContent",
      "removeParts",
      "setSong",
    ]),
    ...mapActions(useUiStore, ["selectParts", "clearSelection"]),

    componentFor(type: PartType) {
      return componentList[type];
    },

    partRef(id: string) {
      return (component: unknown) => {
        if (component) this.partRefs[id] = component as FocusablePart;
        else delete this.partRefs[id];
      };
    },

    focusPart(index: number, direction: Direction, column: number) {
      const target = this.song[index];

      if (target) this.partRefs[target.id].focusAt({ direction, column });
    },

    // SETAS PASSAM POR TODAS AS PARTES (TEXTO, VERSO E TAB), MANTENDO A COLUNA
    moveCursor(payload: MoveCursorPayload) {
      const step = payload.direction == "up" ? -1 : 1;

      this.focusPart(payload.index + step, payload.direction, payload.column);
    },

    newTextField(payload: NewTextFieldPayload) {
      this.addContentBetweenParts({
        component: "textField",
        index: payload.index + 1,
      });
    },

    newContent() {
      const lastIndex = this.song.length - 1;
      const last = this.song[lastIndex];

      if (last && last.type == "textField" && last.info.text == "") {
        this.removeContent(lastIndex);
        return;
      }

      this.addContent("textField");
    },

    // LINHA VAZIA SAI E O CURSOR VAI PARA A VIZINHA. ENTRE DOIS TEXTOS, A
    // LINHA DE BAIXO VAI PARA O FIM DA DE CIMA E O CURSOR FICA NA EMENDA
    async join({ direction, index }: JoinPayload) {
      const part = this.song[index];
      const backward = direction == "backward";
      const upper = backward ? index - 1 : index;
      const neighbor = this.song[backward ? index - 1 : index + 1];

      if (!partText(part)) {
        this.removeContent(index);
        await nextTick();

        if (backward) this.focusPart(index - 1, "up", LINE_END);
        else this.focusPart(index, "down", 0);
        return;
      }

      if (part.type != "textField" || neighbor?.type != "textField") return;

      const column = partText(this.song[upper]).length;

      this.mergeWithNext(upper);
      await nextTick();
      this.focusPart(upper, direction == "backward" ? "up" : "down", column);
    },

    // --- SELEÇÃO DE BLOCOS ---

    partElements(): HTMLElement[] {
      return Array.from(
        (this.$el as HTMLElement).querySelectorAll<HTMLElement>(
          "#song .song-content"
        )
      );
    },

    partIndexOf(target: HTMLElement): number | null {
      const element = target.closest<HTMLElement>("#song .song-content");
      const index = element ? this.partElements().indexOf(element) : -1;

      return index >= 0 ? index : null;
    },

    focusedIndex(): number | null {
      const active = document.activeElement as HTMLElement | null;

      return active ? this.partIndexOf(active) : null;
    },

    partSpans(): VerticalSpan[] {
      return this.partElements().map((element) => {
        const rect = element.getBoundingClientRect();

        return { top: rect.top + scrollY, bottom: rect.bottom + scrollY };
      });
    },

    selectedSong(): Part[] {
      return this.song.filter((part) => this.selectedParts.includes(part.id));
    },

    // SEM FOCO NEM SELEÇÃO DE TEXTO: O Delete APAGA OS BLOCOS, NÃO O
    // CONTEÚDO DE UM CAMPO
    select(anchor: number, head: number) {
      (document.activeElement as HTMLElement | null)?.blur();
      window.getSelection()?.removeAllRanges();

      this.anchor = anchor;
      this.head = head;
      this.selectParts(rangeIds(this.song, anchor, head));
    },

    removeSelected() {
      this.removeParts(this.selectedParts);
      this.clearSelection();
    },

    // Enter: VOLTA A EDITAR A LINHA, COM O CURSOR NO FIM
    editSelected() {
      const index = this.head ?? 0;

      this.clearSelection();
      this.focusPart(index, "down", LINE_END);
    },

    // Ctrl+A: PRIMEIRO O NAVEGADOR SELECIONA O TEXTO DA LINHA; COM ELA TODA
    // SELECIONADA (OU FORA DE QUALQUER CAMPO), SELECIONA A MÚSICA INTEIRA
    wantsAllParts(target: HTMLElement): boolean {
      if (this.selectedParts.length || target == document.body) return true;

      return (
        target.isContentEditable &&
        this.partIndexOf(target) != null &&
        selectsAll(target)
      );
    },

    handleSelectionKeys(event: KeyboardEvent) {
      if (this.overlayOpen || !this.song.length) return;

      const target = event.target as HTMLElement;
      const command = event.ctrlKey || event.metaKey;
      const key = event.key.toLowerCase();

      if (command && !event.altKey && key == "a") {
        if (!this.wantsAllParts(target)) return;

        event.preventDefault();
        this.select(0, this.song.length - 1);
        return;
      }

      // Esc NUMA LINHA SELECIONA A LINHA (O SELETOR DO "/" ABERTO FECHA ANTES)
      if (event.key == "Escape" && !this.selectedParts.length) {
        const index = this.partIndexOf(target);

        if (index == null || event.defaultPrevented) return;

        event.preventDefault();
        this.select(index, index);
        return;
      }

      if (!this.selectedParts.length) return;

      // SÓ O MODIFICADOR, OU Ctrl+C/Ctrl+X (TRATADOS NO copy/cut): MANTÉM
      if (["shift", "control", "meta", "alt"].includes(key)) return;
      if (command && (key == "c" || key == "x")) return;

      if (event.key == "Delete" || event.key == "Backspace") {
        event.preventDefault();
        this.removeSelected();
        return;
      }

      if (event.key == "ArrowUp" || event.key == "ArrowDown") {
        const step = event.key == "ArrowUp" ? -1 : 1;
        const head = Math.min(
          Math.max((this.head ?? 0) + step, 0),
          this.song.length - 1
        );

        event.preventDefault();
        this.select(event.shiftKey ? (this.anchor ?? head) : head, head);
        return;
      }

      if (event.key == "Enter") {
        event.preventDefault();
        this.editSelected();
        return;
      }

      // QUALQUER OUTRA TECLA (Esc, Ctrl+Z...) DESFAZ A SELEÇÃO
      this.clearSelection();
    },

    // OS BLOCOS COPIADOS VIRAM TEXTO DE CIFRA, QUE O COLAR RECONHECE
    copySelection(event: ClipboardEvent) {
      if (!this.selectedParts.length || !event.clipboardData) return;

      event.preventDefault();
      event.clipboardData.setData(
        "text/plain",
        blocksToText(this.selectedSong())
      );

      if (event.type == "cut") this.removeSelected();
    },

    handleMouseDown(event: MouseEvent) {
      if (event.button != 0 || this.overlayOpen) return;

      const target = event.target as HTMLElement;
      const index = this.partIndexOf(target);
      const onHandle = target.closest(".song-content__move") != null;

      // Shift+CLIQUE: SELECIONA DA LINHA ATUAL (OU DA ÂNCORA) ATÉ A CLICADA.
      // NA MESMA LINHA, SEGUE COMO SELEÇÃO DE TEXTO
      if (event.shiftKey && index != null) {
        const origin = this.selectedParts.length
          ? this.anchor
          : this.focusedIndex();

        if (onHandle || (origin != null && origin != index)) {
          event.preventDefault();
          this.select(origin ?? index, index);
          return;
        }
      }

      // A ALÇA DE UMA LINHA SELECIONADA ARRASTA A SELEÇÃO INTEIRA
      if (onHandle && this.selectedParts.includes(this.song[index!].id)) {
        return;
      }

      this.clearSelection();

      if (this.startsDrag(target)) {
        this.drag = { startY: event.pageY, index, active: false };
        window.addEventListener("mousemove", this.dragSelection);
        window.addEventListener("mouseup", this.endDrag);
      }
    },

    // DENTRO DE UMA LINHA OU NA FOLHA FORA DELAS. NÃO NOS BOTÕES DA MARGEM
    // NEM NOS CAMPOS DE TÍTULO E ARTISTA
    startsDrag(target: HTMLElement): boolean {
      if (!this.song.length || !target.closest("#song")) return false;
      if (target.closest(".song-content__gutter, .tab-header")) return false;

      return this.partIndexOf(target) != null || !isEditable(target);
    },

    dragSelection(event: MouseEvent) {
      const drag = this.drag;

      if (!drag) return;
      if (!(event.buttons & 1)) return this.endDrag();

      const spans = this.partSpans();

      // DENTRO DA LINHA ONDE COMEÇOU, É SELEÇÃO DE TEXTO NORMAL
      if (!drag.active) {
        const start = drag.index != null ? spans[drag.index] : null;
        const left = start
          ? event.pageY < start.top || event.pageY > start.bottom
          : Math.abs(event.pageY - drag.startY) > DRAG_THRESHOLD;

        if (!left) return;

        drag.active = true;
        this.selecting = true;
        (document.activeElement as HTMLElement | null)?.blur();
      }

      window.getSelection()?.removeAllRanges();

      const touched = blocksInSpan(spans, drag.startY, event.pageY);

      if (!touched.length) return this.clearSelection();

      const [first, last] = [touched[0], touched[touched.length - 1]];
      const down = event.pageY >= drag.startY;

      this.select(down ? first : last, down ? last : first);
    },

    endDrag() {
      // O CLIQUE QUE FECHA O ARRASTO NÃO CRIA CAMPO NO FIM DA FOLHA
      if (this.drag?.active) {
        const swallow = (event: MouseEvent) => event.stopPropagation();

        window.addEventListener("click", swallow, {
          capture: true,
          once: true,
        });
        setTimeout(() =>
          window.removeEventListener("click", swallow, { capture: true })
        );
      }

      this.stopDrag();
    },

    stopDrag() {
      this.drag = null;
      this.selecting = false;
      window.removeEventListener("mousemove", this.dragSelection);
      window.removeEventListener("mouseup", this.endDrag);
    },

    // --- ARRASTAR PELA ALÇA ---

    startMove(event: SortableEvent) {
      this.movingId = this.song[event.oldIndex ?? -1]?.id ?? null;
    },

    moveParts(parts: Part[]) {
      const moved = this.movingId;

      this.setSong(
        moved ? moveBlocks(this.song, parts, moved, this.selectedParts) : parts
      );
    },
  },
});
</script>

<style lang="scss">
.home {
  // A FOLHA: MESMA LARGURA E MARGENS DA PÁGINA DO PDF
  &__song {
    --gutter: 56px;

    display: flex;
    flex-direction: column;
    max-width: 800px;
    min-height: 1131px; // PROPORÇÃO A4
    margin: 0 auto;
    padding: var(--space-7) 64px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-md);

    @include tablet {
      --gutter: 32px;

      min-height: 0;
      padding: var(--space-5) var(--space-3) var(--space-5) 36px;
    }

    // ARRASTANDO SOBRE AS LINHAS: SÓ OS BLOCOS FICAM SELECIONADOS, NÃO O TEXTO
    &--selecting,
    &--selecting * {
      user-select: none;
    }
  }

  // OCUPA O RESTO DA FOLHA
  &__tail {
    flex: 1;
    min-height: 120px;
    cursor: text;
  }
}
</style>

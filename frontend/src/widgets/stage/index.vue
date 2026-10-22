<template>
  <div
    v-if="stageOpen"
    ref="stage"
    class="stage"
    data-theme="dark"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    :aria-label="$t('components.stage.title')"
    :style="{ '--stage-size': `${fontSize}px` }"
    @wheel="stopScroll"
    @touchstart="stopScroll"
  >
    <header class="stage__header">
      <h1>{{ title || $t("components.stage.untitled") }}</h1>
      <p v-if="artist">{{ artist }}</p>
      <p class="stage__meta">
        {{ $t("components.tabHeader.tone") }}: <strong>{{ tone }}</strong>
        <span aria-hidden="true">·</span>
        {{ $t("components.tabHeader.tuning") }}:
        <strong>{{ tuning.join(" ") }}</strong>
      </p>
    </header>

    <article class="stage__song">
      <template v-for="part in parts" :key="part.id">
        <pre v-if="part.type == 'verse'" class="stage__chords">{{
          part.info.chords
        }}</pre>
        <pre v-else-if="part.type == 'tab'" class="stage__tab">{{
          cleanTab(part.info.text)
        }}</pre>
        <pre v-else class="stage__text">{{ part.info.text || " " }}</pre>
      </template>

      <p v-if="!parts.length" class="stage__empty">
        {{ $t("components.stage.empty") }}
      </p>
    </article>

    <nav class="stage__controls" :aria-label="$t('components.stage.controls')">
      <TheButton variant="ghost" class="stage__close" @click="close">
        <ArrowLeft :size="16" />
        <span class="stage__label">{{ $t("components.stage.back") }}</span>
      </TheButton>

      <div class="stage__group">
        <TheButton
          variant="ghost"
          icon
          :aria-label="$t('components.tabHeader.transposeDown')"
          :title="$t('components.tabHeader.transposeDown')"
          @click="transpose(-1)"
        >
          <Minus :size="16" />
        </TheButton>
        <span class="stage__value stage__tone">{{ tone }}</span>
        <TheButton
          variant="ghost"
          icon
          :aria-label="$t('components.tabHeader.transposeUp')"
          :title="$t('components.tabHeader.transposeUp')"
          @click="transpose(1)"
        >
          <Plus :size="16" />
        </TheButton>
      </div>

      <div class="stage__group">
        <TheButton
          variant="ghost"
          icon
          class="stage__smaller"
          :aria-label="$t('components.stage.smaller')"
          :title="$t('components.stage.smaller')"
          @click="resize(-2)"
        >
          <AArrowDown :size="18" />
        </TheButton>
        <TheButton
          variant="ghost"
          icon
          class="stage__bigger"
          :aria-label="$t('components.stage.bigger')"
          :title="$t('components.stage.bigger')"
          @click="resize(2)"
        >
          <AArrowUp :size="18" />
        </TheButton>
      </div>

      <div class="stage__group">
        <TheButton
          variant="ghost"
          icon
          :aria-label="$t('components.stage.slower')"
          :title="$t('components.stage.slower')"
          @click="changeSpeed(-1)"
        >
          <Turtle :size="16" />
        </TheButton>
        <TheButton
          class="stage__play"
          icon
          :aria-label="
            $t(scrolling ? 'components.stage.pause' : 'components.stage.play')
          "
          :title="
            $t(scrolling ? 'components.stage.pause' : 'components.stage.play')
          "
          @click="toggleScroll"
        >
          <component :is="scrolling ? 'Pause' : 'Play'" :size="16" />
        </TheButton>
        <span class="stage__value stage__speed">{{ speed }}</span>
        <TheButton
          variant="ghost"
          icon
          :aria-label="$t('components.stage.faster')"
          :title="$t('components.stage.faster')"
          @click="changeSpeed(1)"
        >
          <Rabbit :size="16" />
        </TheButton>
      </div>
    </nav>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import {
  AArrowDown,
  AArrowUp,
  ArrowLeft,
  Minus,
  Pause,
  Play,
  Plus,
  Rabbit,
  Turtle,
} from "lucide-vue-next";
import { useInstrumentStore } from "@/stores/instrument";
import { useSongStore } from "@/stores/song";
import { useUiStore } from "@/stores/ui";

const MIN_SIZE = 12;
const MAX_SIZE = 40;
const MAX_SPEED = 10;
// PIXELS POR SEGUNDO EM CADA NÍVEL DE VELOCIDADE
const PIXELS_PER_LEVEL = 10;

// MÚSICA EM TELA CHEIA PARA TOCAR: SÓ LEITURA, LETRA GRANDE, TEMA ESCURO E
// ROLAGEM AUTOMÁTICA
export default defineComponent({
  name: "TheStage",

  components: {
    AArrowDown,
    AArrowUp,
    ArrowLeft,
    Minus,
    Pause,
    Play,
    Plus,
    Rabbit,
    Turtle,
  },

  data() {
    return {
      fontSize: window.innerWidth < 600 ? 15 : 20,
      speed: 3,
      scrolling: false,
      frame: 0,
      lastTime: 0,
      // FRAÇÃO DE PIXEL ACUMULADA ENTRE OS QUADROS
      carry: 0,
    };
  },

  computed: {
    ...mapState(useUiStore, ["stageOpen"]),
    ...mapState(useSongStore, ["title", "artist", "parts"]),
    ...mapState(useInstrumentStore, ["tone", "tuning"]),
  },

  watch: {
    stageOpen(open: boolean) {
      if (open) {
        window.addEventListener("keydown", this.handleKeys);
        this.$nextTick(() => (this.$refs.stage as HTMLElement)?.focus());
      } else {
        window.removeEventListener("keydown", this.handleKeys);
        this.pause();
      }
    },
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeys);
    this.pause();
  },

  methods: {
    ...mapActions(useUiStore, ["setStageOpen"]),
    ...mapActions(useSongStore, ["transpose"]),

    cleanTab(text: string) {
      return text.replace(/^\n+|\n+$/g, "");
    },

    close() {
      this.setStageOpen(false);
    },

    resize(step: number) {
      this.fontSize = Math.min(
        MAX_SIZE,
        Math.max(MIN_SIZE, this.fontSize + step)
      );
    },

    changeSpeed(step: number) {
      this.speed = Math.min(MAX_SPEED, Math.max(1, this.speed + step));
    },

    toggleScroll() {
      if (this.scrolling) this.pause();
      else this.play();
    },

    play() {
      this.scrolling = true;
      this.lastTime = performance.now();
      this.carry = 0;
      this.frame = requestAnimationFrame(this.step);
    },

    pause() {
      this.scrolling = false;
      cancelAnimationFrame(this.frame);
    },

    // ROLAR NA MÃO PAUSA A ROLAGEM AUTOMÁTICA
    stopScroll() {
      if (this.scrolling) this.pause();
    },

    step(time: number) {
      const stage = this.$refs.stage as HTMLElement | undefined;

      if (!stage || !this.scrolling) return;

      this.carry +=
        ((time - this.lastTime) / 1000) * this.speed * PIXELS_PER_LEVEL;
      this.lastTime = time;

      const pixels = Math.floor(this.carry);
      this.carry -= pixels;
      stage.scrollTop += pixels;

      const atEnd =
        stage.scrollTop + stage.clientHeight >= stage.scrollHeight - 1;

      if (atEnd) this.pause();
      else this.frame = requestAnimationFrame(this.step);
    },

    handleKeys(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const actions: Record<string, () => void> = {
        Escape: this.close,
        " ": this.toggleScroll,
        "+": () => this.resize(2),
        "=": () => this.resize(2),
        "-": () => this.resize(-2),
      };
      const action = actions[event.key];

      if (!action) return;

      event.preventDefault();
      action();
    },
  },
});
</script>

<style lang="scss">
.stage {
  position: fixed;
  inset: 0;
  z-index: 5000;
  overflow-y: auto;
  padding: var(--space-7) var(--space-5) 120px;
  background: var(--color-bg);
  color: var(--color-text);

  &:focus {
    outline: none;
  }

  &__header,
  &__song {
    max-width: 960px;
    margin: 0 auto;
  }

  &__header {
    margin-bottom: var(--space-6);

    h1 {
      font-size: calc(var(--stage-size) * 1.8);
      line-height: 1.15;
    }

    p {
      color: var(--color-text-muted);
      font-size: calc(var(--stage-size) * 1.1);
    }

    .stage__meta {
      margin-top: var(--space-2);

      span {
        margin: 0 var(--space-2);
      }
      font-size: calc(var(--stage-size) * 0.8);

      strong {
        color: var(--color-accent);
      }
    }
  }

  pre {
    font-family: var(--font-mono);
    font-size: var(--stage-size);
    font-variant-ligatures: none;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  &__chords {
    color: var(--color-accent);
    font-weight: 700;
  }

  &__tab {
    margin: var(--space-3) 0;
    white-space: pre;
    overflow-x: auto;
  }

  &__empty {
    color: var(--color-text-muted);
  }

  &__controls {
    position: fixed;
    bottom: var(--space-4);
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: var(--space-2);
    max-width: calc(100vw - 2 * var(--space-3));
    padding: var(--space-1);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-full);
    box-shadow: var(--shadow-lg);

    .the-button {
      border-radius: var(--radius-full);
    }
  }

  &__group {
    display: flex;
    align-items: center;
    gap: 2px;
    padding-left: var(--space-2);
    border-left: 1px solid var(--color-border);
  }

  &__value {
    min-width: 3ch;
    color: var(--color-text);
    font-size: var(--text-sm);
    font-weight: 700;
    text-align: center;
  }

  &__label {
    @include tablet {
      display: none;
    }
  }
}
</style>

<template>
  <div
    v-if="stageOpen"
    ref="stage"
    class="stage"
    :class="{ 'stage--playlist': playlist || loading }"
    data-theme="dark"
    tabindex="-1"
    role="dialog"
    aria-modal="true"
    :aria-label="$t('components.stage.title')"
    :style="{ '--stage-size': `${fontSize}px` }"
    @wheel.passive="holdScroll"
    @touchstart.passive="startTouch"
    @touchend="endTouch"
    @touchcancel="endTouch"
    @scroll.passive="watchScroll"
  >
    <!-- PLAYLIST: EM QUE PONTO DA SEQUÊNCIA ESTÁ -->
    <div v-if="playlist" class="stage__progress">
      <span class="stage__playlist-name">{{ playlist.name }}</span>
      <span class="stage__position">
        {{
          $t("components.stage.position", {
            n: index + 1,
            total: songs.length,
          })
        }}
      </span>
      <span class="stage__bar" aria-hidden="true">
        <span :style="{ width: `${((index + 1) / songs.length) * 100}%` }" />
      </span>
    </div>

    <p v-if="loading" class="stage__status">
      {{ $t("components.stage.loading") }}
    </p>

    <template v-else>
      <header class="stage__header">
        <h1>{{ view.title || $t("components.stage.untitled") }}</h1>
        <p v-if="view.artist">{{ view.artist }}</p>
        <p class="stage__meta">
          {{ $t("components.tabHeader.tone") }}:
          <strong class="stage__meta-tone">{{ view.tone }}</strong>
          <small v-if="shift" class="stage__shift">({{ shiftLabel }})</small>
          <span aria-hidden="true">·</span>
          {{ $t("components.tabHeader.tuning") }}:
          <strong>{{ view.tuning.join(" ") }}</strong>
        </p>
      </header>

      <article class="stage__song">
        <template v-for="part in view.parts" :key="part.id">
          <pre v-if="part.type == 'verse'" class="stage__chords">{{
            part.info.chords
          }}</pre>
          <pre v-else-if="part.type == 'tab'" class="stage__tab">{{
            cleanTab(part.info.text)
          }}</pre>
          <pre v-else class="stage__text">{{ part.info.text || " " }}</pre>
        </template>

        <p v-if="!view.parts.length" class="stage__empty">
          {{ $t("components.stage.empty") }}
        </p>
      </article>

      <!-- FIM DA MÚSICA: A PRÓXIMA A UM TOQUE (A ROLAGEM AUTOMÁTICA PARA AQUI) -->
      <footer v-if="playlist" class="stage__after">
        <button v-if="hasNext" class="stage__up-next" @click="next">
          <span class="stage__up-next-label">
            {{ $t("components.stage.upNext") }}
          </span>
          <strong>{{ titleOf(songs[index + 1]) }}</strong>
          <SkipForward :size="22" />
        </button>
        <p v-else class="stage__end">{{ $t("components.stage.end") }}</p>
      </footer>
    </template>

    <!-- AS MÚSICAS DA PLAYLIST E AS OUTRAS PLAYLISTS, SEM SAIR DO PALCO -->
    <template v-if="setlistOpen">
      <div class="stage__backdrop" @click="closeSetlist" />
      <aside
        ref="setlist"
        class="stage__setlist"
        :aria-label="$t('components.stage.setlist')"
      >
        <header class="stage__setlist-header">
          <strong>
            {{ playlist ? playlist.name : $t("components.stage.playlists") }}
          </strong>
          <TheButton
            variant="ghost"
            icon
            class="stage__setlist-close"
            :aria-label="$t('components.stage.closeSetlist')"
            :title="$t('components.stage.closeSetlist')"
            @click="closeSetlist"
          >
            <X :size="18" />
          </TheButton>
        </header>

        <ol v-if="playlist" class="stage__tracks">
          <li v-for="(song, position) in songs" :key="position">
            <button
              class="stage__track"
              :class="{ 'stage__track--current': position == index }"
              :aria-current="position == index ? 'true' : undefined"
              @click="pickSong(position)"
            >
              <span class="stage__track-number">{{ position + 1 }}</span>
              <span class="stage__track-info">
                <strong>{{ titleOf(song) }}</strong>
                <span v-if="song.artist">{{ song.artist }}</span>
              </span>
            </button>
          </li>
        </ol>

        <h2 v-if="playlist" class="stage__setlist-heading">
          {{ $t("components.stage.otherPlaylists") }}
        </h2>
        <p v-if="!user" class="stage__hint">
          {{ $t("components.stage.loginHint") }}
        </p>
        <p v-else-if="!otherPlaylists.length" class="stage__hint">
          {{ $t("components.stage.noPlaylists") }}
        </p>
        <ul v-else class="stage__playlists">
          <li v-for="item in otherPlaylists" :key="item.id">
            <button
              class="stage__playlist"
              :disabled="!item.cipherIds.length"
              @click="pickPlaylist(item)"
            >
              <ListMusic :size="16" />
              <span class="stage__playlist-title">{{ item.name }}</span>
              <span class="stage__count">
                {{ $t("components.library.songs", item.cipherIds.length) }}
              </span>
            </button>
          </li>
        </ul>
      </aside>
    </template>

    <nav class="stage__controls" :aria-label="$t('components.stage.controls')">
      <TheButton variant="ghost" class="stage__close" @click="close">
        <ArrowLeft :size="16" />
        <span class="stage__label">{{ $t("components.stage.back") }}</span>
      </TheButton>

      <!-- O QUE SE USA NO MEIO DA MÚSICA: SEMPRE À MÃO, ATÉ NO CELULAR -->
      <div class="stage__group">
        <TheButton
          variant="ghost"
          icon
          class="stage__setlist-button"
          :aria-label="$t('components.stage.setlist')"
          :title="$t('components.stage.setlist')"
          :aria-expanded="setlistOpen"
          @click="toggleSetlist"
        >
          <ListMusic :size="18" />
        </TheButton>
        <TheButton
          v-if="playlist"
          variant="ghost"
          icon
          class="stage__previous"
          :disabled="!hasPrevious"
          :aria-label="$t('components.stage.previous')"
          :title="$t('components.stage.previous')"
          @click="previous"
        >
          <SkipBack :size="18" />
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
        <TheButton
          v-if="playlist"
          variant="ghost"
          icon
          class="stage__next"
          :disabled="!hasNext"
          :aria-label="$t('components.stage.next')"
          :title="$t('components.stage.next')"
          @click="next"
        >
          <SkipForward :size="18" />
        </TheButton>
      </div>

      <!-- AJUSTES (UMA VEZ POR MÚSICA). NO CELULAR FICAM NO PAINEL DO "⋯" -->
      <div
        class="stage__settings"
        :class="{ 'stage__settings--open': settingsOpen }"
      >
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
          <span class="stage__value stage__tone">{{ view.tone }}</span>
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
          <span
            class="stage__value stage__speed"
            :title="$t('components.stage.speed')"
          >
            {{ speed }}
          </span>
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
      </div>

      <TheButton
        variant="ghost"
        icon
        class="stage__more"
        :aria-label="$t('components.stage.more')"
        :title="$t('components.stage.more')"
        :aria-expanded="settingsOpen"
        @click="settingsOpen = !settingsOpen"
      >
        <Ellipsis :size="18" />
      </TheButton>
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
  Ellipsis,
  ListMusic,
  Minus,
  Pause,
  Play,
  Plus,
  Rabbit,
  SkipBack,
  SkipForward,
  Turtle,
  X,
} from "lucide-vue-next";
import { transposeChord, transposeText } from "@/core/chords";
import { transposeTab } from "@/core/tab";
import { useAuthStore } from "@/stores/auth";
import { useInstrumentStore } from "@/stores/instrument";
import { useLibraryStore } from "@/stores/library";
import { useSongStore } from "@/stores/song";
import { useStageStore } from "@/stores/stage";
import { useUiStore } from "@/stores/ui";
import type { Cipher, Playlist } from "@/types/library";
import type { Part } from "@/types/song";

const MIN_SIZE = 12;
const MAX_SIZE = 40;
const MAX_SPEED = 10;
// PIXELS POR SEGUNDO EM CADA NÍVEL DE VELOCIDADE
const PIXELS_PER_LEVEL = 10;
// QUANTO ESPERAR DEPOIS DA ÚLTIMA ROLAGEM MANUAL PARA RETOMAR A AUTOMÁTICA
const RESUME_DELAY = 300;

// TELA SEMPRE ACESA ENQUANTO O PALCO ESTÁ ABERTO. FORA DO ESTADO REATIVO: O
// PROXY DO VUE QUEBRARIA O release() DO OBJETO NATIVO
let wakeLock: WakeLockSentinel | null = null;

interface SongView {
  title: string;
  artist: string;
  tone: string;
  tuning: string[];
  parts: Part[];
}

function transposePart(part: Part, semitones: number): Part {
  if (part.type == "verse") {
    return {
      ...part,
      info: { chords: transposeText(part.info.chords, semitones) },
    };
  }

  if (part.type == "tab") {
    return { ...part, info: { text: transposeTab(part.info.text, semitones) } };
  }

  return part;
}

// MÚSICA EM TELA CHEIA PARA TOCAR: SÓ LEITURA, LETRA GRANDE, TEMA ESCURO E
// ROLAGEM AUTOMÁTICA. MOSTRA A MÚSICA DO EDITOR OU UMA PLAYLIST INTEIRA
export default defineComponent({
  name: "TheStage",

  components: {
    AArrowDown,
    AArrowUp,
    ArrowLeft,
    Ellipsis,
    ListMusic,
    Minus,
    Pause,
    Play,
    Plus,
    Rabbit,
    SkipBack,
    SkipForward,
    Turtle,
    X,
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
      // ROLAGEM MANUAL EM ANDAMENTO: A AUTOMÁTICA ESPERA ATÉ holdUntil
      touching: false,
      holdUntil: 0,
      // ÚLTIMA POSIÇÃO ESCRITA PELA ROLAGEM AUTOMÁTICA, PARA DISTINGUIR A
      // NOSSA ROLAGEM DA DO USUÁRIO (BARRA DE ROLAGEM, TECLADO, INÉRCIA)
      autoTop: 0,
      setlistOpen: false,
      // CELULAR: PAINEL COM TOM, TAMANHO DA LETRA E VELOCIDADE
      settingsOpen: false,
    };
  },

  computed: {
    ...mapState(useUiStore, ["stageOpen"]),
    ...mapState(useAuthStore, ["user"]),
    ...mapState(useSongStore, {
      editorTitle: "title",
      editorArtist: "artist",
      editorParts: "parts",
    }),
    ...mapState(useInstrumentStore, {
      editorTone: "tone",
      editorTuning: "tuning",
    }),
    ...mapState(useStageStore, [
      "playlist",
      "songs",
      "index",
      "song",
      "shift",
      "loading",
      "hasPrevious",
      "hasNext",
    ]),

    // A MÚSICA NA TELA: A DA PLAYLIST (NO TOM DO PALCO) OU A DO EDITOR
    view(): SongView {
      const song = this.song;

      if (!this.playlist || !song) {
        return {
          title: this.editorTitle,
          artist: this.editorArtist,
          tone: this.editorTone,
          tuning: this.editorTuning,
          parts: this.editorParts,
        };
      }

      const shift = this.shift;

      return {
        title: song.title,
        artist: song.artist,
        tone: shift ? transposeChord(song.tone.trim(), shift) : song.tone,
        tuning: song.tuning,
        parts: shift
          ? song.parts.map((part) => transposePart(part, shift))
          : song.parts,
      };
    },

    shiftLabel(): string {
      return this.shift > 0 ? `+${this.shift}` : `${this.shift}`;
    },

    otherPlaylists(): Playlist[] {
      return useLibraryStore().playlists.filter(
        (item) => item.id != this.playlist?.id
      );
    },
  },

  watch: {
    stageOpen(open: boolean) {
      if (open) {
        window.addEventListener("keydown", this.handleKeys);
        document.addEventListener("visibilitychange", this.relockScreen);
        this.lockScreen();
        this.$nextTick(() => (this.$refs.stage as HTMLElement)?.focus());
      } else {
        window.removeEventListener("keydown", this.handleKeys);
        document.removeEventListener("visibilitychange", this.relockScreen);
        this.releaseScreen();
        this.pause();
        this.setlistOpen = false;
        this.settingsOpen = false;
        useStageStore().reset();
      }
    },

    // OUTRA MÚSICA: COMEÇA DO TOPO, COM A ROLAGEM PARADA
    song(current: Cipher | null, previous: Cipher | null) {
      if (current == previous) return;

      this.pause();
      this.settingsOpen = false;
      this.$nextTick(() => {
        const stage = this.$refs.stage as HTMLElement | undefined;

        if (stage) stage.scrollTop = 0;
      });
    },
  },

  beforeUnmount() {
    window.removeEventListener("keydown", this.handleKeys);
    document.removeEventListener("visibilitychange", this.relockScreen);
    this.releaseScreen();
    this.pause();
  },

  methods: {
    ...mapActions(useUiStore, ["setStageOpen"]),
    ...mapActions(useStageStore, [
      "transpose",
      "next",
      "previous",
      "go",
      "playPlaylist",
    ]),

    cleanTab(text: string) {
      return text.replace(/^\n+|\n+$/g, "");
    },

    titleOf(song?: Cipher): string {
      return song?.title || this.$t("components.stage.untitled");
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

    // A LISTA SEMPRE MOSTRA AS PLAYLISTS ATUAIS (PODEM TER MUDADO EM OUTRO
    // LUGAR) E LEVA O FOCO PARA A MÚSICA QUE ESTÁ TOCANDO
    toggleSetlist() {
      if (this.setlistOpen) return this.closeSetlist();

      this.setlistOpen = true;
      this.settingsOpen = false;
      useLibraryStore().loadPlaylists();
      this.$nextTick(() => {
        const setlist = this.$refs.setlist as HTMLElement | undefined;

        setlist
          ?.querySelector<HTMLElement>(
            ".stage__track--current, .stage__playlist:not(:disabled)"
          )
          ?.focus();
      });
    },

    closeSetlist() {
      this.setlistOpen = false;
      (this.$refs.stage as HTMLElement | undefined)?.focus();
    },

    pickSong(position: number) {
      this.go(position);
      this.closeSetlist();
    },

    async pickPlaylist(playlist: Playlist) {
      this.closeSetlist();
      await this.playPlaylist(playlist);
    },

    async lockScreen() {
      try {
        wakeLock = (await navigator.wakeLock?.request("screen")) ?? null;
      } catch {
        // SEM SUPORTE OU SEM PERMISSÃO: A TELA APAGA COMO DE COSTUME
        wakeLock = null;
      }
    },

    // O NAVEGADOR SOLTA A TRAVA QUANDO A ABA SAI DE VISTA: PEDE DE NOVO AO VOLTAR
    relockScreen() {
      if (document.visibilityState == "visible" && this.stageOpen) {
        this.lockScreen();
      }
    },

    releaseScreen() {
      wakeLock?.release().catch(() => {});
      wakeLock = null;
    },

    toggleScroll() {
      if (this.scrolling) this.pause();
      else this.play();
    },

    play() {
      const stage = this.$refs.stage as HTMLElement | undefined;

      this.scrolling = true;
      this.lastTime = performance.now();
      this.carry = 0;
      this.holdUntil = 0;
      this.autoTop = stage?.scrollTop ?? 0;
      cancelAnimationFrame(this.frame);
      this.frame = requestAnimationFrame(this.step);
    },

    pause() {
      this.scrolling = false;
      cancelAnimationFrame(this.frame);
    },

    // ROLAR NA MÃO NÃO DESLIGA A ROLAGEM AUTOMÁTICA: ELA SÓ ESPERA O USUÁRIO
    // TERMINAR E CONTINUA DE ONDE ELE PAROU. ESCREVER scrollTop DURANTE A
    // ROLAGEM MANUAL BRIGARIA COM O DEDO E CORTARIA A INÉRCIA E O SCROLL SUAVE
    holdScroll() {
      this.holdUntil = performance.now() + RESUME_DELAY;
    },

    startTouch() {
      this.touching = true;
    },

    endTouch() {
      this.touching = false;
      this.holdScroll();
    },

    watchScroll() {
      const stage = this.$refs.stage as HTMLElement | undefined;

      if (!stage) return;

      if (Math.abs(stage.scrollTop - this.autoTop) > 2) this.holdScroll();
      this.autoTop = stage.scrollTop;
    },

    step(time: number) {
      const stage = this.$refs.stage as HTMLElement | undefined;

      if (!stage || !this.scrolling) return;

      if (this.touching || time < this.holdUntil) {
        this.lastTime = time;
        this.carry = 0;
        this.frame = requestAnimationFrame(this.step);
        return;
      }

      this.carry +=
        ((time - this.lastTime) / 1000) * this.speed * PIXELS_PER_LEVEL;
      this.lastTime = time;

      const pixels = Math.floor(this.carry);
      this.carry -= pixels;
      stage.scrollTop += pixels;
      this.autoTop = stage.scrollTop;

      const atEnd =
        stage.scrollTop + stage.clientHeight >= stage.scrollHeight - 1;

      if (atEnd) this.pause();
      else this.frame = requestAnimationFrame(this.step);
    },

    // ← → TROCAM DE MÚSICA (PEDAIS BLUETOOTH DE VIRAR PÁGINA MANDAM ESSAS
    // TECLAS, ATÉ NO CELULAR E NO TABLET). PageUp/PageDown CONTINUAM ROLANDO
    handleKeys(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const actions: Record<string, () => void> = {
        Escape: this.escape,
        " ": this.toggleScroll,
        "+": () => this.resize(2),
        "=": () => this.resize(2),
        "-": () => this.resize(-2),
      };

      if (this.playlist) {
        actions.ArrowRight = this.next;
        actions.ArrowLeft = this.previous;
      }

      const action = actions[event.key];

      if (!action) return;

      event.preventDefault();
      action();
    },

    // Esc FECHA PRIMEIRO O PAINEL ABERTO, DEPOIS O PALCO
    escape() {
      if (this.setlistOpen) this.closeSetlist();
      else if (this.settingsOpen) this.settingsOpen = false;
      else this.close();
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
  // SEM O FLASH AZUL DO NAVEGADOR AO TOCAR: OS BOTÕES TÊM ESTADO PRÓPRIO
  -webkit-tap-highlight-color: transparent;

  &:focus {
    outline: none;
  }

  // ESPAÇO PARA A FAIXA DA PLAYLIST NO TOPO
  &--playlist {
    padding-top: calc(var(--space-7) + 32px);
  }

  &__header,
  &__song,
  &__after {
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

  &__shift {
    margin-left: var(--space-1);
    color: var(--color-text-muted);
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

  &__empty,
  &__status {
    color: var(--color-text-muted);
  }

  &__status {
    max-width: 960px;
    margin: 0 auto;
    font-size: var(--text-lg);
  }

  // FAIXA FIXA NO TOPO: NOME DA PLAYLIST, POSIÇÃO E PROGRESSO
  &__progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    height: 32px;
    padding: 0 var(--space-5);
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);
    font-size: var(--text-xs);

    @include tablet {
      padding: 0 var(--space-3);
    }
  }

  &__playlist-name {
    overflow: hidden;
    color: var(--color-text);
    font-weight: 700;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__position {
    flex: none;
  }

  &__bar {
    flex: 1;
    min-width: 40px;
    height: 3px;
    overflow: hidden;
    background: var(--color-border);
    border-radius: var(--radius-full);

    span {
      display: block;
      height: 100%;
      background: var(--color-accent);
      transition: width var(--duration-normal);
    }
  }

  &__after {
    margin-top: var(--space-7);
  }

  &__up-next {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: var(--space-1) var(--space-4);
    width: 100%;
    padding: var(--space-4) var(--space-5);
    background: var(--color-surface);
    border: 1px solid var(--color-border-strong);
    border-radius: var(--radius-lg);
    color: var(--color-text);
    text-align: left;
    cursor: pointer;

    &:hover {
      background: var(--color-surface-hover);
    }

    strong {
      grid-column: 1;
      color: var(--color-accent);
      font-size: calc(var(--stage-size) * 1.2);
    }

    svg {
      grid-column: 2;
      grid-row: 1 / span 2;
      color: var(--color-accent);
    }
  }

  &__up-next-label {
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  &__end {
    color: var(--color-text-muted);
    font-size: var(--text-md);
    text-align: center;
  }

  // PAINEL DA LISTA DE MÚSICAS
  &__backdrop {
    position: fixed;
    inset: 0;
    z-index: 2;
    background: var(--color-overlay);
  }

  &__setlist {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    width: min(360px, 88vw);
    padding: var(--space-3);
    overflow-y: auto;
    background: var(--color-surface);
    border-left: 1px solid var(--color-border);
    box-shadow: var(--shadow-lg);
  }

  &__setlist-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    padding-left: var(--space-2);
  }

  &__setlist-heading {
    margin-top: var(--space-3);
    padding-left: var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  &__hint {
    padding: 0 var(--space-2);
    color: var(--color-text-muted);
    font-size: var(--text-sm);
  }

  &__tracks,
  &__playlists {
    display: flex;
    flex-direction: column;
    gap: 2px;
    list-style: none;
  }

  &__track,
  &__playlist {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    min-height: 44px;
    padding: var(--space-2);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--color-text);
    font-size: var(--text-sm);
    text-align: left;
    cursor: pointer;

    &:hover:not(:disabled) {
      background: var(--color-surface-hover);
    }

    &:disabled {
      opacity: 0.4;
      cursor: default;
    }
  }

  &__track--current {
    background: var(--color-surface-hover);
    border-color: var(--color-accent);

    .stage__track-number {
      color: var(--color-accent);
    }
  }

  &__track-number {
    flex: none;
    min-width: 2ch;
    color: var(--color-text-muted);
    font-weight: 700;
    text-align: right;
  }

  &__track-info {
    display: flex;
    flex-direction: column;
    min-width: 0;

    span {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
    }
  }

  &__playlist-title {
    flex: 1;
    min-width: 0;
  }

  &__count {
    color: var(--color-text-muted);
    font-size: var(--text-xs);
  }

  &__controls {
    position: fixed;
    bottom: var(--space-4);
    left: 50%;
    z-index: 1;
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

    // CELULAR: BOTÕES MENORES PARA A BARRA CABER INTEIRA
    @media (max-width: 480px) {
      gap: var(--space-1);

      .the-button--md {
        height: 32px;
      }
    }
  }

  &__group {
    display: flex;
    align-items: center;
    gap: 2px;
    padding-left: var(--space-2);
    border-left: 1px solid var(--color-border);

    @media (max-width: 480px) {
      padding-left: var(--space-1);
    }
  }

  // TELAS MAIORES: OS AJUSTES FICAM NA PRÓPRIA BARRA
  &__settings {
    display: contents;
  }

  &__more.the-button {
    display: none;
  }

  // PAINEL ABERTO: O BOTÃO QUE O ABRIU FICA MARCADO
  &__more.the-button[aria-expanded="true"],
  &__setlist-button.the-button[aria-expanded="true"] {
    background: var(--color-surface-hover);
    color: var(--color-text);
  }

  // CELULAR: A BARRA TEM SÓ O ESSENCIAL PARA O SHOW (VOLTAR, LISTA, ⏮ ▶ ⏭)
  // E O "⋯" ABRE OS AJUSTES NUM PAINEL LOGO ACIMA DELA
  @media (max-width: 480px) {
    &__settings {
      display: none;
    }

    &__settings--open {
      position: absolute;
      bottom: calc(100% + var(--space-2));
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3);
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);

      .stage__group {
        padding-left: 0;
        border-left: none;
      }
    }

    &__more.the-button {
      display: inline-flex;
    }
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

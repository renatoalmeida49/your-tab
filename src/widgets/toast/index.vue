<template>
  <transition name="toast">
    <div v-if="notice" class="toast" role="status">
      <span>{{ $t(notice.message) }}</span>

      <button class="toast__undo" @click="undo">
        {{ $t("components.toast.undo") }}
      </button>
    </div>
  </transition>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import { useHistoryStore } from "@/stores/history";

const DURATION = 6000;

export default defineComponent({
  name: "TheToast",

  data() {
    return {
      timer: undefined as ReturnType<typeof setTimeout> | undefined,
    };
  },

  computed: {
    ...mapState(useHistoryStore, ["notice"]),
  },

  watch: {
    notice(notice) {
      clearTimeout(this.timer);

      if (notice) this.timer = setTimeout(() => this.notify(null), DURATION);
    },
  },

  beforeUnmount() {
    clearTimeout(this.timer);
  },

  methods: {
    ...mapActions(useHistoryStore, { historyUndo: "undo", notify: "notify" }),

    undo() {
      this.historyUndo();
    },
  },
});
</script>

<style lang="scss">
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  z-index: 9000;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 16px;
  background: $tertiary;
  color: $white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);

  &__undo {
    background: none;
    border: none;
    color: $secondary;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>

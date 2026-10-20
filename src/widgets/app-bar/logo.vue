<template>
  <!-- PALHETA COM AS LINHAS DE UMA TAB -->
  <svg
    class="the-logo"
    width="32"
    height="32"
    viewBox="0 0 32 32"
    aria-hidden="true"
  >
    <path
      class="the-logo__pick"
      d="M16 3c7.5 0 12.5 3.2 12.5 8.3 0 6.9-7.4 14.6-12.5 17.7C10.9 25.9 3.5 18.2 3.5 11.3 3.5 6.2 8.5 3 16 3Z"
    />
    <path class="the-logo__strings" d="M9 10.5h14M10 14.5h12M12 18.5h8" />
    <circle class="the-logo__note" cx="18" cy="14.5" r="2.2" />
  </svg>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "TheLogo",
});
</script>

<style lang="scss">
.the-logo {
  &__pick {
    fill: var(--color-accent);
  }

  &__strings {
    stroke: var(--color-accent-contrast);
    stroke-width: 1.6;
    stroke-linecap: round;
    opacity: 0.85;
  }

  &__note {
    fill: var(--color-highlight);
  }
}
</style>

<template>
  <AlertDialogRoot :open="!!request" @update:open="onOpenChange">
    <AlertDialogPortal>
      <AlertDialogOverlay class="modal__overlay confirm__overlay" />

      <AlertDialogContent v-if="request" class="confirm">
        <AlertDialogTitle class="confirm__title">
          {{ $t("components.confirm.title") }}
        </AlertDialogTitle>
        <AlertDialogDescription class="confirm__message">
          {{ $t(request.message) }}
        </AlertDialogDescription>

        <div class="confirm__actions">
          <AlertDialogCancel as-child>
            <TheButton variant="ghost" class="confirm__cancel">
              {{ $t("common.cancel") }}
            </TheButton>
          </AlertDialogCancel>
          <!-- SEM AlertDialogAction: ELE FECHARIA (= CANCELAR) ANTES DO answer(true) -->
          <TheButton
            :variant="request.danger ? 'danger' : 'primary'"
            class="confirm__accept"
            @click="answer(true)"
          >
            {{ $t(request.confirmLabel) }}
          </TheButton>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
} from "reka-ui";
import { useConfirmStore } from "@/stores/confirm";

export default defineComponent({
  name: "TheConfirm",

  components: {
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogOverlay,
    AlertDialogPortal,
    AlertDialogRoot,
    AlertDialogTitle,
  },

  computed: {
    ...mapState(useConfirmStore, ["request"]),
  },

  methods: {
    ...mapActions(useConfirmStore, ["answer"]),

    // ESC E "CANCELAR" FECHAM SEM CONFIRMAR
    onOpenChange(open: boolean) {
      if (!open && this.request) this.answer(false);
    },
  },
});
</script>

<style lang="scss">
// ACIMA DE OUTROS MODAIS (EX: CONFIRMAR DENTRO DO MODAL DE AFINAÇÃO)
.confirm__overlay {
  z-index: 10000;
}

.confirm {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10001;
  transform: translate(-50%, -50%);
  width: calc(100vw - 2 * var(--space-4));
  max-width: 420px;
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: modal-in var(--duration-normal) ease-out;

  &:focus {
    outline: none;
  }

  &__title {
    font-size: var(--text-lg);
    font-weight: 700;
  }

  &__message {
    margin-top: var(--space-2);
    color: var(--color-text-muted);
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-2);
    margin-top: var(--space-5);
  }
}
</style>

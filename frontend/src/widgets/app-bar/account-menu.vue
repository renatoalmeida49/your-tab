<template>
  <!-- ATÉ SABER SE HÁ SESSÃO NÃO MOSTRA NADA (SEM PISCAR "ENTRAR") -->
  <template v-if="ready">
    <DropdownMenuRoot v-if="user">
      <DropdownMenuTrigger
        class="the-button the-button--ghost the-button--md the-button--icon account-menu__trigger"
        :aria-label="$t('components.menu.account')"
        :title="user.name"
      >
        <img
          v-if="user.picture"
          :src="user.picture"
          class="account-menu__avatar"
          referrerpolicy="no-referrer"
          alt=""
        />
        <span v-else class="account-menu__avatar account-menu__initial">
          {{ initial }}
        </span>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent class="dropdown" align="end" :sideOffset="6">
          <DropdownMenuLabel class="account-menu__label">
            <strong>{{ user.name }}</strong>
            <span>{{ user.email }}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator class="dropdown__separator" />
          <DropdownMenuItem
            class="dropdown__item account-menu__library"
            @select="setLibraryOpen(true)"
          >
            <LibraryBig :size="16" />
            {{ $t("components.menu.library") }}
          </DropdownMenuItem>
          <DropdownMenuItem
            class="dropdown__item account-menu__logout"
            @select="logout"
          >
            <LogOut :size="16" />
            {{ $t("components.menu.logout") }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>

    <TheButton
      v-else
      variant="ghost"
      class="account-menu__login"
      @click="setLoginOpen(true)"
    >
      <LogIn :size="16" />
      <span class="app-bar__label">{{ $t("components.menu.login") }}</span>
    </TheButton>
  </template>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapActions, mapState } from "pinia";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "reka-ui";
import { LibraryBig, LogIn, LogOut } from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth";
import { useUiStore } from "@/stores/ui";

export default defineComponent({
  name: "AccountMenu",

  components: {
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuRoot,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    LibraryBig,
    LogIn,
    LogOut,
  },

  computed: {
    ...mapState(useAuthStore, ["user", "ready"]),

    initial(): string {
      return (this.user?.name ?? "?").charAt(0).toUpperCase();
    },
  },

  methods: {
    ...mapActions(useAuthStore, ["logout"]),
    ...mapActions(useUiStore, ["setLoginOpen", "setLibraryOpen"]),
  },
});
</script>

<style lang="scss">
.account-menu {
  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: var(--radius-full);
    object-fit: cover;
  }

  &__initial {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--color-accent-soft);
    color: var(--color-accent);
    font-size: var(--text-sm);
    font-weight: 700;
  }

  &__label {
    display: flex;
    flex-direction: column;
    padding: var(--space-2);
    line-height: 1.3;

    strong {
      font-size: var(--text-sm);
    }

    span {
      color: var(--color-text-muted);
      font-size: var(--text-xs);
    }
  }
}
</style>

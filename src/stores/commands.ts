import { useConfirmStore } from "./confirm";
import { useSongStore } from "./song";

// AÇÕES COM CONFIRMAÇÃO, USADAS PELA BARRA DO TOPO E PELA PALETA DE COMANDOS
export async function startNewSong(): Promise<void> {
  const confirmed = await useConfirmStore().ask({
    message: "components.menu.newSongConfirm",
    confirmLabel: "components.menu.newSongConfirmAction",
    danger: true,
  });

  if (confirmed) useSongStore().newSong();
}

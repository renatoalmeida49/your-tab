export const locale = {
  common: {
    confirm: "Confirmar",
    cancel: "Cancelar",
    close: "Fechar",
  },
  subtitle: "Um construtor de cifras, tablaturas e anotações.",
  details: [
    {
      title: "Feito para iniciantes e avançados",
      description:
        "O Tab Builder pode ser utilizado por todos os níveis de guitarristas, baixistas ou qualquer outro instrumento de corda que você toque.",
    },
    {
      title: "Exporte em PDF",
      description:
        "Com a exportação em PDF você pode salvar sua cifra e levá-la para qualquer lugar.",
    },
    {
      title: "Futuras implementações",
      description: [
        "Baixos e guitarras com mais cordas",
        "Outros instrumentos de corda",
        "Melhoria do uso de atalhos",
      ],
    },
    {
      title: "Fácil de usar",
      description:
        "Com os atalhos e a navegação, rapidamente é possível construir uma cifra completa. Clique em qualquer parte abaixo para iniciar suas anotações.",
    },
    {
      title: "Fale conosco!",
      description: "Viu algum bug? Tem alguma sugestão?",
    },
  ],
  components: {
    tabHeader: {
      songName: "Título da música",
      artistName: "Artista",
      tone: "Tom",
      tuning: "Afinação",
      transposeDown: "Transpor meio tom abaixo",
      transposeUp: "Transpor meio tom acima",
      tuningButton: "Mudar afinação",
    },
    textField: {
      placeholder: "Pressione '/' para inserir uma tablatura ou verso",
      insert: "Inserir",
    },
    paste: {
      retuneConfirm:
        "A tablatura colada usa outra afinação. Trocar a afinação da música para a dela? As tabs que já existem serão ajustadas.",
      retuneLoseNotesConfirm:
        "A tablatura colada usa outra afinação. Trocando, as notas das tabs atuais em cordas que deixam de existir serão apagadas.",
      retuneConfirmAction: "Usar a afinação colada",
      keepTuning: "Manter a atual",
    },
    songContent: {
      insertBelow: "Inserir abaixo",
      actions: "Arraste para mover ou clique para mais ações",
      duplicate: "Duplicar",
      moveUp: "Mover para cima",
      moveDown: "Mover para baixo",
      remove: "Remover",
    },
    verse: {
      placeholder:
        "Insira aqui os acordes. Pressione 'enter' para novo campo de texto",
    },
    menu: {
      tab: "Tab",
      text: "Texto",
      verse: "Verso",
      downloadPdf: "Exportar PDF",
      newSong: "Nova música",
      newSongConfirm: "Começar uma nova música? A atual será apagada.",
      newSongConfirmAction: "Apagar e começar",
      add: "Adicionar parte",
      undo: "Desfazer (Ctrl+Z)",
      redo: "Refazer (Ctrl+Shift+Z)",
      help: "Ajuda e atalhos (?)",
      language: "Idioma",
      stage: "Modo palco",
      palette: "Comandos (Ctrl+K)",
      newSongUnsavedConfirm:
        "Começar uma nova música? As alterações não salvas da atual serão perdidas.",
      save: "Salvar",
      saving: "Salvando…",
      saved: "Salvo",
      saveHint: "Salvar no acervo (Ctrl+S)",
      login: "Entrar",
      account: "Sua conta",
      library: "Meu acervo",
      logout: "Sair",
    },
    login: {
      title: "Entrar",
      description:
        "Entre com sua conta Google para salvar suas cifras na nuvem e montar playlists.",
      loading: "Carregando o login do Google…",
      signingIn: "Entrando…",
      notConfigured:
        "O login ainda não foi configurado: defina GOOGLE_CLIENT_ID no backend/.env e reinicie a API.",
      offline:
        "Não foi possível falar com o servidor. Verifique se a API está rodando.",
      scriptFailed: "Não foi possível carregar o login do Google.",
      failed: "Não foi possível entrar. Tente novamente.",
      welcome: "Você entrou. Suas cifras ficam no acervo.",
    },
    library: {
      title: "Meu acervo",
      ciphers: "Cifras",
      playlists: "Playlists",
      search: "Buscar por título ou artista",
      loading: "Carregando o acervo…",
      loadFailed: "Não foi possível carregar o acervo.",
      retry: "Tentar de novo",
      empty:
        "Nenhuma cifra salva ainda. Use “Salvar” na barra do topo para guardar a música atual.",
      noResults: "Nenhuma cifra encontrada.",
      untitled: "Sem título",
      current: "No editor",
      updated: "Atualizada em {date}",
      open: "Abrir",
      delete: "Excluir",
      addToPlaylist: "Adicionar à playlist",
      noPlaylists: "Crie uma playlist na aba Playlists",
      saved: "Salvo no acervo",
      openConfirm:
        "Abrir outra cifra? As alterações não salvas da música atual serão perdidas.",
      openConfirmAction: "Abrir mesmo assim",
      deleteConfirm:
        "Excluir esta cifra do acervo? Ela também sai das playlists.",
      deleteConfirmAction: "Excluir",
      deletePlaylistConfirm:
        "Excluir esta playlist? As cifras continuam no acervo.",
      newPlaylist: "Nome da nova playlist",
      createPlaylist: "Criar playlist",
      playlistsEmpty: "Nenhuma playlist ainda. Crie a primeira acima.",
      playlistEmpty: "Playlist vazia. Adicione cifras pela aba Cifras.",
      songs: "nenhuma música | {n} música | {n} músicas",
      rename: "Renomear",
      deletePlaylist: "Excluir playlist",
      moveUp: "Mover para cima",
      moveDown: "Mover para baixo",
      removeFromPlaylist: "Tirar da playlist",
      errors: {
        session: "Sua sessão expirou. Entre de novo para salvar.",
        offline: "Sem conexão com o servidor.",
        generic: "Algo deu errado. Tente novamente.",
      },
    },
    songFile: {
      downloadFile: "Baixar arquivo da música (.json)",
      downloadHint:
        "Para abrir em outro computador ou importar no acervo de outra conta.",
      openFile: "Abrir arquivo de música (.json)",
      openConfirm:
        "Abrir o arquivo? As alterações não salvas da música atual serão perdidas.",
      openConfirmAction: "Abrir mesmo assim",
      opened: "Música aberta do arquivo",
      openedFirst:
        "O arquivo tem {count} músicas: abrimos a primeira. Para trazer todas, use “Importar” no acervo",
      import: "Importar",
      importHint: "Traz para o acervo as músicas de arquivos .json",
      imported: "Músicas importadas para o acervo: {count}",
      exportAll: "Exportar tudo",
      exportAllHint: "Baixa todas as cifras do acervo num arquivo .json",
      errors: {
        invalid: "Arquivo inválido: não é um arquivo de música do Tab Builder",
        newer:
          "Arquivo feito por uma versão mais nova do Tab Builder. Recarregue a página e tente de novo",
        empty: "O arquivo não tem nenhuma música",
      },
    },
    palette: {
      title: "Paleta de comandos",
      placeholder: "Digite um comando…",
      empty: "Nenhum comando encontrado",
      add: "Adicionar",
      undo: "Desfazer",
      redo: "Refazer",
      save: "Salvar no acervo",
      library: "Abrir meu acervo",
      login: "Entrar com Google",
      logout: "Sair da conta",
    },
    stage: {
      title: "Modo palco",
      untitled: "Sem título",
      empty: "A música ainda está vazia.",
      controls: "Controles do modo palco",
      back: "Voltar ao editor",
      smaller: "Diminuir letra (-)",
      bigger: "Aumentar letra (+)",
      slower: "Rolar mais devagar",
      faster: "Rolar mais rápido",
      play: "Rolar automaticamente (Espaço)",
      pause: "Pausar rolagem (Espaço)",
    },
    export: {
      title: "Exportar música",
      preview: "Pré-visualização do PDF",
      generating: "Gerando o PDF…",
      error: "Não foi possível gerar o PDF. Tente novamente.",
      fileName: "Nome do arquivo",
      download: "Baixar PDF",
      size: "Tamanho do texto",
      sizes: { small: "P", medium: "M", large: "G" },
      sizeNames: { small: "Pequeno", medium: "Médio", large: "Grande" },
      fitToPage: "Ajustar a uma página",
      fitted: "Reduzido para {percent}% para caber em uma folha.",
      notFitted: "Não coube em uma folha nem reduzindo para {percent}%.",
      manyPages:
        "O PDF ocupa mais de uma folha. Marque “Ajustar a uma página” para tentar caber em uma.",
    },
    confirm: {
      title: "Tem certeza?",
    },
    help: {
      title: "Ajuda e atalhos",
      shortcutsTitle: "Atalhos",
      shortcuts: [
        {
          keys: "/",
          description:
            "Num campo de texto, abre o seletor para inserir tab ou verso",
        },
        { keys: "Enter", description: "Cria um campo de texto abaixo" },
        {
          keys: "↑+↓",
          description: "Move o cursor entre as partes, mantendo a coluna",
        },
        {
          keys: "Backspace",
          description:
            "No começo da linha, junta com a de cima (Delete, no fim, junta com a de baixo)",
        },
        {
          keys: "Arrastar",
          description:
            "De uma linha para outra (ou da margem), seleciona as linhas inteiras",
        },
        {
          keys: "Esc",
          description: "Seleciona a linha atual; Shift+↑/↓ aumenta a seleção",
        },
        {
          keys: "Shift+Clique",
          description: "Seleciona as linhas até a clicada",
        },
        {
          keys: "Ctrl+A",
          description:
            "Seleciona o texto da linha; de novo, seleciona a música inteira",
        },
        {
          keys: "Delete",
          description:
            "Com linhas selecionadas, apaga todas (Ctrl+C e Ctrl+X copiam e recortam)",
        },
        { keys: "Ctrl+Z", description: "Desfaz a última alteração" },
        { keys: "Ctrl+Shift+Z", description: "Refaz a alteração desfeita" },
        { keys: "Ctrl+S", description: "Salva a música no acervo" },
        { keys: "Ctrl+K", description: "Abre a paleta de comandos" },
        { keys: "?", description: "Abre esta ajuda" },
      ],
    },
    emptyState: {
      title: "Comece sua música",
      description:
        "Preencha o título e o artista acima e escolha a primeira parte.",
      textHint: "Letra, seções e anotações",
      verseHint: "Acordes alinhados com a letra",
      tabHint: "Tablatura nas cordas do instrumento",
      pasteTip: "cola uma cifra copiada de outro site, com tabs e acordes",
      tip: "num campo de texto insere uma tab ou verso sem tirar a mão do teclado",
    },
    theme: {
      toggle: "Alternar tema",
      system: "Tema do sistema",
      light: "Tema claro",
      dark: "Tema escuro",
    },
    toast: {
      partRemoved: "Parte removida",
      partsRemoved: "Partes removidas",
      undo: "Desfazer",
    },
    tuning: {
      guitar: "Violão/Guitarra",
      bass: "Baixo",
      ukulele: "Ukulele",
      quickTuning: "Afinação rápida",
      strings: "Cordas (da mais aguda para a mais grave)",
      loseNotesConfirmAction: "Trocar afinação",
      loseNotesConfirm:
        "Algumas tabs têm notas em cordas que não existem na nova afinação. Essas notas serão apagadas. Continuar?",
      presets: {
        defaultTuning: "Padrão",
        halfTuning: "Meio tom",
        oneTune: "1 tom",
        dropDTuning: "Drop D",
        dropCTuning: "Drop C",
      },
    },
  },
};

// O PORTUGUÊS É A REFERÊNCIA: OS OUTROS IDIOMAS PRECISAM TER AS MESMAS CHAVES
export type MessageSchema = typeof locale;

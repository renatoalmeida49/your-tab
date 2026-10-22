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
        "Funcionalidade de login, onde você poderá deixar suas tabs salvas e concluí-las em outra ocasião.",
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
    },
    palette: {
      title: "Paleta de comandos",
      placeholder: "Digite um comando…",
      empty: "Nenhum comando encontrado",
      add: "Adicionar",
      undo: "Desfazer",
      redo: "Refazer",
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
      title: "Exportar PDF",
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
        { keys: "Ctrl+Z", description: "Desfaz a última alteração" },
        { keys: "Ctrl+Shift+Z", description: "Refaz a alteração desfeita" },
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

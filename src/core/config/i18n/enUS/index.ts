import type { MessageSchema } from "../ptBR";

export const locale: MessageSchema = {
  common: {
    confirm: "Confirm",
    cancel: "Cancel",
    close: "Close",
  },
  subtitle: "A chord sheet, tablature and annotation builder.",
  details: [
    {
      title: "Made for beginners and advanced",
      description:
        "Tab Builder can be used by all levels of guitarists, bassists or any other stringed instrument you play.",
    },
    {
      title: "Export in PDF",
      description:
        "With PDF export you can save your chord sheet and take it anywhere.",
    },
    {
      title: "Future implementations",
      description: [
        "Login functionality, where you can leave your tabs saved and complete them at another time.",
        "Basses and guitars with more strings",
        "Other string instruments",
        "Improved use of shortcuts",
      ],
    },
    {
      title: "Easy to use",
      description:
        "With shortcuts and navigation, you can quickly build a complete chord sheet. Click anywhere below to start your notes.",
    },
    {
      title: "Contact us!",
      description: "Did you see any bugs? Do you have any suggestions?",
    },
  ],
  components: {
    tabHeader: {
      songName: "Song title",
      artistName: "Artist",
      tone: "Key",
      tuning: "Tuning",
      tuningButton: "Change Tuning",
    },
    textField: {
      placeholder: "Press '/' to insert a tab or verse",
      insert: "Insert",
    },
    songContent: {
      insertBelow: "Insert below",
      actions: "Drag to move or click for more actions",
      duplicate: "Duplicate",
      moveUp: "Move up",
      moveDown: "Move down",
      remove: "Remove",
    },
    verse: {
      placeholder: "Enter the chords here. Press 'enter' for new text field",
    },
    menu: {
      tab: "Tab",
      text: "Text",
      verse: "Verse",
      downloadPdf: "Export PDF",
      newSong: "New song",
      newSongConfirm: "Start a new song? The current one will be erased.",
      newSongConfirmAction: "Erase and start",
      add: "Add part",
      undo: "Undo (Ctrl+Z)",
      redo: "Redo (Ctrl+Shift+Z)",
      help: "Help and shortcuts (?)",
      language: "Language",
    },
    export: {
      title: "Export PDF",
      preview: "PDF preview",
      generating: "Generating the PDF…",
      error: "Could not generate the PDF. Please try again.",
      fileName: "File name",
      download: "Download PDF",
    },
    confirm: {
      title: "Are you sure?",
    },
    help: {
      title: "Help and shortcuts",
      shortcutsTitle: "Shortcuts",
      shortcuts: [
        {
          keys: "/",
          description:
            "In a text field, opens the picker to insert a tab or verse",
        },
        { keys: "Enter", description: "Creates a text field below" },
        {
          keys: "↑+↓",
          description: "Moves the cursor between parts, keeping the column",
        },
        { keys: "Ctrl+Z", description: "Undoes the last change" },
        { keys: "Ctrl+Shift+Z", description: "Redoes the undone change" },
        { keys: "?", description: "Opens this help" },
      ],
    },
    emptyState: {
      title: "Start your song",
      description:
        "Fill in the title and artist above and pick the first part.",
      textHint: "Lyrics, sections and notes",
      verseHint: "Chords aligned with the lyrics",
      tabHint: "Tablature on the instrument strings",
      tip: "in a text field inserts a tab or verse without leaving the keyboard",
    },
    theme: {
      toggle: "Toggle theme",
      system: "System theme",
      light: "Light theme",
      dark: "Dark theme",
    },
    toast: {
      partRemoved: "Part removed",
      undo: "Undo",
    },
    tuning: {
      guitar: "Acoustic/Electric guitar",
      bass: "Bass",
      ukulele: "Ukulele",
      quickTuning: "Quick tuning",
      strings: "Strings (highest to lowest)",
      loseNotesConfirmAction: "Change tuning",
      loseNotesConfirm:
        "Some tabs have notes on strings that don't exist in the new tuning. Those notes will be erased. Continue?",
      presets: {
        defaultTuning: "Standard",
        halfTuning: "Half step down",
        oneTune: "Whole step down",
        dropDTuning: "Drop D",
        dropCTuning: "Drop C",
      },
    },
  },
};

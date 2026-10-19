export const locale = {
  common: {
    confirm: "Confirm",
    cancel: "Cancel",
  },
  subtitle: "A chord sheet, tablature and annotation builder.",
  help: "Read more",
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
      songName: "(Name)",
      artistName: "(Artist)",
      tone: "Key",
      tuning: "Tuning",
      tuningButton: "Change Tuning",
    },
    textField: {
      placeholder: "Press '/' to insert a tab or verse",
      selectTab: "Tab",
      selectVerse: "Verse",
    },
    verse: {
      placeholder: "Enter the chords here. Press 'enter' for new text field",
    },
    menu: {
      tab: "Tab",
      text: "Text",
      verse: "Verse",
      downloadPdf: "Download PDF",
      newSong: "New song",
      newSongConfirm: "Start a new song? The current one will be erased.",
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

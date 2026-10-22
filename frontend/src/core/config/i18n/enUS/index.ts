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
      transposeDown: "Transpose down a half step",
      transposeUp: "Transpose up a half step",
      tuningButton: "Change Tuning",
    },
    textField: {
      placeholder: "Press '/' to insert a tab or verse",
      insert: "Insert",
    },
    paste: {
      retuneConfirm:
        "The pasted tab uses a different tuning. Switch the song to its tuning? Existing tabs will be adjusted.",
      retuneLoseNotesConfirm:
        "The pasted tab uses a different tuning. Switching will erase notes of the current tabs on strings that no longer exist.",
      retuneConfirmAction: "Use the pasted tuning",
      keepTuning: "Keep the current one",
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
      export: "Export",
      newSong: "New song",
      newSongConfirm: "Start a new song? The current one will be erased.",
      newSongConfirmAction: "Erase and start",
      add: "Add part",
      undo: "Undo (Ctrl+Z)",
      redo: "Redo (Ctrl+Shift+Z)",
      help: "Help and shortcuts (?)",
      language: "Language",
      stage: "Stage mode",
      palette: "Commands (Ctrl+K)",
      newSongUnsavedConfirm:
        "Start a new song? Unsaved changes to the current one will be lost.",
      save: "Save",
      saving: "Saving…",
      saved: "Saved",
      saveHint: "Save to library (Ctrl+S)",
      login: "Sign in",
      account: "Your account",
      library: "My library",
      logout: "Sign out",
    },
    login: {
      title: "Sign in",
      description:
        "Sign in with your Google account to save your songs in the cloud and build playlists.",
      loading: "Loading Google sign-in…",
      signingIn: "Signing in…",
      notConfigured:
        "Sign-in is not configured yet: set GOOGLE_CLIENT_ID in backend/.env and restart the API.",
      offline: "Could not reach the server. Check that the API is running.",
      scriptFailed: "Could not load Google sign-in.",
      failed: "Could not sign in. Please try again.",
      welcome: "You're signed in. Your songs live in your library.",
    },
    library: {
      title: "My library",
      ciphers: "Songs",
      playlists: "Playlists",
      search: "Search by title or artist",
      loading: "Loading your library…",
      loadFailed: "Could not load your library.",
      retry: "Try again",
      empty:
        "No saved songs yet. Use “Save” in the top bar to keep the current song.",
      noResults: "No songs found.",
      untitled: "Untitled",
      current: "In the editor",
      updated: "Updated {date}",
      open: "Open",
      delete: "Delete",
      addToPlaylist: "Add to playlist",
      noPlaylists: "Create a playlist in the Playlists tab",
      saved: "Saved to your library",
      openConfirm:
        "Open another song? Unsaved changes to the current song will be lost.",
      openConfirmAction: "Open anyway",
      deleteConfirm:
        "Delete this song from your library? It will also leave your playlists.",
      deleteConfirmAction: "Delete",
      deletePlaylistConfirm:
        "Delete this playlist? The songs stay in your library.",
      newPlaylist: "New playlist name",
      createPlaylist: "Create playlist",
      playlistsEmpty: "No playlists yet. Create the first one above.",
      playlistEmpty: "Empty playlist. Add songs from the Songs tab.",
      songs: "no songs | {n} song | {n} songs",
      rename: "Rename",
      deletePlaylist: "Delete playlist",
      moveUp: "Move up",
      moveDown: "Move down",
      removeFromPlaylist: "Remove from playlist",
      errors: {
        session: "Your session expired. Sign in again to save.",
        offline: "No connection to the server.",
        generic: "Something went wrong. Please try again.",
      },
    },
    songFile: {
      downloadFile: "Download song file (.json)",
      downloadHint:
        "To open it on another computer or import it into another account's library.",
      openFile: "Open song file (.json)",
      openConfirm:
        "Open the file? Unsaved changes to the current song will be lost.",
      openConfirmAction: "Open anyway",
      opened: "Song opened from file",
      openedFirst:
        "The file has {count} songs: the first one was opened. To bring them all, use “Import” in the library",
      import: "Import",
      importHint: "Adds the songs from .json files to the library",
      imported: "Songs imported into the library: {count}",
      exportAll: "Export all",
      exportAllHint: "Downloads every song in the library as a .json file",
      errors: {
        invalid: "Invalid file: it isn't a Tab Builder song file",
        newer:
          "File made by a newer version of Tab Builder. Reload the page and try again",
        empty: "The file has no songs",
      },
    },
    palette: {
      title: "Command palette",
      placeholder: "Type a command…",
      empty: "No commands found",
      add: "Add",
      undo: "Undo",
      redo: "Redo",
      save: "Save to library",
      export: "Export song (PDF or .json)",
      library: "Open my library",
      login: "Sign in with Google",
      logout: "Sign out",
    },
    stage: {
      title: "Stage mode",
      untitled: "Untitled",
      empty: "The song is still empty.",
      controls: "Stage mode controls",
      back: "Back to editor",
      smaller: "Smaller text (-)",
      bigger: "Bigger text (+)",
      slower: "Scroll slower",
      faster: "Scroll faster",
      play: "Auto-scroll (Space)",
      pause: "Pause scrolling (Space)",
    },
    export: {
      title: "Export song",
      preview: "PDF preview",
      generating: "Generating the PDF…",
      error: "Could not generate the PDF. Please try again.",
      fileName: "File name",
      download: "Download PDF",
      size: "Text size",
      sizes: { small: "S", medium: "M", large: "L" },
      sizeNames: { small: "Small", medium: "Medium", large: "Large" },
      fitToPage: "Fit to one page",
      fitted: "Scaled down to {percent}% to fit on one page.",
      notFitted: "Doesn't fit on one page even at {percent}%.",
      manyPages:
        "The PDF takes more than one page. Check “Fit to one page” to try to fit it on one.",
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
        {
          keys: "Backspace",
          description:
            "At the start of a line, joins it with the one above (Delete, at the end, joins the one below)",
        },
        {
          keys: "Drag",
          description:
            "From one line to another (or from the margin), selects whole lines",
        },
        {
          keys: "Esc",
          description:
            "Selects the current line; Shift+↑/↓ extends the selection",
        },
        {
          keys: "Shift+Click",
          description: "Selects the lines up to the clicked one",
        },
        {
          keys: "Ctrl+A",
          description: "Selects the line's text; again, selects the whole song",
        },
        {
          keys: "Delete",
          description:
            "With lines selected, deletes them all (Ctrl+C and Ctrl+X copy and cut)",
        },
        { keys: "Ctrl+Z", description: "Undoes the last change" },
        { keys: "Ctrl+Shift+Z", description: "Redoes the undone change" },
        { keys: "Ctrl+S", description: "Saves the song to your library" },
        { keys: "Ctrl+K", description: "Opens the command palette" },
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
      pasteTip: "pastes a song copied from another site, with tabs and chords",
      openFile: "Open song file (.json)",
      openFileHint: "A song exported by Tab Builder itself",
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
      partsRemoved: "Parts removed",
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

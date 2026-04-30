<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { NotesStore } from '../../lib/stores/notes.svelte.js';
  import SearchBar from '../ui/SearchBar.svelte';
  import NotesList from '../notes/NotesList.svelte';
  import Icon from '../ui/Icon.svelte';

  interface Props {
    store: NotesStore;
    onCreateNote: () => void;
    onSelectNote: (id: string) => void;
    onOpenSettings: () => void;
  }

  let { store, onCreateNote, onSelectNote, onOpenSettings }: Props = $props();
</script>

<div class="flex h-full flex-col bg-ios-bg-secondary dark:bg-ios-bg-grouped-dark">
  <!-- Header -->
  <div class="safe-area-top">
    <div class="flex items-center justify-between px-4 pt-3 pb-2">
      <h1 class="text-[34px] font-bold text-ios-label dark:text-ios-label-dark">{t('appTitle')}</h1>
      <div class="flex items-center gap-2">
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full text-ios-blue active:opacity-60"
          onclick={onOpenSettings}
          aria-label={t('settings')}
        >
          <Icon name="gear" size={22} />
        </button>
        <button
          class="flex h-9 w-9 items-center justify-center rounded-full text-ios-blue active:opacity-60"
          onclick={onCreateNote}
          aria-label={t('newNote')}
        >
          <Icon name="plus" size={22} />
        </button>
      </div>
    </div>
  </div>

  <!-- Search -->
  <SearchBar value={store.searchQuery} oninput={(v) => store.searchQuery = v} />

  <!-- Notes list -->
  <div class="flex-1 overflow-y-auto">
    <NotesList
      notes={store.filteredNotes}
      selectedId={store.selectedNoteId}
      onselect={onSelectNote}
    />
  </div>
</div>

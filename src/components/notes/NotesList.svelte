<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { NoteIndex } from '../../lib/types/note.js';
  import NoteRow from './NoteRow.svelte';

  interface Props {
    notes: NoteIndex[];
    selectedId: string | null;
    onselect: (id: string) => void;
  }

  let { notes, selectedId, onselect }: Props = $props();
</script>

{#if notes.length === 0}
  <div class="flex h-full items-center justify-center px-8 text-center">
    <p class="text-[17px] text-ios-label-tertiary dark:text-ios-label-tertiary-dark">
      {t('noNotes')}
    </p>
  </div>
{:else}
  <div class="divide-y divide-ios-separator dark:divide-ios-separator-dark">
    {#each notes as note (note.id)}
      <NoteRow
        {note}
        selected={note.id === selectedId}
        onselect={() => onselect(note.id)}
      />
    {/each}
  </div>
{/if}

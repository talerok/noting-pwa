<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { NoteIndex } from '../../lib/types/note.js';
  import { relativeDate } from '../../lib/utils/date.js';
  import Icon from '../ui/Icon.svelte';

  interface Props {
    note: NoteIndex;
    selected: boolean;
    onselect: () => void;
  }

  let { note, selected, onselect }: Props = $props();
</script>

<button
  class="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors active:bg-white/10 dark:active:bg-white/5
    {selected ? 'bg-glass-selected dark:bg-glass-selected-dark' : ''}"
  onclick={onselect}
>
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-1.5">
      {#if note.isPinned}
        <Icon name="pin" size={14} class="flex-shrink-0 text-ios-orange" />
      {/if}
      <span class="truncate text-[17px] font-normal text-ios-label dark:text-ios-label-dark">
        {note.title || t('untitled')}
      </span>
      {#if note.isEncrypted}
        <Icon name="lock" size={14} class="flex-shrink-0 text-ios-gray" />
      {/if}
    </div>
    <p class="mt-0.5 text-[14px] text-ios-label-secondary dark:text-ios-label-secondary-dark">
      {relativeDate(note.updatedAt)}
    </p>
  </div>
</button>

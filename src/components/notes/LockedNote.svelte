<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { NotesStore } from '../../lib/stores/notes.svelte.js';
  import Icon from '../ui/Icon.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    store: NotesStore;
    isMobile: boolean;
    onback: () => void;
  }

  let { store, isMobile, onback }: Props = $props();

  let password = $state('');
  let error = $state('');
  let loading = $state(false);

  // Reset state when switching between locked notes (desktop reuses component)
  $effect(() => {
    store.loadedNote?.id;
    password = '';
    error = '';
    loading = false;
  });

  async function handleUnlock() {
    if (!password.trim()) return;
    loading = true;
    error = '';
    const success = await store.unlockNote(password);
    loading = false;
    if (!success) {
      error = t('wrongPassword');
    }
    password = '';
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleUnlock();
  }
</script>

<div class="flex h-full flex-col">
  <!-- Header -->
  <div class="safe-area-top">
    <div class="flex items-center justify-between px-4 pt-3 pb-2">
      <h1 class="min-w-0 truncate text-[34px] font-bold text-ios-label dark:text-ios-label-dark">
        {store.loadedNote?.title ?? ''}
      </h1>
      {#if isMobile}
        <Button variant="secondary" onclick={onback} class="h-9 w-9 flex-shrink-0 !rounded-full !px-0">
          <Icon name="chevronLeft" size={22} />
        </Button>
      {/if}
    </div>
  </div>

  <!-- Lock UI -->
  <div class="flex flex-1 flex-col items-center justify-center gap-4 px-8">
    <Icon name="lock" size={48} class="text-ios-gray3 dark:text-ios-gray" />
    <p class="text-[17px] text-ios-label-secondary dark:text-ios-label-secondary-dark">
      {t('noteIsLocked')}
    </p>

    <input
      type="password"
      placeholder={t('enterPassword')}
      class="w-full max-w-[280px] rounded-ios glass-input px-4 py-3 text-center text-[17px] text-ios-label outline-none placeholder:text-ios-gray dark:text-ios-label-dark"
      bind:value={password}
      onkeydown={handleKeydown}
    />

    {#if error}
      <p class="text-[14px] text-ios-red">{error}</p>
    {/if}

    <Button variant="secondary" onclick={handleUnlock} disabled={loading || !password.trim()}>
      {t('unlock')}
    </Button>
  </div>
</div>

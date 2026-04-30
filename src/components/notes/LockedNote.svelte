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
  <!-- Toolbar -->
  <div class="safe-area-top grid grid-cols-[1fr_auto_1fr] items-center border-b border-ios-separator px-4 dark:border-ios-separator-dark" style="min-height: 56px;">
    <div class="flex items-center justify-start">
      {#if isMobile}
        <button class="flex items-center gap-0.5 text-ios-blue active:opacity-60" onclick={onback}>
          <Icon name="chevronLeft" size={24} />
          <span class="text-[19px]">{t('back')}</span>
        </button>
      {/if}
    </div>
    <span class="max-w-[200px] truncate px-2 text-[19px] font-semibold text-ios-label dark:text-ios-label-dark">
      {store.loadedNote?.title ?? ''}
    </span>
    <div></div>
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
      class="w-full max-w-[280px] rounded-ios bg-ios-gray6 px-4 py-3 text-center text-[17px] text-ios-label outline-none placeholder:text-ios-gray dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark"
      bind:value={password}
      onkeydown={handleKeydown}
    />

    {#if error}
      <p class="text-[14px] text-ios-red">{error}</p>
    {/if}

    <Button onclick={handleUnlock} disabled={loading || !password.trim()}>
      {t('unlock')}
    </Button>
  </div>
</div>

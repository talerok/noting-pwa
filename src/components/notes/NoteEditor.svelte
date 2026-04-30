<script lang="ts">
  import { untrack } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { NotesStore } from '../../lib/stores/notes.svelte.js';
  import Icon from '../ui/Icon.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    store: NotesStore;
    isMobile: boolean;
    onback: () => void;
    onRename: () => void;
    onDelete: () => void;
    onSetPassword: () => void;
    onChangePassword: () => void;
    onRemovePassword: () => void;
  }

  let {
    store, isMobile, onback,
    onRename, onDelete, onSetPassword, onChangePassword, onRemovePassword,
  }: Props = $props();

  let menuOpen = $state(false);
  let localContent = $state('');

  // Sync local content from store when note identity/encryption changes — but NOT on
  // every persistContent mutation, to avoid resetting the textarea cursor position.
  $effect(() => {
    const id = store.loadedNote?.id;
    const isEncrypted = store.loadedNote?.isEncrypted;
    const decrypted = store.decryptedContent;

    untrack(() => {
      const note = store.loadedNote;
      if (!note) {
        localContent = '';
      } else if (isEncrypted) {
        localContent = decrypted ?? '';
      } else {
        localContent = note.content;
      }
    });
  });

  function handleInput(e: Event) {
    const value = (e.target as HTMLTextAreaElement).value;
    localContent = value;
    store.saveContent(value);
  }

  function toggleMenu() {
    menuOpen = !menuOpen;
  }

  function closeMenu() {
    menuOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && menuOpen) {
      closeMenu();
    }
  }

  function menuAction(fn: () => void) {
    closeMenu();
    fn();
  }
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<svelte:window onkeydown={handleKeydown} />

{#if menuOpen}
  <div class="fixed inset-0 z-40" onclick={closeMenu}></div>
{/if}

<div class="flex h-full flex-col">
  <!-- Header -->
  <div class="safe-area-top">
    <div class="flex items-center justify-between px-4 pt-3 pb-2">
      <div class="flex min-w-0 items-center gap-1.5">
        {#if store.loadedNote?.isPinned}
          <Icon name="pin" size={18} class="flex-shrink-0 text-ios-orange" />
        {/if}
        <h1 class="truncate text-[34px] font-bold text-ios-label dark:text-ios-label-dark">
          {store.loadedNote?.title ?? ''}
        </h1>
      </div>
      <div class="flex flex-shrink-0 items-center gap-2">
        {#if isMobile}
          <Button variant="secondary" onclick={onback} class="h-9 w-9 !rounded-full !px-0">
            <Icon name="chevronLeft" size={22} />
          </Button>
        {/if}
        <div class="relative">
        <Button variant="secondary" onclick={toggleMenu} class="h-9 w-9 !rounded-full !px-0">
          <Icon name="ellipsis" size={22} />
        </Button>

      {#if menuOpen}
        <div class="absolute right-0 top-full z-50 mt-1 w-52 origin-top-right rounded-ios-lg glass-elevated py-1" in:scale={{ start: 0.9, duration: 200 }} out:fade={{ duration: 150 }}>
          <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-white/10 dark:text-ios-label-dark dark:active:bg-white/5" onclick={() => menuAction(onRename)}>
            <Icon name="pencil" size={18} />
            <span>{t('renameNote')}</span>
          </button>
          <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-white/10 dark:text-ios-label-dark dark:active:bg-white/5" onclick={() => menuAction(() => store.togglePin())}>
            <Icon name="pin" size={18} />
            <span>{store.loadedNote?.isPinned ? t('unpin') : t('pin')}</span>
          </button>
          <div class="my-1 border-t border-ios-separator dark:border-ios-separator-dark"></div>
          {#if store.loadedNote?.isEncrypted}
            <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-white/10 dark:text-ios-label-dark dark:active:bg-white/5" onclick={() => menuAction(onChangePassword)}>
              <Icon name="lock" size={18} />
              <span>{t('changePassword')}</span>
            </button>
            <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-white/10 dark:text-ios-label-dark dark:active:bg-white/5" onclick={() => menuAction(onRemovePassword)}>
              <Icon name="lock" size={18} />
              <span>{t('removePassword')}</span>
            </button>
          {:else}
            <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-white/10 dark:text-ios-label-dark dark:active:bg-white/5" onclick={() => menuAction(onSetPassword)}>
              <Icon name="lock" size={18} />
              <span>{t('setPassword')}</span>
            </button>
          {/if}
          <div class="my-1 border-t border-ios-separator dark:border-ios-separator-dark"></div>
          <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-red active:bg-ios-gray5 dark:active:bg-white/5" onclick={() => menuAction(onDelete)}>
            <Icon name="trash" size={18} />
            <span>{t('deleteNote')}</span>
          </button>
        </div>
      {/if}
      </div>
      </div>
    </div>
  </div>

  <!-- Editor -->
  <textarea
    class="flex-1 resize-none bg-transparent px-4 py-3 text-[17px] leading-relaxed text-ios-label outline-none placeholder:text-ios-label-tertiary dark:text-ios-label-dark dark:placeholder:text-ios-label-tertiary-dark"
    placeholder={t('startWriting')}
    value={localContent}
    oninput={handleInput}
  ></textarea>
</div>


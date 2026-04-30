<script lang="ts">
  import { untrack } from 'svelte';
  import { scale } from 'svelte/transition';
  import { t } from '../../lib/i18n/index.svelte.js';
  import type { NotesStore } from '../../lib/stores/notes.svelte.js';
  import Icon from '../ui/Icon.svelte';

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
  <!-- Toolbar -->
  <div class="safe-area-top grid grid-cols-[1fr_auto_1fr] items-center border-b border-ios-separator px-4 dark:border-ios-separator-dark" style="min-height: 56px;">
    <div class="flex items-center justify-start">
      {#if isMobile}
        <button
          class="flex items-center gap-0.5 text-ios-blue active:opacity-60"
          onclick={onback}
        >
          <Icon name="chevronLeft" size={24} />
          <span class="text-[19px]">{t('back')}</span>
        </button>
      {/if}
    </div>

    <div class="flex items-center gap-1 px-2">
      {#if store.loadedNote?.isPinned}
        <Icon name="pin" size={16} class="text-ios-orange" />
      {/if}
      <span class="max-w-[200px] truncate text-[19px] font-semibold text-ios-label dark:text-ios-label-dark">
        {store.loadedNote?.title ?? ''}
      </span>
    </div>

    <div class="flex items-center justify-end">
      <div class="relative">
        <button
          class="flex h-10 w-10 items-center justify-center rounded-full text-ios-blue active:opacity-60"
          onclick={toggleMenu}
        >
          <Icon name="ellipsis" size={24} />
        </button>

      {#if menuOpen}
        <div class="absolute right-0 top-full z-50 mt-1 w-52 origin-top-right rounded-ios-lg bg-ios-bg-elevated py-1 shadow-xl dark:bg-ios-bg-elevated2-dark" transition:scale={{ start: 0.9, duration: 150 }}>
          <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-ios-gray5 dark:text-ios-label-dark dark:active:bg-ios-bg-elevated2-dark" onclick={() => menuAction(onRename)}>
            <Icon name="pencil" size={18} />
            <span>{t('renameNote')}</span>
          </button>
          <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-ios-gray5 dark:text-ios-label-dark dark:active:bg-ios-bg-elevated2-dark" onclick={() => menuAction(() => store.togglePin())}>
            <Icon name="pin" size={18} />
            <span>{store.loadedNote?.isPinned ? t('unpin') : t('pin')}</span>
          </button>
          <div class="my-1 border-t border-ios-separator dark:border-ios-separator-dark"></div>
          {#if store.loadedNote?.isEncrypted}
            <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-ios-gray5 dark:text-ios-label-dark dark:active:bg-ios-bg-elevated2-dark" onclick={() => menuAction(onChangePassword)}>
              <Icon name="lock" size={18} />
              <span>{t('changePassword')}</span>
            </button>
            <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-ios-gray5 dark:text-ios-label-dark dark:active:bg-ios-bg-elevated2-dark" onclick={() => menuAction(onRemovePassword)}>
              <Icon name="lock" size={18} />
              <span>{t('removePassword')}</span>
            </button>
          {:else}
            <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-label active:bg-ios-gray5 dark:text-ios-label-dark dark:active:bg-ios-bg-elevated2-dark" onclick={() => menuAction(onSetPassword)}>
              <Icon name="lock" size={18} />
              <span>{t('setPassword')}</span>
            </button>
          {/if}
          <div class="my-1 border-t border-ios-separator dark:border-ios-separator-dark"></div>
          <button class="flex w-full items-center gap-2.5 px-4 py-2.5 text-[17px] text-ios-red active:bg-ios-gray5 dark:active:bg-ios-bg-elevated2-dark" onclick={() => menuAction(onDelete)}>
            <Icon name="trash" size={18} />
            <span>{t('deleteNote')}</span>
          </button>
        </div>
      {/if}
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


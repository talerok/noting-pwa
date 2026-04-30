<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    open: boolean;
    title: string;
    onclose: () => void;
    onsubmit: (password: string) => void;
    showConfirm?: boolean;
  }

  let { open, title, onclose, onsubmit, showConfirm = false }: Props = $props();

  let password = $state('');
  let confirm = $state('');
  let error = $state('');

  $effect(() => {
    if (open) {
      password = '';
      confirm = '';
      error = '';
    }
  });

  function handleSubmit() {
    if (!password) return;
    if (showConfirm && password !== confirm) {
      error = t('passwordsDoNotMatch');
      return;
    }
    onsubmit(password);
    onclose();
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

<Modal {open} {onclose}>
  <h3 class="mb-4 text-center text-[17px] font-semibold text-ios-label dark:text-ios-label-dark">
    {title}
  </h3>

  <input
    type="password"
    placeholder={showConfirm ? t('newPassword') : t('enterPassword')}
    class="w-full rounded-ios bg-ios-gray6 px-4 py-3 text-[17px] text-ios-label outline-none dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark"
    bind:value={password}
    onkeydown={handleKeydown}
  />

  {#if showConfirm}
    <input
      type="password"
      placeholder={t('confirmPassword')}
      class="mt-3 w-full rounded-ios bg-ios-gray6 px-4 py-3 text-[17px] text-ios-label outline-none dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark"
      bind:value={confirm}
      onkeydown={handleKeydown}
    />
  {/if}

  {#if error}
    <p class="mt-2 text-center text-[14px] text-ios-red">{error}</p>
  {/if}

  <div class="mt-4 flex gap-3">
    <Button variant="secondary" onclick={onclose} class="flex-1">{t('cancel')}</Button>
    <Button onclick={handleSubmit} class="flex-1" disabled={!password}>{t('done')}</Button>
  </div>
</Modal>

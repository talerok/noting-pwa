<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    onsubmit: (currentPassword: string, newPassword: string) => Promise<boolean>;
  }

  let { open, onclose, onsubmit }: Props = $props();

  let currentPwd = $state('');
  let newPwd = $state('');
  let confirmPwd = $state('');
  let error = $state('');
  let loading = $state(false);

  $effect(() => {
    if (open) {
      currentPwd = '';
      newPwd = '';
      confirmPwd = '';
      error = '';
      loading = false;
    }
  });

  async function handleSubmit() {
    if (!currentPwd || !newPwd || loading) return;
    if (newPwd !== confirmPwd) {
      error = t('passwordsDoNotMatch');
      return;
    }
    loading = true;
    const success = await onsubmit(currentPwd, newPwd);
    loading = false;
    if (success) {
      onclose();
    } else {
      error = t('wrongPassword');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

<Modal {open} {onclose}>
  <h3 class="mb-4 text-center text-[17px] font-semibold text-ios-label dark:text-ios-label-dark">
    {t('changePassword')}
  </h3>

  <input
    type="password"
    placeholder={t('currentPassword')}
    class="w-full rounded-ios bg-ios-gray6 px-4 py-3 text-[17px] text-ios-label outline-none dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark"
    bind:value={currentPwd}
    onkeydown={handleKeydown}
  />
  <input
    type="password"
    placeholder={t('newPassword')}
    class="mt-3 w-full rounded-ios bg-ios-gray6 px-4 py-3 text-[17px] text-ios-label outline-none dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark"
    bind:value={newPwd}
    onkeydown={handleKeydown}
  />
  <input
    type="password"
    placeholder={t('confirmPassword')}
    class="mt-3 w-full rounded-ios bg-ios-gray6 px-4 py-3 text-[17px] text-ios-label outline-none dark:bg-ios-bg-elevated2-dark dark:text-ios-label-dark"
    bind:value={confirmPwd}
    onkeydown={handleKeydown}
  />

  {#if error}
    <p class="mt-2 text-center text-[14px] text-ios-red">{error}</p>
  {/if}

  <div class="mt-4 flex gap-3">
    <Button variant="secondary" onclick={onclose} class="flex-1">{t('cancel')}</Button>
    <Button onclick={handleSubmit} class="flex-1" disabled={!currentPwd || !newPwd || loading}>{t('done')}</Button>
  </div>
</Modal>

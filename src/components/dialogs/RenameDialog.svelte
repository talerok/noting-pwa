<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    open: boolean;
    currentTitle: string;
    onclose: () => void;
    onrename: (title: string) => void;
  }

  let { open, currentTitle, onclose, onrename }: Props = $props();

  let title = $state('');

  $effect(() => {
    if (open) title = currentTitle;
  });

  function handleSubmit() {
    if (title.trim()) {
      onrename(title.trim());
      onclose();
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') handleSubmit();
  }
</script>

<Modal {open} {onclose}>
  <h3 class="mb-4 text-center text-[17px] font-semibold text-ios-label dark:text-ios-label-dark">
    {t('renameNote')}
  </h3>
  <input
    type="text"
    class="w-full rounded-ios glass-input px-4 py-3 text-[17px] text-ios-label outline-none dark:text-ios-label-dark"
    bind:value={title}
    onkeydown={handleKeydown}
  />
  <div class="mt-4 flex gap-3">
    <Button variant="secondary" onclick={onclose} class="flex-1">{t('cancel')}</Button>
    <Button variant="secondary" onclick={handleSubmit} class="flex-1" disabled={!title.trim()}>{t('save')}</Button>
  </div>
</Modal>

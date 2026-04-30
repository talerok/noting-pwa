<script lang="ts">
  import { t } from '../../lib/i18n/index.svelte.js';
  import Modal from '../ui/Modal.svelte';
  import Button from '../ui/Button.svelte';

  interface Props {
    open: boolean;
    onclose: () => void;
    onconfirm: () => void;
  }

  let { open, onclose, onconfirm }: Props = $props();
</script>

<Modal {open} {onclose}>
  <h3 class="mb-2 text-center text-[17px] font-semibold text-ios-label dark:text-ios-label-dark">
    {t('deleteNote')}
  </h3>
  <p class="mb-4 text-center text-[15px] text-ios-label-secondary dark:text-ios-label-secondary-dark">
    {t('deleteNoteConfirm')}
  </p>
  <div class="flex gap-3">
    <Button variant="secondary" onclick={onclose} class="flex-1">{t('cancel')}</Button>
    <Button variant="destructive" onclick={() => { onconfirm(); onclose(); }} class="flex-1">{t('delete')}</Button>
  </div>
</Modal>

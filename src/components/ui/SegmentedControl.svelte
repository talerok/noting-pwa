<script lang="ts">
  interface Option {
    value: string;
    label: string;
  }

  interface Props {
    options: Option[];
    selected: string;
    onchange: (value: string) => void;
  }

  let { options, selected, onchange }: Props = $props();
</script>

<div class="flex rounded-[10px] glass-input p-[2px]">
  {#each options as opt}
    <button
      class="flex-1 rounded-[9px] px-3 py-[6px] text-[13px] font-medium transition-all
        {selected === opt.value
          ? 'glass text-ios-label shadow-sm dark:text-ios-label-dark'
          : 'text-ios-label-secondary dark:text-ios-label-secondary-dark'}"
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

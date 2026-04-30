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

<div class="flex rounded-[8px] bg-ios-gray6 p-[2px] dark:bg-ios-bg-elevated2-dark">
  {#each options as opt}
    <button
      class="flex-1 rounded-[7px] px-3 py-[6px] text-[13px] font-medium transition-all
        {selected === opt.value
          ? 'bg-white text-ios-label shadow-sm dark:bg-ios-bg-elevated-dark dark:text-ios-label-dark'
          : 'text-ios-label-secondary dark:text-ios-label-secondary-dark'}"
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

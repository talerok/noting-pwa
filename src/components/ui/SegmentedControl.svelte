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

  let selectedIndex = $derived(options.findIndex((o) => o.value === selected));
</script>

<div class="relative flex overflow-hidden rounded-[10px] bg-black/8 dark:bg-white/12 p-[2px]">
  <!-- Sliding pill -->
  <div
    class="absolute top-[2px] bottom-[2px] left-[2px] rounded-[9px] transition-transform duration-300 ease-out bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.08)] dark:bg-white/15 dark:shadow-none"
    style="width: calc((100% - 4px) / {options.length}); transform: translateX({selectedIndex * 100}%);"
  ></div>

  {#each options as opt}
    <button
      class="relative z-10 flex-1 rounded-[9px] px-3 py-[6px] text-[13px] font-medium transition-colors duration-200
        {selected === opt.value
          ? 'text-ios-label dark:text-ios-label-dark'
          : 'text-ios-label-secondary dark:text-ios-label-secondary-dark'}"
      onclick={() => onchange(opt.value)}
    >
      {opt.label}
    </button>
  {/each}
</div>

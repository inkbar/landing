<script lang="ts">
  import type { FrameworkId } from '../../data/snippets'

  interface Panel {
    id: FrameworkId
    label: string
    file: string
    install: string
    html: string
  }

  let { panels, initial }: { panels: Panel[]; initial: FrameworkId } = $props()

  // The initial tab is read once on purpose; the parent never changes it.
  // svelte-ignore state_referenced_locally
  let selected = $state(initial)
  const active = $derived(panels.find((panel) => panel.id === selected) ?? panels[0])
</script>

<div class="tabs">
  <div class="bar">
    <div class="buttons" role="group" aria-label="Framework">
      {#each panels as panel (panel.id)}
        <button
          type="button"
          aria-pressed={panel.id === selected}
          onclick={() => (selected = panel.id)}
        >
          {panel.label}
        </button>
      {/each}
    </div>
    {#if active}<span class="file">{active.file}</span>{/if}
  </div>
  {#if active}
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <div class="code" tabindex="0" role="region" aria-label="{active.label} code sample">
      {@html active.html}
    </div>
    <div class="install"><span class="prompt" aria-hidden="true">$</span>{active.install}</div>
  {/if}
</div>

<style>
  .tabs {
    background: var(--ink-raised);
    border: 1px solid var(--ink-line);
    border-radius: var(--radius-card);
    overflow: hidden;
  }
  .bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 12px;
    border-bottom: 1px solid var(--ink-line);
  }
  .buttons {
    display: flex;
    gap: 4px;
  }
  button {
    min-height: 44px;
    padding: 0 18px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--on-ink);
    font-weight: 600;
    font-size: 15px;
  }
  button[aria-pressed='true'] {
    background: var(--highlighter);
    color: var(--ink);
  }
  .file {
    padding-right: 8px;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--on-ink-muted);
  }
  .code {
    min-height: 400px;
    padding: 22px 24px;
    overflow-x: auto;
    font-size: 13.5px;
    line-height: 1.7;
  }
  .code:focus-visible {
    outline-offset: -5px;
  }
  .code :global(pre) {
    margin: 0;
    background: transparent !important;
    font-family: var(--font-mono);
  }
  .install {
    padding: 14px 24px;
    border-top: 1px solid var(--ink-line);
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: 13.5px;
    color: #ffffff;
  }
  .prompt {
    margin-right: 10px;
    color: var(--on-ink-muted);
  }
</style>

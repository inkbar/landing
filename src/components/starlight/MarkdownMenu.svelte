<script lang="ts">
  import { Check, ChevronDown, ICON_ATTRIBUTES, type IconNode } from '@inkbar/icons'
  import { onMount, tick } from 'svelte'

  interface Props {
    /** The absolute URL of this page's Markdown twin. */
    twin: string
    /** The absolute URL of llms.txt. */
    llms: string
  }
  let { twin, llms }: Props = $props()
  // The twin on this origin, so the dev server and PR previews copy and open their own.
  const localTwin = $derived(new URL(twin).pathname)

  // The Lucide copy outline, which @inkbar/icons does not ship.
  const Copy: IconNode = [
    ['rect', { width: '14', height: '14', x: '8', y: '8', rx: '2', ry: '2' }],
    ['path', { d: 'M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2' }],
  ]

  // Until mounted only the plain link renders, so the server HTML works without JS.
  let mounted = $state(false)
  let open = $state(false)
  let alignStart = $state(false)
  let copied = $state(false)
  let linkCopied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined
  let linkTimer: ReturnType<typeof setTimeout> | undefined
  let root: HTMLElement | undefined = $state()
  let arrow: HTMLButtonElement | undefined = $state()
  let menu: HTMLElement | undefined = $state()

  onMount(() => {
    mounted = true
    return () => {
      clearTimeout(timer)
      clearTimeout(linkTimer)
    }
  })

  // Opens a URL in a new tab, or here when the browser blocks the tab: a failed copy has
  // awaited by then, so the click may no longer count as one. With "noopener" window.open
  // always returns null, so drop the opener by hand instead.
  function show(url: string) {
    const tab = window.open(url, '_blank')
    if (tab) tab.opener = null
    else location.href = url
  }

  // Each copy takes a number; one that finishes after a newer copy has started is stale, and
  // must not replace the newer one's tick or announcement.
  let latest = 0

  function showCopied() {
    linkCopied = false
    clearTimeout(linkTimer)
    copied = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied = false), 2000)
  }

  async function copyPage() {
    const copy = ++latest
    try {
      const text = fetch(localTwin).then(async (res) => {
        if (!res.ok) throw new Error(`${res.status}`)
        return new Blob([await res.text()], { type: 'text/plain' })
      })
      // The catch below reports a failed fetch; this stops it also surfacing as unhandled.
      text.catch(() => {})
      // Safari only lets the click write to the clipboard before anything is awaited, so hand
      // it the pending fetch as a promised item rather than waiting for it first.
      if (typeof ClipboardItem !== 'undefined' && 'write' in navigator.clipboard) {
        await navigator.clipboard.write([new ClipboardItem({ 'text/plain': text })])
      } else {
        await navigator.clipboard.writeText(await (await text).text())
      }
      if (copy === latest) showCopied()
    } catch {
      if (copy !== latest) return
      // No twin or no clipboard: show the Markdown instead, so the reader can still take it.
      show(localTwin)
    }
  }

  async function copyLlms() {
    const copy = ++latest
    try {
      await navigator.clipboard.writeText(llms)
      if (copy !== latest) return
      copied = false
      clearTimeout(timer)
      linkCopied = true
      clearTimeout(linkTimer)
      linkTimer = setTimeout(() => (linkCopied = false), 2000)
    } catch {
      if (copy === latest) show(llms)
    }
    closeMenu()
  }

  function items(): HTMLElement[] {
    return menu ? [...menu.querySelectorAll<HTMLElement>('[role="menuitem"]')] : []
  }

  async function openMenu() {
    alignStart = false
    open = true
    await tick()
    // The menu opens leftwards from the button. Once the button wraps under a long title, that
    // runs out of the title row (or off a phone screen), so open rightwards instead. The island
    // wrapper has display: contents and no box, so measure the row around it.
    const row = root?.parentElement?.closest(':not(astro-island)')
    const rowLeft = row?.getBoundingClientRect().left ?? 0
    if (menu && menu.getBoundingClientRect().left < Math.max(rowLeft, 8))
      alignStart = true
    items()[0]?.focus()
  }

  function closeMenu() {
    open = false
    arrow?.focus()
  }

  function onMenuKeydown(event: KeyboardEvent) {
    const all = items()
    const at = all.indexOf(document.activeElement as HTMLElement)
    const moves: Record<string, number> = {
      ArrowDown: (at + 1) % all.length,
      ArrowUp: (at - 1 + all.length) % all.length,
      Home: 0,
      End: all.length - 1,
    }
    if (event.key in moves) {
      event.preventDefault()
      all[moves[event.key]]?.focus()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closeMenu()
    } else if (event.key === 'Tab') {
      open = false
    }
  }

  $effect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!root || root.contains(event.target as Node)) return
      open = false
      // Let the click move focus where it lands; only when it lands nowhere (plain text, the
      // page background) does focus go back to the arrow, so keyboard users keep their place.
      setTimeout(() => {
        if (document.activeElement === document.body) arrow?.focus()
      })
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  })
</script>

{#snippet icon(node: IconNode)}
  <svg {...ICON_ATTRIBUTES} aria-hidden="true">
    {#each node as [tag, attrs], index (index)}
      <svelte:element this={tag} {...attrs} />
    {/each}
  </svg>
{/snippet}

<div class="markdown-menu" data-markdown-menu bind:this={root}>
  {#if !mounted}
    <a class="btn" href={twin}>View Markdown</a>
  {:else}
    <div class="split">
      <button type="button" class="btn main" onclick={copyPage}>
        {@render icon(copied ? Check : Copy)}
        Copy as Markdown
      </button>
      <button
        type="button"
        class="btn arrow"
        aria-label="More Markdown options"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? 'markdown-menu-items' : undefined}
        bind:this={arrow}
        onclick={() => (open ? closeMenu() : openMenu())}
      >
        <!-- The menu has closed by now, so the arrow shows the tick for the copied link. -->
        {@render icon(linkCopied ? Check : ChevronDown)}
      </button>
    </div>
    {#if open}
      <div
        id="markdown-menu-items"
        class="menu"
        class:start={alignStart}
        role="menu"
        aria-label="Markdown options"
        tabindex="-1"
        bind:this={menu}
        onkeydown={onMenuKeydown}
      >
        <a role="menuitem" tabindex="-1" href={twin}>
          View Markdown<small>Open this page as .md</small>
        </a>
        <button role="menuitem" tabindex="-1" type="button" onclick={copyLlms}>
          Copy llms.txt link<small>For pointing an agent at all the docs</small>
        </button>
      </div>
    {/if}
  {/if}
  <span class="sr-only" aria-live="polite"
    >{linkCopied ? 'Link copied' : copied ? 'Copied' : ''}</span
  >
</div>

<style>
  .markdown-menu {
    position: relative;
    display: inline-flex;
    font-family: var(--font-body);
    font-size: 0.8125rem;
    line-height: 1.4;
  }
  .split {
    display: inline-flex;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4375rem;
    min-height: 2.25rem;
    margin: 0;
    padding: 0.375rem 0.75rem;
    border: 1px solid var(--line);
    border-radius: var(--radius-control);
    background: var(--sheet);
    color: var(--ink);
    font: inherit;
    font-weight: 600;
    text-decoration: none;
    white-space: nowrap;
    cursor: pointer;
  }
  .btn:hover {
    background: var(--paper);
  }
  .btn:focus-visible,
  .menu [role='menuitem']:focus-visible {
    outline: 3px solid var(--ballpoint);
    outline-offset: 2px;
  }
  .btn svg {
    width: 0.9375rem;
    height: 0.9375rem;
  }
  .main {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  .arrow {
    padding-inline: 0.5rem;
    border-inline-start: 0;
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  .menu {
    position: absolute;
    top: calc(100% + 0.375rem);
    right: 0;
    z-index: 10;
    display: flex;
    flex-direction: column;
    width: 16rem;
    padding: 0.375rem;
    border: 1px solid var(--line);
    border-radius: 12px;
    background: var(--sheet);
    box-shadow: 0 8px 24px rgb(13 16 38 / 0.12);
  }
  .menu.start {
    right: auto;
    left: 0;
  }
  .menu [role='menuitem'] {
    display: block;
    width: 100%;
    margin: 0;
    padding: 0.5rem 0.625rem;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: var(--ink);
    font: inherit;
    font-weight: 600;
    text-align: start;
    text-decoration: none;
    cursor: pointer;
  }
  .menu [role='menuitem']:hover,
  .menu [role='menuitem']:focus {
    background: var(--paper);
  }
  .menu small {
    display: block;
    color: var(--caption);
    font-size: 0.75rem;
    font-weight: 400;
  }
</style>

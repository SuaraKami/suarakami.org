<script lang='ts'>
  import type { CollectionEntry } from 'astro:content'
  import type { ForceGraphData, GraphSelectionPayload } from '@/components/force-graph/types'
  import { Popover, ScrollArea } from 'bits-ui'
  import Drawer from '@harshmandan/svaul'
  import ForceGraph from '@/components/force-graph/graph.svelte'
  import { useGlossaryEvents } from '@/lib/hooks/use-glossary-events.svelte'
  import { useIsMobile } from '@/lib/hooks/use-is-mobile.svelte'
  import { glossaryPreference } from '@/lib/stores/glossary-preferences.svelte'
  import { glossaryStates } from './glossary-state.svelte'
  import '@/components/glossary/glossary-term.svelte'

  type GlossaryEntry = CollectionEntry<'glossary'>
  interface GroupedRelations {
    label: string
    items: { term: string, entry: GlossaryEntry | null }[]
  }

  const { entries = [] }: { entries: GlossaryEntry[] } = $props()

  // svelte-ignore state_referenced_locally
  const entryMap = new Map(entries.map(entry => [entry.id, entry]))

  let anchorEl = $state<HTMLElement | null>(null)
  let activeSlug = $state<string | null>(null)
  let detailSlug = $state<string | null>(null)

  const rootEntry = $derived(activeSlug ? entryMap.get(activeSlug) ?? null : null)
  const relations = $derived(rootEntry?.data.relations ?? [])

  function buildGraphData(root: GlossaryEntry): ForceGraphData {
    const nodes: ForceGraphData['nodes'] = [
      { id: root.id, kind: 'page', label: root.data.term, tags: [] },
    ]
    const links: ForceGraphData['links'] = []
    const seen = new Set([root.id])

    for (const relation of root.data.relations) {
      const targetSlug = relation.to.id
      if (!seen.has(targetSlug)) {
        const targetEntry = entryMap.get(targetSlug)
        nodes.push({
          id: targetSlug,
          kind: 'tag',
          label: targetEntry?.data.term ?? relation.type,
          tags: [relation.type],
        })
        seen.add(targetSlug)
      }
      links.push({ source: root.id, target: targetSlug })
    }

    return { links, nodes }
  }

  const graphData = $derived<ForceGraphData | null>(rootEntry ? buildGraphData(rootEntry) : null)
  const hasRelations = $derived(relations.length > 0)
  const groupedRelations = $derived.by(() => {
    const groups: Record<string, GroupedRelations> = {}
    for (const relation of relations) {
      const targetEntry = entryMap.get(relation.to.id) ?? null
      const item = {
        entry: targetEntry,
        term: targetEntry?.data.term ?? relation.type,
      }
      const groupLabel = relation.type
      if (!groups[groupLabel]) {
        groups[groupLabel] = { items: [], label: groupLabel }
      }
      groups[groupLabel].items.push(item)
    }
    return Object.values(groups)
  })
  const detailEntry = $derived.by(() => {
    if (!activeSlug) {
      return null
    }
    const slug = detailSlug ?? activeSlug
    return entryMap.get(slug) ?? null
  })
  const detailHeading = $derived(detailEntry?.data.term)
  const detailDefinition = $derived(detailEntry?.data.definition)

  const isMobile = useIsMobile()
  const isGlossaryEnabled = $derived(glossaryPreference.current)

  function closeOverlay() {
    // Keep content state while the overlay closes; clearing it here swaps the panel
    // to the empty state before the overlay is gone and makes the graph flicker.
    glossaryStates.isOpen = false
  }

  function resetOverlayImmediately() {
    closeOverlay()
    anchorEl = null
    activeSlug = null
    detailSlug = null
  }

  function openFor(target: HTMLElement | null, slug: string) {
    if (!entryMap.has(slug)) {
      return
    }
    anchorEl = target
    activeSlug = slug
    detailSlug = slug
  }

  function handleVisibilityChange(next: boolean) {
    if (!next) {
      closeOverlay()
    }
  }

  function focusRelation(slug: string | null) {
    if (!slug) {
      return
    }
    detailSlug = slug
  }

  function handleGraphSelect(payload: GraphSelectionPayload) {
    detailSlug = payload.id
  }

  const { onOpen: onOpenGlossary } = useGlossaryEvents()
  onOpenGlossary(openFor)

  $effect(() => {
    if (!isGlossaryEnabled) {
      resetOverlayImmediately()
    }
  })
</script>

{#if entries.length && isGlossaryEnabled}
  {#if !isMobile.current}
    <Popover.Root
      open={glossaryStates.isOpen}
      onOpenChange={handleVisibilityChange}
    >
      <Popover.Portal>
        <Popover.Content customAnchor={anchorEl} sideOffset={12} class='z-50'>
          <div
            class='rounded-2xl border border-border/60 bg-panel'
          >
            <ScrollArea.Root class='w-full pr-1'>
              <ScrollArea.Viewport class='max-h-144 w-lg rounded-2xl p-6 pr-5'>
                {#if graphData && rootEntry}
                  {@render panel()}
                {:else}
                  {@render emptyState()}
                {/if}
              </ScrollArea.Viewport>
              <ScrollArea.Scrollbar
                orientation='vertical'
                class='my-4 flex w-1.5 touch-none rounded-full border-l border-l-transparent bg-panel select-none hover:w-2'
              >
                <ScrollArea.Thumb class='flex-1 rounded-full bg-foreground/20' />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  {:else}
    <Drawer
      bind:open={glossaryStates.isOpen}
      ariaLabel={detailHeading ?? 'Glosarium'}
      class='z-60 mt-0 flex max-h-[calc(100dvh-max(1rem,env(safe-area-inset-top)))] flex-col rounded-t-3xl border border-border/80 bg-panel/95 text-foreground shadow-2xl'
    >
      {#snippet overlay(props)}
        <div {...props} class='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm'></div>
      {/snippet}
      {#snippet handle(props)}
        <div {...props} class='mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-border/40'>
          <span data-svaul-drawer-handle-hitarea></span>
        </div>
      {/snippet}
      <div class='min-h-0 overflow-y-auto overscroll-contain p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))]'>
        <div class='mx-auto max-w-xl space-y-4 pb-4'>
          <h2 class='text-base font-semibold text-foreground'>{detailHeading}</h2>
          {#if graphData && rootEntry}
            {@render panel({ dense: true })}
          {:else}
            {@render emptyState()}
          {/if}
        </div>
      </div>
    </Drawer>
  {/if}
{/if}

{#snippet panel({ dense = false } = {})}
  {@const graphHeight = dense ? 'h-60' : 'h-64 md:h-72'}
  <div class='space-y-4 text-sm'>
    {#if !dense}
      <div class='mt-1 space-y-0.5'>
        <h3 class='text-base font-semibold text-foreground'>{detailHeading}</h3>
      </div>
    {/if}
    <div
      class={['grid gap-3', { 'md:grid-cols-2': !dense && hasRelations }]}
    >
      {#if hasRelations}
        <div class='rounded-xl border border-border/70 bg-surface/80 p-3 shadow-inner md:max-w-sm'>
          <div class='flex items-center text-xs font-semibold text-foreground-muted uppercase'>
            <span>Peta Relasi</span>
          </div>
          <div data-svaul-drawer-no-drag class={`mt-2 ${graphHeight} min-h-56 rounded-lg border border-border/50 bg-panel/80 p-1`}>
            {#if graphData}
              <ForceGraph
                graphData={graphData}
                activeNodeId={detailSlug}
                onSelect={handleGraphSelect}
              />
            {/if}
          </div>
        </div>
      {/if}
      <div class='rounded-xl border border-border/70 bg-surface/80 p-4'>
        <p class='text-xs font-semibold text-primary/80 uppercase'>Definisi</p>
        <p class='mt-2 text-sm leading-relaxed text-foreground-muted'>
          {#if detailDefinition}
            {detailDefinition}
          {:else}
            Definisi belum tersedia untuk entri ini, namun Anda masih dapat menjelajah relasinya.
          {/if}
        </p>
      </div>
    </div>
    {#if hasRelations}
      <div class='rounded-xl border border-border/60 bg-panel/70 p-3'>
        <span class='flex items-center text-xs font-semibold text-foreground-muted uppercase'>
          Koneksi
        </span>
        <div class='mt-3 space-y-3 text-sm'>
          {#each groupedRelations as group}
            <div class='grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-surface/80 p-3'>
              <p class='text-xs font-semibold text-foreground-muted uppercase'>{group.label.replace('_', ' ')}</p>
              <div class='flex flex-wrap gap-2'>
                {#each group.items as item}
                  {@const active = item.entry && detailEntry && item.entry.id === detailEntry.id}
                  <button
                    class={[
                      'rounded-full border border-border/60 px-3 py-1 text-xs text-ellipsis transition-colors hover:border-primary/60 hover:text-foreground',
                      { 'border-primary/60 text-foreground': active },
                      { 'text-foreground-muted': !active },
                    ]}
                    disabled={!item.entry}
                    onclick={() => item.entry && focusRelation(item.entry.id)}
                  >
                    {item.term}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </div>
{/snippet}

{#snippet emptyState()}
  <div class='space-y-3 text-sm text-foreground-muted'>
    <p>Belum ada entri glosarium yang terkait dengan konten ini.</p>
  </div>
{/snippet}

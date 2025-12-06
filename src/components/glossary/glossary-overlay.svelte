<script lang='ts'>
  import type { CollectionEntry } from 'astro:content'
  import type { ForceGraphData, GraphSelectionPayload } from '@/components/force-graph/types'
  import { Dialog, Popover, ScrollArea } from 'bits-ui'
  import ForceGraph from '@/components/force-graph/graph.svelte'
  import { useGlossaryEvents } from '@/lib/hooks/use-glossary-events.svelte'
  import { useIsMobile } from '@/lib/hooks/use-is-mobile.svelte'
  import { glossaryPreference } from '@/lib/stores/glossary-preferences.svelte'
  import { glossaryStates } from './glossary-state.svelte'
  import '@/components/glossary/glossary-term.svelte'

  type GlossaryEntry = CollectionEntry<'glossary'>
  type GlossaryRelation = GlossaryEntry['data']['relations'][number]
  type GroupedRelations = {
    label: string
    items: { id: string | null, term: string, entry: GlossaryEntry | null }[]
  }

  const { entries = [] }: { entries: GlossaryEntry[] } = $props()

  const entryMap = new Map(entries.map(entry => [entry.id, entry]))

  let anchorEl = $state<HTMLElement | null>(null)
  let activeSlug = $state<string | null>(null)
  let detailSlug = $state<string | null>(null)
  const graphData = $derived<ForceGraphData | null>(activeSlug ? buildGraphData(activeSlug) : null)
  const relations = $derived(activeSlug ? getRelations(activeSlug) : [])
  const groupedRelations = $derived.by(() => {
    if (!relations || relations.length === 0)
      return []
    const groups: Record<string, GroupedRelations> = {}
    for (const relation of relations) {
      const targetId = resolveRelationId(relation)
      const targetEntry = targetId ? entryMap.get(targetId) ?? null : null
      const item = {
        id: targetId,
        term: targetEntry ? targetEntry.data.term : (relation.label ?? 'Tidak Diketahui'),
        entry: targetEntry,
      }
      const groupLabel = relation.label ?? relation.type
      if (!groups[groupLabel]) {
        groups[groupLabel] = { label: groupLabel, items: [] }
      }
      groups[groupLabel].items.push(item)
    }
    return Object.values(groups)
  })
  const rootEntry = $derived(activeSlug ? entryMap.get(activeSlug) ?? null : null)
  const detailEntry = $derived.by(() => {
    if (!activeSlug)
      return null
    const slug = detailSlug ?? activeSlug
    return entryMap.get(slug) ?? null
  })
  const detailHeading = $derived(detailEntry?.data.term)
  const detailPos = $derived(detailEntry?.data.pos)
  const detailDefinition = $derived(detailEntry?.data.definition)

  const isMobile = useIsMobile()
  const isGlossaryEnabled = $derived(glossaryPreference.current)
  const { onOpen: onOpenGlossary } = useGlossaryEvents()
  onOpenGlossary((el, slug) => {
    openFor(el, slug)
  })

  $effect(() => {
    if (!isGlossaryEnabled) {
      resetActive()
    }
  })

  function openFor(target: HTMLElement | null, slug: string) {
    if (!entryMap.has(slug))
      return
    anchorEl = target
    activeSlug = slug
    detailSlug = slug
  }

  function resetActive() {
    glossaryStates.isOpen = false
    anchorEl = null
    activeSlug = null
    detailSlug = null
  }

  function closeAll() {
    resetActive()
  }

  function handleVisibilityChange(next: boolean) {
    if (!next)
      resetActive()
  }

  function buildGraphData(rootSlug: string): ForceGraphData {
    const root = entryMap.get(rootSlug)
    if (!root)
      return { nodes: [], links: [] }
    const nodes: ForceGraphData['nodes'] = [
      { id: root.id, label: root.data.term, tags: [root.data.pos], kind: 'page' },
    ]
    const links: ForceGraphData['links'] = []
    const seen = new Set([root.id])

    for (const relation of root.data.relations) {
      const targetSlug = resolveRelationId(relation)
      if (!targetSlug)
        continue
      if (!seen.has(targetSlug)) {
        const targetEntry = entryMap.get(targetSlug)
        nodes.push({
          id: targetSlug,
          label: targetEntry?.data.term ?? relation.label ?? targetSlug,
          tags: [relation.label ?? relation.type],
          kind: 'tag',
        })
        seen.add(targetSlug)
      }
      links.push({ source: root.id, target: targetSlug })
    }

    return { nodes, links }
  }

  function getRelations(rootSlug: string) {
    const root = entryMap.get(rootSlug)
    if (!root)
      return []
    return root.data.relations
  }

  function resolveRelationId(relation: GlossaryRelation): string | null {
    const target = relation.to
    if (!target)
      return null
    if (typeof target === 'string')
      return target
    if (typeof target === 'object' && 'id' in target)
      return target.id as string
    return null
  }

  function focusRelation(slug: string | null) {
    if (!slug)
      return
    detailSlug = slug
  }

  function handleGraphSelect(payload: GraphSelectionPayload) {
    if (!payload?.id)
      return
    detailSlug = payload.id
  }
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
                class='bg-panel flex touch-none select-none rounded-full border-l border-l-transparent my-4 w-1.5 hover:w-2'
              >
                <ScrollArea.Thumb class='bg-foreground/20 flex-1 rounded-full' />
              </ScrollArea.Scrollbar>
            </ScrollArea.Root>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  {:else}
    <Dialog.Root
      open={glossaryStates.isOpen}
      onOpenChange={handleVisibilityChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay class='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm' />
        <Dialog.Content>
          {#snippet child({ props })}
            <div
              {...props}
              class='fixed inset-x-0 bottom-0 z-60 rounded-t-3xl border border-border/80 bg-panel/95 text-foreground shadow-2xl'
            >
              <div class='mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-border/40'></div>
              <ScrollArea.Root class='pr-1'>
                <ScrollArea.Viewport class='max-h-[90vh] rounded-t-3xl p-4 pb-6 pr-3'>
                  <div class='mx-auto max-w-xl space-y-4 pb-4'>
                    <div class='flex items-start justify-between gap-4'>
                      <div>
                        <p class='text-xs font-semibold uppercase text-foreground-muted'>Glosarium</p>
                        <h3 class='text-lg font-semibold text-foreground'>{detailHeading}</h3>
                      </div>
                      <button
                        class='rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground-muted hover:border-primary/60 hover:text-foreground'
                        onclick={closeAll}
                      >
                        Tutup
                      </button>
                    </div>
                    {#if graphData && rootEntry}
                      {@render panel({ dense: true })}
                    {:else}
                      {@render emptyState()}
                    {/if}
                  </div>
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  orientation='vertical'
                  class='bg-panel flex touch-none select-none rounded-full border-l border-l-transparent p-px w-1.5 hover:w-2'
                >
                  <ScrollArea.Thumb class='bg-foreground/20 flex-1 rounded-full' />
                </ScrollArea.Scrollbar>
              </ScrollArea.Root>
            </div>
          {/snippet}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  {/if}
{/if}

{#snippet panel({ dense = false } = {})}
  {@const graphHeight = dense ? 'h-60' : 'h-64 md:h-72'}
  <div class='space-y-4 text-sm'>
    <div>
      {#if detailPos}
        <p class='text-xs font-semibold uppercase text-primary'>{detailPos}</p>
      {/if}
      <div class='mt-1 space-y-0.5'>
        <h3 class='text-base font-semibold text-foreground'>{detailHeading}</h3>
      </div>
    </div>
    <div class={['grid gap-3', { 'md:grid-cols-2': !dense }]}>
      <div class='rounded-xl border border-border/70 bg-surface/80 p-3 shadow-inner md:max-w-sm'>
        <div class='flex items-center text-xs font-semibold uppercase text-foreground-muted'>
          <span>Peta Relasi</span>
        </div>
        <div class={`mt-2 ${graphHeight} min-h-56 rounded-lg border border-border/50 bg-panel/80 p-1`}>
          {#if graphData}
            <ForceGraph
              graphData={graphData}
              activeNodeId={detailSlug}
              onSelect={handleGraphSelect}
            />
          {/if}
        </div>
      </div>
      <div class='rounded-xl border border-border/70 bg-surface/80 p-4'>
        <p class='text-xs font-semibold uppercase text-primary/80'>Definisi</p>
        <p class='mt-2 text-sm text-foreground-muted leading-relaxed'>
          {#if detailDefinition}
            {detailDefinition}
          {:else}
            Definisi belum tersedia untuk entri ini, namun Anda masih dapat menjelajah relasinya.
          {/if}
        </p>
      </div>
    </div>
    <div class='rounded-xl border border-border/60 bg-panel/70 p-3'>
      <span class='flex items-center text-xs font-semibold uppercase text-foreground-muted'>
        Koneksi
      </span>
      {#if groupedRelations.length}
        <div class='mt-3 space-y-3 text-sm'>
          {#each groupedRelations as group}
            <div class='grid grid-cols-2 gap-3 rounded-lg border border-border/60 bg-surface/80 p-3'>
              <p class='text-xs font-semibold uppercase text-foreground-muted'>{group.label}</p>
              <div class='flex flex-wrap gap-2'>
                {#each group.items as item}
                  {@const active = item.entry && detailEntry && item.entry.id === detailEntry.id}
                  <button
                    class={[
                      'rounded-full border border-border/60 px-3 py-1 text-xs text-ellipsis transition-colors hover:border-primary/60 hover:text-foreground',
                      { 'border-primary/60 text-foreground': active },
                      { 'text-foreground-muted': !active },
                    ]}
                    disabled={!item.entry || !item.id}
                    onclick={() => item.entry && focusRelation(item.entry.id)}
                  >
                    {item.term}
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      {:else}
        <p class='mt-3 text-sm text-foreground-muted'>Belum ada relasi tambahan untuk entri ini.</p>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet emptyState()}
  <div class='space-y-3 text-sm text-foreground-muted'>
    <p>Belum ada entri glosarium yang terkait dengan konten ini.</p>
  </div>
{/snippet}

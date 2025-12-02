<script lang='ts'>
  import type { CollectionEntry } from 'astro:content'
  import type { ForceGraphData, GraphSelectionPayload } from '@/components/force-graph/types'
  import { Dialog, Popover, ScrollArea } from 'bits-ui'
  import ForceGraph from '@/components/force-graph/graph.svelte'
  import { useGlossaryEvents } from '@/lib/hooks/use-glossary-events.svelte'
  import { useIsMobile } from '@/lib/hooks/use-is-mobile.svelte'
  import { glossaryStates } from './glossary-state.svelte'
  import '@/components/glossary/glossary-term.svelte'

  type GlossaryEntry = CollectionEntry<'glossary'>
  type GlossaryRelation = GlossaryEntry['data']['relations'][number]

  const { entries = [] }: { entries: GlossaryEntry[] } = $props()

  const entryMap = new Map(entries.map(entry => [entry.id, entry]))

  let anchorEl = $state<HTMLElement | null>(null)
  let activeSlug = $state<string | null>(null)
  let detailSlug = $state<string | null>(null)
  const graphData = $derived<ForceGraphData | null>(activeSlug ? buildGraphData(activeSlug) : null)
  const relations = $derived(activeSlug ? getRelations(activeSlug) : [])
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
  const { onOpen: onOpenGlossary } = useGlossaryEvents()
  onOpenGlossary((el, slug) => {
    openFor(el, slug)
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
    return root.data.relations.map((relation) => {
      const targetId = resolveRelationId(relation)
      return {
        relation,
        entry: targetId ? entryMap.get(targetId) ?? null : null,
      }
    })
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

{#if entries.length}
  <div class='glossary-overlay'>
    <Popover.Root
      open={glossaryStates.isOpen && !isMobile}
      onOpenChange={handleVisibilityChange}
    >
      <Popover.Content
        customAnchor={anchorEl}
        sideOffset={12}
      >
        {#snippet child({ props, wrapperProps })}
          <div {...wrapperProps} class='z-60!'>
            <div
              {...props}
              class='glossary-surface w-[min(30rem,calc(100vw-2rem))] rounded-2xl border border-border/60 bg-panel/95 text-foreground shadow-2xl outline-none backdrop-blur-xl'
            >
              <ScrollArea.Root class='max-h-144 w-full pr-1'>
                <ScrollArea.Viewport class='max-h-144 rounded-2xl p-4 pr-3'>
                  {#if graphData && rootEntry}
                    {@render panel()}
                  {:else}
                    {@render emptyState()}
                  {/if}
                </ScrollArea.Viewport>
                <ScrollArea.Scrollbar
                  orientation='vertical'
                  class='bg-[#18181b] flex touch-none select-none rounded-full border-l border-l-transparent my-2 w-1.5 hover:w-2'
                >
                  <ScrollArea.Thumb class='bg-white/20 flex-1 rounded-full' />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner class='hidden' />
              </ScrollArea.Root>
            </div>
          </div>
        {/snippet}
      </Popover.Content>
    </Popover.Root>

    <Dialog.Root
      open={glossaryStates.isOpen && isMobile}
      onOpenChange={handleVisibilityChange}
    >
      <Dialog.Portal>
        <Dialog.Overlay class='fixed inset-0 z-60 bg-black/70 backdrop-blur-sm' />
        <Dialog.Content>
          {#snippet child({ props })}
            <div
              {...props}
              class='fixed inset-x-0 bottom-0 z-70 rounded-t-3xl border border-border/80 bg-panel/95 text-foreground shadow-2xl'
            >
              <div class='mx-auto my-4 h-1.5 w-12 shrink-0 rounded-full bg-gray-100/20'></div>
              <ScrollArea.Root type='auto' class='max-h-[90vh] pr-1'>
                <ScrollArea.Viewport class='max-h-[90vh] rounded-t-3xl p-4 pb-6 pr-3'>
                  <div class='mx-auto max-w-xl space-y-4 pb-4'>
                    <div class='flex items-start justify-between gap-4'>
                      <div>
                        <p class='text-xs uppercase tracking-widest text-foreground-muted'>Glosarium</p>
                        <h3 class='text-lg font-semibold text-foreground'>{detailHeading}</h3>
                      </div>
                      <button
                        class='rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground-muted hover:border-primary/60 hover:text-foreground'
                        type='button'
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
                  class='bg-[#18181b] flex touch-none select-none rounded-full border-l border-l-transparent p-px w-1.5 hover:w-2'
                >
                  <ScrollArea.Thumb class='bg-white/20 flex-1 rounded-full' />
                </ScrollArea.Scrollbar>
                <ScrollArea.Corner class='hidden' />
              </ScrollArea.Root>
            </div>
          {/snippet}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>
{/if}

{#snippet panel({ dense = false } = {})}
  {@const graphHeight = dense ? 'h-60' : 'h-64 md:h-72'}
  <div class={`space-y-4 ${dense ? 'text-sm' : 'text-xs'}`}>
    <div>
      {#if detailPos}
        <p class='text-[0.65rem] uppercase tracking-[0.25em] text-primary'>{detailPos}</p>
      {/if}
      <div class='mt-1 space-y-0.5'>
        <h3 class='text-base font-semibold text-foreground'>{detailHeading}</h3>
      </div>
    </div>
    <div class={`grid gap-3 ${dense ? '' : 'md:grid-cols-[minmax(220px,320px)_minmax(180px,1fr)]'}`}>
      <div class='rounded-xl border border-border/70 bg-surface/80 p-3 shadow-inner'>
        <div class='flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted'>
          <span>Peta Relasi</span>
          <span>{graphData?.nodes.length ?? 0} node</span>
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
        <p class='text-[0.7rem] uppercase tracking-[0.3em] text-primary/80'>Definisi</p>
        <p class='mt-2 text-sm text-foreground-muted'>
          {#if detailDefinition}
            {detailDefinition}
          {:else}
            Definisi belum tersedia untuk entri ini, namun Anda masih dapat menjelajah relasinya.
          {/if}
        </p>
      </div>
    </div>
    <div class='rounded-xl border border-border/60 bg-panel/70 p-3'>
      <div class='flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted'>
        <span>Koneksi</span>
        <span>{relations.length} relasi</span>
      </div>
      {#if relations.length}
        <div class='mt-3 flex flex-wrap gap-2'>
          {#each relations as { relation, entry }}
            <button
              class='glossary-chip'
              data-active={entry && detailEntry && entry.id === detailEntry.id}
              type='button'
              disabled={!entry}
              onclick={() => entry && focusRelation(entry.id)}
            >
              <span class='glossary-chip__label'>{entry?.data.term ?? resolveRelationId(relation) ?? relation.type}</span>
              <span class='glossary-chip__meta'>{relation.label ?? relation.type}</span>
            </button>
          {/each}
        </div>
      {:else}
        <p class='mt-3 text-[0.75rem] text-foreground-muted'>Belum ada relasi tambahan untuk entri ini.</p>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet emptyState()}
  <div class='space-y-3 text-sm text-foreground-muted'>
    <p>Belum ada entri glosarium yang terkait dengan konten ini.</p>
    <p class='text-xs'>Tambahkan data di <code class='rounded border border-border/70 bg-surface/80 px-1'>src/content/glossary</code> untuk mengaktifkan fitur ini.</p>
  </div>
{/snippet}

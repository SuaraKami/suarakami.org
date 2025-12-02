<script lang='ts'>
  import type { CollectionEntry } from 'astro:content'
  import type { ForceGraphData, GraphSelectionPayload } from '@/components/force-graph/types'
  import { Dialog, Popover } from 'bits-ui'
  import { useEventListener } from 'runed'
  import ForceGraph from '@/components/force-graph/graph.svelte'
  import '@/components/glossary/glossary-term.svelte'

  type GlossaryEntry = CollectionEntry<'glossary'>
  type GlossaryRelation = GlossaryEntry['data']['relations'][number]

  type GlossaryOpenDetail = {
    slug?: string
    anchor?: HTMLElement | null
  }

  const { entries = [] }: { entries: GlossaryEntry[] } = $props()

  const entryMap = new Map(entries.map(entry => [entry.id, entry]))
  const mediaQuery = window.matchMedia('(max-width: 767px)')

  let anchorEl = $state<HTMLElement | null>(null)
  let isMobile = $state(mediaQuery.matches)
  let activeSlug = $state<string | null>(null)
  let detailSlug = $state<string | null>(null)
  let lastSelection = $state<GraphSelectionPayload | null>(null)

  const syncMobile = () => {
    isMobile = mediaQuery.matches
  }
  useEventListener(() => mediaQuery, 'change', syncMobile)

  const graphData = $derived<ForceGraphData | null>(activeSlug ? buildGraphData(activeSlug) : null)
  const relations = $derived(activeSlug ? getRelations(activeSlug) : [])
  const rootEntry = $derived(activeSlug ? entryMap.get(activeSlug) ?? null : null)
  const detailEntry = $derived.by(() => {
    if (!activeSlug)
      return null
    const slug = detailSlug ?? activeSlug
    return entryMap.get(slug) ?? null
  })
  const activeNodeId = $derived(detailEntry?.id ?? rootEntry?.id ?? null)
  const hasActiveNode = $derived(Boolean(activeSlug))
  const popoverOpen = $derived(hasActiveNode && !isMobile)
  const sheetOpen = $derived(hasActiveNode && isMobile)

  const handleOpen = (event: Event) => {
    const detail = (event as CustomEvent<GlossaryOpenDetail>).detail
    const slug = detail?.slug
    if (!slug || !entryMap.has(slug))
      return
    const target = detail?.anchor ?? ((event.target instanceof HTMLElement && event.target) || null)
    openFor(target, slug)
  }

  useEventListener(() => window, 'glossary-open', handleOpen)

  $effect(() => {
    if (!anchorEl)
      return
    anchorEl.setAttribute('data-glossary-active', 'true')
    return () => {
      anchorEl?.removeAttribute('data-glossary-active')
    }
  })

  function openFor(target: HTMLElement | null, slug: string) {
    if (!entryMap.has(slug))
      return
    anchorEl = target
    activeSlug = slug
    detailSlug = slug
    const entry = entryMap.get(slug)
    if (entry) {
      lastSelection = { id: slug, label: entry.data.term, tags: [entry.data.pos], slug }
    }
  }

  function resetActive() {
    anchorEl?.removeAttribute('data-glossary-active')
    anchorEl = null
    activeSlug = null
    detailSlug = null
    lastSelection = null
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
    const entry = entryMap.get(slug)
    if (entry) {
      lastSelection = { id: slug, label: entry.data.term, tags: [entry.data.pos], slug }
    }
  }

  function handleGraphSelect(payload: GraphSelectionPayload) {
    if (!payload?.id)
      return
    lastSelection = payload
    detailSlug = payload.id
  }

  const detailHeading = $derived(detailEntry?.data?.term ?? lastSelection?.label ?? rootEntry?.data?.term ?? '')
  const detailSense = $derived(detailEntry?.data?.senseId ?? rootEntry?.data?.senseId ?? '')
  const detailPos = $derived(detailEntry?.data?.pos ?? (lastSelection?.tags?.[0] ?? rootEntry?.data?.pos) ?? '')
  const detailDefinition = $derived(detailEntry?.data?.definition ?? null)
</script>

{#if entries.length}
  <div class='glossary-overlay'>
    <Popover.Root open={popoverOpen} onOpenChange={handleVisibilityChange}>
      <Popover.Content
        customAnchor={anchorEl}
        collisionPadding={24}
        sideOffset={12}
        align='center'
        onCloseAutoFocus={event => event?.preventDefault?.()}
        preventScroll={false}
      >
        {#snippet child({ props, wrapperProps })}
          <div {...wrapperProps} class='z-60'>
            <div
              {...props}
              class='glossary-surface hidden w-[min(28rem,calc(100vw-2rem))] rounded-2xl border border-border/60 bg-panel/95 p-4 text-foreground shadow-2xl outline-none backdrop-blur-xl lg:block'
            >
              {#if graphData && rootEntry}
                {@render panel()}
              {:else}
                {@render emptyState()}
              {/if}
            </div>
          </div>
        {/snippet}
      </Popover.Content>
    </Popover.Root>

    <Dialog.Root open={sheetOpen} onOpenChange={handleVisibilityChange}>
      <Dialog.Portal>
        <Dialog.Overlay class='fixed inset-0 z-60 bg-black/70 backdrop-blur-sm' />
        <Dialog.Content>
          {#snippet child({ props })}
            <div
              {...props}
              class='fixed inset-x-0 bottom-0 z-70 rounded-t-3xl border border-border/80 bg-panel/95 p-4 pb-6 text-foreground shadow-2xl'
            >
              <div class='mx-auto max-w-xl space-y-4'>
                <div class='flex items-start justify-between gap-4'>
                  <div>
                    <p class='text-xs uppercase tracking-widest text-foreground-muted'>Glosarium</p>
                    <h3 class='text-lg font-semibold text-foreground'>{detailHeading || 'Tidak ada entri'}</h3>
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
            </div>
          {/snippet}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  </div>
{/if}

{#snippet panel({ dense = false } = {})}
  <div class={`space-y-4 ${dense ? 'text-sm' : 'text-xs'}`}>
    <div class='flex items-start justify-between gap-4'>
      <div>
        {#if detailPos}
          <p class='text-[0.65rem] uppercase tracking-[0.25em] text-primary'>{detailPos}</p>
        {/if}
        <div class='mt-1 space-y-0.5'>
          <h3 class='text-base font-semibold text-foreground'>{detailHeading || 'Tidak ada entri'}</h3>
          {#if detailSense}
            <p class='font-mono text-[0.6rem] text-foreground-muted'>{detailSense}</p>
          {/if}
        </div>
      </div>
      <div class='text-right text-[0.65rem] text-foreground-muted'>
        {#if rootEntry?.data.term}
          <p>
            Induk: <span class='text-foreground'>{rootEntry.data.term}</span>
          </p>
        {/if}
        {#if rootEntry?.data.pos}
          <p class='uppercase tracking-[0.25em] text-primary/80'>{rootEntry.data.pos}</p>
        {/if}
      </div>
    </div>
    <div class={`grid gap-3 ${dense ? '' : 'md:grid-cols-[minmax(220px,320px)_minmax(180px,1fr)]'}`}>
      <div class='rounded-xl border border-border/70 bg-surface/80 p-3 shadow-inner'>
        <div class='flex items-center justify-between text-[0.65rem] uppercase tracking-[0.3em] text-foreground-muted'>
          <span>Peta Relasi</span>
          <span>{graphData?.nodes.length ?? 0} node</span>
        </div>
        <div class='mt-2 size-full rounded-lg border border-border/50 bg-panel/80 p-1'>
          {#if graphData}
            <ForceGraph
              graphData={graphData}
              activeNodeId={activeNodeId}
              config={{ linkDistance: 120, scale: 2.1, collisionPadding: 8, focusOnHover: false, repelForce: 0.8 }}
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
        {#if detailEntry?.data.aliases?.length}
          <div class='mt-3 flex flex-wrap gap-2 text-[0.65rem] text-foreground-muted'>
            {#each detailEntry.data.aliases.slice(0, 8) as alias}
              <span class='rounded-full border border-border/70 px-2 py-0.5'>{alias}</span>
            {/each}
          </div>
        {/if}
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
            {@const isActive = Boolean(detailEntry && entry?.id === detailEntry.id)}
            <button
              class={`flex min-w-32 flex-col rounded-xl border px-3 py-2 text-left text-[0.75rem] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                isActive ? 'border-primary bg-primary/10 text-foreground' : 'border-border/70 text-foreground-muted'
              } ${
                entry
                  ? 'hover:border-primary/60 hover:bg-primary/5 hover:text-foreground'
                  : 'cursor-not-allowed opacity-50'
              }`}
              type='button'
              disabled={!entry}
              onclick={() => entry && focusRelation(entry.id)}
            >
              <span class='font-medium'>{entry?.data.term ?? resolveRelationId(relation) ?? relation.type}</span>
              <span class='text-[0.6rem] text-primary/80'>{relation.label ?? relation.type}</span>
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

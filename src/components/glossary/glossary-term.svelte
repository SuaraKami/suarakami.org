<svelte:options customElement={{ tag: 'glossary-term', shadow: 'none' }} />

<script lang='ts'>
  import { useEventListener } from 'runed'

  const {
    slug = '',
    term = '',
    alias = '',
  } = $props<{
    slug?: string
    term?: string
    alias?: string
  }>()

  function emitOpen(event?: Event) {
    event?.preventDefault()
    if (!slug || !$host())
      return

    const detail = {
      slug,
      term: term || alias || '',
      alias,
      anchor: $host(),
    }

    $host().dispatchEvent(
      new CustomEvent('glossary-open', {
        bubbles: true,
        composed: true,
        detail,
      }),
    )
  }

  const handleClick = (event: Event) => emitOpen(event)
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      emitOpen(event)
    }
  }

  useEventListener($host(), 'click', handleClick)
  useEventListener($host(), 'keydown', handleKeydown)
</script>

<slot />

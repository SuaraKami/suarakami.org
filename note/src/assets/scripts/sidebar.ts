function setupSidebarControls() {
  const sidebar = document.querySelector('#sidebar')
  const overlay = document.querySelector('#sidebar-overlay')

  if (!(sidebar && overlay)) {
    return
  }

  let isOpen = !sidebar.classList.contains('-translate-x-full')

  const applyState = () => {
    if (isOpen) {
      sidebar.classList.remove('-translate-x-full')
      overlay.classList.remove('opacity-0', 'pointer-events-none')
      overlay.classList.add('opacity-100')
    } else {
      sidebar.classList.add('-translate-x-full')
      overlay.classList.add('opacity-0', 'pointer-events-none')
      overlay.classList.remove('opacity-100')
    }

    document
      .querySelectorAll<HTMLButtonElement>('[data-sidebar-toggle]')
      .forEach((btn) => {
        if (btn.dataset.sidebarToggle === 'close') {
          return
        }
        btn.setAttribute('aria-expanded', String(isOpen))
      })
  }

  const setOpen = (open: boolean) => {
    if (isOpen === open) {
      return
    }
    isOpen = open
    applyState()
  }

  document
    .querySelectorAll<HTMLButtonElement>('[data-sidebar-toggle]')
    .forEach((btn) => {
      if (btn.dataset.sidebarBound === 'true') {
        return
      }
      const action = btn.dataset.sidebarToggle ?? 'toggle'
      btn.addEventListener('click', () => {
        if (action === 'open') {
          setOpen(true)
        } else if (action === 'close') {
          setOpen(false)
        } else {
          setOpen(!isOpen)
        }
      })
      btn.dataset.sidebarBound = 'true'
    })

  applyState()
}

document.addEventListener('astro:page-load', setupSidebarControls)

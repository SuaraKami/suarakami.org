function initHistoryButtons() {
  const backBtn
    = document.querySelector<HTMLButtonElement>('[data-nav="back"]')
  const forwardBtn = document.querySelector<HTMLButtonElement>(
    '[data-nav="forward"]',
  )

  if (backBtn && backBtn.dataset.historyBound !== 'true') {
    backBtn.addEventListener('click', () => window.history.back())
    backBtn.dataset.historyBound = 'true'
  }

  if (forwardBtn && forwardBtn.dataset.historyBound !== 'true') {
    forwardBtn.addEventListener('click', () => window.history.forward())
    forwardBtn.dataset.historyBound = 'true'
  }
}

document.addEventListener('astro:page-load', initHistoryButtons)

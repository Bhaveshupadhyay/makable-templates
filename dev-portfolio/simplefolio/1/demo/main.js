import { portfolio } from './content/portfolio.js'

function initContent() {
  const { profile, links, projects = [] } = portfolio

  // Set page title
  if (profile?.name) {
    document.title = `${profile.name} | Developer Portfolio`
  }

  // Update profile name
  document.querySelectorAll('[data-content="profile.name"]').forEach((el) => {
    el.textContent = profile.name || ''
  })

  // Update headline
  document.querySelectorAll('[data-content="profile.headline"]').forEach((el) => {
    el.textContent = profile.headline || ''
  })

  // Update bio
  document.querySelectorAll('[data-content="profile.bio"]').forEach((el) => {
    el.textContent = profile.bio || ''
  })

  // Update avatar
  if (profile.avatarUrl) {
    document.querySelectorAll('.avatar-img').forEach((el) => {
      el.setAttribute('src', profile.avatarUrl)
      el.setAttribute('alt', profile.name || 'Avatar')
    })
  }

  // Update social links
  if (links?.github) {
    document.querySelectorAll('.social-github').forEach((el) => {
      el.setAttribute('href', links.github)
    })
  }
  if (links?.linkedin) {
    document.querySelectorAll('.social-linkedin').forEach((el) => {
      el.setAttribute('href', links.linkedin)
    })
  }
  if (links?.x) {
    document.querySelectorAll('.social-twitter').forEach((el) => {
      el.setAttribute('href', links.x)
    })
  }
  if (links?.email) {
    document.querySelectorAll('.cta-btn--contact').forEach((el) => {
      el.setAttribute('href', `mailto:${links.email}`)
      el.textContent = `Get in Touch (${links.email})`
    })
  }

  // Update project 0
  const projNameEl = document.querySelector('[data-content="projects.0.name"]')
  if (projNameEl && projects[0]?.name) {
    projNameEl.textContent = projects[0].name
  }
  const projDescEl = document.querySelector('[data-content="projects.0.description"]')
  if (projDescEl && projects[0]?.description) {
    projDescEl.textContent = projects[0].description
  }

  // Initialize tilt effect if library is present
  if (typeof window !== 'undefined' && window.VanillaTilt) {
    window.VanillaTilt.init(document.querySelectorAll('.js-tilt'))
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContent)
} else {
  initContent()
}

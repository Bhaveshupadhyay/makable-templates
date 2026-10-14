import { portfolio } from './content/portfolio.js'

function initContent() {
  const { profile, links, skills = [], projects = [] } = portfolio

  // Set page title
  if (profile?.name) {
    document.title = `${profile.name} - Developer Portfolio`
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

  // Update location
  document.querySelectorAll('[data-content="profile.location"]').forEach((el) => {
    el.textContent = profile.location || ''
  })

  // Update avatar
  if (profile.avatarUrl) {
    document.querySelectorAll('.avatar-img').forEach((el) => {
      el.setAttribute('src', profile.avatarUrl)
      el.setAttribute('alt', profile.name || 'Avatar')
    })
  }

  // Update email
  if (links?.email) {
    document.querySelectorAll('.contact-email').forEach((el) => {
      el.setAttribute('href', `mailto:${links.email}`)
      el.textContent = links.email
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

  // Update projects
  const projNameEl = document.querySelector('[data-content="projects.0.name"]')
  if (projNameEl && projects[0]?.name) {
    projNameEl.textContent = projects[0].name
  }
  const projDescEl = document.querySelector('[data-content="projects.0.description"]')
  if (projDescEl && projects[0]?.description) {
    projDescEl.textContent = projects[0].description
  }

  // Update skills if list exists
  const skillsList = document.querySelector('.skills-list')
  if (skillsList && skills.length > 0) {
    skillsList.replaceChildren()
    const defaultPercents = [95, 90, 85, 80, 75]
    skills.forEach((skill, idx) => {
      const pct = defaultPercents[idx % defaultPercents.length]
      const li = document.createElement('li')
      li.className = 'skills-item'

      const titleWrap = document.createElement('div')
      titleWrap.className = 'title-wrapper'

      const h5 = document.createElement('h5')
      h5.className = 'h5'
      h5.textContent = skill

      const dataEl = document.createElement('data')
      dataEl.value = String(pct)
      dataEl.textContent = `${pct}%`

      titleWrap.appendChild(h5)
      titleWrap.appendChild(dataEl)

      const progBg = document.createElement('div')
      progBg.className = 'skill-progress-bg'

      const progFill = document.createElement('div')
      progFill.className = 'skill-progress-fill'
      progFill.style.width = `${pct}%`

      progBg.appendChild(progFill)
      li.appendChild(titleWrap)
      li.appendChild(progBg)

      skillsList.appendChild(li)
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContent)
} else {
  initContent()
}

import { portfolio } from './content/portfolio.js'

function initContent() {
  const { profile, links = {}, skills = [], projects = [] } = portfolio

  // Page title
  if (profile?.name) {
    document.title = `${profile.name} | Developer Portfolio`
  }

  // Profile details
  document.querySelectorAll('[data-content="profile.name"]').forEach((el) => {
    el.textContent = profile.name || ''
  })

  document.querySelectorAll('[data-content="profile.headline"]').forEach((el) => {
    el.textContent = profile.headline || ''
  })

  document.querySelectorAll('[data-content="profile.bio"]').forEach((el) => {
    el.textContent = profile.bio || ''
  })

  document.querySelectorAll('[data-content="profile.location"]').forEach((el) => {
    el.textContent = profile.location || ''
  })

  if (profile.avatarUrl) {
    document.querySelectorAll('.avatar-img').forEach((el) => {
      el.setAttribute('src', profile.avatarUrl)
      el.setAttribute('alt', profile.name || 'Avatar')
    })
  }

  // Social Links
  if (links.github) {
    document.querySelectorAll('.social-github').forEach((el) => {
      el.setAttribute('href', links.github)
    })
  }
  if (links.linkedin) {
    document.querySelectorAll('.social-linkedin').forEach((el) => {
      el.setAttribute('href', links.linkedin)
    })
  }
  if (links.x) {
    document.querySelectorAll('.social-twitter').forEach((el) => {
      el.setAttribute('href', links.x)
    })
  }
  if (links.email) {
    document.querySelectorAll('.contact-email-btn').forEach((el) => {
      el.setAttribute('href', `mailto:${links.email}`)
      el.textContent = `Get in Touch (${links.email})`
    })
  }

  // Skills chips
  const skillsContainer = document.querySelector('.skills-container')
  if (skillsContainer) {
    skillsContainer.replaceChildren()
    skills.forEach((skill, i) => {
      const chip = document.createElement('div')
      chip.className = 'chip teal lighten-5 teal-text text-darken-3'
      chip.style.fontSize = '0.95rem'
      chip.style.fontWeight = '500'
      chip.style.padding = '0 14px'
      chip.setAttribute('data-content', `skills.${i}`)
      chip.textContent = skill
      skillsContainer.appendChild(chip)
    })
  }

  // Projects cards
  const projectsContainer = document.querySelector('.projects-container')
  if (projectsContainer) {
    projectsContainer.replaceChildren()
    projects.forEach((proj, i) => {
      const col = document.createElement('div')
      col.className = 'col s12 m6'
      col.style.marginBottom = '1.5rem'

      const card = document.createElement('div')
      card.className = 'card z-depth-1 hoverable'
      card.style.height = '100%'
      card.style.display = 'flex'
      card.style.flexDirection = 'column'
      card.style.justifyContent = 'space-between'

      const content = document.createElement('div')
      content.className = 'card-content'

      const header = document.createElement('div')
      header.style.display = 'flex'
      header.style.justifyContent = 'space-between'
      header.style.alignItems = 'baseline'
      header.style.marginBottom = '0.75rem'

      const title = document.createElement('span')
      title.className = 'card-title teal-text text-darken-3'
      title.style.fontWeight = '600'
      title.style.fontSize = '1.25rem'
      title.style.lineHeight = '1.4'
      title.setAttribute('data-content', `projects.${i}.name`)
      title.textContent = proj.name || ''
      header.appendChild(title)

      if (proj.language) {
        const lang = document.createElement('span')
        lang.className = 'badge grey lighten-4 grey-text text-darken-2'
        lang.style.borderRadius = '4px'
        lang.textContent = proj.language
        header.appendChild(lang)
      }

      content.appendChild(header)

      const desc = document.createElement('p')
      desc.style.color = '#546e7a'
      desc.style.lineHeight = '1.6'
      desc.style.fontSize = '0.95rem'
      desc.setAttribute('data-content', `projects.${i}.description`)
      desc.textContent = proj.description || ''
      content.appendChild(desc)

      card.appendChild(content)

      const actions = document.createElement('div')
      actions.className = 'card-action'
      actions.style.display = 'flex'
      actions.style.gap = '1.25rem'

      if (proj.repoUrl) {
        const repoLink = document.createElement('a')
        repoLink.href = proj.repoUrl
        repoLink.target = '_blank'
        repoLink.rel = 'noreferrer'
        repoLink.className = 'teal-text text-darken-2'
        repoLink.style.fontWeight = '600'
        repoLink.style.marginRight = '0'
        repoLink.textContent = 'View Code'
        actions.appendChild(repoLink)
      }

      if (proj.homepageUrl) {
        const demoLink = document.createElement('a')
        demoLink.href = proj.homepageUrl
        demoLink.target = '_blank'
        demoLink.rel = 'noreferrer'
        demoLink.className = 'teal-text text-darken-2'
        demoLink.style.fontWeight = '600'
        demoLink.style.marginRight = '0'
        demoLink.textContent = 'Live Demo'
        actions.appendChild(demoLink)
      }

      if (actions.children.length > 0) {
        card.appendChild(actions)
      }

      col.appendChild(card)
      projectsContainer.appendChild(col)
    })
  }

  // Footer year
  const yearEl = document.getElementById('current-year')
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear())
  }
}

document.addEventListener('DOMContentLoaded', initContent)

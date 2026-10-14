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

  // Update project 0
  const projNameEl = document.querySelector('[data-content="projects.0.name"]')
  if (projNameEl && projects[0]?.name) {
    projNameEl.textContent = projects[0].name
  }
  const projDescEl = document.querySelector('[data-content="projects.0.description"]')
  if (projDescEl && projects[0]?.description) {
    projDescEl.textContent = projects[0].description
  }

  // Update skills if present
  const skillsContainer = document.querySelector('.about__skills')
  if (skillsContainer && skills.length > 0) {
    skillsContainer.replaceChildren()
    skills.forEach((skill) => {
      const li = document.createElement('li')
      li.className = 'about__skill'
      li.textContent = skill.toLowerCase()
      skillsContainer.appendChild(li)
    })
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContent)
} else {
  initContent()
}

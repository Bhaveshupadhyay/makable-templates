import { portfolio } from './content/portfolio.js'

function initContent() {
  const { profile, links, skills = [], projects = [] } = portfolio

  // Set page title
  if (profile?.name) {
    document.title = `${profile.name} | Developer Portfolio`
  }

  // Update profile name across the page
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
    const avatarImg = document.querySelector('.avatar-img')
    if (avatarImg) {
      avatarImg.setAttribute('src', profile.avatarUrl)
      avatarImg.setAttribute('alt', profile.name || 'Avatar')
    }
  }

  // Update social links
  if (links.github) {
    document.querySelectorAll('.social-github, .footer-github').forEach((el) => el.setAttribute('href', links.github))
  }
  if (links.linkedin) {
    document.querySelectorAll('.social-linkedin, .footer-linkedin').forEach((el) => el.setAttribute('href', links.linkedin))
  }
  if (links.x) {
    document.querySelectorAll('.social-twitter, .footer-twitter').forEach((el) => el.setAttribute('href', links.x))
  }
  if (links.email) {
    const emailBtn = document.querySelector('.contact-email-btn')
    if (emailBtn) {
      emailBtn.setAttribute('href', `mailto:${links.email}`)
      emailBtn.textContent = `Get in Touch (${links.email})`
    }
  }

  // Render skills
  const skillsContainer = document.querySelector('.skills-container')
  if (skillsContainer) {
    skillsContainer.replaceChildren()
    skills.forEach((skill, i) => {
      const chip = document.createElement('div')
      chip.className = 'skills__skill'
      chip.setAttribute('data-content', `skills.${i}`)
      chip.textContent = skill
      skillsContainer.appendChild(chip)
    })
  }

  // Render projects
  const projectsContainer = document.querySelector('.projects-container')
  if (projectsContainer) {
    projectsContainer.replaceChildren()
    projects.forEach((proj, i) => {
      const row = document.createElement('div')
      row.className = 'projects__row'

      const imgCont = document.createElement('div')
      imgCont.className = 'projects__row-img-cont'
      const img = document.createElement('img')
      img.src = './assets/jpeg/project-mockup-example.jpeg'
      img.alt = proj.name || 'Project Mockup'
      img.className = 'projects__row-img'
      imgCont.appendChild(img)

      const details = document.createElement('div')
      details.className = 'projects__row-content'

      const title = document.createElement('h3')
      title.className = 'projects__row-content-title'
      title.setAttribute('data-content', `projects.${i}.name`)
      title.textContent = proj.name || ''

      const desc = document.createElement('p')
      desc.className = 'projects__row-content-desc'
      desc.setAttribute('data-content', `projects.${i}.description`)
      desc.textContent = proj.description || ''

      details.appendChild(title)
      details.appendChild(desc)

      const linkCont = document.createElement('div')
      linkCont.style.marginTop = '1.5rem'
      linkCont.style.display = 'flex'
      linkCont.style.gap = '1rem'

      if (proj.repoUrl) {
        const repoLink = document.createElement('a')
        repoLink.className = 'btn btn--med btn--theme'
        repoLink.href = proj.repoUrl
        repoLink.target = '_blank'
        repoLink.rel = 'noreferrer'
        repoLink.textContent = 'Source Code'
        linkCont.appendChild(repoLink)
      }

      if (proj.homepageUrl) {
        const liveLink = document.createElement('a')
        liveLink.className = 'btn btn--med btn--theme-inv'
        liveLink.href = proj.homepageUrl
        liveLink.target = '_blank'
        liveLink.rel = 'noreferrer'
        liveLink.textContent = 'Live Demo'
        linkCont.appendChild(liveLink)
      }

      details.appendChild(linkCont)
      row.appendChild(imgCont)
      row.appendChild(details)
      projectsContainer.appendChild(row)
    })
  }

  // Set footer copyright year
  const yearEl = document.getElementById('current-year')
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear())
  }
}

function initNavigation() {
  const hamMenuBtn = document.querySelector('.header__main-ham-menu-cont')
  const smallMenu = document.querySelector('.header__sm-menu')
  const headerHamMenuBtn = document.querySelector('.header__main-ham-menu')
  const headerHamMenuCloseBtn = document.querySelector('.header__main-ham-menu-close')
  const headerSmallMenuLinks = document.querySelectorAll('.header__sm-menu-link')

  if (!hamMenuBtn || !smallMenu) return

  hamMenuBtn.addEventListener('click', () => {
    if (smallMenu.classList.contains('header__sm-menu--active')) {
      smallMenu.classList.remove('header__sm-menu--active')
    } else {
      smallMenu.classList.add('header__sm-menu--active')
    }
    if (headerHamMenuBtn && headerHamMenuCloseBtn) {
      if (headerHamMenuBtn.classList.contains('d-none')) {
        headerHamMenuBtn.classList.remove('d-none')
        headerHamMenuCloseBtn.classList.add('d-none')
      } else {
        headerHamMenuBtn.classList.add('d-none')
        headerHamMenuCloseBtn.classList.remove('d-none')
      }
    }
  })

  headerSmallMenuLinks.forEach((link) => {
    link.addEventListener('click', () => {
      smallMenu.classList.remove('header__sm-menu--active')
      if (headerHamMenuBtn && headerHamMenuCloseBtn) {
        headerHamMenuBtn.classList.remove('d-none')
        headerHamMenuCloseBtn.classList.add('d-none')
      }
    })
  })
}

// Run setup on DOM content loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initContent()
    initNavigation()
  })
} else {
  initContent()
  initNavigation()
}

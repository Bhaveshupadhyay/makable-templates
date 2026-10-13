import { portfolio } from './content/portfolio.js'

// The site is a prebuilt React bundle with its copy baked in, so the content is written over
// the rendered elements here, and each one is tagged with its data-content path for the builder's
// visual editor. React renders in chunks and remounts sections on resize, so new elements are
// bound as they appear; bound ones are left alone (the editor may be changing them).

const { profile = {}, links = {}, skills = [], projects = [] } = portfolio

const indexed = (path) => (i) => path.replace('#', i)

const BINDINGS = [
  ['.landing-intro h1', () => 'profile.name'],
  ['.contact-container > h3', () => 'profile.name'],
  ['.about-me .para', () => 'profile.bio'],
  ['.contact-box p > span', () => 'profile.location'],
  ['.navbar-connect', () => 'links.email'],
  ['.contact-box a[href^="mailto:"]', () => 'links.email'],
  ['.work-title h4', indexed('projects.#.name')],
  ['.work-box:not(.work-box-cta) .work-info > p', indexed('projects.#.description')],
  ['.techstack-item > span', indexed('skills.#')],
  ['.what-content-in .what-tags', indexed('skills.#')],
]

const SOCIAL = [
  ['github.com', links.github],
  ['linkedin.com', links.linkedin],
  ['x.com', links.x],
  ['twitter.com', links.x],
]

const isHttp = (url) => typeof url === 'string' && /^https?:\/\//i.test(url)

function valueAt(path) {
  return path.split('.').reduce((value, key) => (value == null ? undefined : value[key]), portfolio)
}

const LIST_SLOT = '.techstack-item, .what-tags, .work-box'

function bindText(el, path) {
  const raw = valueAt(path)
  const value = typeof raw === 'string' ? raw : ''
  el.setAttribute('data-content', path)
  const slot = el.closest(LIST_SLOT)
  if (!value && slot) {
    // More slots than content (e.g. 4 tech stack items, 2 skills): hide the extra ones.
    slot.style.display = 'none'
    return
  }
  if (el.textContent.trim() === value) return
  el.textContent = value
  if (el.matches('.techstack-item > span')) {
    // The icon and link are for the original skill; drop them rather than show the wrong logo.
    const item = el.parentElement
    item.querySelector('img')?.remove()
    item.removeAttribute('href')
    item.setAttribute('title', value)
  }
}

// The bundle splits paragraphs into one element per word for a reveal animation, without the
// spaces, so the bio's text would read "Iamadeveloper" to the builder's editor. Keep it whole.
function unsplitBio() {
  const bio = document.querySelector('.about-me .para[data-content]')
  if (bio && bio.firstElementChild) bio.textContent = profile.bio || ''
}

function bind() {
  unsplitBio()
  for (const [selector, pathFor] of BINDINGS) {
    // The what-tags lists repeat per box, so they're numbered within each box.
    const groups = selector.includes('.what-tags')
      ? [...document.querySelectorAll('.what-content-flex')].map((box) => box.querySelectorAll('.what-tags'))
      : [document.querySelectorAll(selector)]
    for (const els of groups) {
      els.forEach((el, i) => {
        if (!el.hasAttribute('data-content')) bindText(el, pathFor(i))
      })
    }
  }
  if (links.email) {
    for (const a of document.querySelectorAll('a[href^="mailto:"]')) a.setAttribute('href', `mailto:${links.email}`)
  }
  for (const a of document.querySelectorAll('a[href]:not([data-bound-link])')) {
    const host = /^https?:\/\/(?:www\.)?([^/]+)/i.exec(a.getAttribute('href') || '')?.[1]
    const url = SOCIAL.find(([domain]) => host === domain)?.[1]
    if (isHttp(url)) a.setAttribute('href', url)
    a.setAttribute('data-bound-link', '')
  }
  const initials = (profile.name || '').split(/\s+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 3)
  const logo = document.querySelector('.navbar-title')
  if (logo && initials && logo.textContent !== initials.toUpperCase()) logo.textContent = initials.toUpperCase()
}

// The 3D character's layer covers the landing text. While the builder's editor is on (it sets
// data-makable-edit on <html>), let clicks through so the text under it can be picked. GSAP sets
// pointer-events inline on it, hence !important.
const style = document.createElement('style')
style.textContent = [
  'html[data-makable-edit] .character-model { pointer-events: none !important; }',
  // The design's name was typed in capitals; keep the look for any name.
  '.landing-intro h1 { text-transform: uppercase; }',
].join('\n')
document.head.append(style)

if (profile.name) document.title = profile.headline ? `${profile.name} - ${profile.headline}` : profile.name
const headline = document.querySelector('[data-content="profile.headline"]')
if (headline) headline.textContent = profile.headline || ''

bind()
new MutationObserver(bind).observe(document.getElementById('root'), { childList: true, subtree: true })

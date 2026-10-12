import { portfolio } from '../content/portfolio.js';

const p = portfolio || {};
const prof = p.profile || {};
const lnks = p.links || {};
const projs = p.projects || [];
const sks = p.skills || ['JavaScript', 'HTML', 'CSS', 'Python', 'C'];

const nameParts = (prof.name || 'John Doe').split(' ');
const firstName = nameParts[0] || 'John';

const c = {
  developer: {
    name: firstName,
    fullName: prof.name || 'John Doe',
    title: prof.headline || 'Creative Developer & 3D Engineer',
    description: prof.bio || ''
  },
  social: {
    github: '',
    email: lnks.email || 'john.doe@example.com',
    location: prof.location || 'San Francisco, CA'
  },
  about: {
    title: 'About Me',
    description: prof.bio || ''
  },
  experiences: [
    {
      position: prof.headline || 'Developer',
      company: 'Tech Studio',
      period: '2025 - Present',
      location: prof.location || 'San Francisco, CA',
      description: prof.bio || 'Developing clean and responsive web applications.',
      responsibilities: [
        'Building scalable web applications',
        'Writing clean, maintainable code',
        'Collaborating with designers and engineers'
      ],
      technologies: sks.slice(0, 5)
    }
  ],
  projects: projs.length > 0 ? projs.map((proj, idx) => ({
    id: idx + 1,
    title: proj.name,
    category: proj.language || 'Project',
    technologies: proj.language || 'Software',
    image: './images/placeholder.png',
    description: proj.description,
    link: proj.homepageUrl || proj.repoUrl || 'https://github.com/'
  })) : [
    {
      id: 1,
      title: 'Project One',
      category: 'JavaScript',
      technologies: 'JavaScript, HTML, CSS',
      image: './images/placeholder.png',
      description: 'Placeholder project description.',
      link: 'https://github.com/'
    }
  ],
  contact: {
    email: lnks.email || 'john.doe@example.com',
    github: 'https://github.com/',
    linkedin: 'https://linkedin.com/',
    twitter: 'https://x.com/',
    facebook: 'https://facebook.com/',
    instagram: 'https://instagram.com/',
    website: 'https://example.com/',
    resume: '#'
  },
  skills: {
    develop: {
      title: 'DEVELOPMENT',
      description: 'Building modern software & interactive experiences',
      details: prof.bio || '',
      tools: ['JavaScript', 'HTML', 'CSS', 'Python', 'C']
    },
    design: {
      title: 'TECHNOLOGIES',
      description: 'Core programming languages',
      details: prof.headline || '',
      tools: ['JavaScript', 'HTML', 'CSS', 'Python', 'C']
    }
  }
};

export { c };

export const portfolio = {
  profile: {
    name: 'John Doe',
    headline: 'Software Engineer & Systems Architect',
    bio: 'Self-driven, passionate software developer with a curious mind who enjoys solving complex, challenging real-world problems and building scalable software architectures.',
    location: 'San Francisco, CA',
    avatarUrl: './assets/img/passport-new.jpg',
  },
  links: {
    github: 'https://github.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    x: 'https://x.com/johndoe',
    website: 'https://johndoe.dev',
    email: 'john.doe@example.com',
  },
  skills: [
    'Python',
    'TypeScript',
    'Go',
    'React',
    'Docker',
    'PostgreSQL',
    'Distributed Systems',
    'FastAPI',
  ],
  projects: [
    {
      name: 'Distributed Task Queue',
      description:
        'Fault-tolerant background task processing queue with Redis persistence and automated retry mechanisms.',
      repoUrl: 'https://github.com/johndoe/task-queue',
      homepageUrl: 'https://example.com/task-queue',
      language: 'Python',
      stars: 310,
    },
    {
      name: 'Cloud Infrastructure CLI',
      description:
        'Developer tool for provisioning, monitoring, and scaling containerized microservices across cloud clusters.',
      repoUrl: 'https://github.com/johndoe/cloud-infra-cli',
      homepageUrl: 'https://example.com/cloud-infra-cli',
      language: 'Go',
      stars: 185,
    },
    {
      name: 'Semantic Code Search',
      description:
        'Vector-embedded code indexing engine enabling natural language syntax searches across git repositories.',
      repoUrl: 'https://github.com/johndoe/code-search',
      homepageUrl: '',
      language: 'TypeScript',
      stars: 94,
    },
  ],
  template: 'clean-dev',
}

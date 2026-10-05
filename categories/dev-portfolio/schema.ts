import { z } from 'zod'

const httpUrl = z.string().url()
const optionalUrl = z.union([httpUrl, z.literal('')])

export const portfolioProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  repoUrl: httpUrl,
  homepageUrl: optionalUrl,
  language: z.string().nullable(),
  stars: z.number().int().nonnegative(),
})
export type PortfolioProject = z.infer<typeof portfolioProjectSchema>

export const portfolioSchema = z.object({
  profile: z.object({
    name: z.string().min(1, 'Name is required'),
    headline: z.string().min(1, 'Add a short headline'),
    bio: z.string(),
    location: z.string(),
    avatarUrl: optionalUrl,
  }),
  links: z.object({
    github: httpUrl,
    linkedin: optionalUrl,
    x: optionalUrl,
    website: optionalUrl,
    email: z.union([z.string().email(), z.literal('')]),
  }),
  skills: z.array(z.string().min(1)),
  projects: z.array(portfolioProjectSchema),
  template: z.string(),
})
export type Portfolio = z.infer<typeof portfolioSchema>

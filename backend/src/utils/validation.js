import { z } from 'zod';

// User validation schemas
export const userProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  profile: z.object({
    headline: z.string().max(100).optional(),
    bio: z.string().max(500).optional(),
  }).optional(),
  branch: z.string().optional(),
  year: z.number().min(1).max(5).optional(),
  interests: z.array(z.string()).optional(),
});

// College validation schemas
export const collegeSchema = z.object({
  name: z.string().min(2).max(200),
  shortName: z.string().min(2).max(50),
  university: z.string().min(2).max(200),
  location: z.object({
    city: z.string().min(2).max(100),
    state: z.string().min(2).max(100),
    country: z.string().min(2).max(100),
  }),
  website: z.string().url().optional(),
  domains: z.array(z.string().email().transform(val => val.split('@')[1])),
});

// Crucible validation schemas
export const problemSchema = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(50),
  difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
  tags: z.array(z.string().min(2).max(30)),
  requirements: z.object({
    functional: z.array(z.string()),
    nonFunctional: z.array(z.string()),
  }),
  constraints: z.array(z.string()),
  expectedOutcome: z.string().min(50),
  hints: z.array(z.string()).optional(),
});

export const solutionSchema = z.object({
  content: z.string().min(50),
});

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
});

// Forge validation schemas
export const resourceSchema = z.object({
  title: z.string().min(5).max(200),
  type: z.enum(['article', 'video', 'book', 'course', 'tool', 'repository', 'documentation']),
  url: z.string().url(),
  description: z.string().min(50),
  content: z.string().optional(),
  tags: z.array(z.string().min(2).max(30)),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
});

export const resourceReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500).optional(),
});

// Query validation schemas
export const paginationSchema = z.object({
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

export const searchSchema = z.object({
  query: z.string().min(2).max(100),
  tags: z.array(z.string()).optional(),
  difficulty: z.string().optional(),
  type: z.string().optional(),
});

// Middleware for validating request body
export const validateBody = (schema) => async (req, res, next) => {
  try {
    req.validatedBody = await schema.parseAsync(req.body);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Validation Error',
      details: error.errors,
    });
  }
};

// Middleware for validating query parameters
export const validateQuery = (schema) => async (req, res, next) => {
  try {
    req.validatedQuery = await schema.parseAsync(req.query);
    next();
  } catch (error) {
    res.status(400).json({
      error: 'Invalid Query Parameters',
      details: error.errors,
    });
  }
}; 
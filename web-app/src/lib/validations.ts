import { z } from 'zod';

const USER_ROLES = ['USER', 'ADMIN'] as const;
const LOAN_STATUSES = ['pending', 'approved', 'picked_up', 'returned', 'rejected'] as const;
const RETURN_STATUSES = ['pending', 'approved', 'completed'] as const;
const RETURN_METHODS = ['in-person', 'drop-box', 'shipping', 'courier'] as const;
const ADMIN_ACTION_TYPES = [
  'loan_approved',
  'loan_rejected',
  'return_approved',
  'return_rejected',
  'return_completed',
  'loan_picked_up'
] as const;

// Game validation schemas
export const createGameSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  platform: z.string().min(1, 'Platform is required'),
  genre: z.string().min(1, 'Genre is required'),
  available: z.boolean().optional().default(true),
  gradient: z.string().optional()
});

export const updateGameSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  platform: z.string().min(1).optional(),
  genre: z.string().min(1).optional(),
  available: z.boolean().optional(),
  gradient: z.string().optional()
}).partial();

// Loan validation schemas
export const createLoanSchema = z.object({
  gameId: z.number().int().positive('Game ID must be a positive integer'),
  dueDate: z.string().refine((date) => {
    const parsedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return parsedDate >= today;
  }, 'Due date must be today or in the future')
});

export const updateLoanSchema = z.object({
  status: z.enum(LOAN_STATUSES).optional(),
  approvedBy: z.number().int().optional(),
  approvedAt: z.string().optional(),
  completedBy: z.number().int().optional(),
  completedAt: z.string().optional(),
  pickupDate: z.string().optional()
}).partial();

// Return validation schemas
export const createReturnSchema = z.object({
  loanId: z.number().int().positive('Loan ID must be a positive integer'),
  returnMethod: z.enum(RETURN_METHODS).optional(),
  trackingNumber: z.string().optional(),
  returnNotes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
  estimatedReturnDate: z.string().optional()
});

export const updateReturnSchema = z.object({
  status: z.enum(RETURN_STATUSES).optional(),
  approvedBy: z.number().int().optional(),
  approvedAt: z.string().optional(),
  completedBy: z.number().int().optional(),
  completedAt: z.string().optional(),
  estimatedReturnDate: z.string().optional()
}).partial();

// Admin action validation schemas
export const adminActionSchema = z.object({
  action: z.enum(ADMIN_ACTION_TYPES),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

export const adminNotesSchema = z.object({
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional()
});

// User validation schemas
export const createUserSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  role: z.enum(USER_ROLES).optional().default('USER')
});

export const updateUserSchema = z.object({
  email: z.email('Invalid email address').optional(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(USER_ROLES).optional()
}).partial();

// Query parameter validation schemas
export const gamesQuerySchema = z.object({
  platform: z.string().optional(),
  genre: z.string().optional(),
  search: z.string().optional(),
  page: z.string().transform((val) => parseInt(val || '1')).pipe(z.number().int().positive()),
  limit: z.string().transform((val) => parseInt(val || '12')).pipe(z.number().int().positive().max(100))
});

export const loansQuerySchema = z.object({
  status: z.enum(LOAN_STATUSES).optional(),
  page: z.string().transform((val) => parseInt(val || '1')).pipe(z.number().int().positive()),
  limit: z.string().transform((val) => parseInt(val || '20')).pipe(z.number().int().positive().max(100))
});

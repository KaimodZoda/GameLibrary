# Game Library Monorepo

A full-stack web application for managing a game borrowing system with integrated LLM assistant. Users can browse available games, borrow them, and return them with admin approval workflows.

## Live Demo

**Deployed on Vercel:** [https://game-library-omega.vercel.app]

## Project Structure

```
game-library-monorepo/
├── web-app/                 # Next.js web application
│   ├── src/app/            # React components and pages
│   ├── src/app/api/        # API routes
│   ├── prisma/             # Database schema and migrations
│   └── package.json        # Web app dependencies
├── services/               # Microservices
│   └── llm-assistant/      # LLM assistant service
│       ├── main.py         # LLM service entry point
│       ├── requirements.txt # Python dependencies
│       └── config.py       # Configuration
├── package.json            # Root monorepo configuration
└── README.md              # This file
```

## Features

### User Features
- Browse available games with filtering by platform, genre, and search
- Borrow games with due date tracking
- Return games with multiple return methods (in-person, drop-box, shipping, courier)
- View personal loan history and status
- Track overdue loans

### Admin Features
- Manage game inventory (add, edit, delete games)
- Approve/reject loan requests
- Confirm user pickups
- Approve/complete return requests
- View audit log of all admin actions
- Manage users (view, edit roles)
- View global statistics (total games, borrowed, overdue, etc.)

### Security Features
- **Authentication**: NextAuth.js with JWT sessions
- **Rate Limiting**: IP-based rate limiting on auth endpoints (5 register / 10 login attempts per 15 minutes)
- **Input Validation**: Zod schema validation for all API endpoints
- **Input Sanitization**: XSS protection for user-generated content
- **Password Security**: Bcrypt hashing with complexity requirements (8+ chars, uppercase, lowercase, number)
- **Account Lockout**: Automatic lockout after 5 failed login attempts

## Tech Stack

- **Frontend**: Next.js 16.2.4, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Validation**: Zod
- **Icons**: Font Awesome

## Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/KaimodZoda/GameLibrary
cd game-library-next
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="https://game-library-omega.vercel.app"
NEXTAUTH_SECRET="your-secret-key-here"
```

Generate a secure NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

### 4. Set up the database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed the database with sample data
npm run db:seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── games/        # Game management
│   │   ├── loans/        # Loan management
│   │   ├── returns/      # Return management
│   │   ├── admin/        # Admin endpoints
│   │   └── stats/        # Statistics
│   └── pages/            # Page components
├── components/           # React components
│   ├── admin/           # Admin-specific components
│   └── ui/              # UI components
├── lib/                 # Utilities
│   ├── auth.ts          # Authentication helpers
│   ├── prisma.ts        # Prisma client
│   ├── validations.ts   # Zod schemas
│   ├── rate-limit.ts    # Rate limiting
│   ├── sanitize.ts      # Input sanitization
│   └── stats.ts         # Statistics calculations
└── hooks/               # React hooks
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth handler (sign in, sign out, session)

### Games
- `GET /api/games` - Get all games with pagination and filtering
- `POST /api/games` - Create new game (admin only)
- `PUT /api/games/[id]` - Update game (admin only)
- `DELETE /api/games/[id]` - Delete game (admin only)

### Loans
- `GET /api/loans` - Get user's loans
- `GET /api/loans/all` - Get all loans (admin)
- `POST /api/loans` - Create loan request
- `PUT /api/loans/[id]/return` - Return a game
- `DELETE /api/loans/[id]` - Cancel loan

### Returns
- `GET /api/returns` - Get return requests
- `POST /api/returns` - Create return request
- `DELETE /api/returns/[id]` - Cancel return request

### Admin
- `PUT /api/admin/loans/[id]/approve` - Approve loan
- `PUT /api/admin/loans/[id]/reject` - Reject loan
- `PUT /api/admin/loans/[id]/pickup` - Confirm pickup
- `PUT /api/admin/returns/[id]/approve` - Approve return
- `PUT /api/admin/returns/[id]/complete` - Complete return

## Database Schema

### User
- id, email, password, name, role (USER/ADMIN)

### Game
- id, title, platform, genre, available, gradient

### Loan
- id, userId, gameId, status (pending/approved/completed/rejected), dueDate, approvedBy, approvedAt, pickupDate

### Return
- id, loanId, status (pending/approved/completed), returnMethod, trackingNumber, returnNotes, estimatedReturnDate

### AdminAction
- id, adminId, loanId, returnId, action, actionDate, notes

## Security Considerations

- All user inputs are validated with Zod schemas
- User-generated content is sanitized to prevent XSS
- Rate limiting prevents brute force attacks
- Passwords are hashed with bcrypt
- Admin endpoints require authentication and admin role
- JWT sessions with 24-hour expiration

## Development

### Running tests
```bash
npm test
```

### Building for production
```bash
npm run build
npm start
```

### Database migrations
```bash
# Create migration
npx prisma migrate dev --name migration_name

# Reset database (development only)
npx prisma migrate reset

# View database in Prisma Studio
npx prisma studio
```

## License

MIT

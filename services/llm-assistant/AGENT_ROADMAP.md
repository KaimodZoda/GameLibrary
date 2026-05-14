# Game Lending Agent Roadmap

This note summarizes the current state of the LLM assistant service and the recommended next work for turning it into a lending-aware agent.

## Current State

The service in `services/llm-assistant` is currently a semantic search and recommendation prototype.

- `main.py`
  - FastAPI service.
  - Exposes `GET /health`, `POST /search`, and `POST /recommend`.
- `core/engine.py`
  - Uses LangChain, OpenAI embeddings, ChatOpenAI, and Supabase Vector Store.
  - Searches the `game_embeddings` table through the `match_games` Postgres function.
  - Generates recommendation text from semantic search results.
- `scripts/enrich.py`
  - Fetches games from Supabase table `Game`.
  - Generates a richer game description with an LLM.
  - Creates embeddings and upserts records into `game_embeddings`.
- `supabase_setup.sql`
  - Enables `pgvector`.
  - Creates `game_embeddings`.
  - Creates `match_games`.
- `.env.example`
  - Documents Supabase, OpenAI, and service port configuration.

The service is not integrated with the Next.js app yet. It also does not currently know how to perform lending actions such as checking user loans, creating loan requests, creating return requests, or confirming actions.

## Recommended Build Order

Build the agent service before building the assistant UI.

Reason: the UI will be easier to design once the agent contract is clear. The agent needs to know what actions it can safely perform before the frontend exposes chat controls, action buttons, or confirmation flows.

Recommended order:

1. Stabilize the database and lending state model.
2. Build a minimal agent service with lending-aware tools.
3. Add safe confirmation flow for actions that mutate data.
4. Add assistant UI in the Next.js app.
5. Improve retrieval quality with better embeddings or reranking.

## Database Changes To Do First

Update `web-app/prisma/schema.prisma` so the lending workflow is explicit and easier for both API code and the agent to reason about.

### 1. Add Enums

Replace loosely typed string fields with Prisma enums.

Suggested enums:

```prisma
enum UserRole {
  USER
  ADMIN
}

enum LoanStatus {
  pending
  approved
  picked_up
  returned
  rejected
  cancelled
}

enum ReturnStatus {
  pending
  approved
  completed
  cancelled
}

enum ReturnMethod {
  IN_PERSON @map("in-person")
  DROP_BOX  @map("drop-box")
  SHIPPING
  COURIER
}

enum AdminActionType {
  loan_approved
  loan_rejected
  loan_picked_up
  return_approved
  return_completed
}
```

### 2. Add Explicit Loan/Return Relation

The `Return` model currently stores `loanId`, but the Prisma relation is incomplete. Add the relation on both sides.

```prisma
model Loan {
  // existing fields
  returnRequest Return?
}

model Return {
  // existing fields
  loanId Int @unique
  loan   Loan @relation(fields: [loanId], references: [id])
}
```

### 3. Make Loan Status Less Ambiguous

Current `Loan.status = "completed"` is overloaded. It can mean either:

- the user has picked up the game and is currently holding it
- the loan has fully ended after return completion

Change the workflow to:

- `pending`: user requested to borrow
- `approved`: admin approved, waiting for pickup
- `picked_up`: user has the game
- `returned`: return is completed and the loan is closed
- `rejected`: admin rejected request
- `cancelled`: user/admin cancelled request

Migration mapping from current data:

- `completed` with `completedAt == null` -> `picked_up`
- `completed` with `completedAt != null` -> `returned`

## API Changes Required After Schema Update

Status checks and writes must be updated across the app.

Important files:

- `web-app/src/app/api/loans/route.ts`
- `web-app/src/app/api/loans/[id]/route.ts`
- `web-app/src/app/api/loans/[id]/return/route.ts`
- `web-app/src/app/api/admin/loans/[id]/approve/route.ts`
- `web-app/src/app/api/admin/loans/[id]/pickup/route.ts`
- `web-app/src/app/api/admin/loans/[id]/reject/route.ts`
- `web-app/src/app/api/returns/route.ts`
- `web-app/src/app/api/returns/[id]/route.ts`
- `web-app/src/app/api/admin/returns/[id]/approve/route.ts`
- `web-app/src/app/api/admin/returns/[id]/complete/route.ts`
- `web-app/src/app/api/admin/users/[id]/route.ts`

Expected logic changes:

- Loan approval writes `approved`.
- Pickup writes `picked_up`, not `completed`.
- Return completion writes return status `completed` and loan status `returned`.
- Active loan checks should include `pending`, `approved`, and `picked_up`.
- Cancel rules should block `picked_up` and `returned`.
- Return requests should only be created for `picked_up` loans.
- User role checks should consistently use `USER` and `ADMIN`.

## Validation And Type Changes

Update Zod schemas and TypeScript types so the app matches Prisma enums.

Important files:

- `web-app/src/lib/validations.ts`
- `web-app/src/types/game.ts`
- `web-app/src/hooks/useLoans.ts`
- `web-app/src/lib/stats.ts`
- `web-app/src/components/admin/RequestManagementUnified.tsx`
- `web-app/src/components/GameCard.tsx`
- `web-app/src/app/pages/return/page.tsx`
- `web-app/src/app/pages/my-loans/page.tsx`

Add a shared computed lending state helper so UI and agent-facing APIs do not reimplement the same branching logic in many places.

Suggested app-facing state:

```ts
type LendingState =
  | 'borrow_pending'
  | 'borrow_approved'
  | 'active'
  | 'overdue'
  | 'return_pending'
  | 'return_approved'
  | 'returned'
  | 'rejected'
  | 'cancelled';
```

The helper should derive this from:

- `Loan.status`
- `Loan.dueDate`
- related `Return.status`
- current date

## Seed And Migration Updates

Update seed data after changing statuses.

Important file:

- `web-app/prisma/seed.ts`

Expected changes:

- Active loans should use `picked_up`.
- Fully returned loans should use `returned`.
- Return statuses stay `pending`, `approved`, or `completed`.
- Admin action strings should become enum values.
- Role strings should become enum values.

## Agent Service Changes

After the database state is clear, build the service around explicit tools.

Recommended minimal tools:

- `search_games(query, filters)`
- `get_game_availability(gameId)`
- `get_user_loans(userId)`
- `recommend_available_games(userId, preferences)`
- `prepare_loan_request(userId, gameId, dueDate)`
- `prepare_return_request(userId, loanId, returnMethod)`

Start with read-only tools first, then add write actions behind confirmation.

Recommended endpoints:

- `POST /assistant/chat`
- `POST /assistant/actions/confirm`

The agent should not directly mutate lending data after a single natural language message. It should first return a proposed action, then wait for explicit confirmation.

Example:

1. User: "I want to borrow Stardew Valley until next Friday."
2. Agent: proposes `create_loan_request` with exact `gameId` and `dueDate`.
3. UI asks for confirmation.
4. Confirm endpoint performs the mutation.

## Next.js Integration

Do not call the Python service directly from the browser.

Add Next.js proxy routes that handle auth/session and then call the assistant service.

Possible routes:

- `web-app/src/app/api/assistant/chat/route.ts`
- `web-app/src/app/api/assistant/actions/confirm/route.ts`

These routes should:

- require authentication
- derive `userId` from session
- apply rate limiting
- validate request body with Zod
- call the Python assistant service
- return structured results to the frontend

## Assistant UI

Build this after the first useful agent service exists.

Recommended first UI:

- A small assistant panel on browse/home.
- User can ask for games by preference.
- Results include answer text and game cards.
- Borrow button appears only for available games.
- Mutating actions show confirmation before submitting.

## Hugging Face Option

Hugging Face can help, but it should not be the first major rewrite.

Best use cases for this project:

- embeddings for semantic search
- multilingual search support
- reranking search results

Recommended hybrid approach:

- Keep the main agent LLM/tool-calling provider stable.
- Use Hugging Face or Sentence Transformers for embeddings/reranking later.
- Keep Supabase `pgvector` as the vector database.

Important caveat:

If the embedding model changes, the vector dimension may change too. The current SQL uses `embedding vector(1536)`, which matches OpenAI `text-embedding-3-small`. A different Hugging Face embedding model may require:

- changing the `game_embeddings.embedding` vector dimension
- regenerating every stored embedding
- avoiding mixed embeddings from different models in the same table

## Immediate Next Task

Start with the database cleanup:

1. Add Prisma enums.
2. Add `Loan.returnRequest` and `Return.loan` relation.
3. Change `LoanStatus` from ambiguous `completed` to explicit `picked_up` and `returned`.
4. Add a shared `getLendingState()` helper.
5. Update API routes, validations, UI status rendering, and seed data to match.

After that, build the minimal read-only agent service.

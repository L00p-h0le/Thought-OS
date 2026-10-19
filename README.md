# Thought-OS

A focused, personal idea management operating system designed to capture raw concepts, evaluate them with structured multidimensional analysis, and drive execution with an integrated task tracker.

Designed with a dark-mode aesthetic inspired by Linear and Notion, built for speed and zero cognitive friction.

---

## What is Thought-OS?

Most ideas die because they are either forgotten in unstructured note apps or abandoned due to unaddressed technical and strategic unknowns. 

**Thought-OS** bridges the gap between raw ideation and active execution:
1. **Capture**: Rapidly record ideas before they fade.
2. **Deconstruct**: Analyze obstacles, technical knowledge gaps, feasibility, scalability ceiling, monetization strategies, and MVP build plans.
3. **Execute**: Break ideas into actionable steps with an inline task tracker that monitors completion velocity from initial draft to launch.

---

## Key Features

### 1. Dashboard & Velocity Metrics
- Real-time stat counters: Total Ideas, Building, Launched, and Task Completion counts.
- Inline **Quick Add** bar to capture ideas in seconds.
- Idea feed displaying status tags, feasibility ratings, monetization indicators, and live progress bars.

### 2. Structured Idea Analysis
Each idea features a dedicated analysis workspace covering essential evaluation criteria:
- **Challenges & Obstacles**: Document technical bottlenecks, regulatory hurdles, or market risks.
- **Knowledge Gap**: Identify what skills, APIs, or concepts need research before writing code.
- **Feasibility Score**: Rate ease of execution (`LOW`, `MEDIUM`, `HIGH`) with context notes.
- **Scalability Potential**: Evaluate infrastructure and market ceilings (`LOW`, `MEDIUM`, `HIGH`).
- **Monetization Strategy**: Toggle viability and define business models (subscription, one-time, freemium, usage-based).
- **How to Build**: Outline architecture, core tech stack choices, and phased MVP milestones.
- **Free-form Notes**: Unstructured scratchpad for links, references, and evolving thoughts.

### 3. Integrated Task Tracker
- Status cycling: `TODO` &rarr; `IN_PROGRESS` &rarr; `DONE`.
- Priority tags: `LOW`, `MEDIUM`, `HIGH`.
- Dynamic completion progress meter with smooth CSS transitions.
- Filter views by status (`All`, `Todo`, `In Progress`, `Done`).
- Inline task creation and one-click deletion.

### 4. Idea Lifecycle Management
- Status pipeline: `DRAFT` &rarr; `EXPLORING` &rarr; `BUILDING` &rarr; `LAUNCHED` &rarr; `ARCHIVED`.
- Categorization (e.g., *SaaS*, *DevTool*, *Mobile App*, *Side Project*).
- Inline editable title and description.

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Browser / Client                      │
│   • Dashboard (page.tsx)                                    │
│   • Idea Detail (ideas/[id]/page.tsx)                       │
│     ├── AnalysisPanel (Interactive Inputs & Auto-save)      │
│     ├── TaskTracker (Status Cycle, Priority, Progress)      │
│     └── IdeaHeader (Status Select, Inline Edit)             │
└──────────────────────────────▲──────────────────────────────┘
                               │
                      Server Actions (actions.ts)
                      [revalidatePath("/", "/ideas/[id]")]
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Next.js App Router (SSR)                 │
│   • React Server Components (Direct DB queries via Prisma)  │
│   • Client Components for interactive forms & mutations     │
└──────────────────────────────▲──────────────────────────────┘
                               │
                      Prisma ORM (v6.4.1)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                  SQLite Database (prisma/dev.db)            │
│   • Idea (Core entity & metadata)                           │
│   • IdeaAnalysis (1:1 relation, cascade delete)             │
│   • Task (1:N relation, cascade delete)                     │
└─────────────────────────────────────────────────────────────┘
```

- **Server-First Data Fetching**: Main pages fetch directly from the local SQLite database via Prisma in React Server Components, eliminating unnecessary REST API boilerplate and client-side waterfall requests.
- **Server Actions for Mutations**: All updates (creating ideas, auto-saving analysis fields, cycling task statuses, deleting records) execute via Next.js Server Actions with immediate cache revalidation (`revalidatePath`).
- **Cascade Deletion**: Deleting an idea automatically cascades to delete its linked analysis record and all associated tasks.

---

## Tech Stack

| Technology | Purpose | Why Chosen |
| :--- | :--- | :--- |
| **Next.js 16 (App Router)** | Full-Stack Web Framework | React 19 support, Server Components for instant data loading, Server Actions for type-safe database mutations without API route overhead. |
| **TypeScript** | Type Safety | End-to-end type safety between database models, server actions, and UI components. |
| **Tailwind CSS v4** | UI Styling | High-performance CSS-first styling, CSS custom property tokens, clean zinc palette, zero runtime footprint. |
| **Prisma ORM (v6.4.1)** | Object-Relational Mapping | Strongly typed database queries, automated migrations, declarative schema definition. |
| **SQLite** | Embedded Database | Zero setup, serverless, file-backed storage ideal for local-first personal productivity software. |
| **Phosphor Icons** | Iconography | Clean, consistent line weights and icon aesthetic tailored for modern developer tools. |
| **Geist Font** | Typography | High-legibility engineered geometric typeface by Vercel. |

---

## Database Choice & Rationale

**Database**: **SQLite** (via Prisma ORM)

### Why SQLite?
1. **Zero Configuration**: No standalone database server, background service, or Docker daemon needed. The database lives as a single file (`prisma/dev.db`).
2. **Ultra-Low Latency**: Queries run in-process over filesystem I/O without TCP network round trips.
3. **Local-First & Private**: Personal ideas and intellectual property remain on local storage.
4. **Seamless Backups**: Backing up ideas requires copying a single file.
5. **Prisma Portability**: Because all queries use Prisma ORM abstractions, switching to PostgreSQL, MySQL, or Turso/LibSQL in the future only requires changing the `provider` in `prisma/schema.prisma`.

---

## Database Schema

```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

model Idea {
  id          String        @id @default(cuid())
  title       String
  description String        @default("")
  status      String        @default("DRAFT") // DRAFT, EXPLORING, BUILDING, LAUNCHED, ARCHIVED
  category    String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  analysis    IdeaAnalysis?
  tasks       Task[]
}

model IdeaAnalysis {
  id                   String   @id @default(cuid())
  ideaId               String   @unique
  challenges           String   @default("")
  knowledgeGap         String   @default("")
  feasibility          String   @default("MEDIUM") // LOW, MEDIUM, HIGH
  feasibilityNotes     String   @default("")
  scalability          String   @default("MEDIUM") // LOW, MEDIUM, HIGH
  scalabilityNotes     String   @default("")
  canMonetize          Boolean  @default(false)
  monetizationStrategy String   @default("")
  howToBuild           String   @default("")
  freeformNotes        String   @default("")

  idea                 Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
}

model Task {
  id          String   @id @default(cuid())
  ideaId      String
  title       String
  description String   @default("")
  status      String   @default("TODO") // TODO, IN_PROGRESS, DONE
  priority    String   @default("MEDIUM") // LOW, MEDIUM, HIGH
  sortOrder   Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  idea        Idea     @relation(fields: [ideaId], references: [id], onDelete: Cascade)
}
```

---

## Getting Started

### Prerequisites
- **Node.js** 20.x or higher
- **npm** (or pnpm / yarn)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/L00p-h0le/Thought-OS.git
   cd Thought-OS
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Initialize the SQLite database**:
   ```bash
   npx prisma db push
   ```

4. **Start the local development server**:
   ```bash
   npm run dev
   ```

5. Open your browser to [http://localhost:3000](http://localhost:3000).

---

## Production Build & Deployment

To verify and produce an optimized production build:
```bash
npm run build
npm start
```

### Deployment Options:
- **Vercel / Netlify**: Deploy as a Next.js application. For persistent multi-user database storage in serverless environments, switch the Prisma datasource to **PostgreSQL** (Supabase, Neon) or **Turso (LibSQL)**.
- **Docker / VPS / Railway / Render**: Deploy the Node.js server with a persistent volume mounted to the SQLite database file path.

---

## License

MIT License. Free to use, adapt, and build upon.

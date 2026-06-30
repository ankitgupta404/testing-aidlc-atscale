<project_specification>
  <project_name>Canopy - Full Featured Project Management Application</project_name>

  <overview>
    Build a fully functional JIRA-like project management application with issues, sprints, Kanban boards, epics,
    dashboards, and powerful filtering. The application uses a serverless full-stack architecture with a React
    frontend, AWS Lambda backend, API Gateway, and DynamoDB for persistence.

    Canopy helps teams manage software projects with agile methodologies. Users can create projects, manage
    backlogs, plan sprints, track issues on Kanban boards, and visualize progress through dashboards and reports.
    The interface should feel professional and polished, with a distinctive forest-inspired color palette that
    avoids typical AI-generated aesthetics.

    ARCHITECTURE: This is a full-stack serverless application structured as a monorepo:
    - Shared: Zod schemas defining the API contract (source of truth for types)
    - Frontend: React SPA deployed to S3 + CloudFront
    - Backend: Lambda handlers behind API Gateway (HTTP API)
    - Database: DynamoDB with single-table design
    - Infrastructure: AWS CDK stack defining all resources
    The frontend uses VITE_API_URL env var to reach the API. Both frontend and backend
    import types from the shared/ package — contract mismatch is impossible at compile time.
  </overview>

  <technology_stack>
    <frontend_application>
      <framework>React 18 for component-based UI development</framework>
      <build_tool>Vite 6 for fast dev server and optimized static builds</build_tool>
      <styling>Tailwind CSS v4 for utility-first styling (using @tailwindcss/vite plugin)</styling>
      <routing>React Router v7 for client-side navigation</routing>
      <state_management>React Context + useReducer for complex state, React Query for server state</state_management>
      <language>TypeScript 5.x with strict mode enabled</language>
    </frontend_application>
    <data_layer>
      <database>Amazon DynamoDB for structured data persistence (single-table design)</database>
      <api>AWS Lambda + API Gateway (HTTP API) for RESTful backend</api>
      <api_client>fetch-based API client with React Query (TanStack Query v5) for caching and optimistic updates</api_client>
      <search>Server-side DynamoDB query + GSI for filtering; client-side MiniSearch for instant search UX</search>
      <shared_contract>Zod schemas in shared/ package — single source of truth for request/response types</shared_contract>
      <note>Frontend uses VITE_API_URL env var to reach the API. Both frontend and backend import types from shared/.</note>
    </data_layer>
    <build_output>
      <frontend_build>npm run build in frontend/ produces dist/ folder</frontend_build>
      <backend_build>esbuild bundles Lambda handlers (handled by CDK)</backend_build>
      <infrastructure_build>cdk synth produces CloudFormation template</infrastructure_build>
      <note>Deployment handled via CI/CD: GHA runs cdk deploy + S3 sync</note>
    </build_output>
    <libraries>
      <dnd>@dnd-kit/core v6.3.1 + @dnd-kit/sortable for drag-and-drop Kanban boards</dnd>
      <charts>Recharts v3.5 for dashboard visualizations (burndown, velocity, pie charts)</charts>
      <dates>date-fns v4 for date handling and formatting</dates>
      <icons>Lucide React for consistent iconography</icons>
      <ids>uuid v11 for generating unique identifiers</ids>
      <markdown>React Markdown for rich text descriptions</markdown>
      <query>@tanstack/react-query v5 for server state management</query>
      <search_lib>minisearch v7 for client-side full-text search</search_lib>
    </libraries>
  </technology_stack>

  <infrastructure>
    <cdk_stack>
      The application infrastructure is defined as an AWS CDK TypeScript stack.
      The agent MUST write this stack as part of the generated code.

      Required resources (all prefixed with `ankit-aidlc-testing-`):
      - DynamoDB table: `ankit-aidlc-testing-canopy-table` (single-table design with GSIs for access patterns)
      - Lambda function: `ankit-aidlc-testing-canopy-api` (Node.js 20, bundled with esbuild)
      - API Gateway HTTP API: `ankit-aidlc-testing-canopy-http-api` (with CORS configured for the frontend origin)
      - S3 bucket: `ankit-aidlc-testing-canopy-frontend` for frontend static assets
      - CloudFront distribution: `ankit-aidlc-testing-canopy-cdn` for frontend (with SPA routing fallback to index.html)
      - IAM Role for Lambda with DynamoDB read/write permissions

      CfnOutput values the stack MUST export:
      - ApiUrl: The HTTP API Gateway endpoint URL (used as VITE_API_URL)
      - FrontendBucketName: S3 bucket name for frontend deployment
      - CloudFrontDistributionId: For cache invalidation during deployment
      - CloudFrontUrl: The public URL for the application
      - TableName: DynamoDB table name

      CDK Stack file location: infra/lib/canopy-stack.ts
      CDK App file location: infra/bin/canopy-app.ts
    </cdk_stack>

    <dynamodb_design>
      Single-table design with the following structure:

      Table name: ankit-aidlc-testing-canopy-table
      Partition Key: PK (String)
      Sort Key: SK (String)

      Global Secondary Indexes:
      - GSI1: GSI1PK (String) / GSI1SK (String) — for querying issues by project+status, sprints by project
      - GSI2: GSI2PK (String) / GSI2SK (String) — for querying issues by assignee, epics by project
      - GSI3: GSI3PK (String) / GSI3SK (String) — for querying issues by sprint, announcements by date

      Entity access patterns:
      | Entity       | PK                    | SK                    | GSI1PK              | GSI1SK           | GSI2PK              | GSI2SK           | GSI3PK              | GSI3SK           |
      |-------------|----------------------|----------------------|---------------------|------------------|---------------------|------------------|---------------------|------------------|
      | Project     | PROJECT#projId       | PROJECT#projId       | ORG#orgId           | PROJECT#projId   | —                   | —                | —                   | —                |
      | Issue       | PROJECT#projId       | ISSUE#issueId        | PROJECT#projId#STATUS#status | ISSUE#issueId | ASSIGNEE#userId  | ISSUE#issueId    | SPRINT#sprintId     | ISSUE#issueId    |
      | Sprint      | PROJECT#projId       | SPRINT#sprintId      | PROJECT#projId      | SPRINT#startDate | —                   | —                | —                   | —                |
      | Epic        | PROJECT#projId       | EPIC#epicId          | PROJECT#projId      | EPIC#epicId      | PROJECT#projId      | EPIC#epicId      | —                   | —                |
      | Comment     | ISSUE#issueId        | COMMENT#commentId    | —                   | —                | —                   | —                | —                   | —                |
      | Announcement| ANNOUNCEMENT         | ANNOUNCEMENT#annId   | —                   | —                | —                   | —                | ANNOUNCEMENT        | DATE#createdAt   |
      | User        | USER#userId          | USER#userId          | ORG#orgId           | USER#userId      | —                   | —                | —                   | —                |
      | Board       | PROJECT#projId       | BOARD#boardId        | —                   | —                | —                   | —                | —                   | —                |

      TTL attribute: ttl (Number) — used for soft-delete expiration if needed
    </dynamodb_design>

    <lambda_configuration>
      Runtime: Node.js 20.x
      Handler: index.handler
      Memory: 512 MB
      Timeout: 30 seconds
      Bundling: esbuild via CDK NodejsFunction construct
      Environment variables:
        - TABLE_NAME: DynamoDB table name (from CDK)
        - CORS_ORIGIN: Frontend CloudFront URL (from CDK)
      
      The Lambda uses a single handler with path-based routing (no framework dependency):
        - Parse event.requestContext.http.method and event.rawPath
        - Route to appropriate handler function
        - Return proper HTTP responses with CORS headers
    </lambda_configuration>
  </infrastructure>

  <directory_structure>
    canopy/
    ├── package.json                    # Workspace root (npm workspaces)
    ├── tsconfig.base.json              # Shared TS config
    ├── shared/
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts                # Re-exports all schemas and types
    │       ├── schemas/
    │       │   ├── project.ts          # Project Zod schemas
    │       │   ├── issue.ts            # Issue Zod schemas
    │       │   ├── sprint.ts           # Sprint Zod schemas
    │       │   ├── epic.ts             # Epic Zod schemas
    │       │   ├── comment.ts          # Comment Zod schemas
    │       │   ├── announcement.ts     # Announcement Zod schemas
    │       │   ├── user.ts             # User Zod schemas
    │       │   └── board.ts            # Board/Column Zod schemas
    │       └── types/
    │           └── index.ts            # Inferred TypeScript types from Zod schemas
    ├── frontend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vite.config.ts
    │   ├── index.html
    │   ├── postcss.config.js
    │   └── src/
    │       ├── main.tsx                # App entry point
    │       ├── App.tsx                 # Root component with router
    │       ├── index.css               # Tailwind directives + custom theme
    │       ├── api/
    │       │   ├── client.ts           # Base fetch client (uses VITE_API_URL)
    │       │   ├── projects.ts         # Project API hooks
    │       │   ├── issues.ts           # Issue API hooks
    │       │   ├── sprints.ts          # Sprint API hooks
    │       │   ├── epics.ts            # Epic API hooks
    │       │   ├── announcements.ts    # Announcement API hooks
    │       │   └── comments.ts         # Comment API hooks
    │       ├── components/
    │       │   ├── layout/
    │       │   │   ├── AppShell.tsx     # Main layout with sidebar + header
    │       │   │   ├── Sidebar.tsx      # Navigation sidebar
    │       │   │   ├── Header.tsx       # Top bar with search + user
    │       │   │   └── MobileNav.tsx    # Mobile responsive navigation
    │       │   ├── ui/
    │       │   │   ├── Button.tsx
    │       │   │   ├── Input.tsx
    │       │   │   ├── Select.tsx
    │       │   │   ├── Modal.tsx
    │       │   │   ├── Badge.tsx
    │       │   │   ├── Avatar.tsx
    │       │   │   ├── Card.tsx
    │       │   │   ├── Dropdown.tsx
    │       │   │   ├── Toast.tsx
    │       │   │   ├── Tabs.tsx
    │       │   │   ├── EmptyState.tsx
    │       │   │   ├── LoadingSpinner.tsx
    │       │   │   └── ConfirmDialog.tsx
    │       │   ├── issues/
    │       │   │   ├── IssueCard.tsx
    │       │   │   ├── IssueDetailPanel.tsx
    │       │   │   ├── IssueForm.tsx
    │       │   │   ├── IssueFilters.tsx
    │       │   │   ├── IssueList.tsx
    │       │   │   └── IssuePriorityIcon.tsx
    │       │   ├── board/
    │       │   │   ├── KanbanBoard.tsx
    │       │   │   ├── KanbanColumn.tsx
    │       │   │   ├── KanbanCard.tsx
    │       │   │   └── BoardFilters.tsx
    │       │   ├── sprint/
    │       │   │   ├── SprintPanel.tsx
    │       │   │   ├── SprintCard.tsx
    │       │   │   ├── SprintPlanningView.tsx
    │       │   │   └── SprintProgressBar.tsx
    │       │   ├── epic/
    │       │   │   ├── EpicList.tsx
    │       │   │   ├── EpicCard.tsx
    │       │   │   ├── EpicForm.tsx
    │       │   │   └── EpicProgressBar.tsx
    │       │   ├── dashboard/
    │       │   │   ├── BurndownChart.tsx
    │       │   │   ├── VelocityChart.tsx
    │       │   │   ├── StatusPieChart.tsx
    │       │   │   ├── RecentActivity.tsx
    │       │   │   └── SprintSummaryCard.tsx
    │       │   └── announcements/
    │       │       ├── AnnouncementList.tsx
    │       │       ├── AnnouncementCard.tsx
    │       │       └── AnnouncementForm.tsx
    │       ├── pages/
    │       │   ├── DashboardPage.tsx
    │       │   ├── ProjectListPage.tsx
    │       │   ├── ProjectDetailPage.tsx
    │       │   ├── BacklogPage.tsx
    │       │   ├── BoardPage.tsx
    │       │   ├── SprintPage.tsx
    │       │   ├── EpicsPage.tsx
    │       │   ├── IssueDetailPage.tsx
    │       │   ├── AnnouncementsPage.tsx
    │       │   └── SettingsPage.tsx
    │       ├── hooks/
    │       │   ├── useSearch.ts
    │       │   ├── useDebounce.ts
    │       │   ├── useLocalStorage.ts
    │       │   └── useBreakpoint.ts
    │       ├── context/
    │       │   ├── ProjectContext.tsx
    │       │   └── ToastContext.tsx
    │       └── utils/
    │           ├── constants.ts
    │           ├── helpers.ts
    │           └── filters.ts
    ├── backend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts                # Lambda handler with router
    │       ├── router.ts               # Path-based request router
    │       ├── handlers/
    │       │   ├── projects.ts         # Project CRUD handlers
    │       │   ├── issues.ts           # Issue CRUD handlers
    │       │   ├── sprints.ts          # Sprint CRUD handlers
    │       │   ├── epics.ts            # Epic CRUD handlers
    │       │   ├── comments.ts         # Comment CRUD handlers
    │       │   ├── announcements.ts    # Announcement CRUD handlers
    │       │   └── seed.ts             # Seed data handler
    │       ├── db/
    │       │   ├── client.ts           # DynamoDB DocumentClient setup
    │       │   ├── projects.ts         # Project DB operations
    │       │   ├── issues.ts           # Issue DB operations
    │       │   ├── sprints.ts          # Sprint DB operations
    │       │   ├── epics.ts            # Epic DB operations
    │       │   ├── comments.ts         # Comment DB operations
    │       │   └── announcements.ts    # Announcement DB operations
    │       ├── middleware/
    │       │   ├── cors.ts             # CORS headers middleware
    │       │   ├── validation.ts       # Zod validation middleware
    │       │   └── error.ts            # Error handling middleware
    │       └── utils/
    │           ├── response.ts         # HTTP response helpers
    │           └── keys.ts             # DynamoDB key builders
    └── infra/
        ├── package.json
        ├── tsconfig.json
        ├── cdk.json
        ├── bin/
        │   └── canopy-app.ts           # CDK app entry point
        └── lib/
            └── canopy-stack.ts         # Main CDK stack
  </directory_structure>

  <api_contract>
    Base URL: ${VITE_API_URL} (output from CDK stack)
    All responses follow envelope: { success: boolean, data?: T, error?: string }
    All list endpoints support pagination via: ?cursor=X&limit=N

    <endpoints>
      <!-- Projects -->
      GET    /api/projects                    — List all projects
      POST   /api/projects                    — Create a project
      GET    /api/projects/:projectId         — Get project details
      PUT    /api/projects/:projectId         — Update a project
      DELETE /api/projects/:projectId         — Delete a project (soft delete)

      <!-- Issues -->
      GET    /api/projects/:projectId/issues  — List issues (supports ?status=&priority=&assignee=&sprint=&epic=&q=)
      POST   /api/projects/:projectId/issues  — Create an issue
      GET    /api/issues/:issueId             — Get issue details
      PUT    /api/issues/:issueId             — Update an issue
      DELETE /api/issues/:issueId             — Delete an issue
      PUT    /api/issues/:issueId/move        — Move issue (change status/sprint/order for board drag-and-drop)

      <!-- Sprints -->
      GET    /api/projects/:projectId/sprints — List sprints for project
      POST   /api/projects/:projectId/sprints — Create a sprint
      GET    /api/sprints/:sprintId           — Get sprint details (with issues)
      PUT    /api/sprints/:sprintId           — Update sprint (name, dates, status)
      PUT    /api/sprints/:sprintId/start     — Start a sprint
      PUT    /api/sprints/:sprintId/complete  — Complete a sprint
      DELETE /api/sprints/:sprintId           — Delete a sprint

      <!-- Epics -->
      GET    /api/projects/:projectId/epics   — List epics for project
      POST   /api/projects/:projectId/epics   — Create an epic
      GET    /api/epics/:epicId               — Get epic details (with issues)
      PUT    /api/epics/:epicId               — Update an epic
      DELETE /api/epics/:epicId               — Delete an epic

      <!-- Comments -->
      GET    /api/issues/:issueId/comments    — List comments on an issue
      POST   /api/issues/:issueId/comments    — Add a comment
      PUT    /api/comments/:commentId         — Edit a comment
      DELETE /api/comments/:commentId         — Delete a comment

      <!-- Announcements -->
      GET    /api/announcements               — List all announcements (?limit=&cursor=)
      POST   /api/announcements               — Create an announcement
      PUT    /api/announcements/:annId        — Update an announcement
      DELETE /api/announcements/:annId        — Delete an announcement

      <!-- Dashboard / Reports -->
      GET    /api/projects/:projectId/dashboard — Get dashboard data (burndown, velocity, status distribution)

      <!-- Seed -->
      POST   /api/seed                        — Seed database with sample data (dev/demo only)
    </endpoints>
  </api_contract>

  <schema_definitions>
    All schemas are defined in shared/src/schemas/ using Zod.
    Types are inferred using z.infer and exported from shared/src/types/index.ts.

    <schema name="project">
      import { z } from 'zod';

      export const ProjectSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
        key: z.string().min(2).max(10).regex(/^[A-Z]+$/), // e.g., "PROJ", "CAN"
        description: z.string().max(2000).optional(),
        leadUserId: z.string().uuid().optional(),
        status: z.enum(['active', 'archived', 'completed']),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateProjectSchema = ProjectSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      });

      export const UpdateProjectSchema = CreateProjectSchema.partial();
    </schema>

    <schema name="issue">
      import { z } from 'zod';

      export const IssuePrioritySchema = z.enum(['critical', 'high', 'medium', 'low', 'trivial']);
      export const IssueTypeSchema = z.enum(['story', 'bug', 'task', 'subtask', 'epic']);
      export const IssueStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']);

      export const IssueSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        key: z.string(), // e.g., "PROJ-123" — auto-generated
        title: z.string().min(1).max(200),
        description: z.string().max(10000).optional(),
        type: IssueTypeSchema,
        status: IssueStatusSchema,
        priority: IssuePrioritySchema,
        assigneeId: z.string().uuid().optional(),
        reporterId: z.string().uuid(),
        epicId: z.string().uuid().optional(),
        sprintId: z.string().uuid().optional(),
        storyPoints: z.number().int().min(0).max(100).optional(),
        labels: z.array(z.string()).default([]),
        order: z.number().int(), // For ordering within a column/backlog
        parentIssueId: z.string().uuid().optional(), // For subtasks
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateIssueSchema = IssueSchema.omit({
        id: true,
        key: true,
        createdAt: true,
        updatedAt: true,
      });

      export const UpdateIssueSchema = CreateIssueSchema.partial();

      export const MoveIssueSchema = z.object({
        status: IssueStatusSchema.optional(),
        sprintId: z.string().uuid().nullable().optional(),
        order: z.number().int(),
      });

      export const IssueFilterSchema = z.object({
        status: z.array(IssueStatusSchema).optional(),
        priority: z.array(IssuePrioritySchema).optional(),
        type: z.array(IssueTypeSchema).optional(),
        assigneeId: z.string().uuid().optional(),
        sprintId: z.string().uuid().nullable().optional(),
        epicId: z.string().uuid().optional(),
        labels: z.array(z.string()).optional(),
        q: z.string().optional(), // Full-text search query
      });
    </schema>

    <schema name="sprint">
      import { z } from 'zod';

      export const SprintStatusSchema = z.enum(['planning', 'active', 'completed']);

      export const SprintSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        name: z.string().min(1).max(100),
        goal: z.string().max(500).optional(),
        status: SprintStatusSchema,
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateSprintSchema = SprintSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      });

      export const UpdateSprintSchema = CreateSprintSchema.partial();
    </schema>

    <schema name="epic">
      import { z } from 'zod';

      export const EpicStatusSchema = z.enum(['draft', 'in_progress', 'done']);

      export const EpicSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        name: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        status: EpicStatusSchema,
        color: z.string().regex(/^#[0-9a-fA-F]{6}$/), // Hex color for visual grouping
        startDate: z.string().datetime().optional(),
        targetDate: z.string().datetime().optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateEpicSchema = EpicSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      });

      export const UpdateEpicSchema = CreateEpicSchema.partial();
    </schema>

    <schema name="comment">
      import { z } from 'zod';

      export const CommentSchema = z.object({
        id: z.string().uuid(),
        issueId: z.string().uuid(),
        authorId: z.string().uuid(),
        body: z.string().min(1).max(5000),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateCommentSchema = CommentSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      });

      export const UpdateCommentSchema = z.object({
        body: z.string().min(1).max(5000),
      });
    </schema>

    <schema name="announcement">
      import { z } from 'zod';

      export const AnnouncementSchema = z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200),
        body: z.string().min(1).max(5000),
        priority: z.enum(['info', 'warning', 'critical']),
        authorId: z.string().uuid(),
        pinned: z.boolean().default(false),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateAnnouncementSchema = AnnouncementSchema.omit({
        id: true,
        createdAt: true,
        updatedAt: true,
      });

      export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();
    </schema>

    <schema name="user">
      import { z } from 'zod';

      export const UserSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
        email: z.string().email(),
        avatarUrl: z.string().url().optional(),
        role: z.enum(['admin', 'member', 'viewer']),
        createdAt: z.string().datetime(),
      });
    </schema>

    <schema name="board">
      import { z } from 'zod';

      export const BoardColumnSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(50),
        status: z.string(), // Maps to IssueStatus
        order: z.number().int(),
        wipLimit: z.number().int().min(0).optional(),
      });

      export const BoardSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        name: z.string().min(1).max(100),
        columns: z.array(BoardColumnSchema),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });
    </schema>

    <schema name="dashboard">
      import { z } from 'zod';

      export const BurndownDataPointSchema = z.object({
        date: z.string(),
        ideal: z.number(),
        actual: z.number(),
      });

      export const VelocityDataPointSchema = z.object({
        sprintName: z.string(),
        committed: z.number(),
        completed: z.number(),
      });

      export const DashboardDataSchema = z.object({
        statusDistribution: z.record(z.string(), z.number()),
        priorityDistribution: z.record(z.string(), z.number()),
        burndown: z.array(BurndownDataPointSchema),
        velocity: z.array(VelocityDataPointSchema),
        totalIssues: z.number(),
        completedIssues: z.number(),
        activeSprint: z.object({
          id: z.string().uuid(),
          name: z.string(),
          progress: z.number(), // 0-100 percentage
          daysRemaining: z.number(),
        }).nullable(),
        recentActivity: z.array(z.object({
          id: z.string(),
          type: z.enum(['issue_created', 'issue_updated', 'issue_moved', 'comment_added', 'sprint_started', 'sprint_completed']),
          description: z.string(),
          timestamp: z.string().datetime(),
          userId: z.string().uuid(),
        })),
      });
    </schema>

    <schema name="api_response">
      import { z } from 'zod';

      export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
        z.object({
          success: z.boolean(),
          data: dataSchema.optional(),
          error: z.string().optional(),
          cursor: z.string().optional(), // Pagination cursor for next page
        });

      export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
        z.object({
          success: z.literal(true),
          data: z.object({
            items: z.array(itemSchema),
            cursor: z.string().nullable(),
            total: z.number().optional(),
          }),
        });
    </schema>
  </schema_definitions>

  <core_data_entities>
    <entity name="Project">
      Represents a software project. Each project has a unique key (e.g., "CAN") used as prefix for issue keys.
      A project contains issues, sprints, epics, and boards.
      Fields: id, name, key, description, leadUserId, status, createdAt, updatedAt
    </entity>

    <entity name="Issue">
      The core work item. Issues have types (story, bug, task, subtask), priorities, statuses, and can be
      assigned to sprints and epics. Issues are ordered within their column/backlog for drag-and-drop.
      Each issue has an auto-generated key like "PROJ-42" based on project key + sequential number.
      Fields: id, projectId, key, title, description, type, status, priority, assigneeId, reporterId,
              epicId, sprintId, storyPoints, labels, order, parentIssueId, createdAt, updatedAt
    </entity>

    <entity name="Sprint">
      A time-boxed iteration containing a set of issues. Sprints have a lifecycle:
      planning → active → completed. Only one sprint per project can be active at a time.
      Fields: id, projectId, name, goal, status, startDate, endDate, createdAt, updatedAt
    </entity>

    <entity name="Epic">
      A large body of work that can be broken into multiple issues. Epics have a color for
      visual grouping on boards and a progress indicator based on child issue completion.
      Fields: id, projectId, name, description, status, color, startDate, targetDate, createdAt, updatedAt
    </entity>

    <entity name="Comment">
      A comment on an issue. Supports markdown formatting.
      Fields: id, issueId, authorId, body, createdAt, updatedAt
    </entity>

    <entity name="Announcement">
      Team-wide announcements displayed on the dashboard. Can be pinned and have priority levels.
      Stored in DynamoDB with full CRUD operations.
      Fields: id, title, body, priority, authorId, pinned, createdAt, updatedAt
    </entity>

    <entity name="User">
      Represents a team member. For this demo app, users are pre-seeded (no auth).
      Fields: id, name, email, avatarUrl, role, createdAt
    </entity>

    <entity name="Board">
      A Kanban board configuration for a project. Defines columns (each mapped to an issue status)
      with optional WIP limits. Default board created with each project.
      Fields: id, projectId, name, columns, createdAt, updatedAt
    </entity>
  </core_data_entities>

  <pages_and_interfaces>
    <page name="Dashboard" path="/" description="Main dashboard showing project overview">
      <layout>Full-width page within AppShell (sidebar + header)</layout>
      <sections>
        <section name="Active Sprint Summary">
          Card showing current sprint name, progress bar, days remaining, story points completed vs committed.
          Quick link to sprint board view.
        </section>
        <section name="Status Distribution">
          Pie/donut chart (Recharts) showing issue count by status across current sprint.
          Color-coded: backlog=gray, todo=blue, in_progress=amber, in_review=purple, done=green, cancelled=red.
        </section>
        <section name="Burndown Chart">
          Line chart showing ideal vs actual remaining story points over the sprint duration.
          X-axis: dates from sprint start to end. Y-axis: story points remaining.
        </section>
        <section name="Velocity Chart">
          Bar chart showing committed vs completed story points for the last 5 sprints.
          Helps teams predict capacity for future sprints.
        </section>
        <section name="Recent Activity">
          Scrollable feed of latest actions (issue created, moved, commented, sprint started/completed).
          Each entry shows: icon, description, relative time, user avatar.
        </section>
        <section name="Announcements Widget">
          Compact list of pinned/recent announcements with priority indicators.
          Link to full announcements page.
        </section>
      </sections>
    </page>

    <page name="Project List" path="/projects" description="Browse and manage projects">
      <layout>Grid of project cards with create button</layout>
      <features>
        - Grid/list view toggle
        - Search projects by name
        - Create project modal (name, key, description)
        - Each card shows: name, key, issue count, active sprint, last activity
        - Click card navigates to project detail
      </features>
    </page>

    <page name="Backlog" path="/projects/:projectId/backlog" description="Product backlog management">
      <layout>Full-height scrollable list with filters sidebar</layout>
      <features>
        - Filterable issue list (by type, priority, epic, assignee, labels)
        - Full-text search (MiniSearch client-side)
        - Multi-select issues for bulk operations (assign to sprint, change priority)
        - Inline create issue at top or bottom
        - Drag-and-drop reordering of backlog items
        - Sprint sections: issues grouped by sprint (or "Backlog" for unassigned)
        - Right-click context menu for quick actions
        - Issue count and total story points displayed per section
        - Quick filters: "My issues", "Recently updated", "Unassigned"
      </features>
    </page>

    <page name="Board" path="/projects/:projectId/board" description="Kanban board for active sprint">
      <layout>Horizontal scrollable columns using @dnd-kit</layout>
      <features>
        - Default columns: Backlog, To Do, In Progress, In Review, Done
        - Drag-and-drop cards between columns (updates issue status via PUT /issues/:id/move)
        - Drag-and-drop reordering within columns
        - Column header shows: name, issue count, WIP limit indicator
        - WIP limit warning (column header turns amber when at limit, red when over)
        - Card displays: issue key, title, priority icon, assignee avatar, story points badge, epic color bar
        - Filter bar above board: assignee, priority, type, epic, text search
        - Sprint selector dropdown (view different sprints)
        - Swimlane toggle: group by assignee, epic, priority, or none
        - Quick create: "+" button at bottom of each column
      </features>
      <dnd_implementation>
        Uses @dnd-kit/core DndContext with @dnd-kit/sortable for columns.
        On drag end: optimistically update local state, fire PUT /issues/:id/move,
        rollback on failure. Use React Query's optimistic update pattern.
      </dnd_implementation>
    </page>

    <page name="Sprint Management" path="/projects/:projectId/sprints" description="Sprint planning and tracking">
      <layout>Timeline view of sprints with detail panel</layout>
      <features>
        - List of all sprints (planning, active, completed) in chronological order
        - Create sprint form: name, goal, start date, end date
        - Sprint detail panel: goal, date range, assigned issues, progress metrics
        - Start sprint action (validates dates, marks previous active as completed)
        - Complete sprint action (shows incomplete issues, option to move to next sprint or backlog)
        - Sprint planning: drag issues from backlog into sprint
        - Sprint scope: total story points, issue count by status
        - Sprint burndown mini-chart in each sprint card
      </features>
    </page>

    <page name="Epics" path="/projects/:projectId/epics" description="Epic management and progress tracking">
      <layout>List/card view of epics with progress indicators</layout>
      <features>
        - Create/edit epic modal (name, description, color, dates)
        - Progress bar per epic (% of child issues completed by count or story points)
        - Expand epic to see child issues
        - Color-coded epic bars visible on board cards and backlog
        - Filter epics by status
        - Epic timeline/roadmap view (horizontal bars on date axis)
      </features>
    </page>

    <page name="Issue Detail" path="/issues/:issueId" description="Full issue view and editing">
      <layout>Two-column: main content left, metadata sidebar right</layout>
      <features>
        - Editable title (click to edit inline)
        - Rich markdown description with edit mode
        - Metadata sidebar: status, priority, type, assignee, reporter, sprint, epic, story points, labels
        - Each metadata field is editable inline (dropdown/picker)
        - Comments section below description (markdown support, edit/delete own comments)
        - Activity log showing all changes to the issue
        - Subtasks section: list child issues, create subtask inline
        - Breadcrumb: Project > Sprint/Backlog > Issue Key
        - Keyboard shortcuts: E to edit, M to assign to me, [ ] to change status
      </features>
    </page>

    <page name="Announcements" path="/announcements" description="Team announcements board">
      <layout>Feed-style list with create form</layout>
      <features>
        - Full CRUD for announcements (stored in DynamoDB)
        - Priority levels with visual indicators: info (blue), warning (amber), critical (red)
        - Pin/unpin announcements (pinned always appear at top)
        - Markdown body rendering
        - Author name and relative timestamp
        - Create/edit form: title, body (textarea with markdown preview), priority, pinned toggle
        - Confirmation dialog for delete
      </features>
    </page>

    <page name="Settings" path="/projects/:projectId/settings" description="Project settings">
      <layout>Tabbed settings page</layout>
      <features>
        - General: Edit project name, key, description
        - Board: Customize columns (add/remove/rename/reorder), set WIP limits
        - Members: View team members (pre-seeded, no invite flow)
        - Danger zone: Archive/delete project
      </features>
    </page>
  </pages_and_interfaces>

  <design_system>
    <color_palette name="Forest Theme">
      The UI uses a distinctive forest-inspired color palette. NOT the typical blue/purple
      of generic SaaS apps. The feel should be earthy, natural, and calming — like working in a treehouse.

      Primary colors (used for buttons, active states, links):
        --canopy-green-50: #f0fdf4
        --canopy-green-100: #dcfce7
        --canopy-green-200: #bbf7d0
        --canopy-green-300: #86efac
        --canopy-green-400: #4ade80
        --canopy-green-500: #22c55e    ← Primary action color
        --canopy-green-600: #16a34a    ← Primary hover
        --canopy-green-700: #15803d
        --canopy-green-800: #166534
        --canopy-green-900: #14532d

      Neutral/bark colors (backgrounds, text, borders):
        --bark-50: #fafaf9
        --bark-100: #f5f5f4
        --bark-200: #e7e5e4
        --bark-300: #d6d3d1
        --bark-400: #a8a29e
        --bark-500: #78716c
        --bark-600: #57534e
        --bark-700: #44403c
        --bark-800: #292524
        --bark-900: #1c1917

      Accent colors:
        --moss: #4d7c0f       (labels, secondary accents)
        --amber: #d97706      (warnings, medium priority)
        --rust: #dc2626       (errors, critical priority)
        --sky: #0284c7        (info, links in dark areas)
        --plum: #7c3aed       (in-review status)

      Semantic usage:
        - Page background: bark-50
        - Card background: white
        - Sidebar background: bark-800 (dark sidebar)
        - Sidebar text: bark-100
        - Sidebar active item: canopy-green-600 bg with white text
        - Primary buttons: canopy-green-600 bg, white text
        - Secondary buttons: bark-200 bg, bark-700 text
        - Text primary: bark-900
        - Text secondary: bark-500
        - Borders: bark-200
        - Focus ring: canopy-green-500
    </color_palette>

    <typography>
      Font family: Inter (Google Fonts) — clean, modern, highly legible
      Fallback: system-ui, -apple-system, sans-serif
      
      Scale:
        - xs: 0.75rem (12px) — metadata, timestamps
        - sm: 0.875rem (14px) — body text, form labels
        - base: 1rem (16px) — paragraphs
        - lg: 1.125rem (18px) — card titles
        - xl: 1.25rem (20px) — page section headers
        - 2xl: 1.5rem (24px) — page titles
        - 3xl: 1.875rem (30px) — dashboard hero numbers
    </typography>

    <spacing>
      Consistent 4px grid. Component padding: 12px-16px. Section gaps: 24px. Page margins: 24px-32px.
    </spacing>

    <responsive_breakpoints>
      - Mobile: < 768px (sidebar collapses to bottom nav, single column layouts)
      - Tablet: 768px - 1024px (sidebar slim mode, board scrolls horizontally)
      - Desktop: > 1024px (full sidebar, multi-column layouts)
    </responsive_breakpoints>
  </design_system>

  <seed_data>
    The POST /api/seed endpoint populates the database with sample data for demonstration.
    This makes the app immediately usable and showcases all features.

    <seed_users>
      5 pre-seeded users:
      - Alice Chen (admin, lead) — alice@canopy.dev
      - Bob Martinez (member, developer) — bob@canopy.dev
      - Carol Williams (member, designer) — carol@canopy.dev
      - David Park (member, developer) — david@canopy.dev
      - Eva Thompson (member, QA) — eva@canopy.dev
    </seed_users>

    <seed_project>
      Project: "Canopy Platform" (key: "CAN", status: active, lead: Alice)
      
      Board: Default Kanban with columns: Backlog, To Do, In Progress, In Review, Done

      Epics (3):
      - "User Authentication" (color: #16a34a, status: done)
      - "Project Management Core" (color: #0284c7, status: in_progress)
      - "Reporting & Analytics" (color: #7c3aed, status: draft)

      Sprints (3):
      - "Sprint 1 - Foundation" (status: completed, 2 weeks ago)
      - "Sprint 2 - Core Features" (status: active, current 2-week window)
      - "Sprint 3 - Polish" (status: planning, next 2 weeks)

      Issues (20+ across all statuses):
      Mix of stories, bugs, and tasks distributed across sprints and statuses.
      Example issues:
        CAN-1: "Set up project structure" (task, done, Sprint 1, Alice, 3pts)
        CAN-2: "Design authentication flow" (story, done, Sprint 1, Carol, 5pts)
        CAN-3: "Implement login page" (story, done, Sprint 1, Bob, 8pts)
        CAN-4: "Create project CRUD API" (story, done, Sprint 1, David, 5pts)
        CAN-5: "Build Kanban board component" (story, in_progress, Sprint 2, Bob, 13pts)
        CAN-6: "Add drag-and-drop to board" (task, in_progress, Sprint 2, Bob, 8pts)
        CAN-7: "Design dashboard layout" (story, in_review, Sprint 2, Carol, 5pts)
        CAN-8: "Implement burndown chart" (story, todo, Sprint 2, David, 8pts)
        CAN-9: "Fix board column overflow" (bug, todo, Sprint 2, Bob, 3pts)
        CAN-10: "Add issue filtering" (story, todo, Sprint 2, Alice, 5pts)
        CAN-11: "Sprint planning improvements" (story, backlog, Sprint 3, Alice, 8pts)
        CAN-12: "Mobile responsive layout" (story, backlog, Sprint 3, Carol, 13pts)
        CAN-13: "Performance optimization" (task, backlog, unassigned, David, 5pts)
        CAN-14: "Add keyboard shortcuts" (story, backlog, unassigned, Bob, 3pts)
        CAN-15: "Write API documentation" (task, backlog, unassigned, Eva, 2pts)
        CAN-16: "Add epic progress tracking" (story, backlog, Sprint 3, David, 5pts)
        CAN-17: "Implement velocity chart" (story, backlog, Sprint 3, David, 8pts)
        CAN-18: "Fix issue ordering bug" (bug, in_progress, Sprint 2, Alice, 2pts)
        CAN-19: "Add announcement system" (story, in_review, Sprint 2, Eva, 5pts)
        CAN-20: "Setup CI/CD pipeline" (task, done, Sprint 1, David, 3pts)

      Announcements (3):
      - "Welcome to Canopy!" (info, pinned, Alice)
      - "Sprint 2 kickoff - Monday standup at 9am" (info, not pinned, Alice)
      - "Production deploy scheduled for Friday 5pm" (warning, not pinned, David)

      Comments (scattered across issues):
      - CAN-5: "Making good progress on the board. DnD is tricky." (Bob)
      - CAN-5: "Let me know if you need design help with the drag states." (Carol)
      - CAN-7: "Dashboard mockups are in Figma. Reviewing with team tomorrow." (Carol)
      - CAN-9: "This happens when there are more than 10 cards in a column." (Eva)
    </seed_project>
  </seed_data>

  <implementation_order>
    The agent should build the application in this order to ensure dependencies are satisfied:

    Phase 1: Foundation
      1. Initialize monorepo structure (root package.json with workspaces)
      2. Set up shared/ package with all Zod schemas and exported types
      3. Set up infrastructure/ CDK stack (DynamoDB table, Lambda, API Gateway, S3, CloudFront)
      4. Set up backend/ with Lambda handler skeleton, router, CORS middleware, DynamoDB client
      5. Set up frontend/ with Vite + React + Tailwind + React Router skeleton

    Phase 2: Backend Core
      6. Implement DynamoDB key builders and utility functions (backend/src/utils/keys.ts)
      7. Implement project CRUD handlers + DB operations
      8. Implement issue CRUD handlers + DB operations (with filtering via GSI queries)
      9. Implement sprint CRUD handlers + lifecycle (start/complete)
      10. Implement epic CRUD handlers
      11. Implement comment CRUD handlers
      12. Implement announcement CRUD handlers
      13. Implement dashboard data aggregation handler
      14. Implement seed data handler

    Phase 3: Frontend Foundation
      15. Build design system: Tailwind theme config with forest palette
      16. Build UI primitives: Button, Input, Select, Modal, Badge, Avatar, Card, Dropdown, Toast
      17. Build AppShell layout: Sidebar (dark), Header, MobileNav
      18. Set up React Query provider and API client (uses VITE_API_URL)
      19. Set up React Router with all routes
      20. Build ToastContext for notifications

    Phase 4: Frontend Features
      21. Build ProjectListPage with create project modal
      22. Build BacklogPage with issue list, filters, inline create
      23. Build BoardPage with @dnd-kit Kanban (drag-and-drop status changes)
      24. Build SprintPage with sprint lifecycle management
      25. Build EpicsPage with progress tracking
      26. Build IssueDetailPage with inline editing, comments, subtasks
      27. Build DashboardPage with Recharts (burndown, velocity, pie chart, activity)
      28. Build AnnouncementsPage with full CRUD

    Phase 5: Polish
      29. Add MiniSearch for client-side instant search
      30. Add responsive/mobile layouts
      31. Add keyboard shortcuts
      32. Add loading states, error states, empty states
      33. Add optimistic updates for drag-and-drop
      34. Final UI polish and consistency pass
  </implementation_order>

  <critical_implementation_notes>
    1. MONOREPO STRUCTURE: Use npm workspaces. Root package.json has "workspaces": ["shared", "frontend", "backend", "infra"]. All packages reference shared via workspace dependency ("@canopy/shared": "workspace:*").

    2. SHARED TYPES: Frontend and backend BOTH import from "@canopy/shared". This ensures type safety across the stack. Never duplicate type definitions.

    3. SINGLE-TABLE DYNAMODB: All entities share one table. Use composite keys (PK/SK) and GSIs for access patterns. The key builder utility (backend/src/utils/keys.ts) centralizes key construction.

    4. LAMBDA ROUTER: No Express/Hono. The Lambda handler reads event.requestContext.http.method and event.rawPath, then routes to the appropriate handler. Keep it simple and fast (cold start matters).

    5. CORS: The Lambda must return Access-Control-Allow-Origin, Access-Control-Allow-Methods, Access-Control-Allow-Headers on ALL responses including errors. Handle OPTIONS preflight explicitly.

    6. OPTIMISTIC UPDATES: Board drag-and-drop MUST feel instant. Use React Query's optimistic update pattern: update cache immediately, fire mutation, rollback on error.

    7. ISSUE KEYS: Auto-generated as "{ProjectKey}-{sequentialNumber}". Store a counter on the project entity (issueCounter attribute) and use DynamoDB atomic increment (ADD) to generate sequential keys.

    8. CDK OUTPUTS: The stack MUST output ApiUrl, FrontendBucketName, CloudFrontDistributionId, CloudFrontUrl, TableName as CfnOutput values. The frontend build uses ApiUrl as VITE_API_URL.

    9. RESOURCE NAMING: ALL AWS resources must be prefixed with `ankit-aidlc-testing-` per the requirements.

    10. NO AUTH: This is a demo app. No authentication/authorization. All users are pre-seeded. The "current user" can be selected from a dropdown in the header (simulated auth). Store selected user in localStorage.

    11. RESPONSIVE DESIGN: Must work on mobile. Sidebar collapses to bottom nav on mobile. Board scrolls horizontally with touch support. Forms are full-screen modals on mobile.

    12. VITE_API_URL: The frontend API client reads import.meta.env.VITE_API_URL for the backend base URL. In development, this can point to a local or deployed API. Default to empty string for same-origin in production.

    13. ERROR HANDLING: All API calls should have proper error boundaries in React and try/catch with meaningful error messages in Lambda handlers. Never expose stack traces to the client.

    14. PAGINATION: All list endpoints support cursor-based pagination. The cursor is a base64-encoded DynamoDB LastEvaluatedKey. Default limit is 50 items.

    15. TIMESTAMPS: All timestamps stored as ISO 8601 strings (UTC). Use date-fns for formatting on the frontend.

    16. DRAG AND DROP: Use @dnd-kit sensors (pointer + keyboard) for accessibility. Support both mouse and touch interactions. Implement collision detection strategy for accurate column drops.
  </critical_implementation_notes>
</project_specification>

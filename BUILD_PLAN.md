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
      <validation>Zod v3.23 for runtime validation on both frontend and backend</validation>
      <query>@tanstack/react-query v5 for server state management</query>
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

      CDK Stack name: `AnkitAidlcTestingCanopyStack`

      CfnOutput values the stack MUST export:
      - ApiUrl: The HTTP API endpoint URL (used as VITE_API_URL)
      - FrontendBucketName: S3 bucket name for deploying frontend assets
      - CloudFrontDistributionId: For cache invalidation during deployments
      - CloudFrontUrl: The public URL for the application
      - TableName: DynamoDB table name (for reference)

      DynamoDB Table Design:
      - Table name: `ankit-aidlc-testing-canopy-table`
      - Partition key: PK (String)
      - Sort key: SK (String)
      - GSI1: GSI1PK (String) / GSI1SK (String) — for querying by project, sprint, etc.
      - GSI2: GSI2PK (String) / GSI2SK (String) — for querying by assignee, status, etc.
      - Billing mode: PAY_PER_REQUEST

      Lambda Configuration:
      - Runtime: Node.js 20.x
      - Memory: 512 MB
      - Timeout: 30 seconds
      - Environment variables: TABLE_NAME (from DynamoDB table)
      - Bundling: esbuild via CDK NodejsFunction construct

      API Gateway Configuration:
      - Type: HTTP API (cheaper, faster than REST API)
      - CORS: Allow all origins in dev, specific CloudFront URL in prod
      - Routes: Proxy all requests to single Lambda (/{proxy+})
      - Stage: $default (auto-deploy)
    </cdk_stack>

    <project_structure>
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
      │       │   ├── board.ts            # Board/Column Zod schemas
      │       │   ├── comment.ts          # Comment Zod schemas
      │       │   ├── user.ts             # User Zod schemas
      │       │   └── announcement.ts     # Announcement Zod schemas
      │       └── types/
      │           └── index.ts            # Inferred TypeScript types from Zod schemas
      ├── frontend/
      │   ├── package.json
      │   ├── tsconfig.json
      │   ├── vite.config.ts
      │   ├── index.html
      │   ├── public/
      │   └── src/
      │       ├── main.tsx
      │       ├── App.tsx
      │       ├── index.css               # Tailwind CSS v4 entry
      │       ├── api/
      │       │   ├── client.ts           # Base fetch client with error handling
      │       │   ├── projects.ts         # Project API hooks
      │       │   ├── issues.ts           # Issue API hooks
      │       │   ├── sprints.ts          # Sprint API hooks
      │       │   ├── epics.ts            # Epic API hooks
      │       │   └── announcements.ts    # Announcement API hooks
      │       ├── components/
      │       │   ├── layout/
      │       │   │   ├── AppShell.tsx    # Main layout with sidebar
      │       │   │   ├── Sidebar.tsx     # Navigation sidebar
      │       │   │   ├── Header.tsx      # Top header bar
      │       │   │   └── Breadcrumb.tsx  # Breadcrumb navigation
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
      │       │   │   ├── Spinner.tsx
      │       │   │   ├── EmptyState.tsx
      │       │   │   └── Tooltip.tsx
      │       │   ├── issues/
      │       │   │   ├── IssueCard.tsx
      │       │   │   ├── IssueDetail.tsx
      │       │   │   ├── IssueForm.tsx
      │       │   │   ├── IssueList.tsx
      │       │   │   └── IssueFilters.tsx
      │       │   ├── board/
      │       │   │   ├── KanbanBoard.tsx
      │       │   │   ├── KanbanColumn.tsx
      │       │   │   └── KanbanCard.tsx
      │       │   ├── sprint/
      │       │   │   ├── SprintPanel.tsx
      │       │   │   ├── SprintPlanning.tsx
      │       │   │   └── SprintCard.tsx
      │       │   ├── dashboard/
      │       │   │   ├── BurndownChart.tsx
      │       │   │   ├── VelocityChart.tsx
      │       │   │   ├── StatusPieChart.tsx
      │       │   │   ├── RecentActivity.tsx
      │       │   │   └── StatsCards.tsx
      │       │   └── announcements/
      │       │       ├── AnnouncementList.tsx
      │       │       ├── AnnouncementForm.tsx
      │       │       └── AnnouncementCard.tsx
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
      │       │   ├── useDebounce.ts
      │       │   ├── useLocalStorage.ts
      │       │   └── useMediaQuery.ts
      │       ├── context/
      │       │   ├── ProjectContext.tsx
      │       │   └── ThemeContext.tsx
      │       └── utils/
      │           ├── constants.ts
      │           ├── formatters.ts
      │           └── filters.ts
      ├── backend/
      │   ├── package.json
      │   ├── tsconfig.json
      │   └── src/
      │       ├── index.ts                # Lambda handler entry (routes requests)
      │       ├── router.ts               # Simple path-based router
      │       ├── handlers/
      │       │   ├── projects.ts         # Project CRUD handlers
      │       │   ├── issues.ts           # Issue CRUD handlers
      │       │   ├── sprints.ts          # Sprint CRUD handlers
      │       │   ├── epics.ts            # Epic CRUD handlers
      │       │   ├── announcements.ts    # Announcement CRUD handlers
      │       │   ├── board.ts            # Board state handlers
      │       │   └── seed.ts             # Seed data handler
      │       ├── db/
      │       │   ├── client.ts           # DynamoDB DocumentClient singleton
      │       │   ├── projects.ts         # Project DB operations
      │       │   ├── issues.ts           # Issue DB operations
      │       │   ├── sprints.ts          # Sprint DB operations
      │       │   ├── epics.ts            # Epic DB operations
      │       │   └── announcements.ts    # Announcement DB operations
      │       └── utils/
      │           ├── response.ts         # HTTP response helpers
      │           └── validation.ts       # Zod validation middleware
      ├── infra/
      │   ├── package.json
      │   ├── tsconfig.json
      │   ├── cdk.json
      │   ├── bin/
      │   │   └── app.ts                  # CDK app entry point
      │   └── lib/
      │       └── canopy-stack.ts         # Main CDK stack definition
      └── seed/
          └── data.ts                     # Sample seed data for DynamoDB
    </project_structure>
  </infrastructure>

  <api_contract>
    <base_url>{{VITE_API_URL}} — resolved from CDK ApiUrl output</base_url>

    <endpoints>
      <!-- Projects -->
      <endpoint method="GET" path="/api/projects" description="List all projects">
        <response>{ projects: Project[] }</response>
      </endpoint>
      <endpoint method="POST" path="/api/projects" description="Create a new project">
        <request>CreateProjectInput</request>
        <response>{ project: Project }</response>
      </endpoint>
      <endpoint method="GET" path="/api/projects/:projectId" description="Get project details">
        <response>{ project: Project }</response>
      </endpoint>
      <endpoint method="PUT" path="/api/projects/:projectId" description="Update a project">
        <request>UpdateProjectInput</request>
        <response>{ project: Project }</response>
      </endpoint>
      <endpoint method="DELETE" path="/api/projects/:projectId" description="Delete a project">
        <response>{ success: true }</response>
      </endpoint>

      <!-- Issues -->
      <endpoint method="GET" path="/api/projects/:projectId/issues" description="List issues for a project (supports filtering)">
        <query_params>status, priority, assignee, epicId, sprintId, type, search, sortBy, sortOrder</query_params>
        <response>{ issues: Issue[], total: number }</response>
      </endpoint>
      <endpoint method="POST" path="/api/projects/:projectId/issues" description="Create an issue">
        <request>CreateIssueInput</request>
        <response>{ issue: Issue }</response>
      </endpoint>
      <endpoint method="GET" path="/api/projects/:projectId/issues/:issueId" description="Get issue details">
        <response>{ issue: Issue, comments: Comment[] }</response>
      </endpoint>
      <endpoint method="PUT" path="/api/projects/:projectId/issues/:issueId" description="Update an issue">
        <request>UpdateIssueInput</request>
        <response>{ issue: Issue }</response>
      </endpoint>
      <endpoint method="DELETE" path="/api/projects/:projectId/issues/:issueId" description="Delete an issue">
        <response>{ success: true }</response>
      </endpoint>
      <endpoint method="PATCH" path="/api/projects/:projectId/issues/:issueId/move" description="Move issue between columns/sprints">
        <request>{ status?: string, sprintId?: string, order?: number }</request>
        <response>{ issue: Issue }</response>
      </endpoint>

      <!-- Comments -->
      <endpoint method="POST" path="/api/projects/:projectId/issues/:issueId/comments" description="Add a comment">
        <request>CreateCommentInput</request>
        <response>{ comment: Comment }</response>
      </endpoint>
      <endpoint method="DELETE" path="/api/projects/:projectId/issues/:issueId/comments/:commentId" description="Delete a comment">
        <response>{ success: true }</response>
      </endpoint>

      <!-- Sprints -->
      <endpoint method="GET" path="/api/projects/:projectId/sprints" description="List sprints for a project">
        <response>{ sprints: Sprint[] }</response>
      </endpoint>
      <endpoint method="POST" path="/api/projects/:projectId/sprints" description="Create a sprint">
        <request>CreateSprintInput</request>
        <response>{ sprint: Sprint }</response>
      </endpoint>
      <endpoint method="PUT" path="/api/projects/:projectId/sprints/:sprintId" description="Update a sprint">
        <request>UpdateSprintInput</request>
        <response>{ sprint: Sprint }</response>
      </endpoint>
      <endpoint method="POST" path="/api/projects/:projectId/sprints/:sprintId/start" description="Start a sprint">
        <response>{ sprint: Sprint }</response>
      </endpoint>
      <endpoint method="POST" path="/api/projects/:projectId/sprints/:sprintId/complete" description="Complete a sprint">
        <response>{ sprint: Sprint, movedToBacklog: number }</response>
      </endpoint>
      <endpoint method="DELETE" path="/api/projects/:projectId/sprints/:sprintId" description="Delete a sprint">
        <response>{ success: true }</response>
      </endpoint>

      <!-- Epics -->
      <endpoint method="GET" path="/api/projects/:projectId/epics" description="List epics for a project">
        <response>{ epics: Epic[] }</response>
      </endpoint>
      <endpoint method="POST" path="/api/projects/:projectId/epics" description="Create an epic">
        <request>CreateEpicInput</request>
        <response>{ epic: Epic }</response>
      </endpoint>
      <endpoint method="PUT" path="/api/projects/:projectId/epics/:epicId" description="Update an epic">
        <request>UpdateEpicInput</request>
        <response>{ epic: Epic }</response>
      </endpoint>
      <endpoint method="DELETE" path="/api/projects/:projectId/epics/:epicId" description="Delete an epic">
        <response>{ success: true }</response>
      </endpoint>

      <!-- Announcements -->
      <endpoint method="GET" path="/api/announcements" description="List all announcements">
        <response>{ announcements: Announcement[] }</response>
      </endpoint>
      <endpoint method="POST" path="/api/announcements" description="Create an announcement">
        <request>CreateAnnouncementInput</request>
        <response>{ announcement: Announcement }</response>
      </endpoint>
      <endpoint method="PUT" path="/api/announcements/:announcementId" description="Update an announcement">
        <request>UpdateAnnouncementInput</request>
        <response>{ announcement: Announcement }</response>
      </endpoint>
      <endpoint method="DELETE" path="/api/announcements/:announcementId" description="Delete an announcement">
        <response>{ success: true }</response>
      </endpoint>

      <!-- Dashboard / Reports -->
      <endpoint method="GET" path="/api/projects/:projectId/dashboard" description="Get dashboard stats">
        <response>{ stats: DashboardStats }</response>
      </endpoint>
      <endpoint method="GET" path="/api/projects/:projectId/burndown" description="Get burndown chart data">
        <query_params>sprintId</query_params>
        <response>{ data: BurndownDataPoint[] }</response>
      </endpoint>
      <endpoint method="GET" path="/api/projects/:projectId/velocity" description="Get velocity chart data">
        <response>{ data: VelocityDataPoint[] }</response>
      </endpoint>

      <!-- Seed -->
      <endpoint method="POST" path="/api/seed" description="Seed database with sample data">
        <response>{ success: true, message: string }</response>
      </endpoint>
    </endpoints>
  </api_contract>

  <schema_definitions>
    <schema name="Project">
      ```typescript
      // shared/src/schemas/project.ts
      import { z } from 'zod';

      export const ProjectSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
        key: z.string().min(2).max(10).regex(/^[A-Z]+$/), // e.g., "CAN", "PROJ"
        description: z.string().max(2000).optional(),
        lead: z.string().min(1),
        avatarColor: z.string().optional(), // hex color for project avatar
        issueCounter: z.number().int().default(0), // for auto-incrementing issue keys
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateProjectInputSchema = z.object({
        name: z.string().min(1).max(100),
        key: z.string().min(2).max(10).regex(/^[A-Z]+$/),
        description: z.string().max(2000).optional(),
        lead: z.string().min(1),
        avatarColor: z.string().optional(),
      });

      export const UpdateProjectInputSchema = CreateProjectInputSchema.partial();

      export type Project = z.infer<typeof ProjectSchema>;
      export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;
      export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;
      ```
    </schema>

    <schema name="Issue">
      ```typescript
      // shared/src/schemas/issue.ts
      import { z } from 'zod';

      export const IssueTypeEnum = z.enum(['story', 'bug', 'task', 'subtask']);
      export const IssuePriorityEnum = z.enum(['critical', 'high', 'medium', 'low']);
      export const IssueStatusEnum = z.enum(['todo', 'in_progress', 'in_review', 'done', 'cancelled']);

      export const IssueSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        key: z.string(), // e.g., "CAN-42"
        title: z.string().min(1).max(200),
        description: z.string().max(10000).optional(),
        type: IssueTypeEnum,
        status: IssueStatusEnum,
        priority: IssuePriorityEnum,
        assignee: z.string().optional(),
        reporter: z.string(),
        epicId: z.string().uuid().optional(),
        sprintId: z.string().uuid().optional(),
        storyPoints: z.number().int().min(0).max(100).optional(),
        labels: z.array(z.string()).default([]),
        order: z.number().int().default(0), // for ordering within a column
        parentId: z.string().uuid().optional(), // for subtasks
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateIssueInputSchema = z.object({
        title: z.string().min(1).max(200),
        description: z.string().max(10000).optional(),
        type: IssueTypeEnum,
        priority: IssuePriorityEnum,
        assignee: z.string().optional(),
        reporter: z.string(),
        epicId: z.string().uuid().optional(),
        sprintId: z.string().uuid().optional(),
        storyPoints: z.number().int().min(0).max(100).optional(),
        labels: z.array(z.string()).optional(),
        parentId: z.string().uuid().optional(),
      });

      export const UpdateIssueInputSchema = z.object({
        title: z.string().min(1).max(200).optional(),
        description: z.string().max(10000).optional(),
        type: IssueTypeEnum.optional(),
        status: IssueStatusEnum.optional(),
        priority: IssuePriorityEnum.optional(),
        assignee: z.string().nullable().optional(),
        epicId: z.string().uuid().nullable().optional(),
        sprintId: z.string().uuid().nullable().optional(),
        storyPoints: z.number().int().min(0).max(100).nullable().optional(),
        labels: z.array(z.string()).optional(),
        order: z.number().int().optional(),
      });

      export type Issue = z.infer<typeof IssueSchema>;
      export type IssueType = z.infer<typeof IssueTypeEnum>;
      export type IssuePriority = z.infer<typeof IssuePriorityEnum>;
      export type IssueStatus = z.infer<typeof IssueStatusEnum>;
      export type CreateIssueInput = z.infer<typeof CreateIssueInputSchema>;
      export type UpdateIssueInput = z.infer<typeof UpdateIssueInputSchema>;
      ```
    </schema>

    <schema name="Sprint">
      ```typescript
      // shared/src/schemas/sprint.ts
      import { z } from 'zod';

      export const SprintStatusEnum = z.enum(['planning', 'active', 'completed']);

      export const SprintSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        name: z.string().min(1).max(100),
        goal: z.string().max(500).optional(),
        status: SprintStatusEnum,
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateSprintInputSchema = z.object({
        name: z.string().min(1).max(100),
        goal: z.string().max(500).optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
      });

      export const UpdateSprintInputSchema = CreateSprintInputSchema.partial();

      export type Sprint = z.infer<typeof SprintSchema>;
      export type SprintStatus = z.infer<typeof SprintStatusEnum>;
      export type CreateSprintInput = z.infer<typeof CreateSprintInputSchema>;
      export type UpdateSprintInput = z.infer<typeof UpdateSprintInputSchema>;
      ```
    </schema>

    <schema name="Epic">
      ```typescript
      // shared/src/schemas/epic.ts
      import { z } from 'zod';

      export const EpicStatusEnum = z.enum(['not_started', 'in_progress', 'done']);

      export const EpicSchema = z.object({
        id: z.string().uuid(),
        projectId: z.string().uuid(),
        name: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        status: EpicStatusEnum,
        color: z.string(), // hex color for visual identification
        startDate: z.string().datetime().optional(),
        targetDate: z.string().datetime().optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateEpicInputSchema = z.object({
        name: z.string().min(1).max(200),
        description: z.string().max(5000).optional(),
        color: z.string().optional(),
        startDate: z.string().datetime().optional(),
        targetDate: z.string().datetime().optional(),
      });

      export const UpdateEpicInputSchema = z.object({
        name: z.string().min(1).max(200).optional(),
        description: z.string().max(5000).optional(),
        status: EpicStatusEnum.optional(),
        color: z.string().optional(),
        startDate: z.string().datetime().nullable().optional(),
        targetDate: z.string().datetime().nullable().optional(),
      });

      export type Epic = z.infer<typeof EpicSchema>;
      export type EpicStatus = z.infer<typeof EpicStatusEnum>;
      export type CreateEpicInput = z.infer<typeof CreateEpicInputSchema>;
      export type UpdateEpicInput = z.infer<typeof UpdateEpicInputSchema>;
      ```
    </schema>

    <schema name="Comment">
      ```typescript
      // shared/src/schemas/comment.ts
      import { z } from 'zod';

      export const CommentSchema = z.object({
        id: z.string().uuid(),
        issueId: z.string().uuid(),
        projectId: z.string().uuid(),
        author: z.string().min(1),
        body: z.string().min(1).max(5000),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateCommentInputSchema = z.object({
        author: z.string().min(1),
        body: z.string().min(1).max(5000),
      });

      export type Comment = z.infer<typeof CommentSchema>;
      export type CreateCommentInput = z.infer<typeof CreateCommentInputSchema>;
      ```
    </schema>

    <schema name="Announcement">
      ```typescript
      // shared/src/schemas/announcement.ts
      import { z } from 'zod';

      export const AnnouncementTypeEnum = z.enum(['info', 'warning', 'success', 'critical']);

      export const AnnouncementSchema = z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200),
        body: z.string().min(1).max(5000),
        type: AnnouncementTypeEnum,
        author: z.string().min(1),
        pinned: z.boolean().default(false),
        expiresAt: z.string().datetime().optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export const CreateAnnouncementInputSchema = z.object({
        title: z.string().min(1).max(200),
        body: z.string().min(1).max(5000),
        type: AnnouncementTypeEnum,
        author: z.string().min(1),
        pinned: z.boolean().optional(),
        expiresAt: z.string().datetime().optional(),
      });

      export const UpdateAnnouncementInputSchema = z.object({
        title: z.string().min(1).max(200).optional(),
        body: z.string().min(1).max(5000).optional(),
        type: AnnouncementTypeEnum.optional(),
        pinned: z.boolean().optional(),
        expiresAt: z.string().datetime().nullable().optional(),
      });

      export type Announcement = z.infer<typeof AnnouncementSchema>;
      export type AnnouncementType = z.infer<typeof AnnouncementTypeEnum>;
      export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;
      export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;
      ```
    </schema>

    <schema name="User">
      ```typescript
      // shared/src/schemas/user.ts
      import { z } from 'zod';

      export const UserSchema = z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(100),
        email: z.string().email(),
        avatar: z.string().url().optional(),
        role: z.enum(['admin', 'member', 'viewer']),
      });

      export type User = z.infer<typeof UserSchema>;
      ```
      Note: For MVP, users are simulated (no auth). The seed data includes sample users
      and the UI uses a "current user" context that can be switched.
    </schema>

    <schema name="Dashboard">
      ```typescript
      // shared/src/schemas/board.ts
      import { z } from 'zod';

      export const DashboardStatsSchema = z.object({
        totalIssues: z.number(),
        openIssues: z.number(),
        completedIssues: z.number(),
        inProgressIssues: z.number(),
        totalStoryPoints: z.number(),
        completedStoryPoints: z.number(),
        issuesByType: z.record(z.string(), z.number()),
        issuesByPriority: z.record(z.string(), z.number()),
        recentActivity: z.array(z.object({
          id: z.string(),
          type: z.enum(['created', 'updated', 'completed', 'commented']),
          issueKey: z.string(),
          issueTitle: z.string(),
          actor: z.string(),
          timestamp: z.string().datetime(),
        })),
      });

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

      export type DashboardStats = z.infer<typeof DashboardStatsSchema>;
      export type BurndownDataPoint = z.infer<typeof BurndownDataPointSchema>;
      export type VelocityDataPoint = z.infer<typeof VelocityDataPointSchema>;
      ```
    </schema>
  </schema_definitions>

  <core_data_entities>
    <dynamodb_single_table_design>
      Table: ankit-aidlc-testing-canopy-table

      Access Patterns and Key Design:

      | Entity        | PK                    | SK                      | GSI1PK               | GSI1SK                  | GSI2PK                | GSI2SK                  |
      |---------------|----------------------|-------------------------|----------------------|-------------------------|----------------------|-------------------------|
      | Project       | PROJECT#&lt;id&gt;         | PROJECT#&lt;id&gt;            | PROJECTS             | PROJECT#&lt;name&gt;          | —                    | —                       |
      | Issue         | PROJECT#&lt;projId&gt;     | ISSUE#&lt;id&gt;              | SPRINT#&lt;sprintId&gt;    | ISSUE#&lt;order&gt;           | ASSIGNEE#&lt;user&gt;      | STATUS#&lt;status&gt;#&lt;id&gt;    |
      | Sprint        | PROJECT#&lt;projId&gt;     | SPRINT#&lt;id&gt;             | PROJECT#&lt;projId&gt;     | SPRINT#&lt;status&gt;#&lt;name&gt;  | —                    | —                       |
      | Epic          | PROJECT#&lt;projId&gt;     | EPIC#&lt;id&gt;               | PROJECT#&lt;projId&gt;     | EPIC#&lt;status&gt;#&lt;name&gt;    | —                    | —                       |
      | Comment       | ISSUE#&lt;issueId&gt;      | COMMENT#&lt;timestamp&gt;#&lt;id&gt;| PROJECT#&lt;projId&gt;     | COMMENT#&lt;timestamp&gt;     | —                    | —                       |
      | Announcement  | ANNOUNCEMENTS        | ANNOUNCEMENT#&lt;id&gt;       | ANN_TYPE#&lt;type&gt;      | ANNOUNCEMENT#&lt;date&gt;     | —                    | —                       |
      | User          | USERS                | USER#&lt;id&gt;               | USER_EMAIL#&lt;email&gt;   | USER#&lt;id&gt;               | —                    | —                       |

      Access Pattern → Query Mapping:
      1. Get project by ID: PK = PROJECT#&lt;id&gt;, SK = PROJECT#&lt;id&gt;
      2. List all projects: GSI1PK = PROJECTS (query GSI1)
      3. List issues for a project: PK = PROJECT#&lt;projId&gt;, SK begins_with "ISSUE#"
      4. Get issues in a sprint: GSI1PK = SPRINT#&lt;sprintId&gt;, SK begins_with "ISSUE#"
      5. Get issues by assignee: GSI2PK = ASSIGNEE#&lt;user&gt;
      6. Get issues by status for assignee: GSI2PK = ASSIGNEE#&lt;user&gt;, GSI2SK begins_with "STATUS#&lt;status&gt;"
      7. List sprints for project: PK = PROJECT#&lt;projId&gt;, SK begins_with "SPRINT#"
      8. List epics for project: PK = PROJECT#&lt;projId&gt;, SK begins_with "EPIC#"
      9. Get comments for issue: PK = ISSUE#&lt;issueId&gt;, SK begins_with "COMMENT#"
      10. List announcements: PK = ANNOUNCEMENTS, SK begins_with "ANNOUNCEMENT#"
      11. Get announcements by type: GSI1PK = ANN_TYPE#&lt;type&gt;
      12. Get user by email: GSI1PK = USER_EMAIL#&lt;email&gt;

      Notes:
      - All items store the full entity data as attributes (denormalized for single-query access)
      - Timestamps are ISO 8601 strings for lexicographic sorting
      - Issues without a sprint use GSI1PK = BACKLOG#&lt;projectId&gt; for backlog queries
      - Issue order field is zero-padded (e.g., "00001") for correct sort in GSI1SK
    </dynamodb_single_table_design>
  </core_data_entities>

  <pages_and_interfaces>
    <design_system>
      <color_palette name="Forest-Inspired">
        The design uses a distinctive forest-inspired palette that feels professional and organic:
        - Primary: Deep Forest Green (#1B4332) — main actions, active states
        - Primary Light: Sage (#52796F) — secondary actions, hover states
        - Primary Lighter: Mint Cream (#D8F3DC) — backgrounds, highlights
        - Accent: Amber (#D4A03C) — warnings, attention, sprint active indicators
        - Accent Warm: Terracotta (#C05746) — critical/high priority, destructive actions
        - Background: Off-white (#FAFDF7) — page background with slight warmth
        - Surface: White (#FFFFFF) — card backgrounds
        - Border: Soft Sage (#E8F0E8) — subtle borders
        - Text Primary: Deep Charcoal (#1A1A2E) — headings, body text
        - Text Secondary: Warm Gray (#5C6B73) — labels, secondary info
        - Text Muted: Light Gray (#9DB4AB) — placeholders, disabled states

        Status colors:
        - Todo: Slate (#64748B)
        - In Progress: Ocean Blue (#2563EB)
        - In Review: Purple (#7C3AED)
        - Done: Forest Green (#16A34A)
        - Cancelled: Gray (#9CA3AF)

        Priority colors:
        - Critical: Deep Red (#DC2626)
        - High: Orange (#EA580C)
        - Medium: Amber (#D97706)
        - Low: Teal (#0D9488)

        Typography:
        - Font: Inter (system fallback: -apple-system, BlinkMacSystemFont, sans-serif)
        - Headings: font-semibold, tracking tight
        - Body: font-normal, leading relaxed

        Spacing/Layout:
        - Sidebar width: 260px (collapsible to 64px on mobile)
        - Content max-width: 1280px
        - Card border-radius: 8px
        - Consistent 16px/24px padding rhythm
      </color_palette>
    </design_system>

    <page name="Dashboard" route="/" description="Project-level overview with key metrics and activity">
      <layout>Full-width content area with stats grid at top, charts in middle, activity feed on right</layout>
      <components>
        - StatsCards: 4 cards showing total issues, completed this sprint, story points velocity, team capacity
        - BurndownChart: Line chart showing ideal vs actual burndown for active sprint (Recharts)
        - VelocityChart: Bar chart showing committed vs completed story points per sprint
        - StatusPieChart: Donut chart showing issue distribution by status
        - RecentActivity: Feed showing latest issue creates, updates, completions with timestamps
        - Quick Actions: Buttons for "Create Issue", "Start Sprint", "View Board"
        - Pinned Announcements: Banner showing pinned announcements at the top
      </components>
      <interactions>
        - Click on stat card → navigates to filtered issue list
        - Click on activity item → navigates to issue detail
        - Charts have tooltips on hover
        - Auto-refreshes every 30 seconds via React Query
        - Project selector dropdown to switch between projects
      </interactions>
    </page>

    <page name="Project List" route="/projects" description="Overview of all projects">
      <layout>Grid of project cards with create button in header</layout>
      <components>
        - ProjectCard: Shows project name, key, description snippet, issue count, lead, last updated
        - CreateProjectModal: Form with name, key (auto-generated from name), description, lead selection
        - SearchBar: Filter projects by name
        - EmptyState: Shown when no projects exist, with CTA to create first project
      </components>
      <interactions>
        - Click card → navigate to project dashboard
        - Create button opens modal
        - Project key auto-generates from first letters of name (editable)
        - Hover card shows quick action buttons (board, backlog, settings)
      </interactions>
    </page>

    <page name="Board (Kanban)" route="/projects/:projectId/board" description="Drag-and-drop Kanban board for active sprint">
      <layout>Horizontal scrolling columns: Todo | In Progress | In Review | Done</layout>
      <components>
        - KanbanBoard: Container with DnD context from @dnd-kit
        - KanbanColumn: Droppable column with header showing count and WIP indicator
        - KanbanCard: Draggable card showing issue key, title, priority badge, assignee avatar, story points, type icon
        - SprintSelector: Dropdown to switch between active sprint and backlog view
        - QuickFilters: Filter by assignee, type, priority (pills at top)
        - CreateIssueInline: "+" button at bottom of each column for quick issue creation
        - ColumnHeader: Column name, issue count, total story points in column
      </components>
      <interactions>
        - Drag card between columns → PATCH /issues/:id/move (optimistic update)
        - Drag to reorder within column → updates order field
        - Click card → slide-out panel with issue details (not full page navigation)
        - Double-click card → navigate to full issue detail page
        - Column headers show count badge
        - Smooth drag animations with @dnd-kit
        - Visual drag overlay showing card preview while dragging
        - Column highlights when card is dragged over it
      </interactions>
    </page>

    <page name="Backlog" route="/projects/:projectId/backlog" description="Full issue list with sprint planning">
      <layout>Split view: Sprint sections at top (collapsible), Backlog section below</layout>
      <components>
        - SprintPanel: Collapsible section per sprint showing sprint name, goal, date range, story point total
        - BacklogSection: Unassigned issues not in any sprint
        - IssueRow: Compact row with type icon, key, title, priority, assignee, story points, epic badge
        - BulkActions: Multi-select issues to move to sprint, change assignee, etc.
        - IssueFilters: Full filter panel (type, status, priority, assignee, epic, labels)
        - SprintPlanning: Drag issues from backlog into sprint sections
        - CreateIssueButton: Opens full issue creation form
        - SortControls: Sort by priority, created date, updated date, story points
        - SearchInput: Full-text search across issue titles and descriptions
      </components>
      <interactions>
        - Drag issues from backlog → sprint section (assigns sprintId)
        - Click sprint header → expand/collapse
        - Right-click issue → context menu with actions
        - Shift+click for multi-select
        - Inline edit: click on assignee/points to edit in place
        - "Start Sprint" button on planning sprints (changes status to active)
        - "Complete Sprint" on active sprint → modal asking what to do with incomplete issues
        - Issue count and total points shown for each section
      </interactions>
    </page>

    <page name="Issue Detail" route="/projects/:projectId/issues/:issueId" description="Full issue view with all details">
      <layout>Two-column: main content (left 65%), sidebar details (right 35%)</layout>
      <components>
        - IssueHeader: Type icon, key (CAN-42), title (editable inline), status badge
        - DescriptionEditor: Markdown editor/viewer for issue description
        - CommentSection: Chronological comments with author, timestamp, markdown body
        - AddCommentForm: Text area with markdown support and submit button
        - DetailsSidebar: Status, Assignee, Reporter, Priority, Sprint, Epic, Story Points, Labels, Created/Updated dates
        - SubtaskList: Child issues if type=story (with progress indicator)
        - ActivityLog: Timeline of all changes to the issue
        - Breadcrumb: Project > Board/Backlog > Issue Key
      </components>
      <interactions>
        - Click title to edit inline
        - Status transitions via dropdown (with allowed transitions)
        - Assignee/Sprint/Epic via searchable dropdowns
        - Story points via inline number input
        - Add/remove labels via tag input
        - Submit comment with Cmd+Enter
        - Delete comment with confirmation
        - Navigate between issues with prev/next arrows
      </interactions>
    </page>

    <page name="Sprints" route="/projects/:projectId/sprints" description="Sprint management view">
      <layout>List of sprint cards in chronological order</layout>
      <components>
        - SprintCard: Shows sprint name, goal, status badge, date range, issue count, points total, progress bar
        - SprintDetailModal: Edit sprint name, goal, dates
        - CreateSprintForm: Name, goal, start/end dates
        - SprintActions: Start, Complete, Delete buttons based on status
        - SprintReport: Shows completed vs planned for completed sprints
        - CompletionModal: What to do with incomplete issues (move to backlog, next sprint)
      </components>
      <interactions>
        - Create new sprint → appears in "planning" status
        - Start sprint → sets status=active, validates dates are set
        - Complete sprint → modal shows incomplete issues, option to move to backlog or next sprint
        - Click sprint → expand to show issues in that sprint grouped by status
        - Only one sprint can be active at a time per project
      </interactions>
    </page>

    <page name="Epics" route="/projects/:projectId/epics" description="Epic tracking and progress">
      <layout>Card grid showing epics with progress bars</layout>
      <components>
        - EpicCard: Name, description, color stripe on left, progress bar (done/total issues), date range, issue count
        - EpicDetailPanel: Slide-out showing all issues in epic, grouped by status
        - CreateEpicForm: Name, description, color picker, start/target dates
        - EpicProgress: Visual progress showing percentage complete based on issue statuses
      </components>
      <interactions>
        - Click epic → slide-out panel with issues in that epic
        - Progress bar calculated from done issues / total issues in epic
        - Color picker for epic identification (used in issue badges)
        - Filter issues by epic from epic view
        - Create issue directly in an epic
      </interactions>
    </page>

    <page name="Announcements" route="/announcements" description="Team announcements board">
      <layout>Card list with pinned items at top, create button in header</layout>
      <components>
        - AnnouncementCard: Type badge (info/warning/success/critical), title, body (markdown rendered), author, date, pin icon
        - AnnouncementForm: Title, body (markdown), type selector, pin toggle, expiry date picker
        - FilterTabs: All | Info | Warning | Critical | Pinned
        - EmptyState: Shown when no announcements exist
      </components>
      <interactions>
        - Create/Edit/Delete announcements (full CRUD)
        - Pin/unpin announcements (pinned always at top)
        - Expired announcements auto-hidden (shown with "Show expired" toggle)
        - Type determines card border color and icon
        - Pinned announcements show as banner on dashboard page
        - Confirm before delete
      </interactions>
    </page>

    <page name="Settings" route="/projects/:projectId/settings" description="Project configuration">
      <layout>Form layout with sections</layout>
      <components>
        - ProjectInfoForm: Edit name, key, description, lead, avatar color
        - DangerZone: Delete project with double confirmation (type project name)
        - SeedDataButton: Button to re-seed the database with sample data (for demo purposes)
      </components>
      <interactions>
        - Save changes with immediate feedback (toast)
        - Delete requires typing project name to confirm
        - Seed button shows warning modal before proceeding
      </interactions>
    </page>
  </pages_and_interfaces>

  <seed_data>
    The seed endpoint (POST /api/seed) must populate the database with realistic sample data:

    Projects (2):
    1. "Canopy Platform" (key: CAN) — a meta project about building this app
       - lead: "Sarah Chen"
       - avatarColor: "#1B4332"
    2. "Mobile App" (key: MOB) — a companion mobile app project
       - lead: "Marcus Johnson"
       - avatarColor: "#2563EB"

    Users (4 simulated):
    1. Sarah Chen — Tech Lead (sarah.chen@canopy.dev)
    2. Marcus Johnson — Senior Developer (marcus.j@canopy.dev)
    3. Priya Patel — Full-Stack Developer (priya.p@canopy.dev)
    4. Alex Rivera — UX Designer (alex.r@canopy.dev)

    Sprints per project (3 each):
    1. "Sprint 1" — completed (started 4 weeks ago, ended 2 weeks ago)
    2. "Sprint 2" — active (started 2 weeks ago, ends in 1 week)
    3. "Sprint 3" — planning (starts next week)

    Epics per project (3 each):
    1. "User Authentication" — done, color: #16A34A
    2. "Board Management" — in_progress, color: #2563EB
    3. "Reporting Dashboard" — not_started, color: #7C3AED

    Issues (20+ per project, mix of):
    - Types: 40% stories, 30% tasks, 20% bugs, 10% subtasks
    - Statuses: Distributed based on sprint status
      - Completed sprint: 80% done, 10% cancelled, 10% moved to next sprint
      - Active sprint: 25% done, 30% in_progress, 20% in_review, 25% todo
      - Backlog: 100% todo
    - Priorities: 10% critical, 25% high, 40% medium, 25% low
    - Story points: 1, 2, 3, 5, 8, 13 (fibonacci)
    - Assignees: distributed across team members
    - Labels: ["frontend", "backend", "api", "ui", "performance", "security", "documentation"]

    Sample Issue Titles (for CAN project):
    - "Set up project scaffolding with Vite and React" (done, sprint 1)
    - "Design forest-inspired color palette" (done, sprint 1)
    - "Implement DynamoDB single-table design" (done, sprint 1)
    - "Build Kanban board with drag-and-drop" (in_progress, sprint 2)
    - "Add issue filtering and search" (in_review, sprint 2)
    - "Create burndown chart component" (todo, sprint 2)
    - "Implement sprint lifecycle management" (in_progress, sprint 2)
    - "Add comment system to issues" (todo, sprint 3)
    - "Build velocity chart for reporting" (todo, backlog)
    - "Mobile responsive layout" (todo, backlog)
    - "Fix: Board cards not updating after drag" (bug, high, sprint 2)
    - "Fix: Sprint dates not validating correctly" (bug, medium, sprint 2)

    Comments (3-5 per issue on ~30% of issues):
    - Realistic development discussion
    - Bug reproduction steps on bug issues
    - Code review feedback and questions
    - Decision documentation

    Announcements (3):
    1. "Sprint 2 Kickoff" — type: info, pinned: true
       body: "Sprint 2 has begun! Focus areas: Board management and real-time updates. Daily standups at 9:30 AM."
    2. "Deployment Window Friday" — type: warning, pinned: false
       body: "Production deployment scheduled for Friday 6-8 PM. Please merge all PRs by Thursday EOD."
    3. "v1.0 Released!" — type: success, pinned: false
       body: "Congratulations team! Canopy v1.0 is now live. Check out the release notes for details."
  </seed_data>

  <implementation_notes>
    <backend_routing>
      The Lambda handler uses a lightweight custom router (no Express dependency to keep bundle small):
      ```typescript
      // backend/src/router.ts
      type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
      type RouteHandler = (event: APIGatewayProxyEventV2, params: Record<string, string>) => Promise<APIGatewayProxyResultV2>;
      type Route = { method: HttpMethod; pattern: RegExp; handler: RouteHandler; paramNames: string[] };

      class Router {
        private routes: Route[] = [];

        add(method: HttpMethod, path: string, handler: RouteHandler) {
          // Convert /api/projects/:projectId/issues/:issueId
          // To regex: /^\/api\/projects\/([^/]+)\/issues\/([^/]+)$/
          const paramNames: string[] = [];
          const pattern = path.replace(/:([^/]+)/g, (_, name) => {
            paramNames.push(name);
            return '([^/]+)';
          });
          this.routes.push({ method, pattern: new RegExp(`^${pattern}$`), handler, paramNames });
        }

        async resolve(method: string, path: string, event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
          for (const route of this.routes) {
            if (route.method !== method) continue;
            const match = path.match(route.pattern);
            if (match) {
              const params: Record<string, string> = {};
              route.paramNames.forEach((name, i) => { params[name] = match[i + 1]; });
              return route.handler(event, params);
            }
          }
          return { statusCode: 404, body: JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Route not found' } }) };
        }
      }
      ```
    </backend_routing>

    <error_handling>
      All API errors follow a consistent format:
      ```typescript
      interface ApiError {
        error: {
          code: string;       // e.g., "VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR"
          message: string;    // Human-readable message
          details?: any;      // Zod validation issues or additional context
        }
      }
      ```
      HTTP status codes:
      - 400: Validation errors (Zod parse failures)
      - 404: Entity not found
      - 409: Conflict (e.g., duplicate project key)
      - 500: Internal server error

      Zod validation errors are formatted into human-readable messages with field paths.
    </error_handling>

    <optimistic_updates>
      The frontend uses React Query's optimistic update pattern for responsive UX:
      - Board drag-and-drop: immediately moves card to new column, rolls back on API error
      - Status changes: immediately updates badge color/text, rolls back on error
      - Issue creates: adds item with temp ID to list, replaces with real ID on success
      - Deletes: immediately removes from list, rolls back if API returns error
      - Comments: adds comment immediately, removes if POST fails

      Pattern:
      ```typescript
      useMutation({
        mutationFn: updateIssue,
        onMutate: async (newData) => {
          await queryClient.cancelQueries({ queryKey: ['issues'] });
          const previous = queryClient.getQueryData(['issues']);
          queryClient.setQueryData(['issues'], (old) => /* optimistic update */);
          return { previous };
        },
        onError: (err, vars, context) => {
          queryClient.setQueryData(['issues'], context.previous);
          toast.error('Failed to update issue');
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['issues'] }),
      });
      ```
    </optimistic_updates>

    <responsive_design>
      Mobile breakpoints:
      - &lt; 640px (sm): Single column, bottom tab navigation, stacked cards
      - 640px-768px (md): Sidebar collapses to icons, 2-column board
      - 768px-1024px (lg): Sidebar collapsible with toggle, board scrolls horizontally
      - &gt; 1024px (xl): Full layout with expanded sidebar, all columns visible

      Mobile-specific behaviors:
      - Sidebar becomes bottom tab bar on mobile
      - Board shows one column at a time with swipe navigation
      - Issue detail becomes full-screen modal
      - Filters collapse into a slide-out drawer
      - Touch-friendly drag handles on cards
    </responsive_design>

    <performance>
      - React Query staleTime: 30s for lists, 60s for detail views
      - React Query gcTime: 5 minutes
      - Debounced search input (300ms)
      - Lazy-loaded route components with React.lazy + Suspense
      - Lambda cold start mitigation: keep handler lean, use SDK v3 tree-shaking, minimal dependencies
      - DynamoDB: Use ProjectionExpression to fetch only needed attributes for list views
      - Frontend bundle splitting: separate vendor chunk for large dependencies (recharts, dnd-kit)
    </performance>

    <important_conventions>
      - All DynamoDB operations use AWS SDK v3 (@aws-sdk/client-dynamodb + @aws-sdk/lib-dynamodb)
      - Backend validates ALL inputs with Zod schemas from shared/ before processing
      - Frontend API client wraps fetch with consistent error handling, types, and VITE_API_URL prefix
      - All dates stored as ISO 8601 strings (UTC)
      - Issue keys auto-increment per project (CAN-1, CAN-2, ...) using atomic counter on project item
      - No authentication for MVP (all operations are unauthenticated)
      - CORS configured to allow the CloudFront origin (and localhost:5173 for dev)
      - All AWS resource names prefixed with `ankit-aidlc-testing-`
      - Backend returns proper HTTP status codes and consistent error format
      - Frontend shows toast notifications for all mutating operations (success and error)
      - All list endpoints support pagination via `limit` and `lastEvaluatedKey` params (cursor-based)
    </important_conventions>
  </implementation_notes>

  <build_instructions>
    <step order="1" name="Initialize Monorepo">
      Create root package.json with npm workspaces: ["shared", "frontend", "backend", "infra"]
      Create tsconfig.base.json with strict mode, ES2022 target, module resolution bundler
      Initialize each workspace package.json with correct dependencies:
      - shared: zod, typescript
      - frontend: react, react-dom, vite, @vitejs/plugin-react, tailwindcss, @tailwindcss/vite,
        react-router-dom, @tanstack/react-query, @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities,
        recharts, date-fns, lucide-react, uuid, react-markdown, minisearch
      - backend: @aws-sdk/client-dynamodb, @aws-sdk/lib-dynamodb, uuid, zod
      - infra: aws-cdk-lib, constructs, typescript
    </step>

    <step order="2" name="Build Shared Package">
      Create all Zod schemas in shared/src/schemas/ (project, issue, sprint, epic, comment, announcement, user, board)
      Create shared/src/types/index.ts exporting inferred types from all schemas
      Create shared/src/index.ts barrel export re-exporting everything
      Configure tsconfig.json to output both CJS and ESM (or just ESM with proper module resolution)
      Ensure shared package can be imported by both frontend and backend workspaces
    </step>

    <step order="3" name="Build Backend">
      Create DynamoDB client singleton using @aws-sdk/lib-dynamodb DynamoDBDocumentClient
      Implement custom router with path parameter extraction and method matching
      Implement CRUD handlers for each entity:
        - Projects: list, create, get, update, delete
        - Issues: list (with filtering), create (with auto-key), get (with comments), update, delete, move
        - Sprints: list, create, update, start, complete, delete
        - Epics: list, create, update, delete
        - Comments: create, delete
        - Announcements: list, create, update, delete
        - Dashboard: stats aggregation, burndown data, velocity data
      Implement seed data handler that populates all sample data
      Wire all routes in index.ts Lambda handler with CORS headers
      Validate all inputs using Zod schemas imported from shared/
      Implement proper error responses with consistent format
    </step>

    <step order="4" name="Build CDK Infrastructure">
      Create CDK app in infra/bin/app.ts
      Create main stack in infra/lib/canopy-stack.ts:
        - DynamoDB table with PK/SK and two GSIs (GSI1, GSI2), PAY_PER_REQUEST billing
        - Lambda function using NodejsFunction with esbuild bundling, pointing to backend/src/index.ts
        - API Gateway HTTP API with CORS and catch-all route to Lambda
        - S3 bucket for frontend with website hosting configuration
        - CloudFront distribution with S3 origin, OAC, and custom error page (SPA routing)
        - All CfnOutputs: ApiUrl, FrontendBucketName, CloudFrontDistributionId, CloudFrontUrl, TableName
      All resource names prefixed with `ankit-aidlc-testing-`
      Stack name: AnkitAidlcTestingCanopyStack
    </step>

    <step order="5" name="Build Frontend - Foundation">
      Initialize Vite + React + TypeScript project in frontend/
      Configure Tailwind CSS v4 with the forest-inspired color palette as custom theme
      Set up React Router with all page routes and nested layouts
      Create AppShell layout component with collapsible Sidebar and Header
      Create reusable UI components: Button, Input, Select, Modal, Badge, Avatar, Card, Dropdown, Toast, Spinner, EmptyState, Tooltip
      Set up TanStack React Query provider with QueryClient configuration
      Create API client utility with fetch wrapper, error handling, and type safety
      Configure VITE_API_URL environment variable usage
    </step>

    <step order="6" name="Build Frontend - Core Pages">
      Implement DashboardPage with stats cards, charts (Recharts), and activity feed
      Implement ProjectListPage with project cards and create modal
      Implement BoardPage with @dnd-kit Kanban board (columns, draggable cards, drop zones)
      Implement BacklogPage with sprint panels, issue rows, drag-to-sprint
      Implement IssueDetailPage with two-column layout, inline editing, comments
      Implement SprintPage with sprint lifecycle management (create, start, complete)
      Implement EpicsPage with epic cards, progress bars, and detail panel
      Implement AnnouncementsPage with full CRUD, type filtering, pin management
      Implement SettingsPage with project configuration and seed button
    </step>

    <step order="7" name="Build Frontend - Polish">
      Add loading states with skeleton screens for all pages
      Add error boundaries with friendly error messages and retry buttons
      Add empty states with illustrations and CTAs for all list views
      Implement responsive design: mobile sidebar → bottom tabs, board → single column swipe
      Add toast notification system for all mutations (success/error feedback)
      Implement optimistic updates for board drag-and-drop and status changes
      Add transitions and animations for smooth UX (card drag, modal open/close, page transitions)
      Ensure all interactive elements have proper focus states and ARIA attributes
    </step>

    <step order="8" name="Integration and Testing">
      Verify all API endpoints work correctly with seed data
      Test Kanban drag-and-drop correctly updates backend and reflects in UI
      Test sprint lifecycle: create → assign issues → start → complete → move incomplete
      Test issue CRUD with all fields, including filtering and search
      Test announcement CRUD with pin/unpin and type filtering
      Test dashboard charts render correctly with real data
      Verify responsive layout on mobile viewport (375px, 768px, 1024px)
      Test error scenarios: network failure, 404, validation errors
      Verify all CfnOutputs are correctly generated in CDK stack
      Ensure frontend builds without errors (npm run build in frontend/)
      Ensure backend TypeScript compiles without errors
      Ensure CDK synth succeeds without errors
    </step>
  </build_instructions>
</project_specification>

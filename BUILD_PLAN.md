<project_specification>
  <project_name>AWS News Hub - AWS Service Releases & Announcements Website</project_name>

  <overview>
    Build a fully functional website that displays the latest AWS service releases and news announcements.
    The application uses a serverless full-stack architecture with a React frontend, AWS Lambda backend,
    API Gateway, and DynamoDB for persistence.

    AWS News Hub helps developers and cloud professionals stay up-to-date with the latest AWS service
    announcements, feature releases, and updates. Users can browse a feed of announcements, filter by
    AWS service category, search for specific topics, and manage announcements through a full CRUD interface.
    The interface should be clean, professional, and responsive — optimized for both desktop and mobile viewing.

    ARCHITECTURE: This is a full-stack serverless application structured as a monorepo:
    - Shared: Zod schemas defining the API contract (source of truth for types)
    - Frontend: React SPA deployed to S3 + CloudFront
    - Backend: Lambda handlers behind API Gateway (HTTP API)
    - Database: DynamoDB with single-table design
    - Infrastructure: AWS CDK stack defining all resources
    The frontend uses VITE_API_URL env var to reach the API. Both frontend and backend
    import types from the shared/ package — contract mismatch is impossible at compile time.

    KEY FEATURES:
    - Homepage showing latest AWS announcements in a chronological feed
    - Each announcement displays: title, date, service category, and summary
    - Filter announcements by AWS service (Lambda, S3, DynamoDB, Bedrock, EC2, ECS, etc.)
    - Full-text search functionality across titles and summaries
    - Responsive design that works seamlessly on mobile devices
    - Full CRUD API to create, read, update, and delete announcements
    - Seeded with 10-15 sample AWS announcements covering recent services and features
  </overview>

  <technology_stack>
    <frontend_application>
      <framework>React 18 for component-based UI development</framework>
      <language>TypeScript 5 for type-safe development</language>
      <build_tool>Vite 6 for fast dev server and optimized static builds</build_tool>
      <styling>Tailwind CSS v4 for utility-first styling (using @tailwindcss/vite plugin)</styling>
      <routing>React Router v7 for client-side navigation</routing>
      <state_management>React Query (TanStack Query v5) for server state caching, refetching, and optimistic updates</state_management>
    </frontend_application>
    <data_layer>
      <database>Amazon DynamoDB for structured data persistence (single-table design)</database>
      <api>AWS Lambda + API Gateway (HTTP API) for RESTful backend</api>
      <api_client>fetch-based API client with React Query for caching and optimistic updates</api_client>
      <search>Server-side DynamoDB query + GSI for filtering by service; client-side filtering for instant search UX</search>
      <shared_contract>Zod schemas in shared/ package — single source of truth for request/response types</shared_contract>
      <note>Frontend uses VITE_API_URL env var to reach the API. Both frontend and backend import types from shared/.</note>
    </data_layer>
    <build_output>
      <frontend_build>npm run build in frontend/ produces dist/ folder</frontend_build>
      <backend_build>esbuild bundles Lambda handlers (handled by CDK NodejsFunction)</backend_build>
      <infrastructure_build>cdk synth produces CloudFormation template</infrastructure_build>
    </build_output>
    <libraries>
      <dates>date-fns v4 for date handling and formatting</dates>
      <icons>Lucide React for consistent iconography</icons>
      <ids>uuid v11 for generating unique identifiers</ids>
      <validation>Zod v3 for runtime validation in both frontend and backend</validation>
    </libraries>
  </technology_stack>

  <infrastructure>
    <cdk_stack>
      The application infrastructure is defined as an AWS CDK TypeScript stack.
      The agent MUST write this stack as part of the generated code.
      All resource names/IDs MUST be prefixed with "ankit-aidlc-testing-".

      Required resources:
      - DynamoDB table: "ankit-aidlc-testing-aws-news-table"
        * Single-table design
        * Partition key: PK (String)
        * Sort key: SK (String)
        * GSI1: GSI1PK (String) / GSI1SK (String) — for service-based queries
        * GSI2: GSI2PK (String) / GSI2SK (String) — for date-based sorting
        * Billing mode: PAY_PER_REQUEST
      - Lambda function: "ankit-aidlc-testing-aws-news-api"
        * Runtime: Node.js 20
        * Bundled with esbuild via NodejsFunction
        * Memory: 256 MB
        * Timeout: 30 seconds
        * Environment variables: TABLE_NAME
      - API Gateway HTTP API: "ankit-aidlc-testing-aws-news-http-api"
        * CORS configured for frontend origin (allow all origins in dev)
        * Routes mapped to Lambda function
      - S3 bucket: "ankit-aidlc-testing-aws-news-frontend"
        * Static website hosting enabled
        * Public access blocked (served via CloudFront)
      - CloudFront distribution: "ankit-aidlc-testing-aws-news-cdn"
        * Origin: S3 bucket
        * Default root object: index.html
        * Error pages: 403/404 → /index.html (SPA routing)
        * Cache policy: CachingOptimized for static assets

      CfnOutput values (MUST be included):
      - ApiUrl: The HTTP API endpoint URL
      - FrontendBucketName: S3 bucket name for frontend deployment
      - CloudFrontUrl: CloudFront distribution domain name
      - TableName: DynamoDB table name
    </cdk_stack>

    <seed_script>
      A seed script (backend/seed.ts) that populates DynamoDB with 10-15 sample AWS announcements.
      Run via: npx ts-node backend/seed.ts
      The script should use the AWS SDK v3 DynamoDB client to batch-write items.
    </seed_script>
  </infrastructure>

  <directory_structure>
    aws-news-hub/
    ├── package.json                  # Root workspace configuration
    ├── tsconfig.base.json            # Shared TypeScript config
    ├── shared/
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts              # Re-exports all schemas and types
    │       ├── schemas.ts            # Zod schemas (API contract)
    │       └── types.ts              # Inferred TypeScript types from Zod
    ├── frontend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vite.config.ts
    │   ├── index.html
    │   ├── public/
    │   └── src/
    │       ├── main.tsx              # App entry point
    │       ├── App.tsx               # Root component with router
    │       ├── api/
    │       │   └── client.ts         # API client (fetch + React Query)
    │       ├── components/
    │       │   ├── Layout.tsx        # App shell (header, nav, footer)
    │       │   ├── AnnouncementCard.tsx  # Single announcement display
    │       │   ├── AnnouncementList.tsx  # Feed of announcements
    │       │   ├── FilterBar.tsx     # Service category filter
    │       │   ├── SearchBar.tsx     # Search input component
    │       │   ├── ServiceBadge.tsx  # Colored badge for AWS service
    │       │   └── LoadingSpinner.tsx
    │       ├── pages/
    │       │   ├── HomePage.tsx      # Main feed page
    │       │   ├── AnnouncementDetailPage.tsx  # Single announcement view
    │       │   ├── CreateAnnouncementPage.tsx  # Create form
    │       │   └── EditAnnouncementPage.tsx    # Edit form
    │       ├── hooks/
    │       │   ├── useAnnouncements.ts   # React Query hooks for announcements
    │       │   └── useDebounce.ts        # Debounce hook for search
    │       └── utils/
    │           ├── constants.ts      # AWS service list, colors
    │           └── formatDate.ts     # Date formatting helpers
    ├── backend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── seed.ts                   # Database seed script
    │   └── src/
    │       ├── index.ts              # Lambda handler entry point (router)
    │       ├── handlers/
    │       │   ├── listAnnouncements.ts    # GET /announcements
    │       │   ├── getAnnouncement.ts      # GET /announcements/:id
    │       │   ├── createAnnouncement.ts   # POST /announcements
    │       │   ├── updateAnnouncement.ts   # PUT /announcements/:id
    │       │   └── deleteAnnouncement.ts   # DELETE /announcements/:id
    │       ├── db/
    │       │   └── client.ts         # DynamoDB document client setup
    │       └── utils/
    │           └── response.ts       # HTTP response helpers (CORS headers, status codes)
    └── infra/
        ├── package.json
        ├── tsconfig.json
        ├── cdk.json
        ├── bin/
        │   └── app.ts               # CDK app entry point
        └── lib/
            └── aws-news-stack.ts     # Main CDK stack
  </directory_structure>

  <api_contract>
    <base_url>{{VITE_API_URL}}</base_url>
    <note>All endpoints return JSON. Errors follow { error: string } format.</note>

    <endpoints>
      <endpoint>
        <method>GET</method>
        <path>/announcements</path>
        <description>List all announcements with optional filtering and search</description>
        <query_parameters>
          - service (optional): Filter by AWS service category (e.g., "Lambda", "S3")
          - search (optional): Search term to match against title and summary
          - limit (optional): Number of results to return (default: 20, max: 100)
          - nextToken (optional): Pagination token for next page
        </query_parameters>
        <response_status>200</response_status>
        <response_body>
          {
            "announcements": Announcement[],
            "nextToken": string | null
          }
        </response_body>
      </endpoint>

      <endpoint>
        <method>GET</method>
        <path>/announcements/:id</path>
        <description>Get a single announcement by ID</description>
        <response_status>200</response_status>
        <response_body>Announcement</response_body>
        <error_responses>
          - 404: { "error": "Announcement not found" }
        </error_responses>
      </endpoint>

      <endpoint>
        <method>POST</method>
        <path>/announcements</path>
        <description>Create a new announcement</description>
        <request_body>CreateAnnouncementInput</request_body>
        <response_status>201</response_status>
        <response_body>Announcement</response_body>
        <error_responses>
          - 400: { "error": "Validation error message" }
        </error_responses>
      </endpoint>

      <endpoint>
        <method>PUT</method>
        <path>/announcements/:id</path>
        <description>Update an existing announcement</description>
        <request_body>UpdateAnnouncementInput</request_body>
        <response_status>200</response_status>
        <response_body>Announcement</response_body>
        <error_responses>
          - 400: { "error": "Validation error message" }
          - 404: { "error": "Announcement not found" }
        </error_responses>
      </endpoint>

      <endpoint>
        <method>DELETE</method>
        <path>/announcements/:id</path>
        <description>Delete an announcement</description>
        <response_status>204</response_status>
        <response_body>Empty</response_body>
        <error_responses>
          - 404: { "error": "Announcement not found" }
        </error_responses>
      </endpoint>
    </endpoints>
  </api_contract>

  <schema_definitions>
    <description>
      All schemas live in shared/src/schemas.ts and serve as the single source of truth
      for both frontend and backend. Types are inferred from Zod schemas using z.infer.
    </description>

    <schema name="Announcement">
      ```typescript
      import { z } from 'zod';

      // AWS service categories
      export const AwsServiceEnum = z.enum([
        'Lambda',
        'S3',
        'DynamoDB',
        'Bedrock',
        'EC2',
        'ECS',
        'CloudFront',
        'API Gateway',
        'Step Functions',
        'EventBridge',
        'SQS',
        'SNS',
        'RDS',
        'Aurora',
        'EKS',
        'IAM',
        'CloudWatch',
        'CodePipeline',
        'SageMaker',
        'Other'
      ]);

      // Full announcement schema (as stored in DB and returned by API)
      export const AnnouncementSchema = z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(200),
        summary: z.string().min(1).max(2000),
        service: AwsServiceEnum,
        date: z.string().datetime(), // ISO 8601 date string
        link: z.string().url().optional(),
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      // Input schema for creating an announcement
      export const CreateAnnouncementInputSchema = z.object({
        title: z.string().min(1).max(200),
        summary: z.string().min(1).max(2000),
        service: AwsServiceEnum,
        date: z.string().datetime(),
        link: z.string().url().optional(),
      });

      // Input schema for updating an announcement (all fields optional)
      export const UpdateAnnouncementInputSchema = z.object({
        title: z.string().min(1).max(200).optional(),
        summary: z.string().min(1).max(2000).optional(),
        service: AwsServiceEnum.optional(),
        date: z.string().datetime().optional(),
        link: z.string().url().optional(),
      });

      // List response schema
      export const ListAnnouncementsResponseSchema = z.object({
        announcements: z.array(AnnouncementSchema),
        nextToken: z.string().nullable(),
      });

      // Query parameters schema
      export const ListAnnouncementsQuerySchema = z.object({
        service: AwsServiceEnum.optional(),
        search: z.string().optional(),
        limit: z.coerce.number().min(1).max(100).default(20),
        nextToken: z.string().optional(),
      });

      // Error response schema
      export const ErrorResponseSchema = z.object({
        error: z.string(),
      });
      ```
    </schema>

    <types>
      ```typescript
      // shared/src/types.ts
      import { z } from 'zod';
      import {
        AnnouncementSchema,
        CreateAnnouncementInputSchema,
        UpdateAnnouncementInputSchema,
        ListAnnouncementsResponseSchema,
        ListAnnouncementsQuerySchema,
        AwsServiceEnum,
      } from './schemas';

      export type Announcement = z.infer<typeof AnnouncementSchema>;
      export type CreateAnnouncementInput = z.infer<typeof CreateAnnouncementInputSchema>;
      export type UpdateAnnouncementInput = z.infer<typeof UpdateAnnouncementInputSchema>;
      export type ListAnnouncementsResponse = z.infer<typeof ListAnnouncementsResponseSchema>;
      export type ListAnnouncementsQuery = z.infer<typeof ListAnnouncementsQuerySchema>;
      export type AwsService = z.infer<typeof AwsServiceEnum>;
      ```
    </types>
  </schema_definitions>

  <core_data_entities>
    <dynamodb_design>
      <description>
        Single-table design for DynamoDB. All items share the same table with
        differentiated access patterns via partition key prefixes and GSIs.
        Table name: ankit-aidlc-testing-aws-news-table
      </description>

      <table_keys>
        - PK (Partition Key): String — "ANNOUNCEMENT#{{id}}"
        - SK (Sort Key): String — "ANNOUNCEMENT#{{id}}"
      </table_keys>

      <gsi1>
        <name>GSI1</name>
        <description>Query announcements by service category, sorted by date</description>
        <partition_key>GSI1PK: "SERVICE#{{service}}"</partition_key>
        <sort_key>GSI1SK: "DATE#{{iso_date}}#{{id}}"</sort_key>
        <projection>ALL</projection>
      </gsi1>

      <gsi2>
        <name>GSI2</name>
        <description>Query all announcements sorted by date (for the main feed)</description>
        <partition_key>GSI2PK: "ALL_ANNOUNCEMENTS"</partition_key>
        <sort_key>GSI2SK: "DATE#{{iso_date}}#{{id}}"</sort_key>
        <projection>ALL</projection>
      </gsi2>

      <item_schema>
        ```
        {
          PK: "ANNOUNCEMENT#{{uuid}}",
          SK: "ANNOUNCEMENT#{{uuid}}",
          GSI1PK: "SERVICE#{{service}}",
          GSI1SK: "DATE#{{iso_date}}#{{uuid}}",
          GSI2PK: "ALL_ANNOUNCEMENTS",
          GSI2SK: "DATE#{{iso_date}}#{{uuid}}",
          id: "{{uuid}}",
          title: "{{string}}",
          summary: "{{string}}",
          service: "{{AwsService}}",
          date: "{{ISO 8601 datetime}}",
          link: "{{url or undefined}}",
          createdAt: "{{ISO 8601 datetime}}",
          updatedAt: "{{ISO 8601 datetime}}"
        }
        ```
      </item_schema>

      <access_patterns>
        <pattern name="Get all announcements (feed)">
          Query GSI2 where GSI2PK = "ALL_ANNOUNCEMENTS", ScanIndexForward = false (newest first)
        </pattern>
        <pattern name="Get announcements by service">
          Query GSI1 where GSI1PK = "SERVICE#{{service}}", ScanIndexForward = false
        </pattern>
        <pattern name="Get single announcement">
          GetItem where PK = "ANNOUNCEMENT#{{id}}" and SK = "ANNOUNCEMENT#{{id}}"
        </pattern>
        <pattern name="Search announcements">
          Query GSI2 for all items, then filter in Lambda by title/summary contains search term.
          (For production, consider OpenSearch; for this app, in-memory filter is acceptable.)
        </pattern>
      </access_patterns>
    </dynamodb_design>
  </core_data_entities>

  <pages_and_interfaces>
    <page name="HomePage" path="/">
      <description>
        Main landing page showing the announcement feed. This is the primary interface
        users interact with. Displays a chronological feed of AWS announcements with
        filtering and search capabilities.
      </description>
      <layout>
        - Header: App logo/title "AWS News Hub", navigation links (Home, Add Announcement)
        - Filter bar: Horizontal row of service filter chips/buttons (All, Lambda, S3, DynamoDB, Bedrock, etc.)
        - Search bar: Full-width search input with magnifying glass icon and debounced filtering
        - Announcement feed: Vertical list of AnnouncementCard components, sorted newest first
        - Load more: "Load More" button at bottom for pagination
        - Empty state: Message when no announcements match filters/search
        - Footer: Simple footer with attribution
      </layout>
      <components>
        - FilterBar: Horizontally scrollable row of service category buttons. "All" selected by default. Clicking a service filters the feed. Active filter is visually highlighted with AWS orange.
        - SearchBar: Text input with search icon. Debounced (300ms) to avoid excessive API calls. Clears with X button.
        - AnnouncementCard: Card component displaying title, date (formatted as "Jun 15, 2025"), service badge (colored chip), and summary (truncated to 3 lines). Clicking navigates to detail page.
        - LoadingSpinner: Centered spinner shown while data is loading.
      </components>
      <behavior>
        - On mount: Fetch latest announcements (GET /announcements)
        - On filter change: Refetch with service parameter (GET /announcements?service=Lambda)
        - On search input: Debounce 300ms then refetch with search parameter (GET /announcements?search=term)
        - Combine filter + search (both can be active simultaneously)
        - Show loading spinner during fetch
        - Show empty state with "No announcements found" if results are empty
      </behavior>
    </page>

    <page name="AnnouncementDetailPage" path="/announcements/:id">
      <description>
        Full view of a single announcement with all details and action buttons.
      </description>
      <layout>
        - Back button: "← Back to feed" link
        - Title: Large heading with announcement title
        - Meta row: Date, service badge, optional external link button
        - Summary: Full announcement summary text (no truncation)
        - Action buttons: "Edit" and "Delete" buttons
      </layout>
      <behavior>
        - On mount: Fetch announcement by ID (GET /announcements/:id)
        - Edit button: Navigate to /announcements/:id/edit
        - Delete button: Show confirmation dialog, then DELETE /announcements/:id, navigate to home
        - 404 handling: Show "Announcement not found" if API returns 404
      </behavior>
    </page>

    <page name="CreateAnnouncementPage" path="/announcements/new">
      <description>
        Form to create a new AWS announcement.
      </description>
      <layout>
        - Page title: "Add New Announcement"
        - Form fields:
          * Title (text input, required)
          * Service (dropdown select, required, populated from AwsServiceEnum)
          * Date (date input, required, defaults to today)
          * Summary (textarea, required, max 2000 chars with character counter)
          * Link (URL input, optional, with placeholder "https://aws.amazon.com/...")
        - Buttons: "Create Announcement" (submit), "Cancel" (navigate back)
      </layout>
      <behavior>
        - Client-side validation using Zod schema (CreateAnnouncementInputSchema)
        - On submit: POST /announcements with form data
        - On success: Navigate to home page with success toast/notification
        - On error: Display validation errors inline below fields
        - Cancel: Navigate back to home page
      </behavior>
    </page>

    <page name="EditAnnouncementPage" path="/announcements/:id/edit">
      <description>
        Form to edit an existing announcement, pre-populated with current values.
      </description>
      <layout>
        - Page title: "Edit Announcement"
        - Same form fields as Create page, pre-populated with existing values
        - Buttons: "Save Changes" (submit), "Cancel" (navigate back to detail)
      </layout>
      <behavior>
        - On mount: Fetch announcement by ID to populate form
        - Client-side validation using Zod schema (UpdateAnnouncementInputSchema)
        - On submit: PUT /announcements/:id with changed fields
        - On success: Navigate to announcement detail page
        - On error: Display validation errors inline
        - Cancel: Navigate back to detail page
      </behavior>
    </page>
  </pages_and_interfaces>

  <ui_design>
    <color_palette>
      <description>
        Professional, clean design with AWS-inspired color accents.
        Dark navy header with white text. Light gray body background.
        Cards with white backgrounds and subtle shadows.
      </description>
      <colors>
        - Primary: #232F3E (AWS dark navy — header, primary buttons)
        - Secondary: #FF9900 (AWS orange — accents, hover states, active filters)
        - Background: #F8F9FA (Light gray page background)
        - Card: #FFFFFF (White card backgrounds)
        - Text Primary: #1A202C (Near-black for headings)
        - Text Secondary: #4A5568 (Gray for body text, summaries)
        - Border: #E2E8F0 (Light gray borders)
        - Success: #38A169 (Green for success toasts)
        - Error: #E53E3E (Red for error states, delete buttons)
      </colors>
    </color_palette>

    <service_badge_colors>
      <description>Each AWS service gets a distinct badge color for visual scanning</description>
      <badges>
        - Lambda: bg-amber-100 text-amber-800
        - S3: bg-green-100 text-green-800
        - DynamoDB: bg-blue-100 text-blue-800
        - Bedrock: bg-purple-100 text-purple-800
        - EC2: bg-orange-100 text-orange-800
        - ECS: bg-teal-100 text-teal-800
        - CloudFront: bg-indigo-100 text-indigo-800
        - API Gateway: bg-pink-100 text-pink-800
        - Step Functions: bg-rose-100 text-rose-800
        - EventBridge: bg-cyan-100 text-cyan-800
        - SQS: bg-yellow-100 text-yellow-800
        - SNS: bg-red-100 text-red-800
        - RDS: bg-sky-100 text-sky-800
        - Aurora: bg-violet-100 text-violet-800
        - EKS: bg-lime-100 text-lime-800
        - IAM: bg-slate-100 text-slate-800
        - CloudWatch: bg-emerald-100 text-emerald-800
        - CodePipeline: bg-fuchsia-100 text-fuchsia-800
        - SageMaker: bg-stone-100 text-stone-800
        - Other: bg-gray-100 text-gray-800
      </badges>
    </service_badge_colors>

    <responsive_design>
      <mobile>
        - Single column layout
        - Filter bar horizontally scrollable with overflow-x-auto
        - Cards stack vertically with full width
        - Search bar full width
        - Navigation collapses to hamburger menu
        - Touch-friendly button sizes (min 44px tap targets)
        - Padding: px-4
      </mobile>
      <tablet>
        - Single column card layout (feed style)
        - Filter bar wraps to multiple rows if needed
        - Padding: px-6
      </tablet>
      <desktop>
        - Centered content container (max-width: 1024px, mx-auto)
        - Cards in single column for readability (feed style)
        - Comfortable spacing and padding
        - Padding: px-8
      </desktop>
    </responsive_design>
  </ui_design>

  <seed_data>
    <description>
      The seed script must populate the database with 15 realistic AWS announcements.
      These should represent real-world AWS releases from 2024-2025 timeframe.
    </description>
    <announcements>
      <announcement>
        <title>Amazon Bedrock now supports Claude 3.5 Sonnet model</title>
        <service>Bedrock</service>
        <date>2025-06-20T00:00:00.000Z</date>
        <summary>Amazon Bedrock now provides access to Anthropic's Claude 3.5 Sonnet model, offering improved performance on coding, analysis, and creative tasks. The model is available in US East (N. Virginia), US West (Oregon), and Europe (Frankfurt) regions.</summary>
      </announcement>
      <announcement>
        <title>AWS Lambda adds support for Python 3.13 runtime</title>
        <service>Lambda</service>
        <date>2025-06-15T00:00:00.000Z</date>
        <summary>AWS Lambda now supports Python 3.13 as a managed runtime. Customers can now build and deploy Lambda functions using the latest Python version, benefiting from improved performance, new syntax features, and enhanced standard library capabilities.</summary>
      </announcement>
      <announcement>
        <title>Amazon S3 introduces Express One Zone storage class</title>
        <service>S3</service>
        <date>2025-06-10T00:00:00.000Z</date>
        <summary>Amazon S3 Express One Zone is a high-performance, single-Availability Zone storage class purpose-built to deliver consistent single-digit millisecond data access for frequently accessed data and latency-sensitive applications.</summary>
      </announcement>
      <announcement>
        <title>Amazon DynamoDB zero-ETL integration with Amazon Redshift</title>
        <service>DynamoDB</service>
        <date>2025-06-05T00:00:00.000Z</date>
        <summary>Amazon DynamoDB now supports zero-ETL integration with Amazon Redshift, enabling you to run analytics and machine learning on your DynamoDB data without building or maintaining complex data pipelines.</summary>
      </announcement>
      <announcement>
        <title>AWS Step Functions adds JSONATA support for data transformation</title>
        <service>Step Functions</service>
        <date>2025-05-28T00:00:00.000Z</date>
        <summary>AWS Step Functions now supports JSONATA expressions for data transformation within state machines. This enables more powerful inline data manipulation without requiring additional Lambda functions for simple transformations.</summary>
      </announcement>
      <announcement>
        <title>Amazon EC2 introduces M7i-flex instances</title>
        <service>EC2</service>
        <date>2025-05-20T00:00:00.000Z</date>
        <summary>Amazon EC2 M7i-flex instances are powered by custom 4th Generation Intel Xeon Scalable processors and offer a balance of compute, memory, and networking resources for a broad set of general-purpose workloads.</summary>
      </announcement>
      <announcement>
        <title>Amazon ECS now supports managed instance draining</title>
        <service>ECS</service>
        <date>2025-05-15T00:00:00.000Z</date>
        <summary>Amazon ECS now supports managed instance draining for EC2 capacity providers, automatically handling the graceful shutdown of tasks when container instances are terminated or scaled in.</summary>
      </announcement>
      <announcement>
        <title>Amazon CloudFront announces embedded Points of Presence</title>
        <service>CloudFront</service>
        <date>2025-05-10T00:00:00.000Z</date>
        <summary>Amazon CloudFront now has embedded Points of Presence (PoPs) located within internet service provider (ISP) networks, bringing content closer to viewers and reducing latency for popular content delivery.</summary>
      </announcement>
      <announcement>
        <title>Amazon API Gateway adds support for WebSocket API access logging</title>
        <service>API Gateway</service>
        <date>2025-05-05T00:00:00.000Z</date>
        <summary>Amazon API Gateway now supports detailed access logging for WebSocket APIs, providing visibility into connection attempts, message routing, and disconnection events for better debugging and monitoring.</summary>
      </announcement>
      <announcement>
        <title>Amazon EventBridge Pipes adds enrichment with Step Functions</title>
        <service>EventBridge</service>
        <date>2025-04-28T00:00:00.000Z</date>
        <summary>Amazon EventBridge Pipes now supports AWS Step Functions as an enrichment target, enabling complex event processing workflows between source and target without custom code.</summary>
      </announcement>
      <announcement>
        <title>AWS Lambda introduces recursive loop detection</title>
        <service>Lambda</service>
        <date>2025-04-20T00:00:00.000Z</date>
        <summary>AWS Lambda now automatically detects and stops recursive invocation loops between Lambda, SQS, and SNS. When a recursive loop is detected, Lambda stops processing the event and notifies you via CloudWatch.</summary>
      </announcement>
      <announcement>
        <title>Amazon S3 adds conditional writes support</title>
        <service>S3</service>
        <date>2025-04-15T00:00:00.000Z</date>
        <summary>Amazon S3 now supports conditional writes that check if an object exists before writing, helping prevent unintentional overwrites. This eliminates the need for client-side checks before uploading objects.</summary>
      </announcement>
      <announcement>
        <title>Amazon DynamoDB adds support for multi-Region strong consistency</title>
        <service>DynamoDB</service>
        <date>2025-04-10T00:00:00.000Z</date>
        <summary>Amazon DynamoDB global tables now support multi-Region strong consistency, allowing applications to read the most recent write regardless of the Region in which it was made.</summary>
      </announcement>
      <announcement>
        <title>Amazon Bedrock Knowledge Bases adds GraphRAG support</title>
        <service>Bedrock</service>
        <date>2025-04-05T00:00:00.000Z</date>
        <summary>Amazon Bedrock Knowledge Bases now supports GraphRAG, enabling retrieval-augmented generation that leverages knowledge graphs for more contextual and relationship-aware responses from foundation models.</summary>
      </announcement>
      <announcement>
        <title>Amazon SQS introduces message throughput metrics</title>
        <service>SQS</service>
        <date>2025-03-28T00:00:00.000Z</date>
        <summary>Amazon SQS now publishes message throughput metrics to CloudWatch, providing real-time visibility into send, receive, and delete operations per queue for better capacity planning and monitoring.</summary>
      </announcement>
    </announcements>
  </seed_data>

  <implementation_notes>
    <backend_handler_pattern>
      The Lambda handler should use a simple router pattern:
      ```typescript
      // backend/src/index.ts
      import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
      import { listAnnouncements } from './handlers/listAnnouncements';
      import { getAnnouncement } from './handlers/getAnnouncement';
      import { createAnnouncement } from './handlers/createAnnouncement';
      import { updateAnnouncement } from './handlers/updateAnnouncement';
      import { deleteAnnouncement } from './handlers/deleteAnnouncement';

      export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
        const { routeKey } = event;
        // routeKey format: "GET /announcements", "POST /announcements", etc.

        switch (routeKey) {
          case 'GET /announcements':
            return listAnnouncements(event);
          case 'GET /announcements/{id}':
            return getAnnouncement(event);
          case 'POST /announcements':
            return createAnnouncement(event);
          case 'PUT /announcements/{id}':
            return updateAnnouncement(event);
          case 'DELETE /announcements/{id}':
            return deleteAnnouncement(event);
          default:
            return {
              statusCode: 404,
              headers: corsHeaders,
              body: JSON.stringify({ error: 'Not found' }),
            };
        }
      };
      ```
    </backend_handler_pattern>

    <cors_headers>
      All API responses must include CORS headers:
      ```typescript
      export const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      };
      ```
    </cors_headers>

    <error_handling>
      - Validate all inputs with Zod schemas before processing
      - Return appropriate HTTP status codes (400, 404, 500)
      - Never expose internal error details to clients
      - Log errors to CloudWatch for debugging
      - Wrap handler logic in try/catch to return 500 for unexpected errors
    </error_handling>

    <frontend_api_client>
      ```typescript
      // frontend/src/api/client.ts
      const API_URL = import.meta.env.VITE_API_URL;

      async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${API_URL}${path}`, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
          },
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'An error occurred');
        }
        if (response.status === 204) return undefined as T;
        return response.json();
      }

      export const api = {
        listAnnouncements: (params?: { service?: string; search?: string; limit?: number; nextToken?: string }) => {
          const searchParams = new URLSearchParams();
          if (params?.service) searchParams.set('service', params.service);
          if (params?.search) searchParams.set('search', params.search);
          if (params?.limit) searchParams.set('limit', String(params.limit));
          if (params?.nextToken) searchParams.set('nextToken', params.nextToken);
          const query = searchParams.toString();
          return fetchApi<ListAnnouncementsResponse>(`/announcements${query ? `?${query}` : ''}`);
        },
        getAnnouncement: (id: string) => fetchApi<Announcement>(`/announcements/${id}`),
        createAnnouncement: (data: CreateAnnouncementInput) =>
          fetchApi<Announcement>('/announcements', { method: 'POST', body: JSON.stringify(data) }),
        updateAnnouncement: (id: string, data: UpdateAnnouncementInput) =>
          fetchApi<Announcement>(`/announcements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        deleteAnnouncement: (id: string) =>
          fetchApi<void>(`/announcements/${id}`, { method: 'DELETE' }),
      };
      ```
    </frontend_api_client>

    <react_query_setup>
      Use TanStack Query for all server state:
      - queryKey patterns: ['announcements'], ['announcements', { service, search }], ['announcement', id]
      - Stale time: 30 seconds for list queries
      - Invalidate 'announcements' list on any mutation (create/update/delete)
      - Use useMutation for create/update/delete operations
      - Show loading states via isLoading/isPending
      - Handle errors via isError and error object
    </react_query_setup>

    <workspace_setup>
      Root package.json should define npm workspaces:
      ```json
      {
        "name": "aws-news-hub",
        "private": true,
        "workspaces": ["shared", "frontend", "backend", "infra"],
        "scripts": {
          "build:shared": "cd shared && npm run build",
          "build:frontend": "cd frontend && npm run build",
          "build:backend": "cd backend && npm run build",
          "dev": "cd frontend && npm run dev",
          "seed": "cd backend && npx ts-node seed.ts"
        }
      }
      ```
      This allows shared/ to be imported by both frontend and backend using the package name.
      The shared package.json must have:
      ```json
      {
        "name": "@aws-news-hub/shared",
        "main": "./src/index.ts",
        "types": "./src/index.ts"
      }
      ```
    </workspace_setup>

    <cdk_implementation_notes>
      The CDK stack (infra/lib/aws-news-stack.ts) must:
      1. Create DynamoDB table with both GSIs
      2. Create Lambda function using NodejsFunction (aws-cdk-lib/aws-lambda-nodejs)
         - Entry point: ../backend/src/index.ts
         - Bundle with esbuild (handled by NodejsFunction automatically)
         - Pass TABLE_NAME as environment variable
      3. Create HTTP API with routes:
         - GET /announcements → Lambda
         - GET /announcements/{id} → Lambda
         - POST /announcements → Lambda
         - PUT /announcements/{id} → Lambda
         - DELETE /announcements/{id} → Lambda
      4. Configure CORS on the HTTP API
      5. Grant Lambda read/write access to DynamoDB table
      6. Create S3 bucket for frontend with CloudFront distribution
      7. Output all required CfnOutput values
    </cdk_implementation_notes>

    <deployment_steps>
      1. npm install (at root — installs all workspaces)
      2. npm run build:shared (compile shared schemas)
      3. cd infra && npx cdk deploy (deploys backend + infra, outputs ApiUrl)
      4. Note the ApiUrl from CfnOutput
      5. cd frontend && VITE_API_URL={{ApiUrl}} npm run build
      6. aws s3 sync frontend/dist/ s3://{{FrontendBucketName}} --delete
      7. npx ts-node backend/seed.ts (seed data using TABLE_NAME from CfnOutput)
    </deployment_steps>

    <local_development>
      For local frontend development:
      1. Set VITE_API_URL in frontend/.env.local (pointing to deployed API or local mock)
      2. Run: cd frontend && npm run dev
      3. Vite dev server starts on http://localhost:5173

      For testing the backend locally (optional):
      - Use SAM CLI or direct invocation with test events
      - Or deploy to AWS and test against the real API
    </local_development>
  </implementation_notes>
</project_specification>

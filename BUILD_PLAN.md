<project_specification>
  <project_name>AWS News Hub - AWS Service Releases & Announcements Website</project_name>

  <overview>
    Build a fully functional website that displays the latest AWS service releases and news announcements.
    The application uses a serverless full-stack architecture with a React frontend, AWS Lambda backend,
    API Gateway, and DynamoDB for persistence.

    AWS News Hub allows users to browse, search, and filter the latest AWS service announcements. Each
    announcement displays a title, date, service category, and summary. Users can filter by AWS service
    (e.g., Lambda, S3, DynamoDB, Bedrock) and use full-text search to find specific announcements.
    Administrators can create, edit, and delete announcements through a CRUD API. The interface should
    be clean, modern, and fully responsive for mobile devices, using an AWS-inspired color palette
    (dark navy, orange accents, clean whites) that feels professional and polished.

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
      <language>TypeScript 5 for type safety across the entire codebase</language>
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
      <note>Deployment handled via: cdk deploy (provisions infra + deploys Lambda) then S3 sync for frontend assets</note>
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

      All AWS resources MUST be prefixed with: ankit-aidlc-testing-

      Required resources:
      - DynamoDB table: ankit-aidlc-testing-aws-news-table
        - Single-table design
        - Partition key: PK (String)
        - Sort key: SK (String)
        - GSI1: GSI1PK (String) / GSI1SK (String) for service-based queries
        - GSI2: GSI2PK (String) / GSI2SK (String) for date-based queries
        - Billing mode: PAY_PER_REQUEST
      - Lambda function: ankit-aidlc-testing-aws-news-api
        - Runtime: Node.js 20
        - Bundled with esbuild via NodejsFunction
        - Memory: 256MB
        - Timeout: 30 seconds
        - Environment variables: TABLE_NAME (reference to DynamoDB table)
      - API Gateway HTTP API: ankit-aidlc-testing-aws-news-http-api
        - CORS configured for frontend origin (allow all origins in dev)
        - Routes proxy to Lambda: ANY /{proxy+}
      - S3 bucket: ankit-aidlc-testing-aws-news-frontend
        - Static website hosting enabled
        - Public access blocked (served via CloudFront)
      - CloudFront distribution: ankit-aidlc-testing-aws-news-cdn
        - Origin: S3 bucket
        - Default root object: index.html
        - Error pages: 403/404 redirect to /index.html (SPA routing)
        - Cache policy: CachingOptimized for static assets

      CfnOutput values (MUST be defined):
      - ApiUrl: The HTTP API endpoint URL
      - FrontendBucketName: The S3 bucket name for frontend deployment
      - CloudFrontUrl: The CloudFront distribution URL
      - TableName: The DynamoDB table name
    </cdk_stack>
  </infrastructure>

  <api_contract>
    <base_url>{{VITE_API_URL}}</base_url>
    <endpoints>
      <endpoint>
        <method>GET</method>
        <path>/announcements</path>
        <description>List all announcements with optional filtering and pagination</description>
        <query_params>
          - service (optional): Filter by AWS service category (e.g., "Lambda", "S3")
          - search (optional): Full-text search across title and summary
          - limit (optional): Number of results per page (default: 20, max: 100)
          - nextToken (optional): Pagination token for next page
        </query_params>
        <response>
          {
            "announcements": Announcement[],
            "nextToken": string | null
          }
        </response>
      </endpoint>
      <endpoint>
        <method>GET</method>
        <path>/announcements/:id</path>
        <description>Get a single announcement by ID</description>
        <response>Announcement</response>
      </endpoint>
      <endpoint>
        <method>POST</method>
        <path>/announcements</path>
        <description>Create a new announcement</description>
        <request_body>CreateAnnouncementInput</request_body>
        <response>Announcement</response>
      </endpoint>
      <endpoint>
        <method>PUT</method>
        <path>/announcements/:id</path>
        <description>Update an existing announcement</description>
        <request_body>UpdateAnnouncementInput</request_body>
        <response>Announcement</response>
      </endpoint>
      <endpoint>
        <method>DELETE</method>
        <path>/announcements/:id</path>
        <description>Delete an announcement</description>
        <response>{ "deleted": true }</response>
      </endpoint>
      <endpoint>
        <method>GET</method>
        <path>/services</path>
        <description>List all unique AWS service categories</description>
        <response>{ "services": string[] }</response>
      </endpoint>
    </endpoints>
  </api_contract>

  <schema_definitions>
    <shared_schemas>
      // shared/src/schemas.ts — Single source of truth for all types

      import { z } from "zod";

      // AWS Service categories enum
      export const AwsServiceSchema = z.enum([
        "Lambda",
        "S3",
        "DynamoDB",
        "Bedrock",
        "EC2",
        "ECS",
        "CloudFront",
        "API Gateway",
        "SQS",
        "SNS",
        "EventBridge",
        "Step Functions",
        "IAM",
        "CloudWatch",
        "CDK",
        "Other"
      ]);

      export type AwsService = z.infer&lt;typeof AwsServiceSchema&gt;;

      // Core Announcement entity
      export const AnnouncementSchema = z.object({
        id: z.string().uuid(),
        title: z.string().min(1).max(300),
        summary: z.string().min(1).max(2000),
        service: AwsServiceSchema,
        date: z.string().datetime(), // ISO 8601 date string
        url: z.string().url().optional(), // Optional link to AWS announcement page
        createdAt: z.string().datetime(),
        updatedAt: z.string().datetime(),
      });

      export type Announcement = z.infer&lt;typeof AnnouncementSchema&gt;;

      // Create input (no id, createdAt, updatedAt — server generates these)
      export const CreateAnnouncementInputSchema = z.object({
        title: z.string().min(1).max(300),
        summary: z.string().min(1).max(2000),
        service: AwsServiceSchema,
        date: z.string().datetime(),
        url: z.string().url().optional(),
      });

      export type CreateAnnouncementInput = z.infer&lt;typeof CreateAnnouncementInputSchema&gt;;

      // Update input (all fields optional except at least one must be provided)
      export const UpdateAnnouncementInputSchema = z.object({
        title: z.string().min(1).max(300).optional(),
        summary: z.string().min(1).max(2000).optional(),
        service: AwsServiceSchema.optional(),
        date: z.string().datetime().optional(),
        url: z.string().url().optional(),
      }).refine(
        (data) => Object.values(data).some((v) => v !== undefined),
        { message: "At least one field must be provided for update" }
      );

      export type UpdateAnnouncementInput = z.infer&lt;typeof UpdateAnnouncementInputSchema&gt;;

      // List response with pagination
      export const AnnouncementListResponseSchema = z.object({
        announcements: z.array(AnnouncementSchema),
        nextToken: z.string().nullable(),
      });

      export type AnnouncementListResponse = z.infer&lt;typeof AnnouncementListResponseSchema&gt;;

      // Query params for listing
      export const ListAnnouncementsQuerySchema = z.object({
        service: AwsServiceSchema.optional(),
        search: z.string().optional(),
        limit: z.coerce.number().min(1).max(100).default(20),
        nextToken: z.string().optional(),
      });

      export type ListAnnouncementsQuery = z.infer&lt;typeof ListAnnouncementsQuerySchema&gt;;

      // Services list response
      export const ServicesResponseSchema = z.object({
        services: z.array(z.string()),
      });
    </shared_schemas>
  </schema_definitions>

  <core_data_entities>
    <dynamodb_design>
      Single-table design for the announcements application.

      Table name: ankit-aidlc-testing-aws-news-table

      Primary Key:
        - PK (Partition Key): "ANNOUNCEMENT#&lt;id&gt;"
        - SK (Sort Key): "ANNOUNCEMENT#&lt;id&gt;"

      GSI1 (Service Index - for filtering by service):
        - GSI1PK: "SERVICE#&lt;service_name&gt;"
        - GSI1SK: "DATE#&lt;iso_date&gt;#&lt;id&gt;"
        Purpose: Query all announcements for a specific service, sorted by date descending

      GSI2 (Date Index - for chronological listing):
        - GSI2PK: "ALL_ANNOUNCEMENTS"
        - GSI2SK: "DATE#&lt;iso_date&gt;#&lt;id&gt;"
        Purpose: Query all announcements sorted by date descending (for the main feed)

      Item shape in DynamoDB:
      {
        PK: "ANNOUNCEMENT#&lt;uuid&gt;",
        SK: "ANNOUNCEMENT#&lt;uuid&gt;",
        GSI1PK: "SERVICE#Lambda",
        GSI1SK: "DATE#2026-06-15T00:00:00.000Z#&lt;uuid&gt;",
        GSI2PK: "ALL_ANNOUNCEMENTS",
        GSI2SK: "DATE#2026-06-15T00:00:00.000Z#&lt;uuid&gt;",
        id: "&lt;uuid&gt;",
        title: "AWS Lambda now supports Node.js 22",
        summary: "AWS Lambda now supports creating...",
        service: "Lambda",
        date: "2026-06-15T00:00:00.000Z",
        url: "https://aws.amazon.com/about-aws/whats-new/...",
        createdAt: "2026-06-15T10:00:00.000Z",
        updatedAt: "2026-06-15T10:00:00.000Z"
      }
    </dynamodb_design>

    <seed_data>
      The backend MUST include a seed script (backend/src/seed.ts) that populates the DynamoDB table
      with the following 15 sample announcements. The seed script should be runnable via:
        npx ts-node backend/src/seed.ts
      or triggered by a CDK custom resource on first deploy.

      Sample announcements to seed:

      1. Title: "Amazon Bedrock now supports Claude 4 Opus model"
         Service: Bedrock
         Date: 2026-06-20
         Summary: "Amazon Bedrock now supports Anthropic's Claude 4 Opus, the most capable model in the Claude family, offering advanced reasoning, coding, and multimodal capabilities for enterprise AI applications."

      2. Title: "AWS Lambda introduces 10GB ephemeral storage support"
         Service: Lambda
         Date: 2026-06-18
         Summary: "AWS Lambda now supports configuring up to 10GB of ephemeral storage in the /tmp directory, enabling data-intensive workloads like ETL processing, ML inference, and large file handling."

      3. Title: "Amazon S3 Express One Zone now available in 8 additional regions"
         Service: S3
         Date: 2026-06-15
         Summary: "Amazon S3 Express One Zone, the highest-performance storage class, is now available in 8 additional AWS Regions, bringing single-digit millisecond data access to more customers globally."

      4. Title: "Amazon DynamoDB introduces vector search for AI applications"
         Service: DynamoDB
         Date: 2026-06-12
         Summary: "Amazon DynamoDB now supports vector search natively, enabling developers to store and query vector embeddings alongside structured data for AI-powered applications without managing separate infrastructure."

      5. Title: "AWS CDK v3 now generally available"
         Service: CDK
         Date: 2026-06-10
         Summary: "AWS CDK v3 introduces improved construct libraries, faster synthesis times, and native support for multi-account deployments with simplified cross-stack references and enhanced type safety."

      6. Title: "Amazon EventBridge introduces enhanced filtering with content-based rules"
         Service: EventBridge
         Date: 2026-06-08
         Summary: "Amazon EventBridge now supports complex content-based filtering rules, including regex patterns, IP address matching, and nested array filtering for more precise event routing."

      7. Title: "AWS Step Functions adds direct SDK integrations for 40 new services"
         Service: Step Functions
         Date: 2026-06-05
         Summary: "AWS Step Functions now supports direct SDK integrations for 40 additional AWS services, eliminating the need for intermediate Lambda functions and reducing workflow complexity and cost."

      8. Title: "Amazon CloudFront supports WebSocket connections"
         Service: CloudFront
         Date: 2026-06-03
         Summary: "Amazon CloudFront now natively supports WebSocket connections at edge locations, enabling real-time bidirectional communication for applications like live chat, gaming, and financial dashboards."

      9. Title: "Amazon ECS adds automatic scaling based on deployment health"
         Service: ECS
         Date: 2026-05-30
         Summary: "Amazon ECS now supports automatic scaling policies that factor in deployment health metrics, ensuring new task instances are only scaled after passing health checks and stability thresholds."

      10. Title: "API Gateway introduces request validation with JSON Schema draft 2020-12"
          Service: API Gateway
          Date: 2026-05-28
          Summary: "Amazon API Gateway now supports request validation using JSON Schema draft 2020-12, providing richer validation capabilities including conditional schemas, recursive references, and improved error messages."

      11. Title: "Amazon SQS introduces message deduplication window of up to 24 hours"
          Service: SQS
          Date: 2026-05-25
          Summary: "Amazon SQS FIFO queues now support configurable deduplication windows of up to 24 hours, giving applications more flexibility to handle retry scenarios and exactly-once processing guarantees."

      12. Title: "Amazon SNS adds support for CloudEvents specification"
          Service: SNS
          Date: 2026-05-22
          Summary: "Amazon SNS now supports publishing and receiving messages using the CloudEvents v1.0 specification, enabling standardized event interoperability across cloud providers and on-premises systems."

      13. Title: "Amazon EC2 introduces M8g instances powered by AWS Graviton5"
          Service: EC2
          Date: 2026-05-20
          Summary: "Amazon EC2 M8g instances, powered by the new AWS Graviton5 processors, deliver up to 40% better price-performance over M7g instances for general-purpose workloads including web servers, app servers, and microservices."

      14. Title: "AWS IAM introduces fine-grained session policies for federated users"
          Service: IAM
          Date: 2026-05-18
          Summary: "AWS IAM now supports fine-grained session policies for federated users, enabling organizations to dynamically restrict permissions based on context such as device posture, network location, and time of access."

      15. Title: "Amazon CloudWatch introduces AI-powered anomaly detection for custom metrics"
          Service: CloudWatch
          Date: 2026-05-15
          Summary: "Amazon CloudWatch now offers AI-powered anomaly detection for custom metrics, automatically learning expected patterns and alerting on deviations without requiring manual threshold configuration."
    </seed_data>
  </core_data_entities>

  <pages_and_interfaces>
    <page name="Homepage / Announcement Feed" path="/">
      <description>
        The main landing page displaying a chronological feed of AWS announcements.
        This is the primary interface users interact with.
      </description>
      <layout>
        - Fixed top navigation bar with app logo ("AWS News Hub"), search input, and navigation links
        - Below nav: Hero section with a brief tagline ("Latest AWS Service Releases and News")
        - Left sidebar (desktop): Service filter panel with checkboxes for each AWS service
        - Main content area: Vertical feed of announcement cards sorted by date (newest first)
        - Each card shows: service badge (colored pill), title, date (relative, e.g., "3 days ago"), summary (truncated to 2 lines)
        - Cards are clickable to navigate to detail view
        - Pagination: "Load More" button at bottom (using cursor-based pagination)
        - Mobile: Sidebar collapses into a dropdown/modal filter
      </layout>
      <components>
        - Header: App logo, search bar (with debounced input), nav links
        - ServiceFilter: Sidebar with checkboxes for each service; shows count of announcements per service
        - AnnouncementCard: Card component with service badge, title, date, summary preview
        - AnnouncementFeed: List of AnnouncementCards with "Load More" pagination
        - EmptyState: Shown when no announcements match filters/search
        - LoadingState: Skeleton cards while data is fetching
      </components>
      <interactions>
        - Typing in search bar filters announcements in real-time (debounced 300ms, calls API)
        - Clicking a service checkbox toggles the filter (updates URL query params)
        - Multiple services can be selected simultaneously (OR logic)
        - Clicking "Clear Filters" resets all selections
        - URL reflects current filter state (shareable links)
      </interactions>
    </page>

    <page name="Announcement Detail" path="/announcements/:id">
      <description>
        Full view of a single announcement with all details.
      </description>
      <layout>
        - Breadcrumb navigation: Home > [Service Name] > [Announcement Title]
        - Full announcement display:
          - Service badge (large, colored)
          - Title (h1)
          - Date (formatted: "June 20, 2026")
          - Full summary text (no truncation)
          - External link button to AWS announcement page (if url exists)
        - "Back to Feed" link
        - Related announcements section: 3 cards from the same service category
      </layout>
      <components>
        - Breadcrumb: Navigation breadcrumb trail
        - AnnouncementDetail: Full announcement display
        - RelatedAnnouncements: Horizontal row of 3 related announcement cards
        - BackLink: Styled link back to the feed with preserved filter state
      </components>
    </page>

    <page name="Admin - Manage Announcements" path="/admin">
      <description>
        Admin interface for CRUD operations on announcements. Simple table view
        with action buttons. No authentication required (simplified for demo).
      </description>
      <layout>
        - Page title: "Manage Announcements"
        - "Add New Announcement" button (opens form modal)
        - Table of all announcements:
          - Columns: Title, Service, Date, Actions (Edit, Delete)
          - Sortable by date
          - Search/filter input above table
        - Confirmation modal for delete actions
        - Form modal for create/edit (shared component)
      </layout>
      <components>
        - AdminTable: Sortable table of announcements with action buttons
        - AnnouncementForm: Modal form for creating/editing announcements
          - Fields: title (text input), summary (textarea), service (dropdown), date (date picker), url (text input, optional)
          - Validation: All required fields highlighted on error (uses Zod schemas)
          - Submit: Creates or updates announcement via API
        - DeleteConfirmation: Modal confirming deletion with announcement title
        - Toast/Notification: Success/error feedback after CRUD operations
      </components>
      <interactions>
        - Click "Add New" opens empty form modal
        - Click "Edit" on a row opens pre-filled form modal
        - Click "Delete" on a row opens confirmation modal
        - Form submission validates with Zod, shows inline errors
        - Successful create/edit/delete shows toast notification and refreshes table
        - Optimistic updates for better UX (revert on error)
      </interactions>
    </page>
  </pages_and_interfaces>

  <design_system>
    <color_palette>
      - Primary: #232F3E (AWS dark navy) — navigation, headers, primary text
      - Secondary: #FF9900 (AWS orange) — CTAs, accents, highlights, active states
      - Background: #F8F9FA (light gray) — page background
      - Surface: #FFFFFF (white) — cards, modals, form inputs
      - Text Primary: #16191F — headings and body text
      - Text Secondary: #5F6B7A — secondary text, dates, metadata
      - Border: #E9ECEF — card borders, dividers
      - Success: #1B8A3D — success toasts, status indicators
      - Error: #D13212 — error states, delete buttons, validation errors
      - Service Badge Colors (one per service for visual distinction):
        - Lambda: #FF9900 (orange)
        - S3: #3F8624 (green)
        - DynamoDB: #4053D6 (blue)
        - Bedrock: #8C4FFF (purple)
        - EC2: #FF9900 (orange)
        - ECS: #ED7100 (dark orange)
        - CloudFront: #8C4FFF (purple)
        - API Gateway: #FF4F8B (pink)
        - SQS: #FF4F8B (pink)
        - SNS: #D13212 (red)
        - EventBridge: #FF4F8B (pink)
        - Step Functions: #FF4F8B (pink)
        - IAM: #DD344C (red)
        - CloudWatch: #FF4F8B (pink)
        - CDK: #3F8624 (green)
        - Other: #5F6B7A (gray)
    </color_palette>
    <typography>
      - Font family: Inter (Google Fonts) for all text, system-ui fallback
      - H1: 2rem (32px), font-weight 700
      - H2: 1.5rem (24px), font-weight 600
      - H3: 1.25rem (20px), font-weight 600
      - Body: 1rem (16px), font-weight 400, line-height 1.6
      - Small: 0.875rem (14px) for metadata, dates
      - Card title: 1.125rem (18px), font-weight 600
    </typography>
    <spacing>
      - Base unit: 4px
      - Card padding: 24px
      - Card gap: 16px
      - Section margin: 48px
      - Page max-width: 1200px (centered)
      - Sidebar width: 280px (desktop)
    </spacing>
    <responsive_breakpoints>
      - Mobile: &lt; 640px (single column, no sidebar, hamburger menu)
      - Tablet: 640px - 1024px (sidebar collapses to top filter bar)
      - Desktop: &gt; 1024px (full sidebar + content layout)
    </responsive_breakpoints>
  </design_system>

  <project_structure>
    aws-news-hub/
    ├── package.json                    # Root workspace configuration
    ├── tsconfig.base.json              # Shared TypeScript configuration
    ├── shared/
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts                # Re-exports all schemas and types
    │       └── schemas.ts              # Zod schemas (source of truth)
    ├── frontend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   ├── vite.config.ts
    │   ├── index.html
    │   ├── public/
    │   │   └── favicon.svg
    │   └── src/
    │       ├── main.tsx                # App entry point
    │       ├── App.tsx                 # Root component with router
    │       ├── index.css               # Tailwind imports + global styles
    │       ├── api/
    │       │   └── client.ts           # API client (fetch wrapper + React Query hooks)
    │       ├── components/
    │       │   ├── Header.tsx          # Navigation bar with search
    │       │   ├── ServiceFilter.tsx   # Service category filter sidebar
    │       │   ├── AnnouncementCard.tsx # Individual announcement card
    │       │   ├── AnnouncementFeed.tsx # Feed list with loading states
    │       │   ├── AnnouncementForm.tsx # Create/edit form modal
    │       │   ├── DeleteConfirmation.tsx # Delete confirmation modal
    │       │   ├── EmptyState.tsx       # No results component
    │       │   ├── LoadingState.tsx     # Skeleton loading cards
    │       │   ├── ServiceBadge.tsx     # Colored service category pill
    │       │   ├── Toast.tsx           # Toast notification component
    │       │   └── Layout.tsx          # Page layout wrapper
    │       ├── pages/
    │       │   ├── HomePage.tsx        # Main feed page
    │       │   ├── DetailPage.tsx      # Single announcement view
    │       │   └── AdminPage.tsx       # Admin CRUD interface
    │       ├── hooks/
    │       │   ├── useAnnouncements.ts # React Query hook for announcements
    │       │   ├── useDebounce.ts      # Debounce hook for search
    │       │   └── useToast.ts         # Toast notification hook
    │       └── utils/
    │           ├── constants.ts        # Service colors, config
    │           └── formatDate.ts       # Date formatting utilities
    ├── backend/
    │   ├── package.json
    │   ├── tsconfig.json
    │   └── src/
    │       ├── index.ts                # Lambda handler entry point (router)
    │       ├── routes/
    │       │   ├── announcements.ts    # CRUD route handlers for announcements
    │       │   └── services.ts         # GET /services handler
    │       ├── db/
    │       │   └── dynamodb.ts         # DynamoDB client + data access functions
    │       ├── middleware/
    │       │   └── validation.ts       # Request validation using Zod schemas
    │       └── seed.ts                 # Seed script to populate initial data
    └── infrastructure/
        ├── package.json
        ├── tsconfig.json
        ├── cdk.json
        ├── bin/
        │   └── app.ts                  # CDK app entry point
        └── lib/
            └── aws-news-hub-stack.ts   # Main CDK stack definition
  </project_structure>

  <implementation_details>
    <backend_routing>
      The Lambda handler (backend/src/index.ts) uses a simple custom router pattern
      (no framework like Express — keep it lightweight for Lambda cold starts):

      - Parse the event from API Gateway HTTP API v2 format
      - Extract HTTP method and path
      - Route to appropriate handler:
        GET /announcements → listAnnouncements
        GET /announcements/:id → getAnnouncement
        POST /announcements → createAnnouncement
        PUT /announcements/:id → updateAnnouncement
        DELETE /announcements/:id → deleteAnnouncement
        GET /services → listServices
      - Return proper HTTP responses with CORS headers
      - Handle errors with appropriate status codes (400, 404, 500)
    </backend_routing>

    <dynamodb_access_patterns>
      1. Get single announcement by ID:
         - Table query: PK = "ANNOUNCEMENT#&lt;id&gt;", SK = "ANNOUNCEMENT#&lt;id&gt;"

      2. List all announcements (chronological, paginated):
         - GSI2 query: GSI2PK = "ALL_ANNOUNCEMENTS", ScanIndexForward = false
         - Supports LastEvaluatedKey for pagination

      3. List announcements by service (filtered, chronological):
         - GSI1 query: GSI1PK = "SERVICE#&lt;service&gt;", ScanIndexForward = false

      4. Search announcements:
         - GSI2 query (all announcements) + FilterExpression with contains() on title and summary
         - Note: For a production app, use OpenSearch. For this demo, DynamoDB filter is acceptable.

      5. List all services:
         - Scan with ProjectionExpression for "service" field, then deduplicate
         - Cache result briefly on the client side (services don't change often)

      6. Create announcement:
         - PutItem with all attributes including computed keys

      7. Update announcement:
         - UpdateItem with UpdateExpression for changed fields
         - Also update GSI keys if service or date changed

      8. Delete announcement:
         - DeleteItem by PK/SK
    </dynamodb_access_patterns>

    <frontend_api_client>
      The API client (frontend/src/api/client.ts) should:
      - Use native fetch() for HTTP requests
      - Prepend VITE_API_URL to all paths
      - Include Content-Type: application/json header
      - Parse and validate responses using Zod schemas
      - Throw typed errors for non-2xx responses
      - Export React Query hooks:
        - useAnnouncements(filters): paginated query with keepPreviousData
        - useAnnouncement(id): single item query
        - useCreateAnnouncement(): mutation with cache invalidation
        - useUpdateAnnouncement(): mutation with optimistic update
        - useDeleteAnnouncement(): mutation with optimistic removal
        - useServices(): query for service list
    </frontend_api_client>

    <search_implementation>
      Search is implemented as a combined client-server approach:
      - Primary: API call with `search` query param → backend uses DynamoDB FilterExpression
        with contains() on title and summary fields (case-insensitive via lowercase comparison)
      - The search input is debounced (300ms) before triggering an API call
      - Loading state shown while search is in progress
      - Empty state with "No results for '[query]'" message when no matches
      - Search query is synced to URL params for shareable results
    </search_implementation>

    <responsive_design>
      Mobile-first responsive design using Tailwind CSS breakpoints:
      - Base (mobile): Single column layout, full-width cards, hamburger menu for nav
      - sm (640px): Cards get horizontal padding, search bar expands
      - md (768px): Two-column card grid on admin page
      - lg (1024px): Sidebar appears, main content area with max-width
      - xl (1280px): Wider content area, more horizontal padding

      Mobile-specific behaviors:
      - Navigation collapses to hamburger menu with slide-out drawer
      - Service filter becomes a "Filter" button that opens a bottom sheet/modal
      - Cards stack vertically with appropriate spacing
      - Touch-friendly tap targets (min 44px)
      - Form modals become full-screen on mobile
    </responsive_design>

    <error_handling>
      Frontend:
      - React Query error boundaries for failed requests
      - Toast notifications for mutation errors (create/update/delete failed)
      - Retry logic: React Query default retry (3 times with exponential backoff)
      - Graceful degradation: show cached data while refetching

      Backend:
      - Structured error responses: { "error": "message", "details": [...] }
      - Validation errors return 400 with field-level details
      - Not found returns 404 with descriptive message
      - Internal errors return 500 with generic message (log details to CloudWatch)
      - All errors include request ID for debugging
    </error_handling>
  </implementation_details>

  <development_workflow>
    <local_development>
      Prerequisites:
      - Node.js 20+
      - AWS CLI configured with appropriate credentials
      - AWS CDK CLI installed globally

      Setup:
      1. npm install (root — installs all workspaces)
      2. cd infrastructure && cdk deploy (provisions AWS resources)
      3. Copy API URL from CDK output
      4. Create frontend/.env.local with VITE_API_URL=&lt;api_url&gt;
      5. Run seed script: cd backend && npx ts-node src/seed.ts
      6. cd frontend && npm run dev (starts Vite dev server on port 5173)

      Scripts (root package.json):
      - "dev": "npm run dev --workspace=frontend"
      - "build": "npm run build --workspace=frontend"
      - "deploy": "cd infrastructure && cdk deploy"
      - "seed": "npx ts-node backend/src/seed.ts"
    </local_development>

    <deployment>
      1. cdk deploy — deploys/updates all infrastructure (Lambda, API Gateway, DynamoDB, S3, CloudFront)
      2. npm run build --workspace=frontend — builds frontend with production API URL
      3. aws s3 sync frontend/dist s3://&lt;bucket-name&gt; --delete — deploys frontend assets
      4. aws cloudfront create-invalidation --distribution-id &lt;id&gt; --paths "/*" — invalidates CDN cache
    </deployment>
  </development_workflow>

  <package_json_specifications>
    <root_package_json>
      {
        "name": "aws-news-hub",
        "private": true,
        "workspaces": ["shared", "frontend", "backend", "infrastructure"],
        "scripts": {
          "dev": "npm run dev --workspace=frontend",
          "build": "npm run build --workspace=frontend",
          "seed": "npx ts-node backend/src/seed.ts"
        }
      }
    </root_package_json>

    <shared_package_json>
      {
        "name": "@aws-news-hub/shared",
        "version": "1.0.0",
        "main": "src/index.ts",
        "types": "src/index.ts",
        "dependencies": {
          "zod": "^3.23.0"
        }
      }
    </shared_package_json>

    <frontend_package_json>
      {
        "name": "@aws-news-hub/frontend",
        "version": "1.0.0",
        "scripts": {
          "dev": "vite",
          "build": "tsc && vite build",
          "preview": "vite preview"
        },
        "dependencies": {
          "@aws-news-hub/shared": "*",
          "@tanstack/react-query": "^5.50.0",
          "date-fns": "^4.1.0",
          "lucide-react": "^0.400.0",
          "react": "^18.3.0",
          "react-dom": "^18.3.0",
          "react-router-dom": "^7.0.0"
        },
        "devDependencies": {
          "@tailwindcss/vite": "^4.0.0",
          "@types/react": "^18.3.0",
          "@types/react-dom": "^18.3.0",
          "@vitejs/plugin-react": "^4.3.0",
          "tailwindcss": "^4.0.0",
          "typescript": "^5.5.0",
          "vite": "^6.0.0"
        }
      }
    </frontend_package_json>

    <backend_package_json>
      {
        "name": "@aws-news-hub/backend",
        "version": "1.0.0",
        "dependencies": {
          "@aws-news-hub/shared": "*",
          "@aws-sdk/client-dynamodb": "^3.600.0",
          "@aws-sdk/lib-dynamodb": "^3.600.0",
          "uuid": "^11.0.0"
        },
        "devDependencies": {
          "@types/aws-lambda": "^8.10.140",
          "@types/uuid": "^10.0.0",
          "ts-node": "^10.9.0",
          "typescript": "^5.5.0"
        }
      }
    </backend_package_json>

    <infrastructure_package_json>
      {
        "name": "@aws-news-hub/infrastructure",
        "version": "1.0.0",
        "scripts": {
          "build": "tsc",
          "synth": "cdk synth",
          "deploy": "cdk deploy"
        },
        "dependencies": {
          "aws-cdk-lib": "^2.150.0",
          "constructs": "^10.3.0"
        },
        "devDependencies": {
          "aws-cdk": "^2.150.0",
          "typescript": "^5.5.0"
        }
      }
    </infrastructure_package_json>
  </package_json_specifications>

  <critical_requirements>
    1. ALL AWS resource names/IDs MUST be prefixed with "ankit-aidlc-testing-"
    2. The CDK stack MUST export CfnOutput values for ApiUrl, FrontendBucketName, CloudFrontUrl, and TableName
    3. The shared/ package MUST be the single source of truth for all types — no duplicate type definitions
    4. The frontend MUST use VITE_API_URL environment variable to connect to the API
    5. The backend Lambda MUST handle CORS headers (Access-Control-Allow-Origin: *, Access-Control-Allow-Methods, Access-Control-Allow-Headers)
    6. The seed script MUST be runnable independently to populate the database with all 15 sample announcements
    7. The application MUST be fully responsive and functional on mobile devices (320px width minimum)
    8. All API responses MUST be validated against Zod schemas on both client and server
    9. The DynamoDB table MUST use single-table design with the specified key schema and GSIs
    10. Error handling MUST be comprehensive — no unhandled promise rejections or uncaught errors
    11. The frontend MUST show loading states (skeleton UI) while data is being fetched
    12. URL state MUST reflect current filters and search (shareable/bookmarkable URLs)
    13. The admin page MUST support full CRUD with optimistic updates and error recovery
    14. Tailwind CSS v4 MUST be used with the @tailwindcss/vite plugin (not PostCSS config)
    15. The project MUST use npm workspaces for monorepo dependency management
  </critical_requirements>
</project_specification>

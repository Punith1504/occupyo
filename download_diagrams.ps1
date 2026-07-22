$SystemArchitecture = @"
graph TD
    Client[Web / Mobile Client] --> Clerk[Clerk Auth]
    Client --> Next[Next.js App Server]
    
    Next --> DB[(PostgreSQL + pgvector)]
    Next --> Cloudinary[Cloudinary Media API]
    Next --> Stripe[Stripe / Razorpay Payments]
    Next --> OpenAI[OpenAI API]
    
    Next --> Actions[Server Actions]
    Actions --> Prisma[Prisma ORM]
    Prisma --> DB
"@

$PipelineArchitecture = @"
graph LR
    subgraph CI/CD Pipeline
        Code[GitHub Repository] --> lint[Lint & Format - ESLint]
        lint --> build[Next.js Build & Prisma Generate]
        build --> deploy[Vercel Deployment]
        deploy --> production[Production Environment]
    end
    
    subgraph Data Pipeline - Property Creation
        Action[User Creates Property] --> Save[Save to Postgres]
        Save --> Trigger[Trigger Embedding Job]
        Trigger --> API[OpenAI Embeddings API]
        API --> VectorDB[Update pgvector in DB]
    end
"@

$DatabaseSchema = @"
erDiagram
    User ||--o{ Property : owns
    User ||--o{ Lease : signs
    User ||--o{ SpaceRequest : creates
    User ||--o{ Message : sends/receives
    
    Property ||--o{ Lease : has
    Property ||--o{ Image : contains
    
    User {
        String id PK
        String clerkUserId
        String role
        String email
    }
    
    Property {
        String id PK
        String title
        String propertyType
        Float pricePerMonth
        String embedding
    }
    
    Lease {
        String id PK
        DateTime startDate
        DateTime endDate
        String status
    }
    
    Message {
        String content
        Boolean read
    }
"@

Invoke-RestMethod -Uri 'https://kroki.io/mermaid/png' -Method Post -Body $SystemArchitecture -ContentType 'text/plain' -OutFile 'System_Architecture.png'
Invoke-RestMethod -Uri 'https://kroki.io/mermaid/png' -Method Post -Body $PipelineArchitecture -ContentType 'text/plain' -OutFile 'Pipeline_Architecture.png'
Invoke-RestMethod -Uri 'https://kroki.io/mermaid/png' -Method Post -Body $DatabaseSchema -ContentType 'text/plain' -OutFile 'Database_Schema.png'

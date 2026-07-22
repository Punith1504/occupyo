const https = require('https');
const fs = require('fs');

const diagrams = {
  'System_Architecture.png': `graph TD
    Client[Web / Mobile Client] --> Clerk[Clerk Auth]
    Client --> Next[Next.js App Server]
    
    Next --> DB[(PostgreSQL + pgvector)]
    Next --> Cloudinary[Cloudinary Media API]
    Next --> Stripe[Stripe / Razorpay Payments]
    Next --> OpenAI[OpenAI API]
    
    Next --> Actions[Server Actions]
    Actions --> Prisma[Prisma ORM]
    Prisma --> DB`,
  
  'Pipeline_Architecture.png': `graph LR
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
    end`,
    
  'Database_Schema.png': `erDiagram
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
`
};

for (const [filename, code] of Object.entries(diagrams)) {
    const postData = code;

    const options = {
        hostname: 'kroki.io',
        port: 443,
        path: '/mermaid/png',
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    const req = https.request(options, (res) => {
        if (res.statusCode !== 200) {
            console.error("Failed to download " + filename + ": HTTP " + res.statusCode);
            return;
        }
        const file = fs.createWriteStream(filename);
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log("Successfully downloaded " + filename);
        });
    });

    req.on('error', (e) => {
        console.error("Problem with request for " + filename + ": " + e.message);
    });

    req.write(postData);
    req.end();
}

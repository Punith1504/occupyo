-- CreateTable
CREATE TABLE "ExternalLeadSignal" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "rawText" TEXT NOT NULL,
    "propertyType" TEXT,
    "location" TEXT,
    "size" TEXT,
    "budgetOrTimeline" TEXT,
    "contactInfo" TEXT,
    "extractionConfidence" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalLeadSignal_pkey" PRIMARY KEY ("id")
);


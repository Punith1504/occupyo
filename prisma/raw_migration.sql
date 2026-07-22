CREATE EXTENSION IF NOT EXISTS postgis;

-- Assuming `location` column is added by Prisma db push
CREATE INDEX IF NOT EXISTS "Property_location_idx" ON "Property" USING GIST ("location");

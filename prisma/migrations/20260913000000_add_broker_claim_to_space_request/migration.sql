-- AlterTable
ALTER TABLE "SpaceRequest" ADD COLUMN     "claimedByBrokerId" TEXT;

-- AddForeignKey
ALTER TABLE "SpaceRequest" ADD CONSTRAINT "SpaceRequest_claimedByBrokerId_fkey" FOREIGN KEY ("claimedByBrokerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;


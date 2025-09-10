-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "assigned_to" TEXT;

-- AddForeignKey
ALTER TABLE "public"."Project" ADD CONSTRAINT "Project_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

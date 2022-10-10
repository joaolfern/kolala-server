-- DropForeignKey
ALTER TABLE "Atendee" DROP CONSTRAINT "Atendee_userId_fkey";

-- AddForeignKey
ALTER TABLE "Atendee" ADD CONSTRAINT "Atendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Mensage" DROP CONSTRAINT "Mensage_answerToId_fkey";

-- AlterTable
ALTER TABLE "Mensage" ALTER COLUMN "answerToId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Mensage" ADD CONSTRAINT "Mensage_answerToId_fkey" FOREIGN KEY ("answerToId") REFERENCES "Mensage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

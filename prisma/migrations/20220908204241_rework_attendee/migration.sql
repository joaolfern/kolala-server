/*
  Warnings:

  - You are about to drop the column `joinedUsersIds` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `_EventToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_EventToUser" DROP CONSTRAINT "_EventToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_EventToUser" DROP CONSTRAINT "_EventToUser_B_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "joinedUsersIds";

-- DropTable
DROP TABLE "_EventToUser";

-- CreateTable
CREATE TABLE "Atendee" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Atendee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Atendee" ADD CONSTRAINT "Atendee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Atendee" ADD CONSTRAINT "Atendee_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

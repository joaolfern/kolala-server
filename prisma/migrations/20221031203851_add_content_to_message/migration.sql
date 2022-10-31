/*
  Warnings:

  - Added the required column `content` to the `Mensage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Mensage" ADD COLUMN     "content" TEXT NOT NULL;

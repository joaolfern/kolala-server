-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "status" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "status" SET DEFAULT 1;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 1,
ALTER COLUMN "level" SET DEFAULT 'user';

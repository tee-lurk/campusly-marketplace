-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "address" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "notify_email" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_push" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_sms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "student_id" TEXT,
ADD COLUMN     "tax_country" TEXT,
ADD COLUMN     "tax_id" TEXT;

/*
  Warnings:

  - You are about to drop the column `address` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `tax_country` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `tax_id` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "address",
DROP COLUMN "gender",
DROP COLUMN "tax_country",
DROP COLUMN "tax_id";

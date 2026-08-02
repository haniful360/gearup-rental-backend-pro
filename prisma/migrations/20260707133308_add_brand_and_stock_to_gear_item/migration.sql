/*
  Warnings:

  - Added the required column `brand` to the `gear_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gear_items" ADD COLUMN     "brand" TEXT NOT NULL,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 1;

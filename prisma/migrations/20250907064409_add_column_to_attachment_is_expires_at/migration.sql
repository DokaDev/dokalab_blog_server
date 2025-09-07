/*
  Warnings:

  - Added the required column `expires_at` to the `post_attachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."post_attachment" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL;

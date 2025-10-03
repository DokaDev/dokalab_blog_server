/*
  Warnings:

  - Added the required column `rendered_content` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."post" ADD COLUMN     "rendered_content" TEXT NOT NULL;

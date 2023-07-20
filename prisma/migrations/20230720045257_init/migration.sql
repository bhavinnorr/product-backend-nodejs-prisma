/*
  Warnings:

  - You are about to alter the column `file_name` on the `ProductImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Json`.

*/
-- AlterTable
ALTER TABLE `ProductImage` MODIFY `file_name` JSON NOT NULL;

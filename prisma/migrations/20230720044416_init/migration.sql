/*
  Warnings:

  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Product` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `ProductImage` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `url` on the `ProductImage` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `ProductImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `productId` on the `ProductImage` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - Added the required column `created_at` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted_at` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `in_stock` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `created_at` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deleted_at` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `file_name` to the `ProductImage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductImage` DROP FOREIGN KEY `ProductImage_productId_fkey`;

-- AlterTable
ALTER TABLE `Product` DROP PRIMARY KEY,
    DROP COLUMN `description`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NOT NULL,
    ADD COLUMN `in_stock` BOOLEAN NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `ProductImage` DROP PRIMARY KEY,
    DROP COLUMN `url`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL,
    ADD COLUMN `deleted_at` DATETIME(3) NOT NULL,
    ADD COLUMN `file_name` VARCHAR(191) NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `productId` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

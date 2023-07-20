/*
  Warnings:

  - You are about to drop the column `productId` on the `ProductImage` table. All the data in the column will be lost.
  - Added the required column `product_id` to the `ProductImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `ProductImage` DROP FOREIGN KEY `ProductImage_productId_fkey`;

-- AlterTable
ALTER TABLE `Product` MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `deleted_at` DATETIME(3) NULL,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `ProductImage` DROP COLUMN `productId`,
    ADD COLUMN `product_id` INTEGER NOT NULL,
    MODIFY `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `deleted_at` DATETIME(3) NULL,
    MODIFY `updated_at` DATETIME(3) NULL;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

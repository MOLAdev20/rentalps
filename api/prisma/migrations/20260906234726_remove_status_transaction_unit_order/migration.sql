/*
  Warnings:

  - You are about to drop the column `status` on the `rented_unit_order` table. All the data in the column will be lost.

*/

-- 1. Drop Foreign Key & Unique Index lama di order_transaction
ALTER TABLE `order_transaction` DROP FOREIGN KEY `order_transaction_order_id_fkey`;
DROP INDEX `order_transaction_order_id_key` ON `order_transaction`;

-- 2. Bikin Index biasa & Pasang lagi Foreign Key di order_transaction
CREATE INDEX `order_transaction_order_id_idx` ON `order_transaction`(`order_id`);
ALTER TABLE `order_transaction` ADD CONSTRAINT `order_transaction_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Drop kolom status di rented_unit_order
ALTER TABLE `rented_unit_order` DROP COLUMN `status`;

-- 4. Drop Foreign Key lama di fnb_item_order DULU sebelum dibikin ulang
ALTER TABLE `fnb_item_order` DROP FOREIGN KEY `fnb_item_order_order_id_fkey`;
ALTER TABLE `fnb_item_order` ADD CONSTRAINT `fnb_item_order_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
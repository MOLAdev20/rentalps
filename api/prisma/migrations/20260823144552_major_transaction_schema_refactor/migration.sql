/*
  Warnings:

  - You are about to drop the `payment_link` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction_item_fnb` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `transaction_item_unit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `payment_link` DROP FOREIGN KEY `payment_link_transaction_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_item_fnb` DROP FOREIGN KEY `transaction_item_fnb_fnb_item_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_item_fnb` DROP FOREIGN KEY `transaction_item_fnb_transaction_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_item_unit` DROP FOREIGN KEY `transaction_item_unit_transaction_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_item_unit` DROP FOREIGN KEY `transaction_item_unit_unit_item_id_fkey`;

-- DropTable
DROP TABLE `payment_link`;

-- DropTable
DROP TABLE `transaction`;

-- DropTable
DROP TABLE `transaction_item_fnb`;

-- DropTable
DROP TABLE `transaction_item_unit`;

-- CreateTable
CREATE TABLE `orders` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_no` VARCHAR(191) NOT NULL,
    `customer_name` VARCHAR(191) NOT NULL,
    `subtotal` DOUBLE NOT NULL,
    `total` DOUBLE NOT NULL,
    `status` ENUM('pending', 'complete', 'cancel') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `orders_order_no_key`(`order_no`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rented_unit_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `unit_item_id` INTEGER NOT NULL,
    `play_time` DOUBLE NOT NULL,
    `sub_total` DOUBLE NOT NULL,
    `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `end_time` DATETIME(3) NOT NULL,
    `status` ENUM('playing', 'finished', 'cancel') NOT NULL DEFAULT 'playing',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fnb_item_order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `fnb_item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `sub_total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_transaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `order_id` INTEGER NOT NULL,
    `transaction_no` VARCHAR(191) NOT NULL,
    `payment_method` ENUM('pending_payment', 'qris', 'cash') NOT NULL DEFAULT 'pending_payment',
    `amount` DOUBLE NOT NULL,
    `snap_url` VARCHAR(191) NULL,
    `snap_expiry` DATETIME(3) NULL,
    `status` ENUM('pending', 'complete', 'cancel', 'expired') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `order_transaction_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `rented_unit_order` ADD CONSTRAINT `rented_unit_order_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `rented_unit_order` ADD CONSTRAINT `rented_unit_order_unit_item_id_fkey` FOREIGN KEY (`unit_item_id`) REFERENCES `unit_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fnb_item_order` ADD CONSTRAINT `fnb_item_order_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fnb_item_order` ADD CONSTRAINT `fnb_item_order_fnb_item_id_fkey` FOREIGN KEY (`fnb_item_id`) REFERENCES `fnb_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_transaction` ADD CONSTRAINT `order_transaction_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

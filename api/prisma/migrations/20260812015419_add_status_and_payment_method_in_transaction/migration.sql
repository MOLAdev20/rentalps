-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `payment_method` ENUM('qris', 'cash') NOT NULL DEFAULT 'cash',
    ADD COLUMN `status` ENUM('pending', 'complete', 'cancel') NOT NULL DEFAULT 'pending';

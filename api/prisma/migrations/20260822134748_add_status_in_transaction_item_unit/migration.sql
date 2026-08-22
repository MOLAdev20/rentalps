-- AlterTable
ALTER TABLE `transaction_item_unit` ADD COLUMN `status` ENUM('playing', 'finished', 'cancel') NOT NULL DEFAULT 'playing';

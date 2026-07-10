/*
  Warnings:

  - Added the required column `end_time` to the `transaction_item_unit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `transaction_item_unit` ADD COLUMN `end_time` DATETIME(3) NOT NULL,
    ADD COLUMN `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

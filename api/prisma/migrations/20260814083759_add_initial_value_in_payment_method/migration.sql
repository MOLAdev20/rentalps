-- AlterTable
ALTER TABLE `transaction` MODIFY `payment_method` ENUM('pending_payment', 'qris', 'cash') NOT NULL DEFAULT 'pending_payment';

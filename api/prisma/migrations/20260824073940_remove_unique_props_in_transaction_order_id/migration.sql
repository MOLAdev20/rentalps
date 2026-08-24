-- AddForeignKey
ALTER TABLE `order_transaction` ADD CONSTRAINT `order_transaction_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

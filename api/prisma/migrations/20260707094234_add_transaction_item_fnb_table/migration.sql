-- CreateTable
CREATE TABLE `transaction_item_fnb` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaction_id` INTEGER NOT NULL,
    `fnb_item_id` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `sub_total` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `transaction_item_fnb` ADD CONSTRAINT `transaction_item_fnb_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transaction`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_item_fnb` ADD CONSTRAINT `transaction_item_fnb_fnb_item_id_fkey` FOREIGN KEY (`fnb_item_id`) REFERENCES `fnb_item`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

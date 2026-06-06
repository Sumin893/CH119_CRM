-- CreateTable
CREATE TABLE `Revenue` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `customerId` INTEGER NULL,
    `category` VARCHAR(100) NOT NULL,
    `amount` INTEGER NOT NULL,
    `paymentMethod` VARCHAR(50) NULL,
    `memo` TEXT NULL,
    `sourceType` VARCHAR(50) NOT NULL DEFAULT 'MANUAL',
    `sourceCustomerId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Revenue_date_idx`(`date`),
    INDEX `Revenue_category_idx`(`category`),
    INDEX `Revenue_paymentMethod_idx`(`paymentMethod`),
    INDEX `Revenue_customerId_idx`(`customerId`),
    UNIQUE INDEX `Revenue_sourceType_sourceCustomerId_key`(`sourceType`, `sourceCustomerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Expense` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATETIME(3) NOT NULL,
    `category` VARCHAR(100) NOT NULL,
    `amount` INTEGER NOT NULL,
    `vendor` VARCHAR(100) NULL,
    `memo` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Expense_date_idx`(`date`),
    INDEX `Expense_category_idx`(`category`),
    INDEX `Expense_vendor_idx`(`vendor`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Revenue` ADD CONSTRAINT `Revenue_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

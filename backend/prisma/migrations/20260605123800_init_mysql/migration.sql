-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Admin_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Customer` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `phoneEncrypted` TEXT NOT NULL,
    `phoneHash` VARCHAR(64) NOT NULL,
    `addressEncrypted` TEXT NOT NULL,
    `productCategory` VARCHAR(50) NOT NULL,
    `productType` VARCHAR(100) NOT NULL,
    `productBrand` VARCHAR(100) NULL,
    `productCount` INTEGER NOT NULL DEFAULT 1,
    `estimateRequestDate` DATETIME(3) NULL,
    `workDate` DATETIME(3) NULL,
    `workStartTime` VARCHAR(5) NULL,
    `workEndTime` VARCHAR(5) NULL,
    `estimatePrice` INTEGER NULL,
    `finalPrice` INTEGER NULL,
    `deposit` INTEGER NULL,
    `balance` INTEGER NULL,
    `paymentMethod` VARCHAR(50) NULL,
    `paymentStatus` VARCHAR(50) NOT NULL,
    `customerStatus` VARCHAR(50) NOT NULL,
    `memo` TEXT NULL,
    `specialNote` TEXT NULL,
    `revisitDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Customer_phoneHash_idx`(`phoneHash`),
    INDEX `Customer_productCategory_idx`(`productCategory`),
    INDEX `Customer_customerStatus_idx`(`customerStatus`),
    INDEX `Customer_paymentStatus_idx`(`paymentStatus`),
    INDEX `Customer_workDate_idx`(`workDate`),
    INDEX `Customer_revisitDate_idx`(`revisitDate`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

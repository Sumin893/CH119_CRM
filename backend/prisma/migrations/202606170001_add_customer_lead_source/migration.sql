ALTER TABLE `Customer` ADD COLUMN `leadSource` VARCHAR(50) NOT NULL DEFAULT '당근';
ALTER TABLE `Customer` ADD COLUMN `referralName` VARCHAR(20) NULL;
CREATE INDEX `Customer_leadSource_idx` ON `Customer`(`leadSource`);

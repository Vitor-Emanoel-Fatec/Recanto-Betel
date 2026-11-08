/*
  Warnings:

  - Added the required column `religion` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ParentBenificiary_beneficiary_id_fkey` ON `parentbenificiary`;

-- DropIndex
DROP INDEX `Relatives_beneficiary_id_fkey` ON `relatives`;

-- AlterTable
ALTER TABLE `beneficiary` ADD COLUMN `addressId` VARCHAR(191) NULL,
    ADD COLUMN `religion` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `streetAddress` VARCHAR(191) NOT NULL,
    `house_number` INTEGER NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `landmark` VARCHAR(191) NULL,
    `housingType` INTEGER NOT NULL,
    `housingCost` DECIMAL(65, 30) NULL,
    `waterCost` DECIMAL(65, 30) NULL,
    `powerCost` DECIMAL(65, 30) NULL,
    `foodCost` DECIMAL(65, 30) NULL,
    `gasCost` DECIMAL(65, 30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Address_beneficiary_id_key`(`beneficiary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Anamnese` ADD CONSTRAINT `Anamnese_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parent` ADD CONSTRAINT `Parent_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Relatives` ADD CONSTRAINT `Relatives_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentBenificiary` ADD CONSTRAINT `ParentBenificiary_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentBenificiary` ADD CONSTRAINT `ParentBenificiary_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Parent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- DropIndex
DROP INDEX `ParentBenificiary_beneficiary_id_fkey` ON `parentbenificiary`;

-- DropIndex
DROP INDEX `Relatives_beneficiary_id_fkey` ON `relatives`;

-- CreateTable
CREATE TABLE `IncomeAndBenefits` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NULL,
    `totalIncome` DECIMAL(65, 30) NOT NULL,
    `perCapitaIncome` DECIMAL(65, 30) NOT NULL,
    `hasGovernmentBenefit` BOOLEAN NOT NULL,
    `benefitName` VARCHAR(191) NULL,
    `benefitValue` DECIMAL(65, 30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IncomeAndBenefits_beneficiary_id_key`(`beneficiary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncomeAndBenefits` ADD CONSTRAINT `IncomeAndBenefits_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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

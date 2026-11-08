/*
  Warnings:

  - Added the required column `story` to the `Beneficiary` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `AuthorizedEscorts_beneficiary_id_fkey` ON `authorizedescorts`;

-- DropIndex
DROP INDEX `ParentBenificiary_beneficiary_id_fkey` ON `parentbenificiary`;

-- DropIndex
DROP INDEX `Relatives_beneficiary_id_fkey` ON `relatives`;

-- AlterTable
ALTER TABLE `beneficiary` ADD COLUMN `story` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `Address` ADD CONSTRAINT `Address_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncomeAndBenefits` ADD CONSTRAINT `IncomeAndBenefits_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AuthorizedEscorts` ADD CONSTRAINT `AuthorizedEscorts_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

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

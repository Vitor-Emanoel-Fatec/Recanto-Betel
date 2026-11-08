/*
  Warnings:

  - You are about to alter the column `relation` on the `relatives` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropIndex
DROP INDEX `ParentBenificiary_beneficiary_id_fkey` ON `parentbenificiary`;

-- DropIndex
DROP INDEX `Relatives_beneficiary_id_fkey` ON `relatives`;

-- AlterTable
ALTER TABLE `relatives` MODIFY `relation` INTEGER NOT NULL;

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

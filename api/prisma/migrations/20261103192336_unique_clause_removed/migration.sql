-- DropForeignKey
ALTER TABLE `parentbenificiary` DROP FOREIGN KEY `ParentBenificiary_beneficiary_id_fkey`;

-- DropIndex
DROP INDEX `ParentBenificiary_beneficiary_id_key` ON `parentbenificiary`;

-- AddForeignKey
ALTER TABLE `ParentBenificiary` ADD CONSTRAINT `ParentBenificiary_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

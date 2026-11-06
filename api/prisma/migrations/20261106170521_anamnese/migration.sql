/*
  Warnings:

  - You are about to drop the `health_info` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX `ParentBenificiary_beneficiary_id_fkey` ON `parentbenificiary`;

-- DropTable
DROP TABLE `health_info`;

-- CreateTable
CREATE TABLE `Anamnese` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `mainComplaintEvolution` TEXT NOT NULL,
    `suffersFromDisease` BOOLEAN NOT NULL,
    `diseaseDescription` VARCHAR(191) NULL,
    `underMedicalTreatment` BOOLEAN NOT NULL,
    `isPregnant` BOOLEAN NOT NULL DEFAULT false,
    `usesMedication` BOOLEAN NOT NULL,
    `medicationDescription` VARCHAR(191) NULL,
    `attendingPhysicianName` VARCHAR(191) NULL,
    `attendingPhysicianPhone` VARCHAR(191) NULL,
    `hasAllergies` BOOLEAN NOT NULL,
    `allergiesDescription` VARCHAR(191) NULL,
    `hasHadSurgery` BOOLEAN NOT NULL,
    `surgeriesDescription` VARCHAR(191) NULL,
    `healingProblems` BOOLEAN NOT NULL,
    `anesthesiaProblems` BOOLEAN NOT NULL,
    `hemorrhageProblems` BOOLEAN NOT NULL,
    `rheumaticFever` BOOLEAN NOT NULL DEFAULT false,
    `heartProblems` BOOLEAN NOT NULL DEFAULT false,
    `kidneyProblems` BOOLEAN NOT NULL DEFAULT false,
    `gastricProblems` BOOLEAN NOT NULL DEFAULT false,
    `respiratoryProblems` BOOLEAN NOT NULL DEFAULT false,
    `allergicProblems` BOOLEAN NOT NULL DEFAULT false,
    `jointRheumatismProblems` BOOLEAN NOT NULL DEFAULT false,
    `diabetes` BOOLEAN NOT NULL DEFAULT false,
    `arterialHypertension` BOOLEAN NOT NULL DEFAULT false,
    `habits` TEXT NULL,
    `familyHistory` TEXT NULL,
    `otherInformation` TEXT NULL,
    `city` VARCHAR(191) NOT NULL DEFAULT 'Tatuí',
    `fillingDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `legalGuardianSignature` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Anamnese_beneficiary_id_key`(`beneficiary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Anamnese` ADD CONSTRAINT `Anamnese_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Parent` ADD CONSTRAINT `Parent_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentBenificiary` ADD CONSTRAINT `ParentBenificiary_beneficiary_id_fkey` FOREIGN KEY (`beneficiary_id`) REFERENCES `Beneficiary`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ParentBenificiary` ADD CONSTRAINT `ParentBenificiary_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `Parent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

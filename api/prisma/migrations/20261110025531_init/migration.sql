-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'USER',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Beneficiary` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `birthday` DATE NOT NULL,
    `rg` INTEGER NOT NULL,
    `cpf` INTEGER NOT NULL,
    `school` VARCHAR(191) NOT NULL,
    `period` VARCHAR(191) NOT NULL,
    `religion` VARCHAR(191) NOT NULL,
    `story` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `addressId` VARCHAR(191) NULL,

    UNIQUE INDEX `Beneficiary_cpf_key`(`cpf`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Address` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `streetAddress` VARCHAR(191) NOT NULL,
    `house_number` INTEGER NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `landmark` VARCHAR(191) NULL,
    `housingType` INTEGER NOT NULL,
    `housingCost` DECIMAL(10, 2) NULL,
    `waterCost` DECIMAL(10, 2) NULL,
    `powerCost` DECIMAL(10, 2) NULL,
    `foodCost` DECIMAL(10, 2) NULL,
    `gasCost` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Address_beneficiary_id_key`(`beneficiary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `IncomeAndBenefits` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `nis` VARCHAR(191) NULL,
    `totalIncome` DECIMAL(10, 2) NOT NULL,
    `perCapitaIncome` DECIMAL(10, 2) NOT NULL,
    `hasGovernmentBenefit` BOOLEAN NOT NULL,
    `benefitName` VARCHAR(191) NULL,
    `benefitValue` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `IncomeAndBenefits_beneficiary_id_key`(`beneficiary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuthorizedEscorts` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `relation` INTEGER NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Anamnese_beneficiary_id_key`(`beneficiary_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Parent` (
    `id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NULL,
    `name` VARCHAR(191) NOT NULL,
    `cpf` INTEGER NOT NULL,
    `contact` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `profession` VARCHAR(191) NULL,
    `educational_level` VARCHAR(191) NULL,
    `comertial_address` VARCHAR(191) NULL,
    `salary` DECIMAL(10, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Parent_user_id_key`(`user_id`),
    UNIQUE INDEX `Parent_cpf_key`(`cpf`),
    UNIQUE INDEX `Parent_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Relatives` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `birthday` DATETIME(3) NOT NULL,
    `relation` INTEGER NOT NULL,
    `salary` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ParentBenificiary` (
    `id` VARCHAR(191) NOT NULL,
    `beneficiary_id` VARCHAR(191) NOT NULL,
    `parent_id` VARCHAR(191) NOT NULL,
    `relationshipType` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ParentBenificiary_parent_id_key`(`parent_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

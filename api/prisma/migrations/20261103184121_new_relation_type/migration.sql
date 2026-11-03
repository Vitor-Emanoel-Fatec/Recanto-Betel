/*
  Warnings:

  - You are about to alter the column `relationshipType` on the `parentbenificiary` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `beneficiary` MODIFY `birthday` DATE NOT NULL;

-- AlterTable
ALTER TABLE `parentbenificiary` MODIFY `relationshipType` INTEGER NOT NULL;

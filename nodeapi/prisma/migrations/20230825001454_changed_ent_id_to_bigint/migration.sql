/*
  Warnings:

  - The primary key for the `entities` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE `transactions`
    DROP FOREIGN KEY `transactions_ibfk_1`;

-- AlterTable
ALTER TABLE `entities`
    DROP PRIMARY KEY,
    MODIFY `entity_id` BIGINT NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`entity_id`);

-- AlterTable
ALTER TABLE `transactions`
    MODIFY `entities_entity_id` BIGINT NULL;

-- AddForeignKey
ALTER TABLE `transactions`
    ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`entities_entity_id`) REFERENCES `entities` (`entity_id`) ON DELETE SET NULL ON UPDATE NO ACTION;

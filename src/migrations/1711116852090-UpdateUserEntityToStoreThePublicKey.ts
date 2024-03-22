import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserEntityToStoreThePublicKey1711116852090 implements MigrationInterface {
    name = 'UpdateUserEntityToStoreThePublicKey1711116852090'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "publicKey" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "publicKey"`);
    }

}

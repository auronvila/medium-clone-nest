import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateWalletAddressAndUserRelation1711116677848 implements MigrationInterface {
    name = 'UpdateWalletAddressAndUserRelation1711116677848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "publicKey" character varying NOT NULL, "privateKey" character varying NOT NULL, "userId" uuid, CONSTRAINT "REL_2ecdb33f23e9a6fc392025c0b9" UNIQUE ("userId"), CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "walletAddress"`);
        await queryRunner.query(`ALTER TABLE "wallets" ADD CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "wallets" DROP CONSTRAINT "FK_2ecdb33f23e9a6fc392025c0b97"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "walletAddress" character varying`);
        await queryRunner.query(`DROP TABLE "wallets"`);
    }

}

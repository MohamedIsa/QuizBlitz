import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1777680000000 implements MigrationInterface {
  name = 'CreateUsersTable1777680000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id"            uuid                NOT NULL DEFAULT gen_random_uuid(),
        "email"         character varying(320) NOT NULL,
        "password_hash" character varying   NOT NULL,
        "created_at"    TIMESTAMP           NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP           NOT NULL DEFAULT now(),
        "deleted_at"    TIMESTAMP,
        CONSTRAINT "pk_users" PRIMARY KEY ("id"),
        CONSTRAINT "uq_users_email" UNIQUE ("email")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_users_email" ON "users" ("email")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}

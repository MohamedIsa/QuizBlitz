import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzes1778300000000 implements MigrationInterface {
  name = 'CreateQuizzes1778300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "quiz_status_enum" AS ENUM ('draft', 'published')`,
    );
    await queryRunner.query(`
      CREATE TABLE "quizzes" (
        "id"              uuid                    NOT NULL DEFAULT gen_random_uuid(),
        "title"           character varying(150)  NOT NULL,
        "description"     text,
        "status"          "quiz_status_enum"      NOT NULL DEFAULT 'draft',
        "cover_image_url" character varying(500),
        "host_id"         uuid                    NOT NULL,
        "created_at"      timestamptz             NOT NULL DEFAULT now(),
        "updated_at"      timestamptz             NOT NULL DEFAULT now(),
        "deleted_at"      timestamptz,
        CONSTRAINT "pk_quizzes" PRIMARY KEY ("id"),
        CONSTRAINT "fk_quizzes_host"
          FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_quizzes_host_id" ON "quizzes" ("host_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_quizzes_host_id"`);
    await queryRunner.query(`DROP TABLE "quizzes"`);
    // TypeORM auto-generation often omits this — the enum type must be dropped
    // explicitly after the table that references it is gone.
    await queryRunner.query(`DROP TYPE "quiz_status_enum"`);
  }
}

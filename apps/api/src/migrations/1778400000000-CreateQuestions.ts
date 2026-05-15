import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuestions1778400000000 implements MigrationInterface {
  name = 'CreateQuestions1778400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "questions" (
        "id"                   uuid                    NOT NULL DEFAULT gen_random_uuid(),
        "text"                 text                    NOT NULL,
        "options"              jsonb                   NOT NULL,
        "correct_option_index" smallint                NOT NULL,
        "time_limit"           smallint                NOT NULL DEFAULT 30,
        "order_index"          smallint                NOT NULL,
        "image_url"            character varying(500),
        "quiz_id"              uuid                    NOT NULL,
        "created_at"           timestamptz             NOT NULL DEFAULT now(),
        "updated_at"           timestamptz             NOT NULL DEFAULT now(),
        "deleted_at"           timestamptz,
        CONSTRAINT "pk_questions" PRIMARY KEY ("id"),
        CONSTRAINT "fk_questions_quiz"
          FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "idx_questions_quiz_id" ON "questions" ("quiz_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_questions_quiz_id"`);
    await queryRunner.query(`DROP TABLE "questions"`);
  }
}

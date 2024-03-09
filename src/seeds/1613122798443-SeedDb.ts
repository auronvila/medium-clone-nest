import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1613122798443 implements MigrationInterface {
  name = 'SeedDb1613122798443';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `INSERT INTO tags (name)
       VALUES ('dragons'),
              ('react')`,
    );

    // Insert the user
    await queryRunner.query(`INSERT INTO users (username, email, password)
                             VALUES ('auronvila', 'auronvila.dev@gmail.com',
                                     '$2b$10$z.T7Ng.jaK8J72d7x/GfJOk9SktoGnLZzZ0WVR43ea/5P6a0RU.AO')`);

    // Retrieve the inserted user's UUID
    const userResult = await queryRunner.query(`SELECT id
                                                FROM users
                                                WHERE username = 'auronvila' LIMIT 1`);
    const userId = userResult[0].id;

    // Insert articles using the retrieved UUID
    await queryRunner.query(`INSERT INTO articles (slug, title, description, body, "tagList", "authorId")
                             VALUES ('first-article', 'first article', 'first article desction', 'first article body',
                                     'react,ts', '${userId}'),
                                    ('first-article2', 'first article2', 'first article desction2',
                                     'first article body2',
                                     'react,ts', '${userId}')`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
  }
}

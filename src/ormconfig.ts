import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { TagEntity } from '@app/tag/tag.entity';


const config: PostgresConnectionOptions = {
  type: 'postgres',
  port: 5432,
  username: 'postgres',
  password: '1',
  database: 'medium-clone',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  migrations: [__dirname + '/migrations/**/*{.ts,.js}'],
};

export default config;
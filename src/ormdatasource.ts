import { DataSource } from 'typeorm';
import ormconfig from '@app/ormconfig';
import ormseedconfig from '@app/ormseedconfig';

export default new DataSource(ormconfig);
export * from './account-user.entity';

import { AccountUserEntity } from './account-user.entity';

export const accountMysqlEntities = [AccountUserEntity] as const;

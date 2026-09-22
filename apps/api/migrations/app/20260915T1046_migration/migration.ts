#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/158e641ef13a6bbfa372248dd48f2637116401af8163ba1659629058c5c605ee/contract';
import startContract from '../../snapshots/158e641ef13a6bbfa372248dd48f2637116401af8163ba1659629058c5c605ee/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/4b7cd0506b8fa325c8c53f09a821e78ba8af27922be4922ff1767a28a6dc200a/contract';
import endContract from '../../snapshots/4b7cd0506b8fa325c8c53f09a821e78ba8af27922be4922ff1767a28a6dc200a/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

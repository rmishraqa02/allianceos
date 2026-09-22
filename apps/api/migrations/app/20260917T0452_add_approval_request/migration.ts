#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/849597b2555adb38fda33dc01b4192502afa903dd6eb608d87930f1608a9a99f/contract';
import endContract from '../../snapshots/849597b2555adb38fda33dc01b4192502afa903dd6eb608d87930f1608a9a99f/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/f9d7f12465e3ec70275068710b3a0fe4d9489b4c490e5748ca4b4d4ffe3a4955/contract';
import startContract from '../../snapshots/f9d7f12465e3ec70275068710b3a0fe4d9489b4c490e5748ca4b4d4ffe3a4955/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'approvalRequest',
        columns: [
          col('comments', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('entityId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('entityType', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('requestedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('requestedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('reviewedAt', 'timestamptz', { codecRef: { codecId: 'pg/timestamptz-string@1' } }),
          col('reviewedBy', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('PENDING'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'deal',
        column: col('currency', 'text', {
          notNull: true,
          default: lit('USD'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'deal',
        column: col('expectedCloseDate', 'timestamptz', {
          codecRef: { codecId: 'pg/timestamptz-temporal@1' },
        }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'deal',
        column: col('partnerRole', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'deal',
        column: col('product', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'deal',
        column: col('status', 'text', {
          notNull: true,
          default: lit('DRAFT'),
          codecRef: { codecId: 'pg/text@1' },
        }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'approvalRequest',
        index: 'approvalRequest_entityType_entityId_idx_ea0fa809',
        columns: ['entityType', 'entityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'approvalRequest',
        index: 'approvalRequest_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'approvalRequest',
        index: 'approvalRequest_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'deal',
        index: 'deal_stage_idx_51755035',
        columns: ['stage'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'deal',
        index: 'deal_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'approvalRequest',
        foreignKey: {
          name: 'approvalRequest_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

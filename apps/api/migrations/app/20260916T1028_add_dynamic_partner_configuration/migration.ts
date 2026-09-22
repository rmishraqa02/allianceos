#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/aa06a288fbf195ab3c98c66ec3e1856860a650ba45a4b9de6b5222affe279a5f/contract';
import startContract from '../../snapshots/aa06a288fbf195ab3c98c66ec3e1856860a650ba45a4b9de6b5222affe279a5f/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/f9d7f12465e3ec70275068710b3a0fe4d9489b4c490e5748ca4b4d4ffe3a4955/contract';
import endContract from '../../snapshots/f9d7f12465e3ec70275068710b3a0fe4d9489b4c490e5748ca4b4d4ffe3a4955/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'partnerCapability',
        columns: [
          col('capabilityId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('partnerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['partnerId', 'capabilityId'])],
      }),
      this.addColumn({
        schema: 'public',
        table: 'partner',
        column: col('industryId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'partner',
        column: col('partnerTypeId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'partner',
        column: col('regionId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'partner',
        column: col('statusId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addColumn({
        schema: 'public',
        table: 'partner',
        column: col('tierId', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.createIndex({
        schema: 'public',
        table: 'partner',
        index: 'partner_industryId_idx_8d9a9547',
        columns: ['industryId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partner',
        index: 'partner_partnerTypeId_idx_ce7c36ff',
        columns: ['partnerTypeId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partner',
        index: 'partner_regionId_idx_f44e49e6',
        columns: ['regionId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partner',
        index: 'partner_statusId_idx_e5a44bce',
        columns: ['statusId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partner',
        index: 'partner_tierId_idx_b5726123',
        columns: ['tierId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partnerCapability',
        index: 'partnerCapability_capabilityId_idx_af7bb943',
        columns: ['capabilityId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partnerCapability',
        index: 'partnerCapability_partnerId_idx_bf5b312c',
        columns: ['partnerId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partner',
        foreignKey: {
          name: 'partner_industryId_fkey',
          columns: ['industryId'],
          references: { schema: 'public', table: 'industry', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partner',
        foreignKey: {
          name: 'partner_partnerTypeId_fkey',
          columns: ['partnerTypeId'],
          references: { schema: 'public', table: 'partnerType', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partner',
        foreignKey: {
          name: 'partner_regionId_fkey',
          columns: ['regionId'],
          references: { schema: 'public', table: 'region', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partner',
        foreignKey: {
          name: 'partner_statusId_fkey',
          columns: ['statusId'],
          references: { schema: 'public', table: 'partnerStatus', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partner',
        foreignKey: {
          name: 'partner_tierId_fkey',
          columns: ['tierId'],
          references: { schema: 'public', table: 'partnerTier', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partnerCapability',
        foreignKey: {
          name: 'partnerCapability_partnerId_fkey',
          columns: ['partnerId'],
          references: { schema: 'public', table: 'partner', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'partnerCapability',
        foreignKey: {
          name: 'partnerCapability_capabilityId_fkey',
          columns: ['capabilityId'],
          references: { schema: 'public', table: 'capability', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

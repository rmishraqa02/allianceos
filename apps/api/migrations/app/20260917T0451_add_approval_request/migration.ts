#!/usr/bin/env -S node
import type { Contract as Start } from '../../snapshots/158e641ef13a6bbfa372248dd48f2637116401af8163ba1659629058c5c605ee/contract';
import startContract from '../../snapshots/158e641ef13a6bbfa372248dd48f2637116401af8163ba1659629058c5c605ee/contract.json' with { type: 'json' };
import type { Contract as End } from '../../snapshots/849597b2555adb38fda33dc01b4192502afa903dd6eb608d87930f1608a9a99f/contract';
import endContract from '../../snapshots/849597b2555adb38fda33dc01b4192502afa903dd6eb608d87930f1608a9a99f/contract.json' with { type: 'json' };
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
      this.createTable({
        schema: 'public',
        table: 'capability',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'industry',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'partnerCapability',
        columns: [
          col('capabilityId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('partnerId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['partnerId', 'capabilityId'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'partnerStatus',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'partnerTier',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'partnerType',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.createTable({
        schema: 'public',
        table: 'region',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('isActive', 'bool', {
            notNull: true,
            default: lit(true),
            codecRef: { codecId: 'pg/bool@1' },
          }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('sortOrder', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('tenantId', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
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
      this.addColumn({
        schema: 'public',
        table: 'user',
        column: col('password', 'text', { codecRef: { codecId: 'pg/text@1' } }),
      }),
      this.addUnique({
        schema: 'public',
        table: 'capability',
        constraint: 'capability_tenantId_name_key',
        columns: ['tenantId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'industry',
        constraint: 'industry_tenantId_name_key',
        columns: ['tenantId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'partnerStatus',
        constraint: 'partnerStatus_tenantId_name_key',
        columns: ['tenantId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'partnerTier',
        constraint: 'partnerTier_tenantId_name_key',
        columns: ['tenantId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'partnerType',
        constraint: 'partnerType_tenantId_name_key',
        columns: ['tenantId', 'name'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'region',
        constraint: 'region_tenantId_name_key',
        columns: ['tenantId', 'name'],
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
        table: 'capability',
        index: 'capability_tenantId_idx_c93ed4f1',
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
      this.createIndex({
        schema: 'public',
        table: 'industry',
        index: 'industry_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
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
      this.createIndex({
        schema: 'public',
        table: 'partnerStatus',
        index: 'partnerStatus_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partnerTier',
        index: 'partnerTier_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'partnerType',
        index: 'partnerType_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'region',
        index: 'region_tenantId_idx_c93ed4f1',
        columns: ['tenantId'],
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
      this.addForeignKey({
        schema: 'public',
        table: 'capability',
        foreignKey: {
          name: 'capability_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'industry',
        foreignKey: {
          name: 'industry_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
        },
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
      this.addForeignKey({
        schema: 'public',
        table: 'partnerStatus',
        foreignKey: {
          name: 'partnerStatus_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
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
        table: 'partnerTier',
        foreignKey: {
          name: 'partnerTier_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
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
        table: 'partnerType',
        foreignKey: {
          name: 'partnerType_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
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
        table: 'region',
        foreignKey: {
          name: 'region_tenantId_fkey',
          columns: ['tenantId'],
          references: { schema: 'public', table: 'tenant', columns: ['id'] },
          onDelete: 'cascade',
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
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

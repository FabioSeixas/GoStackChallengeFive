import { MigrationInterface, QueryRunner, TableForeignKey } from 'typeorm';

export default class RelationTransactionCategory1601168361330
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createForeignKey(
      'transactions',
      new TableForeignKey({
        name: 'TransactionCategory',
        columnNames: ['category'],
        referencedColumnNames: ['title'],
        referencedTableName: 'categories',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('transactions', 'TransactionCategory');
  }
}

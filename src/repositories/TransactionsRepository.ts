import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income = await this.find({ where: { type: 'income' } });
    const totalIncome = income.reduce(
      (accumulated, current) => accumulated + current.value,
      0,
    );
    const outcome = await this.find({ where: { type: 'outcome' } });
    const totalOutcome = outcome.reduce(
      (accumulated, current) => accumulated + current.value,
      0,
    );

    return {
      income: totalIncome,
      outcome: totalOutcome,
      total: totalIncome - totalOutcome,
    };
  }
}

export default TransactionsRepository;

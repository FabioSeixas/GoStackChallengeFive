import { getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface RequestDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    category,
    type,
    title,
    value,
  }: RequestDTO): Promise<Transaction> {
    const transactionsRepo = getRepository(Transaction);
    const categoriesRepo = getRepository(Category);

    let transactionCategory = await categoriesRepo.findOne({ title: category });

    if (!transactionCategory) {
      transactionCategory = categoriesRepo.create({
        title: category,
      });

      await categoriesRepo.save(transactionCategory);
    }

    const newTransaction = transactionsRepo.create({
      title,
      type,
      value,
      category: transactionCategory,
    });

    await transactionsRepo.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;

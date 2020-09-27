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

    const categoryExists = await categoriesRepo.findOne({ title: category });

    if (!categoryExists) {
      const newCategory = categoriesRepo.create({
        title: category,
      });

      await categoriesRepo.save(newCategory);
    }

    const newTransaction = transactionsRepo.create({
      title,
      type,
      value,
      category,
    });

    await transactionsRepo.save(newTransaction);

    return newTransaction;
  }
}

export default CreateTransactionService;

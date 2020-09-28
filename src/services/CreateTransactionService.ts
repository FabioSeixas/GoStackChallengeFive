import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TranscationRepository from '../repositories/TransactionsRepository';
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
    const transactionsRepo = getCustomRepository(TranscationRepository);
    const categoriesRepo = getRepository(Category);

    const { total } = await transactionsRepo.getBalance();

    if (type === 'outcome' && value > total) {
      throw new AppError('Outcome value is above the balance');
    }

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

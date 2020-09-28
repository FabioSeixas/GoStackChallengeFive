import { getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import TransactionRepository from '../repositories/TransactionsRepository';

interface RequestDTO {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: RequestDTO): Promise<void> {
    const transactionRepo = getCustomRepository(TransactionRepository);

    const transaction = transactionRepo.findOne({ id });

    if (!transaction) {
      throw new AppError('Transaction id not found');
    }

    await transactionRepo.delete({ id });
  }
}

export default DeleteTransactionService;

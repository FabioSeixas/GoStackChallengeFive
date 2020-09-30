import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';
import { getRepository, getCustomRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import uploadConfig from '../config/upload';
import TransactionRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface FileDTO {
  file: string;
}

interface TransactionCSV {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

async function loadCSV(filePath: string): Promise<TransactionCSV[]> {
  const readCSVStream = fs.createReadStream(filePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const lines: TransactionCSV[] = [];

  const parseCSV = readCSVStream.pipe(parseStream);

  parseCSV.on('data', async line => {
    const [title, type, value, category] = await line;
    lines.push({ title, type, value, category });
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}

class ImportTransactionsService {
  async execute({ file }: FileDTO): Promise<Transaction[]> {
    const csvFilePath = path.resolve(uploadConfig.directory, file);

    const data = await loadCSV(csvFilePath);

    fs.unlink(csvFilePath, err => {
      if (err) {
        console.error(err);
      }
    });

    const transactionsRepo = getCustomRepository(TransactionRepository);
    const categoriesRepo = getRepository(Category);

    // Check for outcome value > total
    const { total } = await transactionsRepo.getBalance();

    const balanceAfter = data.reduce((accumulated, current) => {
      const { type } = current;
      const value = Number(current.value);

      if (type === 'outcome' && value > accumulated) {
        throw new AppError('Outcome valor higher than total', 400);
      }

      if (type === 'outcome') {
        return accumulated - value;
      }

      return accumulated + value;
    }, total);

    // Categories
    const categories = data.map(transaction => transaction.category);

    const existingCategories = await categoriesRepo.find({
      where: { title: In(categories) },
    });

    const existingCategoriesTitles = existingCategories.map(
      (category: Category) => category.title,
    );

    const categoriesToAdd = categories
      .filter(category => !existingCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoriesRepo.create(
      categoriesToAdd.map(title => ({
        title,
      })),
    );

    await categoriesRepo.save(newCategories);

    const finalCategories = [...newCategories, ...existingCategories];

    // Transactions
    const newTransactions = transactionsRepo.create(
      data.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: finalCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionsRepo.save(newTransactions);

    return newTransactions;
  }
}

export default ImportTransactionsService;

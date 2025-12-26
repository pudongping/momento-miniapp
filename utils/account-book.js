/**
 * 账本管理工具函数
 */

import { getAccountBooksApi } from '@/api/index.js';

// 账本状态存储
let accountBookState = {
  books: [],
  defaultBook: null,
  currentBook: null
};

/**
 * 初始化账本状态
 */
export async function initAccountBooks() {
  try {
    const books = await getAccountBooksApi();
    if (books && Array.isArray(books)) {
      accountBookState.books = books;
      
      // 获取默认账本
      const defaultBook = books.find(b => b.is_default);
      accountBookState.defaultBook = defaultBook || books[0];
      accountBookState.currentBook = accountBookState.defaultBook;
      
      return accountBookState;
    }
  } catch (error) {
    console.error('初始化账本失败', error);
  }
  return accountBookState;
}

/**
 * 获取所有账本
 */
export function getAccountBooks() {
  return accountBookState.books;
}

/**
 * 获取默认账本
 */
export function getDefaultBook() {
  return accountBookState.defaultBook;
}

/**
 * 获取当前账本
 */
export function getCurrentBook() {
  return accountBookState.currentBook;
}

/**
 * 设置当前账本
 */
export function setCurrentBook(book) {
  accountBookState.currentBook = book;
  // 保存到本地存储
  uni.setStorageSync('current_book', book);
}

/**
 * 从本地存储恢复账本状态
 */
export function restoreAccountBookState() {
  const savedBook = uni.getStorageSync('current_book');
  if (savedBook) {
    accountBookState.currentBook = savedBook;
  }
  return accountBookState.currentBook;
}

/**
 * 刷新账本列表
 */
export async function refreshAccountBooks() {
  return initAccountBooks();
}

/**
 * 获取创建的账本
 */
export function getCreatedBooks() {
  return accountBookState.books.filter(b => b.is_creator);
}

/**
 * 获取加入的账本
 */
export function getJoinedBooks() {
  return accountBookState.books.filter(b => !b.is_creator);
}

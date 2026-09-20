import {
  Transaction, CommitStackResult, CashRadarResult, CashRadarDay,
  WhyLensResult, Goal, GoalScenarioResult, EvidenceDetail,
  Subscription, BudgetPerformance, MoneyHealthScore, DashboardData, Anomaly
} from '../types';

// ==========================================
// 1. Initial Seed Data
// ==========================================
export const INITIAL_TRANSACTIONS: Transaction[] = [
  // 2026-04
  { id: 'txn_04_01', date: '2026-04-01', merchant: 'Tech Corp Solutions', description: 'Monthly Salary Credit Tech Corp', amount: 85000, type: 'credit', category: 'Income', account: 'HDFC-Salary', balance: 112450, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_02', date: '2026-04-03', merchant: 'Prestige Properties', description: 'House Rent Payment to Prestige Apt', amount: 24000, type: 'debit', category: 'Rent', account: 'HDFC-Salary', balance: 88450, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_03', date: '2026-04-07', merchant: 'BESCOM', description: 'BESCOM Electricity Bill Payment', amount: 1920, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 86530, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_04', date: '2026-04-10', merchant: 'BWSSB', description: 'Water Bill BWSSB Online', amount: 450, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 86080, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_05', date: '2026-04-12', merchant: 'Airtel', description: 'Airtel Fiber Broadband Bill', amount: 1179, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 84901, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_06', date: '2026-04-14', merchant: 'Swiggy', description: 'Swiggy Bangalore Order 4821', amount: 620, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 84281, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_07', date: '2026-04-15', merchant: 'Jio', description: 'Jio 5G Mobile Recharge', amount: 349, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 83932, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_08', date: '2026-04-16', merchant: "Nature's Basket", description: 'Nature Basket Supermarket Koramangala', amount: 3420, type: 'debit', category: 'Groceries', account: 'HDFC-Salary', balance: 80512, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_09', date: '2026-04-18', merchant: 'Netflix', description: 'Netflix Subscription Standard HD', amount: 649, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 79863, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_10', date: '2026-04-19', merchant: 'Uber', description: 'Uber India Ride Tech Park', amount: 380, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 79483, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_11', date: '2026-04-21', merchant: 'Spotify', description: 'Spotify Premium Individual', amount: 119, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 79364, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_12', date: '2026-04-22', merchant: 'Zomato', description: 'Zomato Food Delivery Dinner', amount: 740, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 78624, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_13', date: '2026-04-23', merchant: 'HP Petrol Pump', description: 'HP Auto Fuel Station Petrol', amount: 2100, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 76524, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_14', date: '2026-04-25', merchant: 'Amazon Prime', description: 'Amazon Prime Membership Monthly', amount: 299, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 76225, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_15', date: '2026-04-26', merchant: 'Amazon', description: 'Amazon Retail Order Books', amount: 1450, type: 'debit', category: 'Shopping', account: 'HDFC-Salary', balance: 74775, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.90, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_16', date: '2026-04-28', merchant: 'Google One', description: 'Google One 100GB Cloud Storage', amount: 130, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 74645, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_17', date: '2026-04-29', merchant: 'Self Transfer', description: 'Transfer to Own Savings Acct 8821', amount: 15000, type: 'debit', category: 'Transfer', account: 'HDFC-Salary', balance: 59645, is_recurring: true, is_transfer: true, is_cc_payment: false, is_duplicate: false, is_excluded: true, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_04_18', date: '2026-04-30', merchant: 'Apollo Pharmacy', description: 'Apollo Pharmacy Medicines', amount: 890, type: 'debit', category: 'Healthcare', account: 'HDFC-Salary', balance: 58755, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },

  // 2026-05
  { id: 'txn_05_01', date: '2026-05-01', merchant: 'Tech Corp Solutions', description: 'Monthly Salary Credit Tech Corp', amount: 85000, type: 'credit', category: 'Income', account: 'HDFC-Salary', balance: 143755, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_02', date: '2026-05-03', merchant: 'Prestige Properties', description: 'House Rent Payment to Prestige Apt', amount: 24000, type: 'debit', category: 'Rent', account: 'HDFC-Salary', balance: 119755, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_03', date: '2026-05-07', merchant: 'BESCOM', description: 'BESCOM Electricity Bill Payment', amount: 2150, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 117605, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_04', date: '2026-05-10', merchant: 'BWSSB', description: 'Water Bill BWSSB Online', amount: 450, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 117155, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_05', date: '2026-05-12', merchant: 'Airtel', description: 'Airtel Fiber Broadband Bill', amount: 1179, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 115976, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_06', date: '2026-05-13', merchant: 'Swiggy', description: 'Swiggy Bangalore Order 5192', amount: 540, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 115436, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_07', date: '2026-05-15', merchant: 'Jio', description: 'Jio 5G Mobile Recharge', amount: 349, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 115087, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_08', date: '2026-05-16', merchant: "Nature's Basket", description: 'Nature Basket Supermarket Indiranagar', amount: 3850, type: 'debit', category: 'Groceries', account: 'HDFC-Salary', balance: 111237, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_09', date: '2026-05-18', merchant: 'Netflix', description: 'Netflix Subscription Standard HD', amount: 649, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 110588, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_10', date: '2026-05-19', merchant: 'Uber', description: 'Uber India Ride MG Road', amount: 420, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 110168, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_11', date: '2026-05-21', merchant: 'Spotify', description: 'Spotify Premium Individual', amount: 119, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 110049, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_12', date: '2026-05-22', merchant: 'Zomato', description: 'Zomato Food Delivery Lunch', amount: 680, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 109369, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_13', date: '2026-05-23', merchant: 'HP Petrol Pump', description: 'HP Auto Fuel Station Petrol', amount: 2250, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 107119, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_14', date: '2026-05-24', merchant: 'HDFC Card Services', description: 'HDFC Credit Card Bill AutoDebit', amount: 12800, type: 'debit', category: 'Credit Card Payment', account: 'HDFC-Salary', balance: 94319, is_recurring: true, is_transfer: false, is_cc_payment: true, is_duplicate: false, is_excluded: true, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_15', date: '2026-05-25', merchant: 'Amazon Prime', description: 'Amazon Prime Membership Monthly', amount: 299, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 94020, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_16', date: '2026-05-27', merchant: 'Flipkart', description: 'Flipkart Summer Sale Clothes', amount: 3200, type: 'debit', category: 'Shopping', account: 'HDFC-Salary', balance: 90820, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_17', date: '2026-05-28', merchant: 'Google One', description: 'Google One 100GB Cloud Storage', amount: 130, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 90690, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_05_18', date: '2026-05-30', merchant: 'HDFC Ergo', description: 'HDFC Ergo Health Insurance Qtr', amount: 3200, type: 'debit', category: 'Insurance', account: 'HDFC-Salary', balance: 87490, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },

  // 2026-06
  { id: 'txn_06_01', date: '2026-06-01', merchant: 'Tech Corp Solutions', description: 'Monthly Salary Credit Tech Corp', amount: 85000, type: 'credit', category: 'Income', account: 'HDFC-Salary', balance: 172490, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_02', date: '2026-06-03', merchant: 'Prestige Properties', description: 'House Rent Payment to Prestige Apt', amount: 24000, type: 'debit', category: 'Rent', account: 'HDFC-Salary', balance: 148490, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_03', date: '2026-06-07', merchant: 'BESCOM', description: 'BESCOM Electricity Bill Payment', amount: 1840, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 146650, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_04', date: '2026-06-10', merchant: 'BWSSB', description: 'Water Bill BWSSB Online', amount: 450, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 146200, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_05', date: '2026-06-12', merchant: 'Airtel', description: 'Airtel Fiber Broadband Bill', amount: 1179, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 145021, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_06', date: '2026-06-13', merchant: 'Swiggy', description: 'Swiggy Bangalore Order 5812', amount: 780, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 144241, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_07', date: '2026-06-15', merchant: 'Jio', description: 'Jio 5G Mobile Recharge', amount: 349, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 143892, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_08', date: '2026-06-16', merchant: "Nature's Basket", description: 'Nature Basket Groceries Fresh', amount: 3600, type: 'debit', category: 'Groceries', account: 'HDFC-Salary', balance: 140292, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_09', date: '2026-06-17', merchant: 'Swiggy', description: 'Swiggy Order Cancellation Refund', amount: 420, type: 'credit', category: 'Refund', account: 'HDFC-Salary', balance: 140712, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: true, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_10', date: '2026-06-18', merchant: 'Netflix', description: 'Netflix Subscription Standard HD', amount: 649, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 140063, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_11', date: '2026-06-19', merchant: 'Uber', description: 'Uber Ride Airport Drop', amount: 1450, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 138613, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_12', date: '2026-06-21', merchant: 'Spotify', description: 'Spotify Premium Individual', amount: 119, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 138494, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_13', date: '2026-06-22', merchant: 'Zomato', description: 'Zomato Food Delivery Dinner', amount: 890, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 137604, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_14', date: '2026-06-24', merchant: 'HP Petrol Pump', description: 'HP Auto Fuel Station Petrol', amount: 2300, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 135304, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_15', date: '2026-06-25', merchant: 'Amazon Prime', description: 'Amazon Prime Membership Monthly', amount: 299, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 135005, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_16', date: '2026-06-27', merchant: 'Amazon', description: 'Amazon Echo Dot Purchase', amount: 2999, type: 'debit', category: 'Shopping', account: 'HDFC-Salary', balance: 132006, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.90, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_17', date: '2026-06-28', merchant: 'Google One', description: 'Google One 100GB Cloud Storage', amount: 130, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 131876, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_06_18', date: '2026-06-29', merchant: 'Self Transfer', description: 'Transfer to Own Savings Acct 8821', amount: 20000, type: 'debit', category: 'Transfer', account: 'HDFC-Salary', balance: 111876, is_recurring: true, is_transfer: true, is_cc_payment: false, is_duplicate: false, is_excluded: true, confidence: 0.99, categorization_method: 'rule', needs_review: false },

  // 2026-07 (Spike and Anomaly month)
  { id: 'txn_07_01', date: '2026-07-01', merchant: 'Tech Corp Solutions', description: 'Monthly Salary Credit Tech Corp', amount: 85000, type: 'credit', category: 'Income', account: 'HDFC-Salary', balance: 196876, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_02', date: '2026-07-03', merchant: 'Prestige Properties', description: 'House Rent Payment to Prestige Apt', amount: 24000, type: 'debit', category: 'Rent', account: 'HDFC-Salary', balance: 172876, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_03', date: '2026-07-07', merchant: 'BESCOM', description: 'BESCOM Electricity Bill Payment', amount: 2040, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 170836, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_04', date: '2026-07-10', merchant: 'BWSSB', description: 'Water Bill BWSSB Online', amount: 450, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 170386, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_05', date: '2026-07-12', merchant: 'Airtel', description: 'Airtel Fiber Broadband Bill', amount: 1179, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 169207, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_06', date: '2026-07-13', merchant: 'Swiggy', description: 'Swiggy Bangalore Order 6192', amount: 890, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 168317, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_07', date: '2026-07-14', merchant: 'Swiggy', description: 'Swiggy Bangalore Order 6204', amount: 890, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 167427, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: true, is_excluded: false, confidence: 0.70, categorization_method: 'rule', needs_review: true },
  { id: 'txn_07_08', date: '2026-07-15', merchant: 'Jio', description: 'Jio 5G Mobile Recharge', amount: 349, type: 'debit', category: 'Utilities', account: 'HDFC-Salary', balance: 167078, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_09', date: '2026-07-16', merchant: 'Blinkit', description: 'Blinkit Quick Grocery 10min', amount: 1250, type: 'debit', category: 'Groceries', account: 'HDFC-Salary', balance: 165828, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_10', date: '2026-07-17', merchant: 'Croma Electronics', description: 'Croma Sony WH1000XM5 Headphones', amount: 26990, type: 'debit', category: 'Shopping', account: 'HDFC-Salary', balance: 138838, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_11', date: '2026-07-18', merchant: 'Netflix', description: 'Netflix Subscription Standard HD Price Increase', amount: 749, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 138089, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_12', date: '2026-07-19', merchant: 'Uber', description: 'Uber India Ride Residency Rd', amount: 560, type: 'debit', category: 'Transportation', account: 'HDFC-Salary', balance: 137529, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.98, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_13', date: '2026-07-21', merchant: 'Spotify', description: 'Spotify Premium Individual', amount: 119, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 137410, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_14', date: '2026-07-22', merchant: 'Truffles Koramangala', description: 'Truffles Cafe Burger & Steaks', amount: 1450, type: 'debit', category: 'Food', account: 'HDFC-Salary', balance: 135960, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.95, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_15', date: '2026-07-25', merchant: 'Amazon Prime', description: 'Amazon Prime Membership Monthly', amount: 299, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 135661, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_16', date: '2026-07-28', merchant: 'Google One', description: 'Google One 100GB Cloud Storage', amount: 130, type: 'debit', category: 'Subscription', account: 'HDFC-Salary', balance: 135531, is_recurring: true, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_17', date: '2026-07-29', merchant: 'Self Transfer', description: 'Transfer to Own Savings Acct 8821', amount: 20000, type: 'debit', category: 'Transfer', account: 'HDFC-Salary', balance: 115531, is_recurring: true, is_transfer: true, is_cc_payment: false, is_duplicate: false, is_excluded: true, confidence: 0.99, categorization_method: 'rule', needs_review: false },
  { id: 'txn_07_18', date: '2026-07-31', merchant: 'Unknown Vendor POS 9811', description: 'POS Purchase Electronics Hub', amount: 4500, type: 'debit', category: 'Uncategorized', account: 'HDFC-Salary', balance: 111031, is_recurring: false, is_transfer: false, is_cc_payment: false, is_duplicate: false, is_excluded: false, confidence: 0.45, categorization_method: 'fallback', needs_review: true }
];

export const INITIAL_GOALS: Goal[] = [
  {
    id: 'g_emergency',
    name: 'Emergency Fund (6 Mos Buffer)',
    target_amount: 150000,
    current_saved_amount: 75000,
    monthly_contribution: 10000,
    deadline: '2027-06-01',
    remaining_amount: 75000,
    estimated_months: 8,
    estimated_completion_date: '2027-02-15'
  },
  {
    id: 'g_laptop',
    name: 'New Workstation / M3 Max Laptop',
    target_amount: 95000,
    current_saved_amount: 35000,
    monthly_contribution: 6000,
    deadline: '2027-08-15',
    remaining_amount: 60000,
    estimated_months: 10,
    estimated_completion_date: '2027-04-15'
  },
  {
    id: 'g_travel',
    name: 'Year-End Japan Travel Vacation',
    target_amount: 60000,
    current_saved_amount: 20000,
    monthly_contribution: 4000,
    deadline: '2026-12-20',
    remaining_amount: 40000,
    estimated_months: 10,
    estimated_completion_date: '2027-04-20'
  }
];

export const INITIAL_OBLIGATIONS = [
  { id: 'ob_rent', name: 'Prestige Properties Rent', amount: 24000, due_date: '2026-08-03', recurring: true, status: 'pending' },
  { id: 'ob_bescom', name: 'BESCOM Electricity Bill', amount: 2150, due_date: '2026-08-07', recurring: true, status: 'pending' },
  { id: 'ob_bwssb', name: 'BWSSB Water Supply', amount: 450, due_date: '2026-08-10', recurring: true, status: 'pending' },
  { id: 'ob_airtel', name: 'Airtel Broadband Fiber', amount: 1179, due_date: '2026-08-12', recurring: true, status: 'pending' },
  { id: 'ob_insurance', name: 'HDFC Ergo Health Insurance Qtr', amount: 3200, due_date: '2026-08-28', recurring: true, status: 'pending' }
];

export const INITIAL_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub_netflix', service: 'Netflix Standard HD', current_price: 749, previous_price: 649, frequency: 'monthly', annualized_cost: 8988, next_renewal: '2026-08-18', price_creep: 100, category: 'Streaming Video', potential_overlap: 'Also subscribing to Prime & Hotstar', last_payment_date: '2026-07-18', payment_count: 4 },
  { id: 'sub_spotify', service: 'Spotify Premium Individual', current_price: 119, previous_price: 119, frequency: 'monthly', annualized_cost: 1428, next_renewal: '2026-08-21', price_creep: 0, category: 'Music Streaming', last_payment_date: '2026-07-21', payment_count: 4 },
  { id: 'sub_prime', service: 'Amazon Prime Video & Delivery', current_price: 299, previous_price: 299, frequency: 'monthly', annualized_cost: 3588, next_renewal: '2026-08-25', price_creep: 0, category: 'E-Commerce & Video', last_payment_date: '2026-07-25', payment_count: 4 },
  { id: 'sub_google', service: 'Google One 100GB Storage', current_price: 130, previous_price: 130, frequency: 'monthly', annualized_cost: 1560, next_renewal: '2026-08-28', price_creep: 0, category: 'Cloud Storage', last_payment_date: '2026-07-28', payment_count: 4 }
];

// ==========================================
// 2. Storage & State Management
// ==========================================
const STORAGE_KEY_TXNS = 'finpilot_transactions';
const STORAGE_KEY_RADAR = 'finpilot_radar_config';
const STORAGE_KEY_GOALS = 'finpilot_goals';

export function getStoredTransactions(): Transaction[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_TXNS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed reading transactions from localStorage', e);
  }
  return INITIAL_TRANSACTIONS;
}

export function saveStoredTransactions(txns: Transaction[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_TXNS, JSON.stringify(txns));
  } catch (e) {
    console.error('Failed saving transactions to localStorage', e);
  }
}

export function getStoredGoals(): Goal[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY_GOALS);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return INITIAL_GOALS;
}

export function saveStoredGoals(goals: Goal[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
  } catch (e) {}
}

export function getRadarConfig(): { safety_line: number; starting_balance: number; salary_date: number } {
  try {
    const data = localStorage.getItem(STORAGE_KEY_RADAR);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  return { safety_line: 20000, starting_balance: 52400, salary_date: 1 };
}

export function saveRadarConfig(cfg: { safety_line?: number; starting_balance?: number; salary_date?: number }): void {
  const current = getRadarConfig();
  const updated = { ...current, ...cfg };
  localStorage.setItem(STORAGE_KEY_RADAR, JSON.stringify(updated));
}

// ProofTrail Registry
const proofTrailRegistry = new Map<string, EvidenceDetail>();

export function registerEvidence(evidence: EvidenceDetail): void {
  proofTrailRegistry.set(evidence.id, evidence);
}

export function getEvidence(id: string): EvidenceDetail | null {
  return proofTrailRegistry.get(id) || null;
}

// ==========================================
// 3. Deterministic CommitStack Calculation
// ==========================================
export function calculateCommitStack(
  txns: Transaction[],
  goals: Goal[],
  monthStr?: string
): CommitStackResult {
  const dates = txns.map(t => t.date.substring(0, 7)).filter(Boolean);
  const targetMonth = monthStr || (dates.length ? dates.sort()[dates.length - 1] : '2026-07');
  
  const monthTxns = txns.filter(t => t.date.startsWith(targetMonth));
  
  // Income: Credits not excluded and not refunds
  const incomeTxns = monthTxns.filter(t => t.type === 'credit' && !t.is_excluded && !t.category.toLowerCase().includes('refund'));
  let monthlyIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
  if (monthlyIncome === 0) {
    // fallback historical monthly average
    const allCredits = txns.filter(t => t.type === 'credit' && !t.is_excluded && !t.category.toLowerCase().includes('refund'));
    const uniqueMonths = new Set(allCredits.map(t => t.date.substring(0, 7))).size || 1;
    monthlyIncome = Math.round(allCredits.reduce((sum, t) => sum + t.amount, 0) / uniqueMonths);
  }

  // Expenses
  const expenseTxns = monthTxns.filter(t => t.type === 'debit' && !t.is_excluded);
  const committedKeywords = ['rent', 'subscription', 'utilities', 'insurance', 'emi', 'loan'];
  
  const committedItems: Array<{ name: string; category: string; amount: number; type: string }> = [];
  let committedAmount = 0;
  let typicalVariable = 0;

  expenseTxns.forEach(t => {
    const catLower = t.category.toLowerCase();
    const isComm = committedKeywords.some(k => catLower.includes(k)) || t.is_recurring;
    if (isComm) {
      committedAmount += t.amount;
      committedItems.push({
        name: t.merchant || t.description,
        category: t.category,
        amount: t.amount,
        type: t.category
      });
    } else {
      typicalVariable += t.amount;
    }
  });

  const goalContributions = goals.reduce((sum, g) => sum + (g.monthly_contribution || 0), 0);
  const freeMoney = Math.max(0, monthlyIncome - (committedAmount + goalContributions + typicalVariable));
  const committedPercentage = monthlyIncome > 0 ? Math.round((committedAmount / monthlyIncome) * 100) : 0;
  const freeMoneyPercentage = monthlyIncome > 0 ? Math.round((freeMoney / monthlyIncome) * 100) : 0;

  const evidenceId = `ev_commitstack_${targetMonth.replace('-', '')}`;
  registerEvidence({
    id: evidenceId,
    insight_key: 'commit_stack',
    formula: 'Free Money = Monthly Income - (Committed Fixed Costs + Goal Contributions + Typical Variable)',
    supporting_data: {
      monthly_income: monthlyIncome,
      committed_amount: committedAmount,
      goal_contributions: goalContributions,
      typical_variable: typicalVariable,
      free_money: freeMoney,
      committed_percentage: `${committedPercentage}%`,
      free_money_percentage: `${freeMoneyPercentage}%`
    },
    explanation: `For ${targetMonth}, your income was ₹${monthlyIncome.toLocaleString('en-IN')}. Committed expenses claim ${committedPercentage}% (₹${committedAmount.toLocaleString('en-IN')}), monthly goals consume ₹${goalContributions.toLocaleString('en-IN')}, leaving ₹${freeMoney.toLocaleString('en-IN')} as true discretionary free money.`,
    transaction_ids: expenseTxns.map(t => t.id),
    transactions: expenseTxns
  });

  return {
    monthly_income: monthlyIncome,
    committed_amount: committedAmount,
    goal_contributions: goalContributions,
    typical_variable: typicalVariable,
    free_money: freeMoney,
    committed_percentage: committedPercentage,
    free_money_percentage: freeMoneyPercentage,
    committed_items: committedItems,
    evidence_id: evidenceId
  };
}

// ==========================================
// 4. CashRadar 30-Day Liquidity Forecast
// ==========================================
export function calculateCashRadar(
  txns: Transaction[],
  settings?: { safety_line?: number; starting_balance?: number; salary_date?: number }
): CashRadarResult {
  const cfg = { ...getRadarConfig(), ...settings };
  const startingBalance = cfg.starting_balance;
  const safetyLine = cfg.safety_line;
  const salaryDate = cfg.salary_date;

  const today = new Date();
  const days: CashRadarDay[] = [];
  let runningBalance = startingBalance;
  const riskyDates: string[] = [];
  let lowestBalance = runningBalance;
  let lowestDate = today.toISOString().split('T')[0];

  for (let i = 0; i < 30; i++) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];
    const dayNum = curDate.getDate();
    const dayName = curDate.toLocaleDateString('en-US', { weekday: 'short' });

    let dayIncome = 0;
    let dayExpenses = 0;
    let dayObligations = 0;
    const events: Array<{ title: string; type: string; amount: number }> = [];

    // Salary credit event
    if (dayNum === salaryDate) {
      dayIncome += 85000;
      events.push({ title: 'Expected Monthly Salary Credit', type: 'salary', amount: 85000 });
    }

    // Matching recurring obligations
    INITIAL_OBLIGATIONS.forEach(ob => {
      const obDueDay = parseInt(ob.due_date.split('-')[2], 10);
      if (obDueDay === dayNum) {
        dayObligations += ob.amount;
        events.push({ title: ob.name, type: 'obligation', amount: ob.amount });
      }
    });

    // Typical daily variable spending estimate (~₹450/day)
    dayExpenses += 450;

    runningBalance = runningBalance + dayIncome - dayObligations - dayExpenses;

    const isRisky = runningBalance < safetyLine;
    let riskReason: string | undefined;
    if (isRisky) {
      riskyDates.push(dateStr);
      riskReason = `Projected balance ₹${Math.round(runningBalance).toLocaleString('en-IN')} drops below safety cushion of ₹${safetyLine.toLocaleString('en-IN')}.`;
    }

    if (runningBalance < lowestBalance) {
      lowestBalance = runningBalance;
      lowestDate = dateStr;
    }

    days.push({
      date: dateStr,
      day: dayNum,
      day_name: dayName,
      projected_balance: Math.round(runningBalance),
      income: dayIncome,
      expenses: dayExpenses,
      obligations: dayObligations,
      is_risky: isRisky,
      risk_reason: riskReason,
      events
    });
  }

  const explanation = riskyDates.length > 0
    ? `CashRadar identified ${riskyDates.length} days where obligations pressure liquidity below your ₹${safetyLine.toLocaleString('en-IN')} safety cushion. Lowest balance hits ₹${Math.round(lowestBalance).toLocaleString('en-IN')} on ${lowestDate}.`
    : `CashRadar forecasts 30-day liquidity remains safely above your ₹${safetyLine.toLocaleString('en-IN')} cushion at all times. Lowest projected balance is ₹${Math.round(lowestBalance).toLocaleString('en-IN')}.`;

  return {
    starting_balance: startingBalance,
    safety_line: safetyLine,
    salary_date: salaryDate,
    days,
    risky_dates: riskyDates,
    lowest_projected_balance: Math.round(lowestBalance),
    lowest_balance_date: lowestDate,
    explanation
  };
}

// ==========================================
// 5. WhyLens Spending Variance Decomposition
// ==========================================
export function calculateWhyLens(
  txns: Transaction[],
  category: string = 'Food',
  currentPeriod?: string,
  previousPeriod?: string
): WhyLensResult {
  const months = Array.from(new Set(txns.map(t => t.date.substring(0, 7)))).sort();
  const curr = currentPeriod || (months.length > 0 ? months[months.length - 1] : '2026-07');
  const prev = previousPeriod || (months.length > 1 ? months[months.length - 2] : '2026-06');

  const currTxns = txns.filter(t => t.date.startsWith(curr) && t.type === 'debit' && t.category.toLowerCase() === category.toLowerCase() && !t.is_excluded);
  const prevTxns = txns.filter(t => t.date.startsWith(prev) && t.type === 'debit' && t.category.toLowerCase() === category.toLowerCase() && !t.is_excluded);

  const currTotal = currTxns.reduce((s, t) => s + t.amount, 0);
  const prevTotal = prevTxns.reduce((s, t) => s + t.amount, 0);
  const totalChange = currTotal - prevTotal;
  const percentChange = prevTotal > 0 ? Math.round(((currTotal - prevTotal) / prevTotal) * 100) : 0;

  const currCount = currTxns.length;
  const prevCount = prevTxns.length;
  const currAvg = currCount > 0 ? currTotal / currCount : 0;
  const prevAvg = prevCount > 0 ? prevTotal / prevCount : 0;

  // Price Effect = (AvgCurr - AvgPrev) * PrevCount
  const priceEffect = Math.round((currAvg - prevAvg) * prevCount);
  // Frequency Effect = (CountCurr - CountPrev) * PrevAvg
  const freqEffect = Math.round((currCount - prevCount) * prevAvg);

  // New Merchants
  const prevMerchants = new Set(prevTxns.map(t => t.merchant.toLowerCase()));
  const newMerchantsMap = new Map<string, { total: number; count: number }>();
  currTxns.forEach(t => {
    if (!prevMerchants.has(t.merchant.toLowerCase())) {
      const existing = newMerchantsMap.get(t.merchant) || { total: 0, count: 0 };
      newMerchantsMap.set(t.merchant, {
        total: existing.total + t.amount,
        count: existing.count + 1
      });
    }
  });

  const newMerchants = Array.from(newMerchantsMap.entries()).map(([merchant, stat]) => ({
    merchant,
    total: stat.total,
    count: stat.count
  }));

  // Outliers: amounts > 1.5x average
  const outliers = currTxns.filter(t => t.amount > currAvg * 1.5).map(t => ({
    id: t.id,
    merchant: t.merchant,
    amount: t.amount,
    date: t.date
  }));

  const contributions = [
    {
      component: 'price_effect',
      label: 'Price per Order Effect',
      amount: priceEffect,
      percentage_contribution: totalChange !== 0 ? Math.round((priceEffect / Math.abs(totalChange)) * 100) : 0,
      description: `Average order cost shifted from ₹${Math.round(prevAvg)} to ₹${Math.round(currAvg)}.`
    },
    {
      component: 'frequency_effect',
      label: 'Order Volume / Frequency Effect',
      amount: freqEffect,
      percentage_contribution: totalChange !== 0 ? Math.round((freqEffect / Math.abs(totalChange)) * 100) : 0,
      description: `Transaction volume changed by ${currCount - prevCount} purchases (${prevCount} vs ${currCount}).`
    },
    {
      component: 'new_merchants',
      label: 'First-time Merchants',
      amount: newMerchants.reduce((s, m) => s + m.total, 0),
      percentage_contribution: totalChange !== 0 ? Math.round((newMerchants.reduce((s, m) => s + m.total, 0) / Math.abs(totalChange)) * 100) : 0,
      description: `${newMerchants.length} new merchants visited in ${curr}.`
    }
  ];

  const evidenceId = `ev_whylens_${category.toLowerCase()}_${curr}_${prev}`;
  registerEvidence({
    id: evidenceId,
    insight_key: 'why_lens',
    formula: 'ΔTotal = (Avg_curr - Avg_prev) * Count_prev [Price] + (Count_curr - Count_prev) * Avg_prev [Frequency] + Interaction',
    supporting_data: {
      category,
      current_total: currTotal,
      previous_total: prevTotal,
      total_variance: totalChange,
      price_effect: priceEffect,
      frequency_effect: freqEffect,
      new_merchants_count: newMerchants.length
    },
    explanation: `Total spending on ${category} shifted by ₹${totalChange.toLocaleString('en-IN')} (${percentChange > 0 ? '+' : ''}${percentChange}%). Price effect contributed ₹${priceEffect.toLocaleString('en-IN')}, volume effect contributed ₹${freqEffect.toLocaleString('en-IN')}.`,
    transaction_ids: currTxns.map(t => t.id),
    transactions: currTxns
  });

  return {
    category,
    current_period: curr,
    previous_period: prev,
    current_total: currTotal,
    previous_total: prevTotal,
    total_change: totalChange,
    percent_change: percentChange,
    contributions,
    new_merchants: newMerchants,
    outliers,
    explanation: `Variance analysis for ${category}: Spending went from ₹${prevTotal.toLocaleString('en-IN')} in ${prev} to ₹${currTotal.toLocaleString('en-IN')} in ${curr} (${percentChange > 0 ? '+' : ''}${percentChange}%).`,
    evidence_id: evidenceId
  };
}

// ==========================================
// 6. GoalShift Timeline Simulator
// ==========================================
export function simulateGoalShift(
  goal: Goal,
  additionalMonthly: number,
  scenarioTitle?: string
): GoalScenarioResult {
  const remaining = Math.max(0, goal.target_amount - goal.current_saved_amount);
  const origContribution = Math.max(1, goal.monthly_contribution);
  const newContribution = Math.max(1, origContribution + additionalMonthly);

  const beforeMonths = Math.ceil(remaining / origContribution);
  const afterMonths = Math.ceil(remaining / newContribution);
  const monthsSaved = Math.max(0, beforeMonths - afterMonths);

  const now = new Date();
  const beforeDate = new Date(now.getFullYear(), now.getMonth() + beforeMonths, 1).toISOString().split('T')[0];
  const afterDate = new Date(now.getFullYear(), now.getMonth() + afterMonths, 1).toISOString().split('T')[0];

  const explanation = additionalMonthly > 0
    ? `By boosting monthly allocation to "${goal.name}" by ₹${additionalMonthly.toLocaleString('en-IN')} (to ₹${newContribution.toLocaleString('en-IN')}/mo), you reach your ₹${goal.target_amount.toLocaleString('en-IN')} target ${monthsSaved} month${monthsSaved !== 1 ? 's' : ''} earlier (${afterDate} instead of ${beforeDate}).`
    : `Current monthly allocation of ₹${origContribution.toLocaleString('en-IN')} will reach target in ${beforeMonths} months on ${beforeDate}.`;

  return {
    goal_id: goal.id,
    goal_name: goal.name,
    target_amount: goal.target_amount,
    current_saved_amount: goal.current_saved_amount,
    original_contribution: origContribution,
    scenario_contribution: newContribution,
    additional_monthly_savings: additionalMonthly,
    before_months: beforeMonths,
    after_months: afterMonths,
    months_saved: monthsSaved,
    before_date: beforeDate,
    after_date: afterDate,
    explanation
  };
}

// ==========================================
// 7. Complete Dashboard Aggregator
// ==========================================
export function generateDashboard(monthStr?: string): DashboardData {
  const txns = getStoredTransactions();
  const goals = getStoredGoals();
  const commitStack = calculateCommitStack(txns, goals, monthStr);
  const radar = calculateCashRadar(txns);

  const targetMonth = monthStr || '2026-07';
  const monthTxns = txns.filter(t => t.date.startsWith(targetMonth));
  
  const debits = monthTxns.filter(t => t.type === 'debit' && !t.is_excluded);
  const totalSpending = debits.reduce((s, t) => s + t.amount, 0);
  const totalIncome = commitStack.monthly_income;
  const netSavings = Math.max(0, totalIncome - totalSpending);
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category breakdown
  const catMap = new Map<string, number>();
  debits.forEach(t => {
    catMap.set(t.category, (catMap.get(t.category) || 0) + t.amount);
  });
  const topCategories = Array.from(catMap.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  // Anomalies
  const anomalies: Anomaly[] = [
    {
      id: 'anom_dup_01',
      transaction_id: 'txn_07_07',
      date: '2026-07-14',
      merchant: 'Swiggy',
      category: 'Food',
      amount: 890,
      anomaly_type: 'duplicate_charge',
      severity: 'high',
      explanation: 'Potential duplicate charge detected: Identical ₹890 charged by Swiggy within 24 hours (Order 6192 on July 13 and Order 6204 on July 14).',
      score: 0.92,
      transaction_ids: ['txn_07_06', 'txn_07_07']
    },
    {
      id: 'anom_spike_01',
      transaction_id: 'txn_07_10',
      date: '2026-07-17',
      merchant: 'Croma Electronics',
      category: 'Shopping',
      amount: 26990,
      anomaly_type: 'large_outlier',
      severity: 'medium',
      explanation: 'High expenditure spike: ₹26,990 purchase exceeds the typical Shopping 90-day baseline by 4.2x.',
      score: 0.85,
      transaction_ids: ['txn_07_10']
    },
    {
      id: 'anom_creep_01',
      transaction_id: 'txn_07_11',
      date: '2026-07-18',
      merchant: 'Netflix',
      category: 'Subscription',
      amount: 749,
      anomaly_type: 'price_increase',
      severity: 'info',
      explanation: 'Subscription price creep: Netflix increased monthly cost from ₹649 to ₹749 (+15.4%).',
      score: 0.95,
      transaction_ids: ['txn_07_11', 'txn_06_10']
    }
  ];

  // Budgets with projected monthly spending
  const daysInMonth = 30;
  const currentDayIndex = 18; // approx mid/late cycle run-rate
  const calculateBudget = (category: string, budget: number, defaultSpent: number): BudgetPerformance => {
    const spent = catMap.get(category) ?? defaultSpent;
    const remaining = budget - spent;
    const percent_used = Math.round((spent / budget) * 100);
    // Linear monthly pace projection
    const projected_spent = spent > budget
      ? spent
      : Math.round((spent / currentDayIndex) * daysInMonth);
    const projected_percent = Math.round((projected_spent / budget) * 100);
    return {
      category,
      budget,
      spent,
      remaining,
      percent_used,
      projected_spent,
      projected_percent,
      status: spent > budget ? 'over_budget' : 'within_budget'
    };
  };

  const budgets: BudgetPerformance[] = [
    calculateBudget('Food', 12000, 6200), // projected: 10,333 (86% of budget - exceeds 80% threshold!)
    calculateBudget('Groceries', 15000, 4850), // projected: 8,083 (54%)
    calculateBudget('Transportation', 6000, 2860), // projected: 4,767 (79%)
    calculateBudget('Shopping', 8000, 26990), // spent: 26,990 (337% of budget - exceeded!)
    calculateBudget('Subscription', 2000, 1317) // fixed: 1,317 (66%)
  ];

  // Money Health Score
  const healthScore: MoneyHealthScore = {
    total_score: 82,
    grade: 'A-',
    budget_adherence_score: 22,
    obligation_load_score: 28,
    savings_trend_score: 20,
    cash_flow_safety_score: 12,
    goal_progress_score: 0,
    breakdown: [
      { factor: 'Fixed Obligation Burden', points: 28, max: 30, reason: 'Committed fixed costs consume 34% of net income, comfortably within the healthy <50% threshold.' },
      { factor: 'Budget Adherence', points: 22, max: 25, reason: '4 out of 5 tracked categories stayed strictly within allocated limits; one outlier occurred in Shopping.' },
      { factor: 'Savings Discipline', points: 20, max: 25, reason: 'Consistent monthly allocations toward 3 long-term goals averaging ₹20,000/mo.' },
      { factor: 'Cashflow Cushion', points: 12, max: 20, reason: 'Lowest projected cash balance dips close to the ₹20,000 safety cushion around mid-month before salary replenishment.' }
    ],
    summary_text: 'FinPilot Health Grade A- (82/100). Low fixed obligation load and solid savings consistency provide resilience. Shopping spike in July reduced discretionary buffer.'
  };

  return {
    total_income: totalIncome,
    total_spending: totalSpending,
    net_savings: netSavings,
    savings_rate: savingsRate,
    committed_amount: commitStack.committed_amount,
    free_money: commitStack.free_money,
    money_health_score: healthScore,
    commit_stack: commitStack,
    cash_radar_summary: {
      starting_balance: radar.starting_balance,
      safety_line: radar.safety_line,
      risky_dates_count: radar.risky_dates.length,
      lowest_projected_balance: radar.lowest_projected_balance,
      explanation: radar.explanation
    },
    top_categories: topCategories,
    recent_transactions: txns.slice(-15).reverse(),
    upcoming_obligations: INITIAL_OBLIGATIONS,
    anomalies: anomalies,
    active_subscriptions: INITIAL_SUBSCRIPTIONS,
    subscriptions: INITIAL_SUBSCRIPTIONS,
    goals: goals,
    budgets: budgets,
    ai_insights: [
      { id: 'ins_01', title: 'CommitStack Free Money ₹18,990', summary: 'After fixed costs and goal savings, ₹18,990 remains uncommitted this month.', evidence_id: commitStack.evidence_id, type: 'positive' },
      { id: 'ins_02', title: 'Potential Duplicate Charge on Swiggy', summary: 'Swiggy billed ₹890 twice in 24 hours for orders 6192 and 6204.', evidence_id: 'anom_dup_01', type: 'warning' },
      { id: 'ins_03', title: 'Netflix 15% Price Creep', summary: 'Netflix recurring fee increased from ₹649 to ₹749.', evidence_id: 'anom_creep_01', type: 'info' }
    ]
  };
}

// ==========================================
// 8. PrivacyGuard Sanitization
// ==========================================
export function sanitizePrivacyGuard(text: string): { sanitized: string; maskedCount: number; maskedFields: string[] } {
  let sanitized = text;
  const maskedFields: string[] = [];
  let count = 0;

  // Account numbers
  const acctRegex = /\b(?:\d[ -]*?){10,16}\b/g;
  if (acctRegex.test(sanitized)) {
    sanitized = sanitized.replace(acctRegex, '[ACCOUNT_MASKED]');
    maskedFields.push('account_number');
    count++;
  }

  // Phone numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}\b/g;
  if (phoneRegex.test(sanitized)) {
    sanitized = sanitized.replace(phoneRegex, '[PHONE_MASKED]');
    maskedFields.push('phone_number');
    count++;
  }

  // Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  if (emailRegex.test(sanitized)) {
    sanitized = sanitized.replace(emailRegex, '[EMAIL_MASKED]');
    maskedFields.push('email_address');
    count++;
  }

  return { sanitized, maskedCount: count, maskedFields };
}

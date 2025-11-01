// Predefined category options for transactions and budgets
export const CATEGORY_OPTIONS = [
  // Income Categories
  { value: 'Salary', label: '💰 Salary' },
  { value: 'Bonus', label: '💰 Bonus' },
  { value: 'Investment Income', label: '💰 Investment Income' },
  { value: 'Freelance', label: '💰 Freelance' },
  { value: 'Gift Received', label: '💰 Gift Received' },
  { value: 'Refund', label: '💰 Refund' },
  { value: 'Other Income', label: '💰 Other Income' },

  // Expense Categories
  { value: 'Groceries', label: '🛒 Groceries' },
  { value: 'Dining Out', label: '🍽️ Dining Out' },
  { value: 'Transportation', label: '🚗 Transportation' },
  { value: 'Gas/Fuel', label: '⛽ Gas/Fuel' },
  { value: 'Utilities', label: '💡 Utilities' },
  { value: 'Rent/Mortgage', label: '🏠 Rent/Mortgage' },
  { value: 'Insurance', label: '🛡️ Insurance' },
  { value: 'Healthcare', label: '🏥 Healthcare' },
  { value: 'Entertainment', label: '🎬 Entertainment' },
  { value: 'Shopping', label: '🛍️ Shopping' },
  { value: 'Clothing', label: '👕 Clothing' },
  { value: 'Personal Care', label: '💇 Personal Care' },
  { value: 'Education', label: '📚 Education' },
  { value: 'Subscriptions', label: '📱 Subscriptions' },
  { value: 'Gifts', label: '🎁 Gifts' },
  { value: 'Charity', label: '❤️ Charity' },
  { value: 'Travel', label: '✈️ Travel' },
  { value: 'Home Improvement', label: '🔨 Home Improvement' },
  { value: 'Pet Care', label: '🐾 Pet Care' },
  { value: 'Fitness', label: '💪 Fitness' },
  { value: 'Bank Fees', label: '🏦 Bank Fees' },
  { value: 'Taxes', label: '📋 Taxes' },
  { value: 'Other Expense', label: '📌 Other Expense' },
  { value: 'Uncategorized', label: '❓ Uncategorized' },
];

// Just the category names for filtering/display
export const EXPENSE_CATEGORIES = CATEGORY_OPTIONS.filter(c =>
  !['Salary', 'Bonus', 'Investment Income', 'Freelance', 'Gift Received', 'Refund', 'Other Income'].includes(c.value)
);

export const INCOME_CATEGORIES = CATEGORY_OPTIONS.filter(c =>
  ['Salary', 'Bonus', 'Investment Income', 'Freelance', 'Gift Received', 'Refund', 'Other Income'].includes(c.value)
);

import { motion } from 'framer-motion';
import { UtensilsCrossed, Car, Gamepad2, ShoppingBag, Receipt, Heart, MoreHorizontal } from 'lucide-react';

export interface ExpenseCategory {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export const expenseCategories: ExpenseCategory[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: UtensilsCrossed,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/20'
  },
  {
    id: 'transportation',
    name: 'Transportation',
    icon: Car,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/20'
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: Gamepad2,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/20'
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: ShoppingBag,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100 dark:bg-pink-900/20'
  },
  {
    id: 'bills',
    name: 'Bills & Utilities',
    icon: Receipt,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/20'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/20'
  },
  {
    id: 'other',
    name: 'Other',
    icon: MoreHorizontal,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100 dark:bg-gray-900/20'
  }
];

interface CategorySelectorProps {
  readonly selectedCategory: string;
  readonly onCategoryChange: (categoryId: string) => void;
  readonly className?: string;
}

export function CategorySelector({ selectedCategory, onCategoryChange, className = '' }: CategorySelectorProps) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 ${className}`}>
      {expenseCategories.map((category, index) => {
        const Icon = category.icon;
        const isSelected = selectedCategory === category.id;

        return (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onCategoryChange(category.id)}
            className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
              isSelected
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50'
            }`}
          >
            <div className="flex flex-col items-center gap-2">
              <div className={`p-3 rounded-full ${category.bgColor} transition-colors`}>
                <Icon className={`h-6 w-6 ${category.color}`} />
              </div>
              <span className={`text-sm font-medium text-center ${
                isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
              }`}>
                {category.name}
              </span>
            </div>
            {isSelected && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
              >
                <div className="w-2 h-2 bg-white rounded-full" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

interface CategoryBadgeProps {
  readonly categoryId: string;
  readonly className?: string;
}

export function CategoryBadge({ categoryId, className = '' }: CategoryBadgeProps) {
  const category = expenseCategories.find(cat => cat.id === categoryId);
  if (!category) return null;

  const Icon = category.icon;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${category.bgColor} ${category.color} ${className}`}>
      <Icon className="h-4 w-4" />
      {category.name}
    </div>
  );
}
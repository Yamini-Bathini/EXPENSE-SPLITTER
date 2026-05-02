export interface User {
  id: number;
  username: string;
  email: string;
  token?: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  members: User[];
}

export interface Split {
  userId: number;
  userName: string;
  amount: number;
}

export interface Expense {
  id: number;
  description: string;
  category: string;
  amount: number;
  splitType: 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';
  paidById: number;
  paidByName: string;
  groupId: number;
  splits: Split[];
}

export interface Transaction {
  id: number | null;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
  note: string;
  status: string;
  occurredAt: string;
}

export interface Balance {
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  amount: number;
}

export interface BalanceSummary {
  balances: Balance[];
  suggestedSettlements: Transaction[];
}

export interface Transaction {
  id: string;
  date: string;
  merchant: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  account: string;
  balance?: number | null;
  source_document_id?: string | null;
  is_recurring: boolean;
  is_transfer: boolean;
  is_cc_payment: boolean;
  is_duplicate: boolean;
  is_excluded: boolean;
  confidence: number;
  categorization_method: string;
  needs_review: boolean;
}

export interface CommitStackItem {
  name: string;
  category: string;
  amount: number;
  type: string;
}

export interface CommitStackResult {
  monthly_income: number;
  committed_amount: number;
  goal_contributions: number;
  typical_variable: number;
  free_money: number;
  committed_percentage: number;
  free_money_percentage: number;
  committed_items: CommitStackItem[];
  evidence_id?: string;
}

export interface CashRadarDay {
  date: string;
  day: number;
  day_name: string;
  projected_balance: number;
  income: number;
  expenses: number;
  obligations: number;
  is_risky: boolean;
  risk_reason?: string;
  events: Array<{ title: string; type: string; amount: number }>;
}

export interface CashRadarResult {
  starting_balance: number;
  safety_line: number;
  salary_date: number;
  days: CashRadarDay[];
  risky_dates: string[];
  lowest_projected_balance: number;
  lowest_balance_date: string;
  explanation: string;
}

export interface WhyLensContribution {
  component: string;
  label: string;
  amount: number;
  percentage_contribution: number;
  description: string;
}

export interface WhyLensResult {
  category: string;
  current_period: string;
  previous_period: string;
  current_total: number;
  previous_total: number;
  total_change: number;
  percent_change: number;
  contributions: WhyLensContribution[];
  new_merchants: Array<{ merchant: string; total: number; count: number }>;
  outliers: Array<{ id: string; merchant: string; amount: number; date: string }>;
  explanation: string;
  evidence_id?: string;
}

export interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_saved_amount: number;
  monthly_contribution: number;
  deadline?: string;
  remaining_amount?: number;
  estimated_months?: number;
  estimated_completion_date?: string;
}

export interface GoalScenarioResult {
  goal_id: string;
  goal_name: string;
  target_amount: number;
  current_saved_amount: number;
  original_contribution: number;
  scenario_contribution: number;
  additional_monthly_savings: number;
  before_months: number;
  after_months: number;
  months_saved: number;
  before_date: string;
  after_date: string;
  explanation: string;
}

export interface Anomaly {
  id: string;
  transaction_id: string;
  date: string;
  merchant: string;
  category: string;
  amount: number;
  anomaly_type: string;
  severity: 'low' | 'medium' | 'high' | 'info';
  explanation: string;
  score: number;
  transaction_ids?: string[];
}

export interface Subscription {
  id: string;
  service: string;
  current_price: number;
  previous_price?: number;
  frequency: string;
  annualized_cost: number;
  next_renewal: string;
  price_creep: number;
  category: string;
  potential_overlap?: string;
  last_payment_date: string;
  payment_count: number;
}

export interface RecurringPayment {
  id: string;
  merchant: string;
  amount: number;
  average_amount: number;
  frequency: string;
  category: string;
  occurrences: number;
  last_payment: string;
  next_expected_payment: string;
  confidence: number;
  transaction_ids: string[];
}

export interface BudgetPerformance {
  category: string;
  budget: number;
  spent: number;
  remaining: number;
  percent_used: number;
  status: 'within_budget' | 'over_budget';
  projected_spent?: number;
  projected_percent?: number;
}

export interface MoneyHealthScore {
  total_score: number;
  grade: string;
  budget_adherence_score: number;
  obligation_load_score: number;
  savings_trend_score: number;
  cash_flow_safety_score: number;
  goal_progress_score: number;
  breakdown: Array<{ factor: string; points: number; max: number; reason: string }>;
  summary_text: string;
}

export interface DashboardData {
  total_income: number;
  total_spending: number;
  net_savings: number;
  savings_rate: number;
  committed_amount: number;
  free_money: number;
  money_health_score: MoneyHealthScore;
  commit_stack: CommitStackResult;
  cash_radar_summary: {
    starting_balance: number;
    safety_line: number;
    risky_dates_count: number;
    lowest_projected_balance: number;
    explanation: string;
  };
  top_categories: Array<{ category: string; amount: number; percentage: number }>;
  recent_transactions: Transaction[];
  upcoming_obligations: Array<{ id: string; name: string; amount: number; due_date: string; status: string }>;
  anomalies: Anomaly[];
  active_subscriptions: Subscription[];
  subscriptions?: Subscription[];
  goals: Goal[];
  budgets: BudgetPerformance[];
  ai_insights: Array<{ id: string; title: string; summary: string; evidence_id?: string; type: string }>;
}

export interface EvidenceDetail {
  id: string;
  insight_key: string;
  formula: string;
  supporting_data: Record<string, any>;
  explanation: string;
  transaction_ids: string[];
  transactions: Transaction[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  evidence_id?: string;
  tool_used?: string;
  structured_data?: any;
  privacy_tokens_masked?: number;
  masked_fields?: string[];
}

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class Transaction(BaseModel):
    id: str
    date: str
    merchant: str
    description: Optional[str] = ""
    amount: float
    type: str  # 'debit' or 'credit'
    category: str
    account: Optional[str] = "Primary"
    balance: Optional[float] = None
    source_document_id: Optional[str] = None
    is_recurring: bool = False
    is_transfer: bool = False
    is_cc_payment: bool = False
    is_duplicate: bool = False
    is_excluded: bool = False
    confidence: float = 1.0
    categorization_method: str = "rule"
    needs_review: bool = False
    created_at: Optional[str] = None

class TransactionCategoryUpdate(BaseModel):
    transaction_id: str
    new_category: str
    remember_for_merchant: bool = True

class Budget(BaseModel):
    id: str
    category: str
    amount: float
    period: str = "monthly"
    spent: Optional[float] = 0.0
    remaining: Optional[float] = 0.0
    percent_used: Optional[float] = 0.0

class BudgetCreate(BaseModel):
    category: str
    amount: float

class Goal(BaseModel):
    id: str
    name: str
    target_amount: float
    current_saved_amount: float
    deadline: Optional[str] = None
    monthly_contribution: float
    remaining_amount: Optional[float] = 0.0
    estimated_months: Optional[float] = 0.0
    estimated_completion_date: Optional[str] = None

class GoalCreate(BaseModel):
    name: str
    target_amount: float
    current_saved_amount: float
    monthly_contribution: float
    deadline: Optional[str] = None

class GoalScenarioRequest(BaseModel):
    goal_id: str
    scenario_text: str  # e.g., "Reduce shopping by ₹1,000"
    custom_monthly_boost: Optional[float] = None

class GoalScenarioResult(BaseModel):
    goal_id: str
    goal_name: str
    target_amount: float
    current_saved_amount: float
    original_contribution: float
    scenario_contribution: float
    additional_monthly_savings: float
    before_months: float
    after_months: float
    months_saved: float
    before_date: str
    after_date: str
    explanation: str

class CommitStackItem(BaseModel):
    name: str
    category: str
    amount: float
    type: str  # 'rent', 'subscription', 'utility', 'emi', 'variable'

class CommitStackResult(BaseModel):
    monthly_income: float
    committed_amount: float
    goal_contributions: float
    typical_variable: float
    free_money: float
    committed_percentage: float
    free_money_percentage: float
    committed_items: List[CommitStackItem]
    evidence_id: Optional[str] = None

class CashRadarDay(BaseModel):
    date: str
    day: int
    day_name: str
    projected_balance: float
    income: float
    expenses: float
    obligations: float
    is_risky: bool
    risk_reason: Optional[str] = None
    events: List[Dict[str, Any]] = []

class CashRadarResult(BaseModel):
    starting_balance: float
    safety_line: float
    salary_date: int
    days: List[CashRadarDay]
    risky_dates: List[str]
    lowest_projected_balance: float
    lowest_balance_date: str
    explanation: str

class WhyLensContribution(BaseModel):
    component: str  # 'price_effect', 'frequency_effect', 'new_merchant', 'outlier'
    label: str
    amount: float
    percentage_contribution: float
    description: str

class WhyLensResult(BaseModel):
    category: str
    current_period: str
    previous_period: str
    current_total: float
    previous_total: float
    total_change: float
    percent_change: float
    contributions: List[WhyLensContribution]
    new_merchants: List[Dict[str, Any]]
    outliers: List[Dict[str, Any]]
    explanation: str
    evidence_id: Optional[str] = None

class ProofTrailItem(BaseModel):
    id: str
    insight_key: str
    title: str
    result_summary: str
    formula: str
    supporting_data: Dict[str, Any]
    transaction_ids: List[str]
    transactions: List[Transaction] = []
    explanation: str

class SubscriptionItem(BaseModel):
    id: str
    service: str
    current_price: float
    previous_price: Optional[float] = None
    frequency: str = "monthly"
    annualized_cost: float
    next_renewal: str
    price_creep: float = 0.0
    category: str = "Subscription"
    potential_overlap: Optional[str] = None

class ObligationItem(BaseModel):
    id: str
    name: str
    amount: float
    due_date: str
    recurring: bool = True
    status: str = "pending"
    source_document_id: Optional[str] = None

class HealthScore(BaseModel):
    total_score: int
    grade: str
    budget_adherence_score: int
    obligation_load_score: int
    savings_trend_score: int
    cash_flow_safety_score: int
    goal_progress_score: int
    breakdown: List[Dict[str, Any]]
    summary_text: str

class DashboardData(BaseModel):
    total_income: float
    total_spending: float
    net_savings: float
    savings_rate: float
    committed_amount: float
    free_money: float
    money_health_score: HealthScore
    commit_stack: CommitStackResult
    cash_radar_summary: Dict[str, Any]
    top_categories: List[Dict[str, Any]]
    recent_transactions: List[Transaction]
    upcoming_obligations: List[ObligationItem]
    anomalies: List[Dict[str, Any]]
    active_subscriptions: List[SubscriptionItem]
    goals: List[Goal]
    budgets: List[Budget]
    ai_insights: List[Dict[str, Any]]
    privacy_guard_masked_count: int = 0

class AIChatRequest(BaseModel):
    message: str
    context_period: Optional[str] = None

class AIChatResponse(BaseModel):
    answer: str
    tool_used: Optional[str] = None
    structured_data: Optional[Dict[str, Any]] = None
    evidence_id: Optional[str] = None
    privacy_tokens_masked: int = 0
    masked_fields: List[str] = []

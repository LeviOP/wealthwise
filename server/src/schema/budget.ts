export const budgetTypeDefs = `#graphql
  type Budget {
    id: ID!
    category: Category!
    amount: Float!
    period: BudgetPeriod!
    startDate: String!
    createdAt: String!
    updatedAt: String!
    spent: Float!
    remaining: Float!
    percentageUsed: Float!
  }

  enum BudgetPeriod {
    monthly
    yearly
  }

  input CreateBudgetInput {
    categoryId: ID!
    amount: Float!
    period: BudgetPeriod!
    startDate: String
  }

  input UpdateBudgetInput {
    amount: Float
    period: BudgetPeriod
    startDate: String
  }

  type Query {
    budgets: [Budget!]!
    budget(id: ID!): Budget
    budgetsByPeriod(period: BudgetPeriod!): [Budget!]!
    budgetsByCategory(categoryId: ID!): [Budget!]!
  }

  type Mutation {
    createBudget(input: CreateBudgetInput!): Budget!
    updateBudget(id: ID!, input: UpdateBudgetInput!): Budget!
    deleteBudget(id: ID!): Boolean!
  }
`; 
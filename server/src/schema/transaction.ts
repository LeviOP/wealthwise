export const transactionTypeDefs = `#graphql
  type Transaction {
    id: ID!
    amount: Float!
    type: TransactionType!
    category: Category
    description: String!
    date: String!
    createdAt: String!
    updatedAt: String!
  }

  enum TransactionType {
    income
    expense
  }

  input CreateTransactionInput {
    amount: Float!
    type: TransactionType!
    categoryId: ID!
    description: String!
    date: String
  }

  input UpdateTransactionInput {
    amount: Float
    type: TransactionType
    categoryId: ID
    description: String
    date: String
  }

  type Query {
    transactions: [Transaction!]!
    transaction(id: ID!): Transaction
    transactionsByCategory(categoryId: ID!): [Transaction!]!
    transactionsByDateRange(startDate: String!, endDate: String!): [Transaction!]!
  }

  type Mutation {
    createTransaction(input: CreateTransactionInput!): Transaction!
    updateTransaction(id: ID!, input: UpdateTransactionInput!): Transaction!
    deleteTransaction(id: ID!): Transaction!
  }
`; 
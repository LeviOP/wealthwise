export const categoryTypeDefs = `#graphql
  type Category {
    id: ID!
    name: String!
    type: CategoryType!
    createdAt: String!
    updatedAt: String!
  }

  enum CategoryType {
    income
    expense
  }

  input CreateCategoryInput {
    name: String!
    type: CategoryType!
  }

  input UpdateCategoryInput {
    name: String
    type: CategoryType
  }

  type Query {
    categories: [Category!]!
    category(id: ID!): Category
    categoriesByType(type: CategoryType!): [Category!]!
  }

  type Mutation {
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!
  }
`; 
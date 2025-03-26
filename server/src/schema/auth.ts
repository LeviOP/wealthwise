import { gql } from 'apollo-server-express';

export const authTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  extend type Mutation {
    login(email: String!, password: String!): AuthPayload!
    register(email: String!, password: String!, firstName: String!, lastName: String!): AuthPayload!
  }
`; 
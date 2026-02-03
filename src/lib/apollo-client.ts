import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const httpLink = new HttpLink({
  uri: process.env.GRAPHQL_URL || process.env.NEXT_PUBLIC_GRAPHQL_URL,
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

export default client;

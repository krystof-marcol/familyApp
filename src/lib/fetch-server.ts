import { print } from "graphql/language/printer";

export async function fetchGraphQL(
  queryObj: any,
  variables: any = {},
  tags: string[] = [],
) {
  const endpoint = process.env.GRAPHQL_URL;

  if (!endpoint) {
    throw new Error(
      "Environment variable NEXT_PUBLIC_GRAPHQL_API_URL is missing. Check your .env file.",
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: print(queryObj),
      variables,
    }),
    next: { tags: tags },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch data: ${res.statusText}`);
  }

  return res.json();
}

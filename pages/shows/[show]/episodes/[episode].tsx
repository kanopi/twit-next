import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import { drupal, query } from "lib/drupal";
import { Layout } from "components/layout";


interface NodeURLPath {
  path: {
    alias: string;
  };
}


interface QueryResult {
  nodes: {
    items: NodeURLPath[];
  };
}

// Fetch all paths for Episodes
export const getStaticPaths: GetStaticPaths = async () => {
  const result: QueryResult = await query({
    query: `
      query {
        nodes: entityQuery(
          entityType: NODE
          limit: 100
          filter: {conditions: [{field: "type", operator: EQUAL, value: ["episode"]}, {field: "status", operator: EQUAL, value: "1"}]}
        ) {
          items {
            ... on NodeEpisode {
              path {
                alias
              }
            }
          }
        }
      }
    `,
  });

  // const paths = result.entityQuery.items.map((item) => ({
  //   params: {
  //     episode: item.path.alias.replace(/^\/+/, '') 
  //   },
  // }));

   const paths = drupal.buildStaticPathsParamsFromPaths(
    [...result?.nodes?.items].map(
      ({ path }) => path.alias
    )
  )

  return {
    paths,
    fallback: "blocking",
  };
};

const episode = () => {
  return (
    <Layout>
      hey there episode
    </Layout>
  )
}

export default episode;
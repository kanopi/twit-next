import Head from "next/head";
import { query } from "lib/drupal";
import { Layout } from "components/layout";
import NodeShowTeaser from "components/show/node--show--teaser";

export async function getStaticProps(context) {
  const data = await query({
    query: `
      query {
        entityQuery(
          entityType: NODE
          limit: 1000
          filter: {conditions: [{field: "type", operator: EQUAL, value: ["show"]}, {field: "status", operator: EQUAL, value: "1"}]}
          sort: {field: "field_show_sort", direction: DESC}
        ) {
          items {
            ... on Node {
              __typename
              title
              id
              path {
                alias
                pid
                langcode
                pathauto
              }
            }
            ... on NodeShow {
              fieldShowTagline
              fieldShowsFeedCategory
              fieldCoverAlbumArt {
                entity {
                  urlAbsolute
                }
              }
            }
          }
        }
      }
    `,
  });

  return {
    props: {
      nodes: data?.entityQuery?.items ?? [],
    },
  };
}

export default function IndexPage({ nodes }) {
  return (
    <Layout>
      <Head>
        <title>Next.js for Drupal</title>
        <meta
          name="description"
          content="A Next.js site powered by a Drupal backend."
        />
      </Head>
      <div className="container py-10 mx-auto">
        <h1 className="mb-10 text-6xl font-black">Latest Shows</h1>
        <div className="grid grid-cols-1 gap-10 my-4 lg:grid-cols-2">
          {nodes?.length ? (
            nodes.map((node) => (
              <NodeShowTeaser key={node.id} node={node} />
            ))
          ) : (
            <p className="py-4">No nodes found</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
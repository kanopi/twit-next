import Head from "next/head";
import { GetStaticPropsResult } from "next";
import Image from "next/image"

import { query } from "lib/drupal";
import { Layout } from "components/layout";
import { Show } from "types";
import Link from "next/link";
import NodeShowTeaser from "components/show/node--show--teaser";

interface IndexPageProps {
  nodes: Show[];
}

export default function IndexPage({ nodes }: IndexPageProps) {
  return (
    <Layout>
      <Head>
        <title>Next.js for Drupal</title>
        <meta
          name="description"
          content="A Next.js site powered by a Drupal backend."
        />
      </Head>
      <div>
        <h1 className="mb-10 text-6xl font-black">Latest Shows</h1>
        <div className="grid grid-cols-2 gap-10 my-4">
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

export async function getStaticProps(
  context
): Promise<GetStaticPropsResult<IndexPageProps>> {
  // Fetch the first 10 articles.
  const data = await query<{
    entityQuery: {
      items: Show[];
    };
  }>({
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

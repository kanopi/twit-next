import Head from "next/head";
import { Layout } from "components/layout";
import Link from "next/link";
import { Show } from "types";
import { GetStaticPropsResult } from "next";
import { query } from "lib/drupal";
import NodeShowTeaser from "components/show/node--show--teaser";

interface ShowsPageProps {
  nodes: Show[];
}


export async function getStaticProps(
  context
): Promise<GetStaticPropsResult<ShowsPageProps>> {
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


const ShowPage = ({ nodes }) => {
  return (
    <Layout>
      <Head>
        <title>Next.js for Drupal</title>
        <meta
          name="description"
          content="A Next.js site powered by a Drupal backend."
        />
      </Head>

      
      <h1 className="mb-10 text-6xl font-black my-4">What is TWiT.tv</h1>
      <p>TWiT.tv podcasts keep you up-to-date with all that&apos;s happening in the world of technology.</p>
      <p>Be entertained while learning about the latest tech news, reviews, and how-tos. Geek out with one of our great tech podcasts below from Leo Laporte, Jason Howell, Mikah Sargent, Ant Pruitt, and friends.</p>
      <p>If you’re interested in getting our podcasts ad-free, <Link href={'/clubtwit'}>learn more about Club TWiT</Link>.</p>
  
      <div className="mb-10 text-5xl font-black my-4">Latest Shows</div>
      <div className="grid grid-cols-1 gap-10 my-4 lg:grid-cols-2">
        {nodes?.length ? (
          nodes.map((node) => (
              <NodeShowTeaser key={node.id} node={node} />
            ))
          ) : (
            <p className="py-4">No nodes found</p>
          )}
        </div>
    </Layout>
  );
};

export default ShowPage;
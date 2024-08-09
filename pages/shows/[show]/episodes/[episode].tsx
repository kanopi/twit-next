import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import { drupal, query } from "lib/drupal";
import { Layout } from "components/layout";
import Link from "next/link";

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

interface ImageData {
  alt: string;
  width: string;
  height: string;
  entity: {
    urlAbsolute: string;
  };
}

interface EpisodeData {
  id: string;
  title: string;
  body: string;
  fieldHeroImage: ImageData;
  fieldEpisodeShow: {
    title: string;
    url: {
      path: string;
    }
  }
}

interface EpisodeQueryResult {
  route: {
    __typename: string;
    entity: EpisodeData;
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

  const paths = result.nodes.items.map((item) => {
    const segments = item.path.alias.split('/');
    return {
      params: {
        show: segments[2], // Adjust index based on your URL structure
        episode: segments[4], // Adjust index based on your URL structure
      },
    };
  });


  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({params}) => {
  let { show, episode } = params;
  const alias = `/shows/${show}/episodes/${episode}`;

  const result: EpisodeQueryResult = await query({
    query: `
      query($alias: String!) {
        route(path: $alias) {
          __typename
          ... on EntityCanonicalUrl {
            entity {
              __typename
              ... on NodeEpisode {
                id
                title
                body
                fieldHeroImage {
                  alt
                  width
                  height
                  entity {
                    urlAbsolute
                  }
                }
                fieldEpisodeShow {
                  title
                  url {
                    path
                  }
                }
              }
            }
          }
        }
      }
    `,
    variables: { alias },
  });

  return {
    props: {
      episode: result?.route.entity ?? null,
    },
  };
};

const EpisodePage = ({ episode }: InferGetStaticPropsType<typeof getStaticProps>) => {
  if (!episode) {
    return (
      <Layout>
        <p>Episode not found.</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10 mx-auto">
        <h1>{episode.title}</h1>
        <div>
          {episode?.fieldHeroImage?.entity && (
            <Image
              src={episode.fieldHeroImage.entity.urlAbsolute}
              alt={episode.fieldHeroImage.alt}
              width={parseInt(episode.fieldHeroImage.width, 10)}
              height={parseInt(episode.fieldHeroImage.height, 10)}
            />
          )}
        </div>
        <Link href={episode.fieldEpisodeShow.url.path} className="bg-blue-600 text-white p-3 inline-block my-4">{`Back to ${episode.fieldEpisodeShow.title}`}</Link>
        <div dangerouslySetInnerHTML={{ __html: episode.body }} className="prose inline"/>
      </div>
    </Layout>
  );
};

export default EpisodePage;

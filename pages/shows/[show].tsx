import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from "next";
import Image from "next/image";
import Head from "next/head";
import { query } from "lib/drupal";
import { Layout } from "components/layout";
import Link from "next/link";

// Define the TypeScript interfaces for the expected data
interface NodeURLPath {
  path: {
    alias: string;
  };
}

// Define image.
interface ImageData {
  alt: string;
  width: string;
  height: string;
  entity: {
    urlAbsolute: string;
  };
}

interface QueryResult {
  entityQuery: {
    items: NodeURLPath[];
  };
}

interface ShowData {
  id: string;
  title: string;
  body: string;
  fieldHeroImage: ImageData;
  fieldExtendedShowDescription: string;
}

interface ShowQueryResult {
  route: {
    __typename: string;
    entity: ShowData;
  };
}

interface EpisodeData {
  id: string;
  title: string;
  fieldEpisodeTeaser: string;
  path: NodeURLPath,
  fieldEpisodeAiringDate: {
    value: string;
  };
  fieldHeroImage: ImageData;
}

interface EpisodeQueryResult {
  entityQuery: {
    items: EpisodeData[];
  };
}

// Fetch all paths for shows
export const getStaticPaths: GetStaticPaths = async () => {
  const result: QueryResult = await query({
    query: `
      query {
        entityQuery(
          entityType: NODE
          limit: 1000
          filter: {conditions: [{field: "type", operator: EQUAL, value: ["show"]}, {field: "status", operator: EQUAL, value: "1"}]}
        ) {
          items {
            ... on NodeShow {
              path {
                alias
              }
            }
          }
        }
      }
    `,
  });

  const paths = result.entityQuery.items.map((item) => ({
    params: { show: item.path.alias.replace(/^\/shows\//, "") }
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

// Fetch show data for a specific path
export const getStaticProps: GetStaticProps = async ({params}) => {
  const alias = `/shows/${params?.show}`;
  const showResultData: ShowQueryResult = await query({
    query: `
      query($alias: String!) {
        route(path: $alias) {
          __typename
          ... on EntityCanonicalUrl {
            entity {
              __typename
              ... on NodeShow {
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
                fieldExtendedShowDescription
              }
            }
          }
        }
      }
    `,
    variables: { alias },
  });

  const showId = showResultData.route.entity.id;

  // Query to fetch episodes related to the show
  const episodesResult: EpisodeQueryResult = await query({
    query: `
      query($showId: String!) {
        entityQuery(
          entityType: NODE
          limit: 6
          filter: {conditions: [{field: "field_episode_show", operator: EQUAL, value: [$showId]}], groups: {conditions: {field: "field_hero_image", operator: IS_NOT_NULL}}}
          sort: {field: "field_episode_number", direction: DESC}
        ) {
          items {
            ... on NodeEpisode {
              id
              title
              path {
                alias
              }
              fieldEpisodeTeaser
              fieldEpisodeAiringDate {
                value
              }
              fieldHeroImage {
                alt
                width
                height
                entity {
                  urlAbsolute
                }
              }
            }
          }
        }
      }
    `,
    variables: { showId },
  });

  return {
    props: {
      show: showResultData.route.entity,
      episodes: episodesResult?.entityQuery?.items ?? [],
    },
  };
};

// Show details component
const ShowDetails = ({ show, episodes }: InferGetStaticPropsType<typeof getStaticProps>) => {
  return (
    <Layout>
      <Head>
        <title>{`${show.title} | Next.js for Drupal`}</title>
        <meta
          name="description"
          content={`Details about the show ${show.title}.`}
        />
      </Head>
      <div className="relative w-full h-[45dvh] lg:h-[65dvh]">
        <Image 
          src={show?.fieldHeroImage?.entity?.urlAbsolute} 
          alt={show.fieldHeroImage?.alt} 
          priority={true} 
          fill={true} 
          className="object-cover" 
          loading="eager"
          sizes="100vw"
        />
      </div>
      <div className="container py-10 mx-auto">
        <Link href="/shows" className="bg-blue-600 text-white p-3 inline-block my-4">Back to shows</Link>
        <h1 className="mb-10 text-6xl font-black my-4">{show.title}</h1>
        <div dangerouslySetInnerHTML={{ __html: show.body }} className="prose inline my-4"/>
        <div className="grid grid-cols-1 gap-10 my-6 lg:grid-cols-3">
          {episodes?.length > 0 && episodes.map((episode) => (
            <div key={episode.id}>
              <Link href={episode.path.alias} className="relative w-full min-h-64 max-h-64 flex flex-col">
                {episode.fieldHeroImage && (
                  <Image
                    src={`${episode.fieldHeroImage.entity.urlAbsolute}`}
                    alt={episode.fieldHeroImage.alt}
                    width={episode.fieldHeroImage.width}
                    height={episode.fieldHeroImage.height}
                    className="absolute top-0 left-0 h-full w-full"
                  />
                )}
                <div className="bg-black bg-opacity-80 mt-auto text-white z-10 p-4">
                  <div className="font-bold">{episode.title}</div>
                  <div dangerouslySetInnerHTML={{ __html: episode.fieldEpisodeTeaser }} />
                </div>
              </Link>
            </div>
          ))}
        </div>

        <div dangerouslySetInnerHTML={{ __html: show.fieldExtendedShowDescription }} className="prose inline"/>
      </div>
    </Layout>
  );
};

export default ShowDetails;

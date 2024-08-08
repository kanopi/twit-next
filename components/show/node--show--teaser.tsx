// components/show--teaser.tsx

import Link from "next/link";
import Image from "next/image";
import { Show } from "types";

interface NodeShowTeaserProps {
  node: Show;
}

const NodeShowTeaser = ({ node }: NodeShowTeaserProps) => {
  return (
    <div key={node.id} className="flex flex-row gap-6 shadow-lg">
      <Link href={node.path.alias}>
        {node?.fieldCoverAlbumArt?.entity?.urlAbsolute && (
          <Image
            src={`${node.fieldCoverAlbumArt.entity.urlAbsolute}`}
            width={200}
            height={200}
            alt={node.title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 200px"
          />
        )}
      </Link>
      <div className="flex flex-col flex-1 p-4">
        <Link href={node.path.alias} className="text-2xl hover:underline focus:underline">{node.title}</Link>
        <p>{node.fieldShowTagline}</p>
      </div>
    </div>
  );
};

export default NodeShowTeaser;

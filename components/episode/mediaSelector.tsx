import dynamic from 'next/dynamic';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false });

const MediaSelector = ({ mediaList, fieldHeroImage }) => {
  // Filter mediaList to include only items with a valid fieldMediaFormat and ensure the media object is not null or undefined
  const validMediaList = mediaList?.filter(media => media && media.fieldMediaFormat) || [];

  const [selectedFormat, setSelectedFormat] = useState(validMediaList?.[0]?.fieldMediaFormat || '');
  const [userSelected, setUserSelected] = useState(false);
  const playerRef = useRef(null);

  const handleSelectionChange = (event) => {
    setSelectedFormat(event.target.value);
    setUserSelected(true);
  };

  const selectedMedia = validMediaList.find(media => media.fieldMediaFormat === selectedFormat);
  const isAudio = selectedFormat === 'audio';

  useEffect(() => {
    if (userSelected && playerRef.current) {
      const topOffset = playerRef.current.getBoundingClientRect().top + window.scrollY - 250;
      window.scrollTo({ top: topOffset, behavior: 'smooth' });
    }
  }, [selectedFormat, userSelected]);

  const renderLightImage = () => {
    if (fieldHeroImage?.entity?.urlAbsolute && selectedFormat === 'video') {
      return (
        <Image
          src={fieldHeroImage.entity.urlAbsolute}
          alt={fieldHeroImage.alt || 'Thumbnail'}
          layout="fill"
          objectFit="cover"
          priority
        />
      );
    }
    return null;
  };

  if (!validMediaList || validMediaList.length === 0) {
    return <p>This episode is coming soon...</p>;
  }

  return (
    <div>
      {/* ReactPlayer Component */}
      {selectedMedia && selectedMedia?.fieldMediaUrl?.uri?.path && (
        <div
          ref={playerRef}
          className="w-full relative"
          style={{
            paddingTop: isAudio ? '0' : '56.25%',
          }}
        >
          <ReactPlayer
            url={selectedMedia.fieldMediaUrl.uri.path}
            controls={true}
            width="100%"
            height={isAudio ? '50px' : '100%'}
            light={selectedFormat === 'video' ? renderLightImage() : false}
            style={isAudio ? {} : { position: 'absolute', top: 0, left: 0 }}
          />
        </div>
      )}
      {/* Dropdown Select List */}
      <div className="flex flex-row justify-end">
        <select
          onChange={handleSelectionChange}
          value={selectedFormat}
          name="selectMedia"
          id="selectMedia"
          className="mt-3 bg-blue-600 p-3 text-xl text-white"
        >
          {validMediaList.map((media) => (
            <option key={media.id} value={media.fieldMediaFormat}>
              {media.fieldMediaFormat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MediaSelector;

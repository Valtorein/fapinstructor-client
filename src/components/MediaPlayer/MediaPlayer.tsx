import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";

import { MediaLink, MediaType } from "@/types/Media";
import { selectSettings } from "@/stores/settings";
import { loadRedGifLink } from "@/api/redgifs/redgifs";

const useStyles = makeStyles(() => ({
  video: {
    width: "100%",
    height: "99%",
  },
  image: {
    width: "100%",
    height: "99%",
    objectFit: "contain",
  },
  youtube: {
    width: "99%",
    height: "90%",
  },
}));

const isYouTube = (url: string) => url.includes("www.youtube-nocookie.com");

export type MediaPlayerProps = {
  link: MediaLink;
  onEnded: () => void;
  duration: number;
};

export function MediaPlayer({ link, duration, onEnded }: MediaPlayerProps) {
  const classes = useStyles();
  const [playCount, setPlayCount] = useState(0);
  const [directLink, setDirectLink] = useState(link.directLink);
  const [mediaType, setMediaType] = useState(link.mediaType);
  const settings = useSelector(selectSettings);

  useEffect(() => {
    let timeout = 0;

    if (
      mediaType === MediaType.Picture ||
      mediaType === MediaType.Gif
    ) {
      if (timeout === 0) {
        timeout = window.setTimeout(onEnded, duration * 1000);
      }
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [directLink, mediaType, duration, onEnded]);

  useEffect(() => {
    if (!link.directLink.includes('redgifs.com')) {
      setDirectLink(link.directLink);
      setMediaType(link.mediaType);
      return;
    }

    loadRedGifLink(link)
      .then((rgLink) => {
        setDirectLink(rgLink.directLink);
        setMediaType(rgLink.mediaType);
      })
      .catch(() => onEnded());
  }, [link, onEnded]);

  function repeatForDuration(event: React.ChangeEvent<HTMLVideoElement>) {
    if (event.target.duration * (playCount + 1) < duration) {
      setPlayCount(playCount + 1);
      event.target.play().catch(() => {
        // An exception is thrown if the user changes the slide before the video starts playback.
        // Ref: https://goo.gl/LdLk22
      });
    } else {
      setPlayCount(0);
      onEnded();
    }
  }

  if (directLink === '') {
    //  Placeholder while we load the image URL from redgifs
    return <div></div>;
  } else if (mediaType === MediaType.Video) {
    return (
      <video
        className={classes.video}
        src={directLink}
        style={{
          pointerEvents: `none`,
        }}
        autoPlay
        muted={!settings.videoAudio}
        onError={onEnded}
        onEnded={repeatForDuration}
        playsInline
      />
    );
  } else if (
    mediaType === MediaType.Gif ||
    mediaType === MediaType.Picture
  ) {
    return <img className={classes.image} src={directLink} alt="" />;
  } else if (isYouTube(directLink)) {
    return (
      <iframe
        src={directLink}
        title="youtube"
        className={classes.youtube}
        frameBorder="0"
        allowFullScreen
      />
    );
  } else {
    throw new Error("unavailable media type");
  }
}

import { useState, useEffect, useRef } from 'react';

export default function usePictureInPicture() {
  const [isPiP, setIsPiP] = useState(false);
  const videoRef = useRef(null);

  const enterPiP = async () => {
    if (videoRef.current && document.pictureInPictureEnabled) {
      try {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      } catch (err) {
        console.error('PiP error:', err);
      }
    }
  };

  const exitPiP = async () => {
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } catch (err) {
        console.error('Exit PiP error:', err);
      }
    }
  };

  useEffect(() => {
    const handlePiPChange = () => {
      setIsPiP(!!document.pictureInPictureElement);
    };

    videoRef.current?.addEventListener('enterpictureinpicture', handlePiPChange);
    videoRef.current?.addEventListener('leavepictureinpicture', handlePiPChange);

    return () => {
      videoRef.current?.removeEventListener('enterpictureinpicture', handlePiPChange);
      videoRef.current?.removeEventListener('leavepictureinpicture', handlePiPChange);
    };
  }, []);

  return { videoRef, isPiP, enterPiP, exitPiP };
}
import React from 'react';
import PlayPauseButton from './PlayPauseButton';
import Icon from 'components/icons';
import PlayerRange from './Range';
import { AVAILABLE_PLAYBACK_STATES } from './constants';

type Props = {
  handleShuffle: () => void;
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;

  handleBack: () => void;
  handleNext: () => void;

  playbackState: string;
};

function ControlSection({
  handleShuffle,
  isPlaying,
  setIsPlaying,

  handleBack,
  handleNext,
  playbackState,
}: Props) {
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="justify-center mx-10 min-w-[150px] lg:min-w-[12.5rem]">
      <div className="flex items-center justify-between">
        {/* <PlayPauseButton onClick={handleShuffle}>
					<Icon name="SHUFFLE" className="w-5 h-5" />
				</PlayPauseButton> */}
        <PlayPauseButton onClick={handleBack}>
          <Icon name="BACKWARD" className="w-5 h-5 text-primary" />
        </PlayPauseButton>
        <PlayPauseButton onClick={handlePlayPause}>
          {isPlaying ? (
            <Icon name="PAUSE" className="w-8 h-8 text-primary" />
          ) : (
            <Icon name="PLAY" className="w-8 h-8 text-primary" />
          )}
        </PlayPauseButton>
        <PlayPauseButton onClick={handleNext}>
          <Icon name="FORWARD" className="w-5 h-5" />
        </PlayPauseButton>
        <div
          className="hidden sm:flex w-7 h-7"
          // tooltip
          // data-tip={playbackState}
        >
          <PlayPauseButton onClick={handleShuffle}>
            {playbackState === AVAILABLE_PLAYBACK_STATES.PLAY_ALL && (
              <Icon name="SHUFFLE" className="w-5 h-5 text-gray-600 block" />
            )}
            {playbackState === AVAILABLE_PLAYBACK_STATES.REPEAT_ALL && (
              <Icon name="SHUFFLE" className="w-5 h-5 text-primary block" />
            )}
            {playbackState === AVAILABLE_PLAYBACK_STATES.REPEAT_ONE && (
              <Icon
                name="SHUFFLE_ONCE"
                className="w-6 h-6 text-primary block"
              />
            )}
          </PlayPauseButton>
        </div>
      </div>
    </div>
  );
}

export default ControlSection;

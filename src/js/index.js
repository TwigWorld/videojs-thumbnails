import videojs from 'video.js';
import ThumbnailHelpers from './thumbnail_helpers.js';
import {window} from 'global';

// Default options for the plugin.
const defaults = {};

// Cross-compatibility for Video.js 5 and 6.
const registerPlugin = videojs.registerPlugin || videojs.plugin;
// const dom = videojs.dom || videojs;

/**
 * Function to invoke when the player is ready.
 *
 * This is a great place for your plugin to initialize itself. When this
 * function is called, the player will have its DOM and child components
 * in place.
 *
 * @function onPlayerReady
 * @param    {Player} player
 *           A Video.js player.
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */

const prepareThumbnailsClips = (videoTime, options) => {

  let currentTime = 0;
  let currentIteration = 0;
  let thumbnailOffset = 0;
  const stepTime = options.stepTime;
  const thumbnailWidth = options.width;
  const spriteURL = options.spriteUrl;
  const thumbnailClips = {
    0: {
      src: spriteURL,
      style: {
        left: (thumbnailWidth / 2 * -1) + 'px',
        width: ((Math.floor(videoTime / stepTime) + 1) * thumbnailWidth) + 'px',
        clip: 'rect(0,' + options.width + 'px,' + options.width + 'px, 0)'
      }
    }
  };

  while (currentTime <= videoTime) {
    currentTime += stepTime;
    thumbnailOffset = ++currentIteration * thumbnailWidth;
    thumbnailClips[currentTime] = {
      style: {
        left: ((thumbnailWidth / 2 + thumbnailOffset) * -1) + 'px',
        clip: 'rect(0, ' + (thumbnailWidth + thumbnailOffset) + 'px,' +
              options.width + 'px, ' + thumbnailOffset + 'px)'
      }
    };
  }
  return thumbnailClips;
};

const initializeThumbnails = (thumbnailsClips, player) => {

  const thumbnailClips = ThumbnailHelpers.createThumbnails({}, defaults, thumbnailsClips);
  const progressControl = player.controlBar.progressControl;
  const thumbnailImg = ThumbnailHelpers.createThumbnailImg(thumbnailClips);
  const timelineTime = ThumbnailHelpers.createThumbnailTime();
  const thumbnailArrowDown = ThumbnailHelpers.createThumbnailArrowDown();
  let thumbnaislHolder = ThumbnailHelpers.createThumbnaislHolder();

  thumbnaislHolder = ThumbnailHelpers.mergeThumbnailElements(thumbnaislHolder,
                                                             thumbnailImg,
                                                             timelineTime,
                                                             thumbnailArrowDown);
  ThumbnailHelpers.hidePlayerOnHoverTime(progressControl);

  if (window.navigator.userAgent.toLowerCase().indexOf('android') !== -1) {
    ThumbnailHelpers.suportAndroidEvents();
  }

  ThumbnailHelpers.createThumbnails(thumbnailImg.style,
                                    thumbnailClips['0'].style);

  ThumbnailHelpers.centerThumbnailOverCursor(thumbnailImg);

  ThumbnailHelpers.addThumbnailToPlayer(progressControl,
                                        thumbnaislHolder);

  ThumbnailHelpers.upadateOnHover(progressControl,
                                  thumbnaislHolder,
                                  thumbnailClips,
                                  timelineTime,
                                  thumbnailImg,
                                  player);

  ThumbnailHelpers.upadateOnHoverOut(progressControl,
                                     thumbnaislHolder,
                                     player);
};

const onPlayerReady = (player, options) => {
  player.on('loadedmetadata', (() => {
    const thumbnailsClips = prepareThumbnailsClips(player.duration(), options);

    initializeThumbnails(thumbnailsClips, player);
  }));
};
/**
 * A video.js plugin.
 *
 * In the plugin function, the value of `this` is a video.js `Player`
 * instance. You cannot rely on the player being in a "ready" state here,
 * depending on how the plugin is invoked. This may or may not be important
 * to you; if not, remove the wait for "ready"!
 *
 * @function thumbnails
 * @param    {Object} [options={}]
 *           An object of options left to the plugin author to define.
 */
const thumbnails = function(options) {
  this.ready(() => {
    onPlayerReady(this, videojs.mergeOptions(defaults, options));
  });
};

// Register the plugin with video.js.
registerPlugin('thumbnails', thumbnails);

// Include the version number.
thumbnails.VERSION = '__VERSION__';

export default thumbnails;

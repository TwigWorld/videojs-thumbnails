import {document, window} from 'global';

export default class ThumbnailHelpers {
  /* global player  */

  /** This is a description of the foo function. */
  /**
   * Represents a book.
   * @constructor
   * @param {string} title - The title of the book.
   * @param {string} author - The author of the book.
   */
  static createThumbnails(...args) {

    const thumbnailClip = args.shift() || {};

    Object.keys(args).map((i) => {
      const singleThumbnail = args[i];

      Object.keys(singleThumbnail).map((property) => {
        if (singleThumbnail.hasOwnProperty(property)) {
          if (typeof singleThumbnail[property] === 'object') {
            thumbnailClip[property] = ThumbnailHelpers.createThumbnails(thumbnailClip[property],
                                                singleThumbnail[property]);
          } else {
            thumbnailClip[property] = singleThumbnail[property];
          }
        }
        return thumbnailClip;
      });
      return thumbnailClip;
    });
    return thumbnailClip;
  }

  static getComputedStyle(thumbnailContent, pseudo) {
    return (prop) => {
      if (window.getComputedStyle) {
        return window.getComputedStyle(thumbnailContent, pseudo)[prop];
      }
      return thumbnailContent.currentStyle[prop];
    };
  }

  static getVisibleWidth(thumbnailContent, width) {
    if (width) {
      return parseFloat(width);
    }

    let clip = ThumbnailHelpers.getComputedStyle(thumbnailContent)('clip');

    if (clip !== 'auto' && clip !== 'inherit') {
      clip = clip.split(/(?:\(|\))/)[1].split(/(?:,| )/);
      if (clip.length === 4) {
        return (parseFloat(clip[1]) - parseFloat(clip[3]));
      }
    }
    return 0;
  }

  static getScrollOffset() {
    if (window.pageXOffset) {
      return {
        x: window.pageXOffset,
        y: window.pageYOffset
      };
    }
    return {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop
    };
  }

  static suportAndroidEvents() {
    // Android doesn't support :active and :hover on non-anchor and non-button elements
    // so, we need to fake the :active selector for thumbnails to show up.
    const progressControl = player.controlBar.progressControl;

    const addFakeActive = () => {
      progressControl.addClass('fake-active');
    };

    const removeFakeActive = () => {
      progressControl.removeClass('fake-active');
    };

    progressControl.on('touchstart', addFakeActive);
    progressControl.on('touchend', removeFakeActive);
    progressControl.on('touchcancel', removeFakeActive);
  }

  static createThumbnaislHolder() {
    const wrap = document.createElement('div');

    wrap.className = 'vjs-thumbnail-holder';
    return wrap;
  }

  static createThumbnailImg(thumbnailClips) {
    const thumbnailImg = document.createElement('img');

    thumbnailImg.src = thumbnailClips['0'].src;
    thumbnailImg.className = 'vjs-thumbnail-img';
    return thumbnailImg;
  }

  static createThumbnailTime() {
    const time = document.createElement('div');

    time.className = 'vjs-thumbnail-time';
    time.id = 'vjs-time';
    return time;
  }

  static createThumbnailArrowDown() {
    const arrow = document.createElement('div');

    arrow.className = 'vjs-thumbnail-arrow';
    arrow.id = 'vjs-arrow';
    return arrow;
  }

  static mergeThumbnailElements(thumbnailsHolder,
                                thumbnailImg,
                                timelineTime,
                                thumbnailArrowDown) {

    thumbnailsHolder.appendChild(thumbnailImg);
    thumbnailsHolder.appendChild(timelineTime);
    thumbnailsHolder.appendChild(thumbnailArrowDown);
    return thumbnailsHolder;
  }

  static centerThumbnailOverCursor(thumbnailImg) {
    // center the thumbnail over the cursor if an offset wasn't provided
    if (!thumbnailImg.style.left && !thumbnailImg.style.right) {
      thumbnailImg.onload = () => {
        const thumbnailWidth = { width: -(thumbnailImg.naturalWidth / 2) };

        thumbnailImg.style.left = `${thumbnailWidth}px`;
      };
    }
  }

  static getVideoDuration() {
    let duration = player.duration();

    player.on('durationchange', () => {
      duration = player.duration();
    });
    return duration;
  }

  static addThumbnailToPlayer(progressControl, thumbnailsHolder) {
    progressControl.el().appendChild(thumbnailsHolder);
  }

  static findMouseLeftOffset(pageMousePositionX, progressControl, pageXOffset, event) {
    // find the page offset of the mouse
    let leftOffset = pageMousePositionX || (event.clientX +
                     document.body.scrollLeft + document.documentElement.scrollLeft);

    // subtract the page offset of the positioned offset parent
    leftOffset -= progressControl.el().
                  getBoundingClientRect().left + pageXOffset;
    return leftOffset;
  }

  static getMouseVideoTime(mouseLeftOffset, progressControl, duration) {
    return Math.floor((mouseLeftOffset - progressControl.el().offsetLeft) /
           progressControl.width() * duration);
  }

  static updateThumbnailTime(timelineTime, progressControl) {
    timelineTime.innerHTML = (progressControl.seekBar.mouseTimeDisplay.
                             el_.attributes['data-current-time'].value);
  }

  static getPageMousePositionX(event) {
    let pageMouseOffsetX = event.pageX;

    if (event.changedTouches) {
      pageMouseOffsetX = event.changedTouches[0].pageX;
    }
    return pageMouseOffsetX;
  }

  static keepThumbnailInsidePlayer(thumbnailImg,
                                   activeThumbnail,
                                   thumbnailClips,
                                   mouseLeftOffset,
                                   progresBarRightOffset) {

    const width = ThumbnailHelpers.getVisibleWidth(thumbnailImg, activeThumbnail.width ||
                  thumbnailClips[0].width);

    const halfWidth = width / 2;

    // make sure that the thumbnail doesn't fall off the right side of
    // the left side of the player
    if ((mouseLeftOffset + halfWidth) > progresBarRightOffset) {
      mouseLeftOffset -= (mouseLeftOffset + halfWidth) - progresBarRightOffset;
    } else if (mouseLeftOffset < halfWidth) {
      mouseLeftOffset = halfWidth;
    }
    return mouseLeftOffset;
  }

  static updateThumbnailLeftStyle(mouseLeftOffset, thumbnailsHolder) {
    const leftValue = { mouseLeftOffset };

    thumbnailsHolder.style.left = `${leftValue.mouseLeftOffset}px`;
  }

  static getActiveThumbnail(thumbnailClips, mouseTime) {
    let activeClip = 0;

    for (const clipNumber in thumbnailClips) {
      if (mouseTime > clipNumber) {
        activeClip = Math.max(activeClip, clipNumber);
      }
    }
    return thumbnailClips[activeClip];
  }

  static updateThumbnailSrc(activeThumbnail, thumbnailImg) {
    if (activeThumbnail.src && thumbnailImg.src !== activeThumbnail.src) {
      thumbnailImg.src = activeThumbnail.src;
    }
  }

  static updateThumbnailStyle(activeThumbnail, thumbnailImg) {
    if (activeThumbnail.style && thumbnailImg.style !== activeThumbnail.style) {
      ThumbnailHelpers.createThumbnails(thumbnailImg.style, activeThumbnail.style);
    }
  }

  static moveListener(event,
                      progressControl,
                      thumbnailsHolder,
                      thumbnailClips,
                      timelineTime,
                      thumbnailImg,
                      player) {

    const duration = ThumbnailHelpers.getVideoDuration();
    const pageXOffset = ThumbnailHelpers.getScrollOffset().x;
    const progresBarPosition = progressControl.el().
                               getBoundingClientRect();

    const progresBarRightOffset = (progresBarPosition.width ||
                                   progresBarPosition.right) +
                                   pageXOffset;

    const pageMousePositionX = ThumbnailHelpers.getPageMousePositionX(event);

    let mouseLeftOffset = ThumbnailHelpers.findMouseLeftOffset(pageMousePositionX,
                                                               progressControl,
                                                               pageXOffset,
                                                               event);

    const mouseTime = ThumbnailHelpers.getMouseVideoTime(mouseLeftOffset,
                                                         progressControl,
                                                         duration);

    const activeThumbnail = ThumbnailHelpers.getActiveThumbnail(thumbnailClips,
                                                                mouseTime);

    ThumbnailHelpers.updateThumbnailTime(timelineTime, progressControl);

    ThumbnailHelpers.updateThumbnailSrc(activeThumbnail, thumbnailImg);

    ThumbnailHelpers.updateThumbnailStyle(activeThumbnail, thumbnailImg);

    mouseLeftOffset = ThumbnailHelpers.keepThumbnailInsidePlayer(thumbnailImg,
                                                activeThumbnail,
                                                thumbnailClips,
                                                mouseLeftOffset,
                                                progresBarRightOffset);

    ThumbnailHelpers.updateThumbnailLeftStyle(mouseLeftOffset, thumbnailsHolder);
  }

  static upadateOnHover(progressControl,
                          thumbnailsHolder,
                          thumbnailClips,
                          timelineTime,
                          thumbnailImg) {

    // update the thumbnail while hovering
    progressControl.on('mousemove', (event) => {
      ThumbnailHelpers.moveListener(event,
                                    progressControl,
                                    thumbnailsHolder,
                                    thumbnailClips,
                                    timelineTime,
                                    thumbnailImg);
    });
    progressControl.on('touchmove', (event) => {
      ThumbnailHelpers.moveListener(event,
                                    progressControl,
                                    thumbnailsHolder,
                                    thumbnailClips,
                                    timelineTime,
                                    thumbnailImg);
    });
  }

  static hideThumbnail(thumbnailsHolder) {
    thumbnailsHolder.style.left = '-1000px';
  }

  static upadateOnHoverOut(progressControl, thumbnailsHolder, player) {

    // move the placeholder out of the way when not hovering
    progressControl.on('mouseout', (event) => {
      ThumbnailHelpers.hideThumbnail(thumbnailsHolder);
    });
    progressControl.on('touchcancel', (event) => {
      ThumbnailHelpers.hideThumbnail(thumbnailsHolder);
    });
    progressControl.on('touchend', (event) => {
      ThumbnailHelpers.hideThumbnail(thumbnailsHolder);
    });
    player.on('userinactive', (event) => {
      ThumbnailHelpers.hideThumbnail(thumbnailsHolder);
    });
  }
}

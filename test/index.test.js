import {document} from 'global';

import QUnit from 'qunitjs';
import sinon from 'sinon';
import videojs from 'video.js';

import plugin from '../src/js/index.js';
import ThumbnailHelpers from '../src/js/thumbnail_helpers.js';

const Player = videojs.getComponent('Player');

QUnit.module('sanity tests');

QUnit.test('the environment is sane', function(assert) {
  assert.strictEqual(typeof Array.isArray, 'function', 'es5 exists');
  assert.strictEqual(typeof sinon, 'object', 'sinon exists');
  assert.strictEqual(typeof videojs, 'function', 'videojs exists');
  assert.strictEqual(typeof plugin, 'function', 'plugin is a function');
});

QUnit.module('videojs-thumbnails', {

  beforeEach() {

    // Mock the environment's timers because certain things - particularly
    // player readiness - are asynchronous in video.js 5. This MUST come
    // before any player is created; otherwise, timers could get created
    // with the actual timer methods!

    this.prepareTresholds = (videoTime) => {
      let currentTime = 0;
      const stepTime = 2;
      let currentIteration = 0;
      const thumbnailWidth = 100;
      let thumbnailOffset = 0;
      const spriteURL = 'http://placehold.it/350x150';
      const tresholds = {
        0: {
          src: spriteURL,
          style: {
            left: (thumbnailWidth / 2 * -1) + 'px',
            width: ((Math.floor(videoTime / stepTime) + 1) * thumbnailWidth) + 'px',
            height: '86px',
            padding: '5px 0 23px 0',
            background: 'rgba(255,255,255,0.7)',
            clip: 'rect(0, 100px, 100px, 0)'
          }
        }
      };

      while (currentTime <= videoTime) {
        currentTime += stepTime;
        thumbnailOffset = ++currentIteration * thumbnailWidth;
        tresholds[currentTime] = {
          style: {
            left: ((thumbnailWidth / 2 + thumbnailOffset) * -1) + 'px',
            clip: 'rect(0, ' + (thumbnailWidth + thumbnailOffset) + 'px, 100px, ' +
                  thumbnailOffset + 'px)'
          }
        };
      }
      return tresholds;
    };

    this.clock = sinon.useFakeTimers();

    this.fixture = document.getElementById('qunit-fixture');
    this.video = document.createElement('video');
    this.fixture.appendChild(this.video);
    this.player = videojs(this.video);
  },

  afterEach() {
    this.player.dispose();
    this.clock.restore();
  }
});

QUnit.test('registers itself with video.js', function(assert) {

  assert.expect(8);

  assert.strictEqual(
    typeof Player.prototype.thumbnails,
    'function',
    'videojs-thumbnails plugin was registered'
  );

  // this.player.thumbnails();
  this.player.thumbnails(this.prepareTresholds(70));

  // Tick the clock forward enough to trigger the player to be "ready".
  this.clock.tick(1);

  // console.log(this.player.el().getElementsByClassName('vjs-thumbnail-time'))

  assert.equal(
    1,
    this.player.contentEl().getElementsByClassName('vjs-thumbnail-holder').length,
    'The plugin adds a wrapper div with class vjs-thumbnail-holder to the player'
  );

  assert.equal(
    1,
    this.player.contentEl().getElementsByClassName('vjs-thumbnail-img').length,
    'The plugin adds thumbnail image  with class vjs-thumbnail-img to the player'
  );

  assert.equal(
    1,
    this.player.contentEl().getElementsByClassName('vjs-thumbnail-time').length,
    'The plugin adds tile div with class vjs-thumbnail-time to the player'
  );

  assert.equal(
    1,
    this.player.contentEl().getElementsByClassName('vjs-thumbnail-arrow').length,
    'The plugin adds thumbnail arrow down elwment'
  );

  this.image = this.player.contentEl().getElementsByClassName('vjs-thumbnail-img')[0];

  assert.equal(
    'http://placehold.it/350x150',
    this.image.src,
    'The plugin adds thumbnail image with correct src url'
  );

  assert.equal(
    'rect(0px 100px 100px 0px)',
    this.image.style.clip,
    'The plugin adds thumbnail image with neccessery styles'
  );

  assert.equal(
    '-50px',
    this.image.style.left,
    'The plugin adds thumbnail image with correct left positioning'
  );
});

QUnit.test('Thumbnail behaviour when mouse hover', function(assert) {

  assert.expect(3);

  assert.strictEqual(
    typeof Player.prototype.thumbnails,
    'function',
    'videojs-thumbnails plugin was registered'
  );

  this.player.thumbnails(this.prepareTresholds(70));

  this.clock.tick(1);

  const thumbnaislHolder = this.player.contentEl().
                           getElementsByClassName('vjs-thumbnail-holder')[0];

  ThumbnailHelpers.updateThumbnailLeftStyle(200, thumbnaislHolder);

  assert.equal(
    '200px',
    thumbnaislHolder.style.left,
    'The plugin should add styles left to the holder element on hover'
  );

  ThumbnailHelpers.hideThumbnail(thumbnaislHolder);

  assert.equal(
    '-1000px',
    thumbnaislHolder.style.left,
    'The plugin adds left styles to the holder elemend and hide it when mouse out'
  );
});

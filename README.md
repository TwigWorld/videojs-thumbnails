# videojs-thumbnails

Thumbnails images on video progress bar.
Example of the thumbnail:
![Thumbnail example](https://github.com/TwigWorld/videojs-thumbnails/raw/master/thumbnails.jpg "Thumbnail example")

The plugin works with sprites. Example of sprite generated from the video:
![Thumbnail sprite example](https://github.com/TwigWorld/videojs-thumbnails/raw/master/sprite.jpg "Thumbnail sprite example")

## Installation

```sh
npm install --save videojs-thumbnails
```

The npm installation is preferred, but Bower works, too.

```sh
bower install  --save videojs-thumbnails
```

## Usage

To include videojs-thumbnails on your website or web application, use any of the following methods.

### `<script>` Tag

This is the simplest case. Get the script in whatever way you prefer and include the plugin _after_ you include [video.js][videojs], so that the `videojs` global is available.
Setup and initialisation below is an example of thumbnail shown in the screenshot above.
Depending on the ratio of your video you will generate specific size of the sprite so some adjustments to variable to best position and display thumbnails.
The sprite created in the example is 100th px ( depending on the video length ) wide and 58px high with the clip width of 100px ( see example above ).

```html
<script src="//path/to/video.min.js"></script>
<script src="//path/to/videojs-thumbnails.min.js"></script>
<script>
  var player = videojs('my-video');
  
  // example of setup for specific size of the sprite
  // adjust if necessary 
    player.thumbnails(
      {
        // width of the single sprite clip
        width: 100,
        // url to sprite image
        spriteUrl: "//path/to/sprite.jpg",
        // how often to change thumbnail on timeline ( ex. every 2sec )
        stepTime: 2,
      }
    );
</script>
```

### Styles

Thumbnail styles need to be also included for thumbnails to work correctly.

```html
 <link href="//path/to/videojs-thumbnails.css" rel="stylesheet">
```
To adjust style simply overide style in css file. For example .vjs-thumbnail-img class padding, background and height.

### Browserify

When using with Browserify, install videojs-thumbnails via npm and `require` the plugin as you would any other module.

```js
var videojs = require('video.js');

// The actual plugin function is exported by this module, but it is also
// attached to the `Player.prototype`; so, there is no need to assign it
// to a variable.
require('videojs-thumbnails');

var player = videojs('my-video');

player.thumbnails();
```

### RequireJS/AMD

When using with RequireJS (or another AMD library), get the script in whatever way you prefer and `require` the plugin as you normally would:

```js
require(['video.js', 'videojs-thumbnails'], function(videojs) {
  var player = videojs('my-video');

  player.thumbnails();
});
```

## License

MIT. Copyright (c) Mariusz Rajczakowski &lt;mrajczakowski@gmail.com&gt;


[videojs]: http://videojs.com/

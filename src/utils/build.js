
/**
 * Topbar compilation
 * Use the same params variable for all compilation.
 */

var builder = require('./builder.js');

var topbar = {
  "baseUrl": "../",
  "main": "js/topbar",
  "out": "../build/topbar.js",
  "minify": false,
  "shortcut": "",
  "paths": {
    'Physics': 'Physics/src/Physics',
    'Vector': 'Physics/src/Vector',
    'common': 'utils/common',
    'Attraction': 'Physics/src/Attraction',
    'Integrator': 'Physics/src/Integrator',
    'Particle': 'Physics/src/Particle',
    'ParticleSystem': 'Physics/src/ParticleSystem',
    'requestAnimationFrame': '../third-party/requestAnimationFrame',
    'Spring': 'Physics/src/Spring'
  }
};

function compileTopbar() {

  builder.build(topbar);

  topbar.minify = true;
  topbar.out = '../build/topbar.min.js';
  topbar.on_compile = compileInspiration;

  builder.build(topbar);

}

/**
 * Inspiration compilation
 */

function compileInspiration() {

  var inspiration = {
    "baseUrl": '../',
    "main": "js/inspiration",
    "out": "../build/inspiration.js",
    "minify": false,
    "shortcut": "",
    "paths": {
      "common": "utils/common"
    }
  };

  builder.build(inspiration);

  inspiration.minify = true;
  inspiration.out = '../build/inspiration.min.js';

  builder.build(inspiration);

}

compileTopbar();
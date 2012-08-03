
var params = {
  "baseUrl": "../",
  "main": "js/main",
  "out": "../build/main.js",
  "minify": false,
  "shortcut": "",
  "paths": {
    'Physics': 'Physics/src/Physics',
    'Vector': 'Physics/src/Vector',
    'common': 'Physics/src/common',
    'Attraction': 'Physics/src/Attraction',
    'Integrator': 'Physics/src/Integrator',
    'Particle': 'Physics/src/Particle',
    'ParticleSystem': 'Physics/src/ParticleSystem',
    'requestAnimationFrame': '../third-party/requestAnimationFrame',
    'underscore': 'utils/empty',
    'Spring': 'Physics/src/Spring'
  }
}

require('./builder.js').build(params);

params.minify = true;
params.out = '../build/main.min.js';

require('./builder.js').build(params);
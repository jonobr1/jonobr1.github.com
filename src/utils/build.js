
var params = {
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
}

require('./builder.js').build(params);

params.minify = true;
params.out = '../build/topbar.min.js';

require('./builder.js').build(params);
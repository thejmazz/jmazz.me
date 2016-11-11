/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _colorUtils = __webpack_require__(1);

	var _randomUtils = __webpack_require__(2);

	// === WORLD ===

	var world = new WHS.World({
	  stats: 'fps',
	  autoresize: 'window',

	  gravity: [0, -100, 0],

	  camera: {
	    position: [-5, 14, 10],
	    near: 0.01,
	    far: 1000
	  },

	  rendering: {
	    background: {
	      color: 0x162129
	    },

	    renderer: {
	      antialias: true
	    }
	  },

	  shadowmap: {
	    type: THREE.PCFSoftShadowMap
	  }
	});

	// === LIGHTING ===

	new WHS.AmbientLight({
	  light: {
	    intensity: 0.5
	  }
	}).addTo(world);

	new WHS.PointLight({
	  light: {
	    intensity: 0.5,
	    distance: 100
	  },

	  shadowmap: {
	    fov: 90
	  },

	  position: [0, 10, 10]
	}).addTo(world);

	// === MESHES ===

	new WHS.Plane({
	  geometry: {
	    width: 1000,
	    height: 1000
	  },

	  mass: 0,

	  material: {
	    color: 0x447F8B,
	    kind: 'lambert'
	  },

	  rotation: {
	    x: -Math.PI / 2
	  }
	}).addTo(world);

	var sphere = new WHS.Sphere({
	  geometry: {
	    radius: 3,
	    widthSegments: 32,
	    heightSegments: 32
	  },

	  mass: 10, // Mass of physics object.

	  material: {
	    color: 0xff00000,
	    kind: 'lambert'
	  },

	  position: [0, 100, 0]
	});

	var boxMaker = function boxMaker(position) {
	  var rotation = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : { x: 0, y: 0, z: 0 };
	  return new WHS.Box({
	    geometry: {
	      width: 3,
	      height: 1,
	      depth: 1
	    },
	    material: {
	      color: (0, _randomUtils.pick)(_colorUtils.flatUIHexColors),
	      kind: 'lambert'
	    },
	    position: position,
	    rotation: rotation
	  });
	};

	var base = 0.5;
	var levelMaker = function levelMaker(height) {
	  var y = base + height;

	  var rotation = height % 2 === 0 ? { x: 0, y: 0, z: 0 } : { x: 0, y: Math.PI / 2, z: 0 };

	  if (height % 2 === 0) {
	    boxMaker([0, y, 0], rotation).addTo(world);
	    boxMaker([0, y, -1], rotation).addTo(world);
	    boxMaker([0, y, -2], rotation).addTo(world);
	  } else {
	    boxMaker([-1, y, -1], rotation).addTo(world);
	    boxMaker([0, y, -1], rotation).addTo(world);
	    boxMaker([1, y, -1], rotation).addTo(world);
	  }
	};

	for (var i = 0; i < 10; i++) {
	  levelMaker(i);
	}

	// === START ===
	world.start();
	world.setControls(new WHS.OrbitControls());

/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var flatUIHexColors = exports.flatUIHexColors = [0x1abc9c, 0x16a085, 0x2ecc71, 0x27ae60, 0x3498db, 0x2980b9, 0x9b59b6, 0x8e44ad, 0x34495e, 0x2c3e50, 0xf1c40f, 0xf39c12, 0xe67e22, 0xd35400, 0xe74c3c, 0xc0392b, 0xecf0f1, 0xbdc3c7, 0x95a5a6, 0x7f8c8d];

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var pick = exports.pick = function pick(arr) {
	  return arr[Math.floor(Math.random() * arr.length)];
	};

/***/ }
/******/ ]);
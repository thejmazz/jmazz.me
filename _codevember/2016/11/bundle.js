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

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _colorUtils = __webpack_require__(1);

	var _randomUtils = __webpack_require__(2);

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

	// === COMPONENTS ===

	var Box = function (_WHS$Box) {
	  _inherits(Box, _WHS$Box);

	  function Box(props) {
	    _classCallCheck(this, Box);

	    return _possibleConstructorReturn(this, (Box.__proto__ || Object.getPrototypeOf(Box)).call(this, _extends({}, Box.defaults, {
	      material: _extends({}, Box.defaults.material, {
	        color: (0, _randomUtils.pick)(_colorUtils.flatUIHexColors)
	      })
	    }, props)));
	  }

	  return Box;
	}(WHS.Box);

	// === World Construction ===

	Box.defaults = {
	  material: {
	    kind: 'lambert'
	  },
	  geometry: {
	    width: 3,
	    height: 1,
	    depth: 1
	  },
	  mass: 0
	};
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

	var level = function level(_ref, type) {
	  var _ref2 = _slicedToArray(_ref, 3),
	      x = _ref2[0],
	      y = _ref2[1],
	      z = _ref2[2];

	  var yRotation = type === 0 ? 0 : Math.PI / 2;
	  var rotation = { x: 0, y: yRotation, z: 0 };

	  var level = {
	    rotation: yRotation,
	    children: []
	  };

	  if (type === 0) {
	    level.children = [new Box({ rotation: rotation, position: [x, y, z] }), new Box({ rotation: rotation, position: [x, y, z - 1] }), new Box({ rotation: rotation, position: [x, y, z - 2] })];
	  } else if (type === 1) {
	    level.children = [new Box({ rotation: rotation, position: [x - 1, y, z - 1] }), new Box({ rotation: rotation, position: [x, y, z - 1] }), new Box({ rotation: rotation, position: [x + 1, y, z - 1] })];
	  }

	  level.children.forEach(function (component) {
	    return component.addTo(world);
	  });

	  return level;
	};

	var tower = function tower(_ref3, height) {
	  var _ref4 = _slicedToArray(_ref3, 3),
	      x = _ref4[0],
	      y = _ref4[1],
	      z = _ref4[2];

	  var levels = [];
	  for (var i = y; i < height; i++) {
	    levels.push(level([x, i + 0.5, z], i % 2));
	  }

	  return { levels: levels };
	};

	var tower1 = tower([0, 0, 0], 10);
	var tower2 = tower([0, 0, 6], 10);

	console.log(tower2.levels[9]);

	// === LOOPS ===

	new WHS.Loop(function (clock) {
	  var box = tower1.levels[9].children[1];

	  if (box.position.z > 5) {
	    this.stop(world);
	  } else {
	    box.position.z += clock.getDelta() * 0.5;
	  }
	}).start(world);

	new WHS.Loop(function (clock) {
	  var delta = clock.getDelta();
	  var box = tower2.levels[9].children[1];

	  if (box.position.z > 8) {
	    box.position.y -= delta * 0.5;
	  } else {
	    box.position.z += delta * 0.5;
	  }

	  if (box.position.y < 0.5) {
	    this.stop(world);
	  }
	}).start(world);

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
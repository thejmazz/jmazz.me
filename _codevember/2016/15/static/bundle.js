(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = function(strings) {
  if (typeof strings === 'string') strings = [strings]
  var exprs = [].slice.call(arguments,1)
  var parts = []
  for (var i = 0; i < strings.length-1; i++) {
    parts.push(strings[i], exprs[i] || '')
  }
  parts.push(strings[i])
  return parts.join('')
}

},{}],2:[function(require,module,exports){
// stats.js - http://github.com/mrdoob/stats.js
(function(f,e){"object"===typeof exports&&"undefined"!==typeof module?module.exports=e():"function"===typeof define&&define.amd?define(e):f.Stats=e()})(this,function(){var f=function(){function e(a){c.appendChild(a.dom);return a}function u(a){for(var d=0;d<c.children.length;d++)c.children[d].style.display=d===a?"block":"none";l=a}var l=0,c=document.createElement("div");c.style.cssText="position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000";c.addEventListener("click",function(a){a.preventDefault();
u(++l%c.children.length)},!1);var k=(performance||Date).now(),g=k,a=0,r=e(new f.Panel("FPS","#0ff","#002")),h=e(new f.Panel("MS","#0f0","#020"));if(self.performance&&self.performance.memory)var t=e(new f.Panel("MB","#f08","#201"));u(0);return{REVISION:16,dom:c,addPanel:e,showPanel:u,begin:function(){k=(performance||Date).now()},end:function(){a++;var c=(performance||Date).now();h.update(c-k,200);if(c>g+1E3&&(r.update(1E3*a/(c-g),100),g=c,a=0,t)){var d=performance.memory;t.update(d.usedJSHeapSize/
1048576,d.jsHeapSizeLimit/1048576)}return c},update:function(){k=this.end()},domElement:c,setMode:u}};f.Panel=function(e,f,l){var c=Infinity,k=0,g=Math.round,a=g(window.devicePixelRatio||1),r=80*a,h=48*a,t=3*a,v=2*a,d=3*a,m=15*a,n=74*a,p=30*a,q=document.createElement("canvas");q.width=r;q.height=h;q.style.cssText="width:80px;height:48px";var b=q.getContext("2d");b.font="bold "+9*a+"px Helvetica,Arial,sans-serif";b.textBaseline="top";b.fillStyle=l;b.fillRect(0,0,r,h);b.fillStyle=f;b.fillText(e,t,v);
b.fillRect(d,m,n,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d,m,n,p);return{dom:q,update:function(h,w){c=Math.min(c,h);k=Math.max(k,h);b.fillStyle=l;b.globalAlpha=1;b.fillRect(0,0,r,m);b.fillStyle=f;b.fillText(g(h)+" "+e+" ("+g(c)+"-"+g(k)+")",t,v);b.drawImage(q,d+a,m,n-a,p,d,m,n-a,p);b.fillRect(d+n-a,m,a,p);b.fillStyle=l;b.globalAlpha=.9;b.fillRect(d+n-a,m,a,g((1-h/w)*p))}}};return f});

},{}],3:[function(require,module,exports){
'use strict';

var _create = require('./lib/create.js');

console.log('Try running toggleControls()');

var glslify = require('glslify');

var loader = new THREE.OBJLoader();
var jsonLoader = new THREE.JSONLoader();
var textureLoader = new THREE.TextureLoader();

var _createScene = (0, _create.createScene)({
  clearColor: 0xDBB98C
}),
    scene = _createScene.scene,
    camera = _createScene.camera,
    renderer = _createScene.renderer;

window.scene = scene;

camera.position.set(0, 4, 4);

var controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.minDistance = 1.7;
controls.maxDistance = 5;

// === LIGHT ===

var ambient = new THREE.AmbientLight(0xD9BC8B, 0.3);
scene.add(ambient);

var light = new THREE.PointLight(0xffffff, 1.5, 100);
light.position.set(5, 10, 5);
scene.add(light);

// === CONTROLS ===

var showing = false;
var guiContainer = document.createElement('div');
guiContainer.style.position = 'fixed';
guiContainer.style.top = '0';
document.body.appendChild(guiContainer);

window.toggleControls = function () {
  if (showing) {
    guiContainer.style.right = '10px';
    showing = false;
  } else {
    guiContainer.style.right = '9001px';
    showing = true;
  }
};
window.toggleControls();

var gui = new dat.GUI({ autoPlace: false });
guiContainer.appendChild(gui.domElement);

// === DIMENSIONS ===

var moonSize = 1;
var cloudsSize = moonSize * 2;

// === MOON ===

var moon = new THREE.Mesh(new THREE.SphereGeometry(moonSize, 32, 32), new THREE.MeshPhongMaterial({
  color: 0xB28D7F,
  shininess: 5,
  map: textureLoader.load('textures/moon-diffuse.jpg'),
  normalMap: textureLoader.load('textures/moon-normal.jpg')
}));

scene.add(moon);

// === CLOUDS ===

var params = function params() {
  this.frequency = 0.22;
  this.octaves = 10;
  this.amplitude = 0.5;
  this.lacunarity = 2.0;
  this.gain = 0.5;
  this.timeFactor = 0.01;
};

var p = new params();

gui.add(p, 'frequency', -10, 10);
gui.add(p, 'octaves', 1, 100);
gui.add(p, 'amplitude', -10, 10);
gui.add(p, 'lacunarity', -10, 10);
gui.add(p, 'gain', -10, 10);
gui.add(p, 'timeFactor', 0, 0.5);

var cloudsMaterial = new THREE.ShaderMaterial({
  uniforms: Object.assign({}, THREE.ShaderLib.lambert.uniforms, {
    time: { type: 'f', value: 0.0, step: 0.03 },
    diffuse: { value: new THREE.Color(0x673D4D) },
    frequency: { type: 'f', value: p.frequency },
    octaves: { type: 'i', value: p.octaves },
    amplitude: { type: 'f', value: p.amplitude },
    lacunarity: { type: 'f', value: p.lacunarity },
    gain: { type: 'f', value: p.gain },
    timeFactor: { type: 'f', value: p.timeFactor }
  }),
  vertexShader: glslify(["#define GLSLIFY 1\n#define LAMBERT\nvarying vec3 vLightFront;\n\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n\n// send xyz position to fragment shader\nvarying vec3 pos;\n\n#include <common>\n#include <uv_pars_vertex>\n#include <uv2_pars_vertex>\n#include <envmap_pars_vertex>\n#include <bsdfs>\n#include <lights_pars>\n#include <color_pars_vertex>\n#include <morphtarget_pars_vertex>\n#include <skinning_pars_vertex>\n#include <shadowmap_pars_vertex>\n#include <logdepthbuf_pars_vertex>\n#include <clipping_planes_pars_vertex>\n\nvoid main() {\n    pos = position;\n\n    #include <uv_vertex>\n    #include <uv2_vertex>\n    #include <color_vertex>\n    #include <beginnormal_vertex>\n    #include <morphnormal_vertex>\n    #include <skinbase_vertex>\n    #include <skinnormal_vertex>\n    #include <defaultnormal_vertex>\n    #include <begin_vertex>\n    #include <morphtarget_vertex>\n    #include <skinning_vertex>\n    #include <project_vertex>\n    #include <logdepthbuf_vertex>\n    #include <clipping_planes_vertex>\n    #include <worldpos_vertex>\n    #include <envmap_vertex>\n    #include <lights_lambert_vertex>\n    #include <shadowmap_vertex>\n}\n"]),
  fragmentShader: glslify(["#define GLSLIFY 1\n// simplex, son\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_2(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 mod289_2(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec4 permute_2(vec4 x) {\n     return mod289_2(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_1(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat snoise_2(vec3 v)\n  {\n  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n\n// First corner\n  vec3 i  = floor(v + dot(v, C.yyy) );\n  vec3 x0 =   v - i + dot(i, C.xxx) ;\n\n// Other corners\n  vec3 g_0 = step(x0.yzx, x0.xyz);\n  vec3 l = 1.0 - g_0;\n  vec3 i1 = min( g_0.xyz, l.zxy );\n  vec3 i2 = max( g_0.xyz, l.zxy );\n\n  //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n  //   x1 = x0 - i1  + 1.0 * C.xxx;\n  //   x2 = x0 - i2  + 2.0 * C.xxx;\n  //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n  vec3 x1 = x0 - i1 + C.xxx;\n  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n\n// Permutations\n  i = mod289_2(i);\n  vec4 p = permute_2( permute_2( permute_2(\n             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n\n// Gradients: 7x7 points over a square, mapped onto an octahedron.\n// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n  float n_ = 0.142857142857; // 1.0/7.0\n  vec3  ns = n_ * D.wyz - D.xzx;\n\n  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n\n  vec4 x_ = floor(j * ns.z);\n  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n\n  vec4 x = x_ *ns.x + ns.yyyy;\n  vec4 y = y_ *ns.x + ns.yyyy;\n  vec4 h = 1.0 - abs(x) - abs(y);\n\n  vec4 b0 = vec4( x.xy, y.xy );\n  vec4 b1 = vec4( x.zw, y.zw );\n\n  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n  vec4 s0 = floor(b0)*2.0 + 1.0;\n  vec4 s1 = floor(b1)*2.0 + 1.0;\n  vec4 sh = -step(h, vec4(0.0));\n\n  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n\n  vec3 p0_1 = vec3(a0.xy,h.x);\n  vec3 p1 = vec3(a0.zw,h.y);\n  vec3 p2 = vec3(a1.xy,h.z);\n  vec3 p3 = vec3(a1.zw,h.w);\n\n//Normalise gradients\n  vec4 norm = taylorInvSqrt_1(vec4(dot(p0_1,p0_1), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_1 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n\n// Mix final noise value\n  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n  m = m * m;\n  return 42.0 * dot( m*m, vec4( dot(p0_1,x0), dot(p1,x1),\n                                dot(p2,x2), dot(p3,x3) ) );\n  }\n\n//\n// Description : Array and textureless GLSL 2D/3D/4D simplex\n//               noise functions.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec4 mod289_1(vec4 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0; }\n\nfloat mod289_1(float x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0; }\n\nvec4 permute_1(vec4 x) {\n     return mod289_1(((x*34.0)+1.0)*x);\n}\n\nfloat permute_1(float x) {\n     return mod289_1(((x*34.0)+1.0)*x);\n}\n\nvec4 taylorInvSqrt_0(vec4 r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nfloat taylorInvSqrt_0(float r)\n{\n  return 1.79284291400159 - 0.85373472095314 * r;\n}\n\nvec4 grad4(float j, vec4 ip)\n  {\n  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0);\n  vec4 p,s;\n\n  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0;\n  p.w = 1.5 - dot(abs(p.xyz), ones.xyz);\n  s = vec4(lessThan(p, vec4(0.0)));\n  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;\n\n  return p;\n  }\n\n// (sqrt(5) - 1)/4 = F4, used once below\n#define F4 0.309016994374947451\n\nfloat snoise_1(vec4 v)\n  {\n  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4\n                        0.276393202250021,  // 2 * G4\n                        0.414589803375032,  // 3 * G4\n                       -0.447213595499958); // -1 + 4 * G4\n\n// First corner\n  vec4 i  = floor(v + dot(v, vec4(F4)) );\n  vec4 x0 = v -   i + dot(i, C.xxxx);\n\n// Other corners\n\n// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI)\n  vec4 i0;\n  vec3 isX = step( x0.yzw, x0.xxx );\n  vec3 isYZ = step( x0.zww, x0.yyz );\n//  i0.x = dot( isX, vec3( 1.0 ) );\n  i0.x = isX.x + isX.y + isX.z;\n  i0.yzw = 1.0 - isX;\n//  i0.y += dot( isYZ.xy, vec2( 1.0 ) );\n  i0.y += isYZ.x + isYZ.y;\n  i0.zw += 1.0 - isYZ.xy;\n  i0.z += isYZ.z;\n  i0.w += 1.0 - isYZ.z;\n\n  // i0 now contains the unique values 0,1,2,3 in each channel\n  vec4 i3 = clamp( i0, 0.0, 1.0 );\n  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 );\n  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 );\n\n  //  x0 = x0 - 0.0 + 0.0 * C.xxxx\n  //  x1 = x0 - i1  + 1.0 * C.xxxx\n  //  x2 = x0 - i2  + 2.0 * C.xxxx\n  //  x3 = x0 - i3  + 3.0 * C.xxxx\n  //  x4 = x0 - 1.0 + 4.0 * C.xxxx\n  vec4 x1 = x0 - i1 + C.xxxx;\n  vec4 x2 = x0 - i2 + C.yyyy;\n  vec4 x3 = x0 - i3 + C.zzzz;\n  vec4 x4 = x0 + C.wwww;\n\n// Permutations\n  i = mod289_1(i);\n  float j0 = permute_1( permute_1( permute_1( permute_1(i.w) + i.z) + i.y) + i.x);\n  vec4 j1 = permute_1( permute_1( permute_1( permute_1 (\n             i.w + vec4(i1.w, i2.w, i3.w, 1.0 ))\n           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 ))\n           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 ))\n           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 ));\n\n// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope\n// 7*7*6 = 294, which is close to the ring size 17*17 = 289.\n  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ;\n\n  vec4 p0_0 = grad4(j0,   ip);\n  vec4 p1 = grad4(j1.x, ip);\n  vec4 p2 = grad4(j1.y, ip);\n  vec4 p3 = grad4(j1.z, ip);\n  vec4 p4 = grad4(j1.w, ip);\n\n// Normalise gradients\n  vec4 norm = taylorInvSqrt_0(vec4(dot(p0_0,p0_0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n  p0_0 *= norm.x;\n  p1 *= norm.y;\n  p2 *= norm.z;\n  p3 *= norm.w;\n  p4 *= taylorInvSqrt_0(dot(p4,p4));\n\n// Mix contributions from the five corners\n  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0);\n  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0);\n  m0 = m0 * m0;\n  m1 = m1 * m1;\n  return 49.0 * ( dot(m0*m0, vec3( dot( p0_0, x0 ), dot( p1, x1 ), dot( p2, x2 )))\n               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ;\n\n  }\n\n//\n// Description : Array and textureless GLSL 2D simplex noise function.\n//      Author : Ian McEwan, Ashima Arts.\n//  Maintainer : ijm\n//     Lastmod : 20110822 (ijm)\n//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.\n//               Distributed under the MIT License. See LICENSE file.\n//               https://github.com/ashima/webgl-noise\n//\n\nvec3 mod289_0(vec3 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec2 mod289_0(vec2 x) {\n  return x - floor(x * (1.0 / 289.0)) * 289.0;\n}\n\nvec3 permute_0(vec3 x) {\n  return mod289_0(((x*34.0)+1.0)*x);\n}\n\nfloat snoise_0(vec2 v)\n  {\n  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0\n                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)\n                     -0.577350269189626,  // -1.0 + 2.0 * C.x\n                      0.024390243902439); // 1.0 / 41.0\n// First corner\n  vec2 i  = floor(v + dot(v, C.yy) );\n  vec2 x0 = v -   i + dot(i, C.xx);\n\n// Other corners\n  vec2 i1;\n  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0\n  //i1.y = 1.0 - i1.x;\n  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);\n  // x0 = x0 - 0.0 + 0.0 * C.xx ;\n  // x1 = x0 - i1 + 1.0 * C.xx ;\n  // x2 = x0 - 1.0 + 2.0 * C.xx ;\n  vec4 x12 = x0.xyxy + C.xxzz;\n  x12.xy -= i1;\n\n// Permutations\n  i = mod289_0(i); // Avoid truncation effects in permutation\n  vec3 p = permute_0( permute_0( i.y + vec3(0.0, i1.y, 1.0 ))\n    + i.x + vec3(0.0, i1.x, 1.0 ));\n\n  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);\n  m = m*m ;\n  m = m*m ;\n\n// Gradients: 41 points uniformly over a line, mapped onto a diamond.\n// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)\n\n  vec3 x = 2.0 * fract(p * C.www) - 1.0;\n  vec3 h = abs(x) - 0.5;\n  vec3 ox = floor(x + 0.5);\n  vec3 a0 = x - ox;\n\n// Normalise gradients implicitly by scaling m\n// Approximation of: m *= inversesqrt( a0*a0 + h*h );\n  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );\n\n// Compute final noise value at P\n  vec3 g;\n  g.x  = a0.x  * x0.x  + h.x  * x0.y;\n  g.yz = a0.yz * x12.xz + h.yz * x12.yw;\n  return 130.0 * dot(m, g);\n}\n\nuniform float frequency;\nuniform int octaves;\nuniform float amplitude;\nuniform float lacunarity;\nuniform float gain;\nuniform float timeFactor;\n\n// we gonna hijack diffuse\nuniform vec3 diffuse;\nuniform vec3 emissive;\n/* uniform float opacity; */\n\n// add time for noise\nuniform float time;\n// and take xyz pos from vertex shader\nvarying vec3 pos;\n\nvarying vec3 vLightFront;\n\n#ifdef DOUBLE_SIDED\n\tvarying vec3 vLightBack;\n#endif\n\n#include <common>\n#include <packing>\n#include <color_pars_fragment>\n#include <uv_pars_fragment>\n#include <uv2_pars_fragment>\n#include <map_pars_fragment>\n#include <alphamap_pars_fragment>\n#include <aomap_pars_fragment>\n#include <lightmap_pars_fragment>\n#include <emissivemap_pars_fragment>\n#include <envmap_pars_fragment>\n#include <bsdfs>\n#include <lights_pars>\n#include <fog_pars_fragment>\n#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>\n#include <specularmap_pars_fragment>\n#include <logdepthbuf_pars_fragment>\n#include <clipping_planes_pars_fragment>\n\nfloat fbm (vec3 pos, float time, float frequency, float amplitude, float lacunarity, float gain) {\n    float total = 0.0;\n    /* int octaves = 5; */\n\n    for (int i = 0; i < 100; i++) {\n        float noise = snoise_1(vec4(pos * frequency, time));\n        total += noise;\n\n        frequency *= lacunarity;\n        amplitude *= gain;\n\n        if (i == octaves - 1 ) {\n            break;\n        }\n    }\n\n    return total;\n}\n\nvoid main() {\n    /* float frequency = 0.5; */\n    /* float amplitude = 4.0; */\n    /* float lacunarity = 2.0; */\n    /* float gain = 0.5; */\n\n    /* float opacity = fbm(pos, time * 0.01, frequency, amplitude, lacunarity, gain); */\n    float opacity = fbm(pos, time * timeFactor, frequency, amplitude, lacunarity, gain);\n    opacity *= 0.8;\n\n    // see bottom to where gl_FragColor is set, using either diffuse or lighted\n    // color\n\n    // === lambert shader code ===\n\n    #include <clipping_planes_fragment>\n\n    vec4 diffuseColor = vec4( diffuse, opacity );\n    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );\n    vec3 totalEmissiveRadiance = emissive;\n\n    #include <logdepthbuf_fragment>\n    #include <map_fragment>\n    #include <color_fragment>\n    #include <alphamap_fragment>\n    #include <alphatest_fragment>\n    #include <specularmap_fragment>\n    #include <emissivemap_fragment>\n\n    reflectedLight.indirectDiffuse = getAmbientLightIrradiance( ambientLightColor );\n\n    #include <lightmap_fragment>\n\n    reflectedLight.indirectDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb );\n\n    #ifdef DOUBLE_SIDED\n            reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;\n    #else\n            reflectedLight.directDiffuse = vLightFront;\n    #endif\n\n    reflectedLight.directDiffuse *= BRDF_Diffuse_Lambert( diffuseColor.rgb ) * getShadowMask();\n\n    #include <aomap_fragment>\n\n    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;\n\n    #include <normal_flip>\n    #include <envmap_fragment>\n\n    /* gl_FragColor = vec4( outgoingLight, diffuseColor.a ); */\n    gl_FragColor = vec4( diffuse, opacity );\n    /* gl_FragColor = vec4( outgoingLight, opacity ); */\n\n    #include <premultiplied_alpha_fragment>\n    #include <tonemapping_fragment>\n    #include <encodings_fragment>\n    #include <fog_fragment>\n}\n\n"]),
  lights: true,
  transparent: true
});

var blackMaterial = new THREE.MeshLambertMaterial({
  color: 0x000000,
  side: THREE.BackSide
});

var clouds = new THREE.SceneUtils.createMultiMaterialObject(new THREE.SphereGeometry(cloudsSize, 64, 64), [cloudsMaterial, blackMaterial]);

scene.add(clouds);

// === LOOP ===

var update = function update(ts, delta) {
  moon.rotation.y += delta * 0.05 * Math.PI;
  clouds.rotation.y += delta * 0.025 * Math.PI;

  cloudsMaterial.uniforms.time.value += cloudsMaterial.uniforms.time.step;

  cloudsMaterial.uniforms.frequency.value = p.frequency;
  cloudsMaterial.uniforms.octaves.value = p.octaves;
  cloudsMaterial.uniforms.lacunarity.value = p.lacunarity;
  cloudsMaterial.uniforms.amplitude.value = p.amplitude;
  cloudsMaterial.uniforms.gain.value = p.gain;
  cloudsMaterial.uniforms.timeFactor.value = p.timeFactor;
};

// === LABEL ===

var label = document.createElement('div');
label.id = 'label';
label.innerHTML = '<b>CASPIAN</b> WAKING SEASON';
label.style.position = 'absolute';
// label.style.bottom = '100px'
// document.body.appendChild(label)

function toScreenPosition(obj, camera) {
  camera.updateMatrixWorld();
  var vector = new THREE.Vector3();

  var widthHalf = 0.5 * renderer.context.canvas.width;
  var heightHalf = 0.5 * renderer.context.canvas.height;

  obj.updateMatrixWorld();
  vector.setFromMatrixPosition(obj.matrixWorld);
  // console.log(camera)
  vector.project(camera);

  // console.log(vector)

  vector.x = vector.x * widthHalf + widthHalf;
  vector.y = -(vector.y * heightHalf) + heightHalf;

  return {
    x: vector.x,
    y: vector.y
  };
}

var divObj = new THREE.Object3D();
divObj.position.set(0, -6, 0);

var updateDivPosition = function updateDivPosition() {
  var label = document.getElementById('label');
  var coords = toScreenPosition(divObj, camera);

  label.style.left = coords.x - Math.floor(label.offsetWidth / 2) + 'px';
  label.style.top = coords.y + 'px';
};
// updateDivPosition()

// console.log(coords)

// === RENDER ===

var clock = new THREE.Clock();
// const stats = createStats()
var render = function render(ts) {
  // stats.begin()

  renderer.render(scene, camera);
  update(ts, clock.getDelta());
  // updateDivPosition()
  // need GPU for this...
  // cloudsMaterial.alphaMap = noiseTexture(ts)

  // stats.end()

  requestAnimationFrame(render);
};

render();

},{"./lib/create.js":4,"glslify":1}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createScene = exports.createStats = undefined;

var _stats = require('stats.js');

var _stats2 = _interopRequireDefault(_stats);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Adds stats box to DOM.
 * @return {Object} the stats object for reference
 */
var createStats = exports.createStats = function createStats() {
  var stats = new _stats2.default();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '10px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  return stats;
};

/**
 * Create THREE renderer
 * @param  {int} W width
 * @param  {int} H height
 * @return {Object}   THREE renderer
 */
var createRenderer = function createRenderer(W, H, clearColor, size) {
  var renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(W * size, H * size);
  renderer.setClearColor(clearColor);
  document.body.appendChild(renderer.domElement);
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.width = '100%';

  return renderer;
};

var createScene = exports.createScene = function createScene(_ref) {
  var _ref$W = _ref.W,
      W = _ref$W === undefined ? window.innerWidth : _ref$W,
      _ref$H = _ref.H,
      H = _ref$H === undefined ? window.innerHeight : _ref$H,
      _ref$size = _ref.size,
      size = _ref$size === undefined ? 1 : _ref$size,
      _ref$fov = _ref.fov,
      fov = _ref$fov === undefined ? 75 : _ref$fov,
      _ref$close = _ref.close,
      close = _ref$close === undefined ? 0.01 : _ref$close,
      _ref$far = _ref.far,
      far = _ref$far === undefined ? 100000 : _ref$far,
      _ref$clearColor = _ref.clearColor,
      clearColor = _ref$clearColor === undefined ? 0xffffff : _ref$clearColor;


  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(fov, W / H, close, far);
  // const camera = new THREE.OrthographicCamera(
  //   window.innerWidth / - 2,
  //   window.innerWidth / 2,
  //   window.innerHeight / 2,
  //   window.innerHeight / - 2,
  //   - 100,
  //   100 )
  var renderer = createRenderer(W, H, clearColor, size);

  return { scene: scene, camera: camera, renderer: renderer };
};

},{"stats.js":2}]},{},[3]);

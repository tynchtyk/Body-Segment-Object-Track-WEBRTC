// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"webrtc.js":[function(require,module,exports) {
var remoteVideo = document.getElementById('remote_video');
var canvas = document.getElementById('canvas');
var localStream = null;
var bodyPixNet = null;
var animationId = null;
var contineuAnimation = false;
var bodyPixMaks = null;
var segmentTimerId = null;
var maskType = 'room'; // ------- bodypix -------

function loadModel() {
  var net;
  return regeneratorRuntime.async(function loadModel$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap(bodyPix.load());

        case 2:
          net = _context.sent;
          bodyPixNet = net;
          console.log('bodyPix ready');

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
}

loadModel();

function updateSegment() {
  var segmeteUpdateTime = 10; // ms

  if (!bodyPixNet) {
    console.warn('bodyPix net NOT READY');
    return;
  }

  bodyPixNet.segmentPerson(remoteVideo).then(function (segmentation) {
    var foregroundColor = {
      r: 255,
      g: 255,
      b: 255,
      a: 255
    };
    var backgroundColor = {
      r: 0,
      g: 0,
      b: 0,
      a: 255
    };
    var personPartImage = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
    bodyPixMaks = personPartImage;

    if (contineuAnimation) {
      segmentTimerId = setTimeout(updateSegment, segmeteUpdateTime);
    }
  }).catch(function (err) {
    console.error('segmentPerson ERROR:', err);
  });
}

function drawCanvas(srcElement) {
  var opacity = 1.0;
  var flipHorizontal = false; //const maskBlurAmount = 0;

  var maskBlurAmount = 3;
  bodyPix.drawMask(canvas, srcElement, bodyPixMaks, opacity, maskBlurAmount, flipHorizontal);
}

function updateCanvas() {
  drawCanvas(remoteVideo);

  if (contineuAnimation) {
    animationId = window.requestAnimationFrame(updateCanvas);
  }
}

function writeCanvasString(str) {
  var ctx = canvas.getContext('2d');
  ctx.font = "64px serif";
  ctx.fillText(str, 5, 100);
  console.log(str);
}

function startCanvasVideo() {
  writeCanvasString('initalizing BodyPix');
  contineuAnimation = true;
  animationId = window.requestAnimationFrame(updateCanvas);
  updateSegment();
} // -------- user media -----------


function startVideo() {
  var mediaConstraints;
  return regeneratorRuntime.async(function startVideo$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          mediaConstraints = {
            video: {
              width: 640,
              height: 480
            },
            audio: false
          };
          _context2.next = 3;
          return regeneratorRuntime.awrap(navigator.mediaDevices.getUserMedia(mediaConstraints).catch(function (err) {
            console.error('media ERROR:', err);
            return;
          }));

        case 3:
          localStream = _context2.sent;
          remoteVideo.srcObject = localStream;
          _context2.next = 7;
          return regeneratorRuntime.awrap(remoteVideo.play().catch(function (err) {
            return console.error('local play ERROR:', err);
          }));

        case 7:
          remoteVideo.volume = 0;
          startCanvasVideo();

        case 9:
        case "end":
          return _context2.stop();
      }
    }
  });
}
},{}]},{},["webrtc.js"], null)
//# sourceMappingURL=/webrtc.f9d0e5f3.js.map
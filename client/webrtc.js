
let localStream = null;
var remoteVideo;
var peerConnection;
var uuid;
var serverConnection;

var overlay;
var overlayCC;


let objectNet = null;

let bodyPixNet = null;
let animationId = null;
let contineuAnimation = false;
let bodyPixMaks = null;
let segmentTimerId = null;
let canvasStream = null;
let maskType = 'room';
const rainbow = [
  [110, 64, 170], [143, 61, 178], [178, 60, 178], [210, 62, 167],
  [238, 67, 149], [255, 78, 125], [255, 94, 99],  [255, 115, 75],
  [255, 140, 56], [239, 167, 47], [217, 194, 49], [194, 219, 64],
  [175, 240, 91], [135, 245, 87], [96, 247, 96],  [64, 243, 115],
  [40, 234, 141], [28, 219, 169], [26, 199, 194], [33, 176, 213],
  [47, 150, 224], [65, 125, 224], [84, 101, 214], [99, 81, 195]
];

remoteVideo = document.getElementById('remoteVideo');
overlay = document.getElementById('overlay');
overlayCC = overlay.getContext('2d');


//Body Segment Model

async function loadModel() {
  const net = await bodyPix.load(
    //deete this to use defaul mode
    {
      architecture: 'MobileNetV1',
      outputStride: 16,
      multiplier: 0.75,
      quantBytes: 2
    }
  );
  bodyPixNet = net;
  console.log('bodyPix ready');
}


// Object detection
/*
async function loadModel2(){
  const model = await objectDetector.load('/model_web');
  objectNet = model;
}
loadModel2();*/

var peerConnectionConfig = {
  'iceServers': [
    {'urls': 'stun:stun.stunprotocol.org:3478'},
    {'urls': 'stun:stun.l.google.com:19302'},
  ]
};

  uuid = createUUID();



  serverConnection = new WebSocket('wss://' + window.location.hostname + ':8443');
  serverConnection.onmessage = gotMessageFromServer;
/*

function getUserMediaSuccess(stream) {
  localStream = stream;
//  localVideo.style.filter = "invert(100%)";
//remoteVideo.srcObject = localStream;
//  drawLoop();
}
*/






function errorHandler(error) {
  console.log(error);
}

function gotMessageFromServer(message) {
  if(!peerConnection) start(false);

  var signal = JSON.parse(message.data);

  // Ignore messages from ourself
  if(signal.uuid == uuid) return;

  if(signal.sdp) {
    peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(function() {
      // Only create answers in response to offers
      if(signal.sdp.type == 'offer') {
        peerConnection.createAnswer().then(createdDescription).catch(errorHandler);
      }
    }).catch(errorHandler);
  } else if(signal.ice) {
    peerConnection.addIceCandidate(new RTCIceCandidate(signal.ice)).catch(errorHandler);
  }
}

function gotIceCandidate(event) {
  if(event.candidate != null) {
    serverConnection.send(JSON.stringify({'ice': event.candidate, 'uuid': uuid}));
  }
}

function createdDescription(description) {
  console.log('got description');

  peerConnection.setLocalDescription(description).then(function() {
    serverConnection.send(JSON.stringify({'sdp': peerConnection.localDescription, 'uuid': uuid}));
  }).catch(errorHandler);
}

async function gotRemoteStream(event) {
  console.log('got remote stream');
  remoteVideo.srcObject = event.streams[0];
  await remoteVideo.play().catch(err => console.error('local play ERROR:', err));
  
  remoteVideo.volume = 0;

//  startCanvasVideo(); 
//  drawLoop()
//  startCanvasVideo()
}




function createUUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  }

  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}



function drawLoop() {
  console.log("DRAWING");
  requestAnimFrame(drawLoop);
   //psrElement.innerHTML = "score :" + ctrack.getScore().toFixed(4);
 
  overlayCC.clearRect(0, 0, remoteVideo.width, remoteVideo.height);

  overlayCC.drawImage( remoteVideo, 0, 0, remoteVideo.width, remoteVideo.height );
  /*var pixelData = overlayCC.getImageData( 0, 0 , remoteVideo.width,remoteVideo.height);
  var avg, i;
  // apply a  simple greyscale transformation
  for( i = 0; i < pixelData.data.length; i += 4 ) {
      avg = (
          pixelData.data[ i ] +
          pixelData.data[ i + 1 ] +
          pixelData.data[ i + 2 ]
      ) / 3;
      pixelData.data[ i ] = avg;
      pixelData.data[ i + 1 ] = avg;
      pixelData.data[ i + 2 ] = avg;
  }
  // write the manipulated pixel data to the second canvas
  overlayCC.putImageData( pixelData, 0, 0 );*/
  
  
}


function updateSegment() {
  const segmeteUpdateTime = 2; // ms
  if (!bodyPixNet) {
    //return ;
    //drawloop()
  }
  bodyPixNet.segmentMultiPersonParts(remoteVideo)
    .then(segmentation => {
      const foregroundColor = {r: 255, g: 255, b: 255, a: 255};
      const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
      const personPartImage = bodyPix.toColoredPartMask(segmentation, rainbow);
      bodyPixMaks = personPartImage;
      

      if (contineuAnimation) {
        segmentTimerId = setTimeout(updateSegment, segmeteUpdateTime);
      }
    })
    .catch(err => {
      console.error('segmentPerson ERROR:', err);
    })
}


function drawCanvas() {
  const opacity = 1.0;
  const flipHorizontal = false;
  //const maskBlurAmount = 0;
  const maskBlurAmount = 0;
  bodyPix.drawMask(
    overlay, remoteVideo, bodyPixMaks, opacity, maskBlurAmount,
    flipHorizontal
  );
}

function updateCanvas() {
  drawCanvas();
  if (contineuAnimation) {
    animationId = window.requestAnimationFrame(updateCanvas);
  }
}



function startCanvasVideo() {
  contineuAnimation = true;
  animationId = window.requestAnimationFrame(updateCanvas);

  updateSegment();

}

/*
const detectFrame = async model => {
  const predictions = await model.detect(remoteVideo)
  renderPredictions(predictions)
   requestAnimationFrame(() => {
    detectFrame(model)
  })
  
}

const renderPredictions = predictions => {
  overlayCC.clearRect(0, 0, overlayCC.canvas.width, overlayCC.canvas.height)
  // Font options.
  const font = '16px sans-serif'
 // overlayCC.font = font
  //overlayCC.textBaseline = 'top'
  predictions.forEach(prediction => {
    //var pixelData = overlayCC.getImageData( 0, 0 , remoteVideo.width,remoteVideo.height);
    //overlayCC.putImageData( pixelData, 0, 0 );
    const x = prediction.bbox[0]
    const y = prediction.bbox[1]
    const width = prediction.bbox[2]
    const height = prediction.bbox[3]

    overlayCC.beginPath();  
  
    //to specify a color or style for your canvas use fillStyle property  
    overlayCC.fillStyle = "yellow";  
   
    //to create a full circle invoke the arc method and in that method  
    //pass the value for x and y, radius, start point,  
    //height = height*2;
    var diag = Math.sqrt(height*height + width*width);
    overlayCC.arc(x+height, y+width/2, diag/1.8, 0, Math.PI * 2, true);  
   
    //to close the path invoke the closePath function  
    overlayCC.closePath();  
   
    //invoke fill function to fill the canvas with a circle and in that circle a color of yellow  
    overlayCC.fill();  
/*
    const smiley = "🙂";
    var num = (width+height)/1.35;
    var font_size = num.toString();
    var f = font_size + "px Segoe UI";
    
    overlayCC.font = f;
    overlayCC.fillText( smiley, x-width/6, y+height/3);
  })

}*/


// -------- user media -----------


async function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.ontrack = gotRemoteStream;
  //drawLoop();

  if(isCaller) {

      const mediaConstraints = { video: { width: 800, height: 800 }, audio: false };

      localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
        console.error('media ERROR:', err);
        return;
      });

      await loadModel();
      
      remoteVideo.srcObject = localStream;
      await remoteVideo.play().catch(err => console.error('local play ERROR:', err));
      remoteVideo.volume = 0;

      startCanvasVideo();    /// Bodysegmenmtation
      //detectFrame(objectNet)    /// Object detection
      

      canvasStream = overlay.captureStream();

      peerConnection.addStream(canvasStream);

      peerConnection.createOffer().then(createdDescription).catch(errorHandler);
    }
}

// for pwa
window.addEventListener('load', e => {
  //registerSW(); 
});



async function registerSW() { 
  if ('serviceWorker' in navigator) { 
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register('worker.js')
        .then(() => {
          alert('ServiceWorker registration successful');
        })
        .catch(err => {
          //alert('ServiceWorker registration failed', err);
        })
    }

  } 
  
  else {
    document.querySelector('.alert').removeAttribute('hidden'); 
  }
}
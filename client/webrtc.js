let localStream = null;
var remoteVideo;
var peerConnection;
var uuid;
var serverConnection;

var overlay;
var overlayCC;


let bodyPixNet = null;
let animationId = null;
let contineuAnimation = false;
let bodyPixMaks = null;
let segmentTimerId = null;
let canvasStream = null;
let maskType = 'room';

remoteVideo = document.getElementById('remoteVideo');
overlay = document.getElementById('overlay');
overlayCC = overlay.getContext('2d');

async function loadModel() {
  const net = await bodyPix.load(/** optional arguments, see below **/);
  bodyPixNet = net;
  console.log('bodyPix ready');
}
loadModel();

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
  const segmeteUpdateTime = 10; // ms
  if (!bodyPixNet) {
    drawloop()
  }
  bodyPixNet.segmentPerson(remoteVideo)
    .then(segmentation => {
      const foregroundColor = {r: 255, g: 255, b: 255, a: 255};
      const backgroundColor = {r: 0, g: 0, b: 0, a: 255};
      const personPartImage = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
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
  const maskBlurAmount = 1;
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

// -------- user media -----------

async function start(isCaller) {
  peerConnection = new RTCPeerConnection(peerConnectionConfig);
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.ontrack = gotRemoteStream;
  //drawLoop();

  if(isCaller) {

      const mediaConstraints = { video: { width: 500, height: 400 }, audio: false };

      localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
        console.error('media ERROR:', err);
        return;
      });

      remoteVideo.srcObject = localStream;
      await remoteVideo.play().catch(err => console.error('local play ERROR:', err));
      remoteVideo.volume = 0;

      startCanvasVideo();


      canvasStream = overlay.captureStream();

      peerConnection.addStream(canvasStream);

      peerConnection.createOffer().then(createdDescription).catch(errorHandler);
    }
}
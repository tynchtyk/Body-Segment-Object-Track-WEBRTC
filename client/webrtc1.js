    const remoteVideo = document.getElementById('remote_video');
    const canvas = document.getElementById('canvas');

    let localStream = null;


    let bodyPixNet = null;
    let animationId = null;
    let contineuAnimation = false;
    let bodyPixMaks = null;
    let segmentTimerId = null;
    let maskType = 'room';

    // ------- bodypix -------
    async function loadModel() {
      const net = await bodyPix.load(/** optional arguments, see below **/);
      bodyPixNet = net;
      console.log('bodyPix ready');
    }
    loadModel();

    function updateSegment() {
      const segmeteUpdateTime = 10; // ms
      if (!bodyPixNet) {
        console.warn('bodyPix net NOT READY');
        return;
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

    
    function drawCanvas(srcElement) {
      const opacity = 1.0;
      const flipHorizontal = false;
      //const maskBlurAmount = 0;
      const maskBlurAmount = 3;
      bodyPix.drawMask(
        canvas, srcElement, bodyPixMaks, opacity, maskBlurAmount,
        flipHorizontal
      );
    }

    function updateCanvas() {
      drawCanvas(remoteVideo);
      if (contineuAnimation) {
        animationId = window.requestAnimationFrame(updateCanvas);
      }
    }


    function writeCanvasString(str) {
      const ctx = canvas.getContext('2d');
      ctx.font = "64px serif";
      ctx.fillText(str, 5, 100);
      console.log(str);
    }


    function startCanvasVideo() {
      writeCanvasString('initalizing BodyPix');
      contineuAnimation = true;
      animationId = window.requestAnimationFrame(updateCanvas);

      updateSegment();
    }

    // -------- user media -----------

    async function startVideo() {
      const mediaConstraints = { video: { width: 640, height: 480 }, audio: false };

      localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
        console.error('media ERROR:', err);
        return;
      });

      remoteVideo.srcObject = localStream;
      await remoteVideo.play().catch(err => console.error('local play ERROR:', err));
      remoteVideo.volume = 0;

      startCanvasVideo();
    }
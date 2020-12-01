Segmentation of body and sending it via WEBRTC
==============

This is a simple web app that captures your video stream from webcam, uses body segmentation model to segment you body(Body will colored into white and the enviroment into black color) and sends the captured stream to another web page via WEBRTC 


## Before Usage

The signaling server uses Node.js and `ws` and can be started as such:

```
$ npm install
```

## Usage

$ npm start

Open two web pagers by visiting `https://localhost:8443`(you can also join with phone by visiting the local ip address of your server computer) with Firefox or Google.
And then click 'start' button from the sender page.


Reference:
 1. Body pix segmentation model https://github.com/tensorflow/tfjs-models/tree/master/body-pix 
 2. Tensorflow js https://www.tensorflow.org/js 
 3. Webrtc guide https://www.html5rocks.com/en/tutorials/webrtc/basics/ 
 4. Conwerting website into pwa https://vaadin.com/learn/tutorials/learn-pwa/turn-website-into-a-pwa 





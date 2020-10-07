import { dispatch, getActions, getState, STATE_CHANGE, } from '../store/store.js';
import { sampleRate } from '../utils/utils.js';
import { getAudioContext } from '../audio/audio.js';
import addWindowResizeCallback from './windowresize.js';

// maximum recording length is 4 seconds
const recBufferMaxLength = sampleRate * 4;
const maxSilenceDuration = sampleRate * 1;
const inputLevelTreshold = 0.2;
let canvasEl, canvasRect, canvasCtx, recordArmEl, recordMeterEl;
let analyser, source, stream, bufferLength, dataArray, recorderWorkletNode, recBuffer, recBufferIndex, silenceDuration = 0;

/**
 * Add event listeners.
 */
function addEventListeners() {
  document.addEventListener(STATE_CHANGE, handleStateChanges);
  recordArmEl.addEventListener('change', e => {
    dispatch(getActions().toggleRecordArm());
  });
  addWindowResizeCallback(handleWindowResize);
}

/**
 * Capture audio recorded by the RecorderWorkletProcessor.
 * @param {Object} e Event sent from AudioWorkletProcessor.
 */
function captureAudio(e) {

  // convert Array of Numbers from -1 to 1 and add to Int16Array
  const recBufferLastIndex = Math.min(recBufferIndex + e.data.length, recBufferMaxLength);
  for (let j = 0; recBufferIndex < recBufferLastIndex; recBufferIndex++, j++) {
    const sample = Math.max(-1, Math.min(e.data[j], 1));
    recBuffer[recBufferIndex] = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;

    // measure silence duration
    if (Math.abs(sample) < inputLevelTreshold) {
      silenceDuration++;
    } else {
      silenceDuration = 0;
    }
  }

  // ArrayBuffer to String
  const uint8Array = new Uint8Array(recBuffer.buffer);
  let binaryStr = '';
  for (let i = 0, n = uint8Array.byteLength; i < n; i++) {
    binaryStr += String.fromCharCode(uint8Array[i]);
  }

  dispatch(getActions().recordAudioStream(binaryStr));
  
  if (recBufferIndex >= recBufferMaxLength || silenceDuration >= maxSilenceDuration) {
    dispatch(getActions().toggleRecording(false));
  }
}

/**
 * Draw an oscilloscope of the current audio source.
 */
function draw() {
  analyser.getByteTimeDomainData(dataArray);
  const sliceWidth = canvasRect.width / bufferLength;
  let x = 0;

  canvasCtx.fillRect(0, 0, canvasRect.width, canvasRect.height);
  canvasCtx.beginPath();
  for(let i = 0; i < bufferLength; i++) {
    const value = dataArray[i] / 128;
    const y = value * canvasRect.height / 2;

    if (i === 0) {
      canvasCtx.moveTo(x, y);
    } else {
      canvasCtx.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvasCtx.lineTo(canvasRect.width, canvasRect.height / 2);
  canvasCtx.stroke();

  if (source) {
    requestAnimationFrame(draw);
  } else {
    canvasCtx.fillRect(0, 0, canvasRect.width, canvasRect.height);
  }
}

/**
 * Application state changed.
 * @param {Object} e Custom event.
 */
function handleStateChanges(e) {
  const { state, action, actions, } = e.detail;
  switch (action.type) {
      
    case actions.SET_PROJECT:
    case actions.TOGGLE_RECORD_ARM:
			updateRecordArm(state);
      break;
    
    case actions.TOGGLE_RECORDING:
      updateRecording(state);
      break;
  }
}

/**
 * Window resize event handler.
 */
function handleWindowResize() {
	updateCanvas();
}

/**
 * General module setup.
 */
export function setup() {
  recordArmEl = document.querySelector('#controls__record-arm');
  recordMeterEl = document.querySelector('#controls__record-meter');
  recBuffer = new Int16Array(recBufferMaxLength);
  addEventListeners();
}

function setupAudioWorklet() {
  if (recorderWorkletNode) {
    source.connect(recorderWorkletNode);
    return;
  }

  const audioCtx = getAudioContext();
  audioCtx.audioWorklet.addModule('js/audio/recorder-worklet-processor.js').then(() => {
    recorderWorkletNode = new AudioWorkletNode(audioCtx, 'recorder-worklet-processor');
    recorderWorkletNode.port.onmessage = e => {
      switch (e.data) {

        case 'startCapturing':
          dispatch(getActions().recordStart());
          break;

        default:
          captureAudio(e);
      }
    };
    source.connect(recorderWorkletNode);
  }).catch(error => {
    console.log(error);
  });
}

/**
 * Create the record meter the first time it is requested. 
 */
function setupMeter() {
  if (analyser) {
    return;
  }

  canvasEl = document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
  recordMeterEl.appendChild(canvasEl);
  canvasCtx = canvasEl.getContext('2d');
  updateCanvas();
	
  analyser = getAudioContext().createAnalyser();
  analyser.fftSize = 2048;
  bufferLength = analyser.fftSize;
  dataArray = new Uint8Array(bufferLength);
  analyser.getByteTimeDomainData(dataArray);
}

/**
 * Update canvas after window resize.
 */
function updateCanvas() {
  if (canvasEl) {
    canvasEl.height = recordMeterEl.clientHeight;
    canvasEl.width = recordMeterEl.clientWidth;
    canvasRect = canvasEl.getBoundingClientRect();
    canvasCtx.fillStyle = 'rgb(255, 255, 255)';
    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
  }
}

/**
 * Open audio stream.
 * Stackoverflow: Web Audio API creating a Peak Meter with AnalyserNode
 * @see https://stackoverflow.com/a/44360625
 * @param {Object} state Application state.
 */
async function updateRecordArm(state) {
  const { isRecordArmed } = state;

  // set the checkbox
  recordArmEl.checked = isRecordArmed;

  // create an audiostream source and show analyser
	if (isRecordArmed) {
		try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setupMeter();
      source = getAudioContext().createMediaStreamSource(stream);
      source.connect(analyser);
      setupAudioWorklet();
      draw();
		} catch(error) {
      console.log('Record arm error: ', error);
			dispatch(getActions().toggleRecordArm());
		}
	} else {

    // disconnect source and close stream
    if (source) {
      source.disconnect(analyser);
      source.disconnect(recorderWorkletNode);
      source = null;
    }
		if (stream) {
			stream.getTracks().forEach(track => track.stop());
    }
	}
}

/**
 * Toggle recording.
 * @param {Object} state Application state.
 */
function updateRecording(state) {
  const { isRecording } = state;
  if (isRecording) {
    recorderWorkletNode.port.postMessage('stopRecording');
    recBufferIndex = 0;
    recBuffer = new Int16Array(recBufferMaxLength);
    silenceDuration = 0;

    // a short delay to avoid recording the sound of the shape in the Kibo.
    setTimeout(() => {
      recorderWorkletNode.port.postMessage('startRecording');
    }, 50);
  } else {
    recorderWorkletNode.port.postMessage('stopRecording');
  }
}

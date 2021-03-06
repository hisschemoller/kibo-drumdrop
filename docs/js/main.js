import { dispatch, getActions, getState, persist } from './store/store.js';
import { setup as setupAudio } from './audio/audio.js';
import { setup as setupRecoder } from './audio/recorder.js';
import { accessMidi, setup as setupMidi, } from './midi/midi.js';
import { setup as setupBluetooth } from './bluetooth/bluetooth.js';
import { setup as setupControls } from './view/controls.js';
import { setup as setupDialog } from './view/dialog.js';
import { setup as setupRecord } from './view/record.js';
import { setup as setupSettings } from './view/settings.js';
import { setup as setupWaveform } from './view/waveform.js';

async function main() {
  let hasMIDIAccess = false;
  try {
    await accessMidi();
    hasMIDIAccess = true;
  } catch(error) {
    console.log('Error', error);
  } finally {
    setupAudio();
    setupRecoder();
    setupDialog();
    setupRecord();
    setupSettings();
    setupControls();
    setupWaveform();
    persist();
    setupMidi();
    setupBluetooth();
    dispatch(getActions().setMidiAccessible(hasMIDIAccess));
    dispatch(getActions().populate());
    dispatch(getActions().toggleSettings(true));
  }
}

main();

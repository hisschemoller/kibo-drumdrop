# Kibo Fono

A web app to record your microphone and play the recorded sounds musically.

Demo: https://hisschemoller.github.io/kibo-fono/

## The Kibo Fono app

![App overview](assets/img/kibo-fono-overview.jpg 'App overview')

Kibo Fono runs in your browser. It lets you record eight sounds with the microphone in your computer or mobile device. You can then play back the sounds with the Kodaly Kibo or another MIDI controller, creating rhythms and musical patterns.

## Kodaly Kibo

![Kodaly Kibo](assets/img/kibo-bb-prospettiva.png 'Kodaly Kibo')

This app is especially made to work with the [Kodaly Kibo](https://www.kodaly.app/). The Kibo is a MIDI controller with eight wooden shapes that can be played like drum pads or piano keys. MIDI transmits wireless over Bluetooth LE or over USB cable.

This document assumes you're using the app with a Kibo. There's a paragraph below however that explains how to use Kibo Fono with other MIDI controllers or on its own without a controller.

## How to use the app with a Kibo

![App startup](assets/img/kibo-fono-startup.jpg 'App startup')

Switch on the Kibo and connect it via Bluetooth or USB MIDI. This can be done in the Settings panel in the app, which appears when the app first loads or by clicking the cog icon in the top right of the app.

![Record mode](assets/img/kibo-fono-record-mode.jpg 'Record mode')

The app has two modes: Record and Playback. Playback mode prevents you from accidentally erasing recordings.

Switch between record and playback mode by clicking the metal knob on the Kibo, or by clicking the microphone button in the app.

### To record a sound:

* Make sure the app is in record mode.
* Enter a shape in the Kibo (first remove the shape if it was already in).
* The app now starts to listen for sounds.
* When the app detects sound it will start to record. It can record a maximum of 4 seconds per shape.
* After recording ends you can tap the shape on the Kibo to listen to the recording.

### To erase a sound:

* Make sure the app is in record mode.
* Remove a shape from the Kibo to clear the recording in that slot.

### To play a sound:

* Tap a shape on the Kibo to play a sound. The softer you tap the lower the volume.

## Use the app with another MIDI controller

Connect your controller via Bluetooth or USB MIDI using the app's Settings panel.

### MIDI implementation

* MIDI note pitches 60, 62, 64, 65, 67, 69, 71 and 72 play the eight sound slots.
* MIDI CC 119 with value 127 toggles 'record mode' on and off.
* MIDI CC 102, 103, 104, 105, 106, 107, 108 and 109 with value:
  * 127 starts recording in the eight sound slots.
  * 0-126 stops recording in the sound slot.

## Use the app on its own

The Settings panel can be ignored and closed.

### To record a sound:

* Put the app in record mode by clicking the round microphone button.
* Click and hold one of the eight sound slots.
* The app now starts to listen for sounds.
* When the app detects sound it will start to record. It can record a maximum of 4 seconds per shape.
* After recording ends you can tap the computer keyboard's 1 to 8 number keys to listen to the recording.

### To erase a sound:

* Individual sounds can't be erased from the app. 
* You can however do a full reset by holding the 'r', 's' and 't' (for 'reset') computer keyboard keys at the same time, then let go and refresh the browser. This clears all data.

### To play a sound:

* Make sure the app is not in record mode and click the sound slots.
* Or, on a computer, tap the keyboard's 1 to 8 number keys to play the sounds.

## Drag and drop audio files

![Drag and drop](assets/img/kibo-fono-dragdrop.jpg 'Drag and drop')

If you use the app on a computer that supports drag and drop of files, you can drop audio files on the sound slots. The sound slots show a dashed border when a file is dragged over them to indicate they can receive the file.

## App settings

![Settings panel](assets/img/kibo-fono-settings.jpg 'Settings panel')

The settings panel shows when the app starts. It can be recalled by clicking the cogwheel icon in the top right corner of the screen.

It has two settings:

1. Bluetooth - Click 'Connect' to connect to a Bluetooth LE device that transmits MIDI over Bluetooth.
2. MIDI - Select a MIDI input from the dropdown.

## Supported browsers

Chrome is currently the only browser that can run the app. The desktop as well as the mobile Android version of Chrome.

Browsers have to implement the Javascript Web Bluetooth or Web MIDI API to run the app. Because these are required to connect with MIDI or Bluetooth.

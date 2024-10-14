# Elise

## Overview

Elise is a prototype software sequencer UI inspired by modern step sequencers. It's designed for use with hardware that has:

* 16 RGB pads
* 8 encoders (or potentiometers)
* A keyboard (or additional pads) for note input
* At least six freely-assignable keys (may change in the future)
* (optional) A hardware display screen for extra feedback

It can also be used with a touch screen, or with a mixture of the touch screen and hardware.

A *scene* in Elise contains 16 *tracks*, which can contain up to 64 *steps*. A track outputs *notes* to an assigned MIDI destination and *MIDI CC/PC parameters* to the same or different MIDI destinations (allowing for modulating e.g. an effects pedal in the same track as the synth playing into it). A track also includes an *LFO*, which can be used to modulate MIDI parameter(s).

A user can input steps or change tracks/scenes using the RGB pads. They can also add *parameter locks* on individual steps by holding the pad and changing the parameter. The parameters can be changed by either using touch screen meters or by using the hardware encoders.

Piano roll and grid view displays allow a user to visualize their harmonies, melodies, and drum patterns in different ways. They are not currently planned to support user input directly in them, as this experience tends to work poorly on a touch screen. Additional touch screen UIs for adjusting notes may be added in the future, though.

### Performance tools

Tracks have *mute states* that can be toggled during playback.

*(maybe)* Global/scene macros can be created on an additional screen to allow more flexibility during live performance. These can target MIDI parameters on any track and will override any parameter locks when active.

## Progress

* [x] Parameter locking
* [ ] Touch UI for adjusting parameters
* [ ] Touch UI for inputting notes
* [x] MIDI parameter configuration page
* [ ] MIDI parameter template save/load
* [x] Grid view
* [ ] Piano roll
* [ ] Copy/paste and/or duplication tools for tracks and sequences

Once this is done, I'll work on playback mode:

* [ ] Playback mode basics (press play, playhead go, change patterns, etc)
* [ ] Offset/microtiming
* [ ] LFOs
* [ ] Parameter lock slides

Then some performance options for playback mode:

* [ ] Mute states
* [ ] Drum mode (press Pad 1 to play a note on Track 1, Pad 2 to play a note on Track 2...)
* [ ] Chromatic mode (press pads to play chromatic notes on current track)
* [ ] Global macros (scene macros?)

### Feature wishlist

These probably won't happen before I start investigating native wrappers (as described below), but I've tried to keep them in mind while building Elise:

* Conditional triggers
  * Fill mode (may need a 7th button...)
* Live recording
* Song mode
* Removing various limitations (multiple parameter pages, multiple LFOs, more than 64 steps per sequence)
* Sequencer improvements:
  * Set steps-per-bar (configured per-track so you can do polyrhythms)
  * Step resolution on a bar (e.g. 8th note steps, 32nd steps)
  * ...there should be some way to do triplets that isn't manual offset/microtiming

### Future plans

The concepts in Elise are intended to allow for several possible applications:

* Tracks could contain samples or built-in synths instead of using MIDI destinations.
* If Elise is wrapped or ported to a native environment, it could:
  * Be used as a VST or AUv3 within a DAW or mixer application, allowing it to target software synths and effects.
  * Be used as a VST/AUv3 _host_ itself, allowing integrating software synths directly into the Elise application.
* Once Elise is handling audio, mixer and audio send UIs could be added.

My theoretical plan at the moment - being scared of DSP and the world of AUv3s, but wanting to use this sequencer on my iPad, is:

* Wrap Elise in an iOS app allowing me to use it on an iPad in a standalone fashion with hardware MIDI outputs. This would require replacing the current `WebMidi` usage with a bridge to a native iOS MIDI event bus.
* Get Elise working as a MIDI processor AUv3 inside AUM.
* Investigate the feasibility of turning Elise into a true AUv3 host while still, like, keeping my day job.
* If that somehow goes well, add built-in sample playback to tracks.

### Hardware support

Currently, the only supported hardware is the Novation Launchkey MK4 49-key controller. I plan to at least add support to the rest of the Launchkey MK4 lineup (25/37/61) and the Launchkey MK4 Mini 25/37.

From there, I think supporting the Launchkey MK3 25/37/49/61 would be doable. The Launchkey Mini MK3 doesn't appear to have enough buttons for the shift states, but it maybe possible to support.

There aren't many other immediately comparable keyboard MIDI controllers that I'm aware of. The Arturia MIDI controllers don't have 16 pads and likely wouldn't be supportable. The FLkey might be supportable (it doesn't have a programmer's guide I can find, but I suspect it might work like a Launchkey MK3?).

From there it's worth thinking about pad controllers with MIDI-addressable RGB. These would require you to use the software UI for parameter updates and for inputting notes. A potential example of a controller here would be the Midi Fighter Spectra, which has 6 side buttons and 16 RGB buttons that could be used.

Launchpads and similar large grid controllers could be used, but wouldn't make a lot of sense from a UI perspective - 64 pads instead of 16 implies either building a Launchpad-specific user experience (which would require changing a number of assumptions about Elise's architecture) or just using the remaining 48 pads as note input, which seems kind of lame.

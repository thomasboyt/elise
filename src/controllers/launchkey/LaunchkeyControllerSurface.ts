import * as WebMidi from 'webmidi';
import { launchkeySysexMessageFactories } from './LaunchkeySysex';
import {
  absoluteEncoderCcOffset,
  DawModePad,
  displayEncoderTargetOffset,
  DrumModePad,
  EncoderMode,
  LaunchkeySkuType,
  messageTargets,
  midiCCToEncoderMode,
  midiCCToPadMode,
  miniButtonCCs,
  padColors,
  PadMode as LKPadMode,
  regularButtonCCs,
  relativeEncoderCcOffset,
  displayTargets,
} from './LaunchkeyConstants';
import { EncoderBank } from '../../state/state';
import { PadColor, PadMode } from '../../ui/uiModels';
import { ControllerSurface } from '../ControllerSurface';

export class LaunchkeyControllerSurface extends ControllerSurface {
  private initialized = false;
  private padMode: PadMode = 'clip';

  // Launchkey state
  private launchkeyPadMode: LKPadMode | null = null;
  private launchkeyEncoderMode: EncoderMode | null = null;
  private funcHeld: boolean = false;
  private launchHeld: boolean = false;

  private midiInput: WebMidi.Input;
  private dawInput: WebMidi.Input;
  // private midiOutput: WebMidi.Output;
  private dawOutput: WebMidi.Output;
  private sku: LaunchkeySkuType;

  constructor(
    midiInput: WebMidi.Input,
    dawInput: WebMidi.Input,
    _midiOutput: WebMidi.Output,
    dawOutput: WebMidi.Output,
    sku: LaunchkeySkuType,
  ) {
    super();
    this.sku = sku;
    this.midiInput = midiInput;
    this.dawInput = dawInput;
    // this.midiOutput = midiOutput;
    this.dawOutput = dawOutput;
  }

  initController(): void {
    if (this.initialized) {
      return;
    }

    this.log('Initializing');
    this.initialized = true;
    this.registerEventListeners();

    const initMsg = launchkeySysexMessageFactories.enableDawMode();
    this.sendRawMessage(initMsg);

    const nameDawModeMsg = launchkeySysexMessageFactories.setDisplayText(
      this.sku,
      messageTargets.dawModeLabel,
      0,
      'Elise',
    );
    this.sendRawMessage(nameDawModeMsg);

    this.launchkeyPadMode = 'daw';
    this.launchkeyEncoderMode = 'plugin';

    this.setStationaryDisplay('Line One', 'Line Two');

    for (
      let target = displayEncoderTargetOffset;
      target < displayEncoderTargetOffset + 8;
      target += 1
    ) {
      this.sendRawMessage(
        launchkeySysexMessageFactories.configureDisplay(
          this.sku,
          target,
          'twoLineNameTextParameter',
          true,
        ),
      );
    }

    // Page 14
    // TODO: GET LED BRIGHTNESS LEVEL
    const buttonCCs = this.sku === 'mini' ? miniButtonCCs : regularButtonCCs;
    this.dawOutput.channels[4].sendControlChange(
      buttonCCs['Pads Function'],
      63,
    );
    this.dawOutput.channels[4].sendControlChange(buttonCCs['Pads Launch'], 63);
  }

  teardownController(): void {
    this.log('Teardown');
    this.initialized = false;
    this.unregisterEventListeners();
    this.sendRawMessage(launchkeySysexMessageFactories.disableDawMode());
  }

  changeEncoderBank(encoderBank: EncoderBank): void {
    this.logOutgoing('Change encoder bank', encoderBank);
    // TODO: this is a goofy place for this logic
    if (encoderBank === 'global') {
      this.setEncoderBankButtons(false, false);
    } else if (encoderBank === 'note') {
      this.setEncoderBankButtons(false, true);
    } else if (encoderBank === 'parameters') {
      this.setEncoderBankButtons(true, true);
    } else if (encoderBank === 'lfo') {
      this.setEncoderBankButtons(true, false);
    }
  }

  changePadMode(padMode: PadMode): void {
    this.logOutgoing('Change pad mode', padMode);
    this.padMode = padMode;
    if (this.padMode === 'clip') {
      this.setStationaryDisplay('Sequence', 'Bar x of y');
    } else if (this.padMode === 'track') {
      this.setStationaryDisplay('', 'Select track');
    } else if (this.padMode === 'scene') {
      this.setStationaryDisplay('', 'Select scene');
    }
  }

  /**
   * Set the color of a given pad.
   *
   * @param padIndex 0-15, left to right and top to bottom.
   * @param color One of the supported pad colors.
   */
  updatePadColor(padIndex: number, color: PadColor): void {
    if (this.launchkeyPadMode === 'daw') {
      const note = DawModePad.toNote(padIndex);
      this.logOutgoing('Set DAW mode pad', padIndex, color);
      this.dawOutput.channels[1].sendNoteOn(note, {
        rawAttack: padColors[color],
      });
    } else if (this.launchkeyPadMode === 'drum') {
      const note = DrumModePad.toNote(padIndex);
      this.logOutgoing('Set drum mode pad', padIndex, color);
      this.dawOutput.channels[10].sendNoteOn(note, {
        rawAttack: padColors[color],
      });
    }
  }

  /**
   * Set the displayed name on the controller for a given encoder.
   *
   * @param encoderIndex 0-8, left to right.
   * @param name The displayed name.
   */
  updateEncoderName(encoderIndex: number, name: string): void {
    this.logOutgoing('Set encoder name ', encoderIndex, name);
    this.sendRawMessage(
      launchkeySysexMessageFactories.setDisplayText(
        this.sku,
        displayEncoderTargetOffset + encoderIndex,
        0,
        name,
      ),
    );
  }

  /**
   * Set the value on the controller for a given encoder.
   *
   * @param encoderIndex 0-8, left to right.
   * @param value The value of the encoder.
   */
  updateEncoderValue(
    encoderIndex: number,
    value: number,
    displayValue: string,
  ): void {
    let midiCc;

    if (
      this.launchkeyEncoderMode === 'plugin' ||
      this.launchkeyEncoderMode === 'mixer' ||
      this.launchkeyEncoderMode === 'sends'
    ) {
      midiCc = encoderIndex + absoluteEncoderCcOffset;
    } else if (this.launchkeyEncoderMode === 'transport') {
      midiCc = encoderIndex + relativeEncoderCcOffset;
    }
    if (midiCc) {
      this.logOutgoing('Set encoder value ', encoderIndex, value);
      this.dawOutput.channels[16].sendControlChange(midiCc, value);
      this.sendRawMessage(
        launchkeySysexMessageFactories.setDisplayText(
          this.sku,
          displayEncoderTargetOffset + encoderIndex,
          1,
          displayValue,
        ),
      );
    }
  }

  private sendRawMessage(data: number[]) {
    this.dawOutput.send(data);
  }

  private setStationaryDisplay(lineOne: string, lineTwo: string) {
    this.sendRawMessage(
      launchkeySysexMessageFactories.configureDisplay(
        this.sku,
        displayTargets.stationary,
        'twoLineNameTextParameter',
        false,
      ),
    );
    this.sendRawMessage(
      launchkeySysexMessageFactories.setDisplayText(
        this.sku,
        displayTargets.stationary,
        0,
        lineOne,
      ),
    );
    this.sendRawMessage(
      launchkeySysexMessageFactories.setDisplayText(
        this.sku,
        displayTargets.stationary,
        1,
        lineTwo,
      ),
    );
    this.sendRawMessage(
      launchkeySysexMessageFactories.triggerDisplay(
        this.sku,
        displayTargets.stationary,
      ),
    );
  }

  private setEncoderBankButtons(upState: boolean, downState: boolean) {
    // Page 14
    // TODO: GET LED BRIGHTNESS LEVEL
    const buttonCCs = this.sku === 'mini' ? miniButtonCCs : regularButtonCCs;
    this.dawOutput.channels[4].sendControlChange(
      buttonCCs['Encoders Up'],
      upState ? 63 : 0,
    );
    this.dawOutput.channels[4].sendControlChange(
      buttonCCs['Encoders Down'],
      downState ? 63 : 0,
    );
  }

  // I hate the boilerplate and having to remember to unregister, but don't know
  // how to do nice type safety with a list of event listeners or w/e

  private registerEventListeners() {
    this.log('Registered event listeners');
    this.dawInput.addListener('midimessage', this.handleMidiMessage);
    this.midiInput.addListener('midimessage', this.handleMidiMessage);
    this.dawInput.channels[1].addListener(
      'noteon',
      this.handleDawModePadNoteOn,
    );
    this.dawInput.channels[1].addListener(
      'noteoff',
      this.handleDawModePadNoteOff,
    );
    this.dawInput.channels[1].addListener(
      'controlchange',
      this.handleControlChangeCh1,
    );
    this.dawInput.channels[10].addListener(
      'noteon',
      this.handleDrumModePadNoteOn,
    );
    this.dawInput.channels[7].addListener(
      'controlchange',
      this.handleControlChangeCh7,
    );
    this.dawInput.channels[16].addListener(
      'controlchange',
      this.handleControlChangeCh16,
    );
    this.midiInput.addListener('noteon', this.handleMidiNoteOn);
    this.midiInput.addListener('noteoff', this.handleMidiNoteOff);
  }

  private unregisterEventListeners() {
    this.log('Unregistered event listeners');
    this.dawInput.removeListener('midimessage', this.handleMidiMessage);
    this.midiInput.removeListener('midimessage', this.handleMidiMessage);
    this.dawInput.channels[1].removeListener(
      'noteon',
      this.handleDawModePadNoteOn,
    );
    this.dawInput.channels[1].removeListener(
      'noteoff',
      this.handleDawModePadNoteOff,
    );
    this.dawInput.channels[1].removeListener(
      'controlchange',
      this.handleControlChangeCh1,
    );
    this.dawInput.channels[10].removeListener(
      'noteon',
      this.handleDrumModePadNoteOff,
    );
    this.dawInput.channels[7].removeListener(
      'controlchange',
      this.handleControlChangeCh7,
    );
    this.dawInput.channels[16].removeListener(
      'controlchange',
      this.handleControlChangeCh16,
    );
    this.midiInput.removeListener('noteon', this.handleMidiNoteOn);
    this.midiInput.removeListener('noteoff', this.handleMidiNoteOff);
  }

  private handleMidiMessage = (e: WebMidi.MessageEvent) => {
    console.debug(
      `MIDI: ${e.port.id}/${e.message.channel} - ${e.message.type} ${e.message.data}`,
    );
  };

  private handleDawModePadNoteOn = (e: WebMidi.NoteMessageEvent) => {
    const padIndex = DawModePad.fromNote(e.note.number);
    this.logIncoming('Pad DAW mode note on', padIndex, e.note.rawAttack);
    this.emit('padOn', padIndex, e.note.rawAttack);
  };

  private handleDawModePadNoteOff = (e: WebMidi.NoteMessageEvent) => {
    const padIndex = DawModePad.fromNote(e.note.number);
    this.logIncoming('Pad DAW mode note off', padIndex);
    this.emit('padOff', padIndex);
  };

  private handleDrumModePadNoteOn = (e: WebMidi.NoteMessageEvent) => {
    const padIndex = DrumModePad.fromNote(e.note.number);
    this.logIncoming('Pad drum mode note on', padIndex, e.note.rawAttack);
    this.emit('padOn', padIndex, e.note.rawAttack);
  };

  private handleDrumModePadNoteOff = (e: WebMidi.NoteMessageEvent) => {
    const padIndex = DrumModePad.fromNote(e.note.number);
    this.logIncoming('Pad drum mode note off', padIndex);
    this.emit('padOff', padIndex);
  };

  private handleControlChangeCh1 = (e: WebMidi.ControlChangeMessageEvent) => {
    const buttonCCs = this.sku === 'mini' ? miniButtonCCs : regularButtonCCs;
    if (e.controller.number === buttonCCs['Encoders Up'] && e.value) {
      this.emit('prevEncoderBank');
    } else if (e.controller.number === buttonCCs['Encoders Down'] && e.value) {
      this.emit('nextEncoderBank');
    } else if (e.controller.number === buttonCCs['Pads Up'] && e.value) {
      this.emit('prevClipBar');
    } else if (e.controller.number === buttonCCs['Pads Down'] && e.value) {
      this.emit('nextClipBar');
    } else if (e.controller.number === regularButtonCCs['Pads Launch']) {
      this.launchHeld = !!e.value;
      this.setShiftMode();
    } else if (e.controller.number === regularButtonCCs['Pads Function']) {
      this.funcHeld = !!e.value;
      this.setShiftMode();
    }
  };

  private setShiftMode() {
    if (
      this.padMode === 'clip' ||
      this.padMode === 'track' ||
      this.padMode === 'scene' ||
      this.padMode === 'mute'
    ) {
      if (!this.launchHeld && !this.funcHeld && this.padMode !== 'clip') {
        this.emit('enterPadClipMode');
      } else if (
        this.launchHeld &&
        !this.funcHeld &&
        this.padMode !== 'scene'
      ) {
        this.emit('enterPadSceneMode');
      } else if (
        !this.launchHeld &&
        this.funcHeld &&
        this.padMode !== 'track'
      ) {
        this.emit('enterPadTrackMode');
      } else if (this.launchHeld && this.funcHeld && this.padMode !== 'mute') {
        this.emit('enterPadMuteMode');
      }
    }
  }

  private handleControlChangeCh7 = (e: WebMidi.ControlChangeMessageEvent) => {
    if (e.controller.number === 29) {
      this.handleChangeLKPadMode(e);
    }
    if (e.controller.number === 30) {
      this.handleChangeEncoderMode(e);
    }
  };

  private handleChangeLKPadMode = (e: WebMidi.ControlChangeMessageEvent) => {
    const lkPadMode = midiCCToPadMode.get(e.rawValue!);
    if (!lkPadMode) {
      throw new Error(`Unrecognized pad mode CC ${e.rawValue}`);
    }
    this.logIncoming('Launchkey pad mode change', lkPadMode);
    this.launchkeyPadMode = lkPadMode;
    // TODO: emit page change?
  };

  private handleChangeEncoderMode = (e: WebMidi.ControlChangeMessageEvent) => {
    const encoderMode = midiCCToEncoderMode.get(e.rawValue!);
    if (!encoderMode) {
      throw new Error(`Unrecognized encoder mode CC value ${e.rawValue}`);
    }
    this.logIncoming('Launchkey encoder mode change', encoderMode);
    this.launchkeyEncoderMode = encoderMode;
    // TODO: emit page change?
  };

  private handleControlChangeCh16 = (e: WebMidi.ControlChangeMessageEvent) => {
    const controllerNumber = e.controller.number;
    const value = e.rawValue!;

    if (
      controllerNumber >= absoluteEncoderCcOffset &&
      controllerNumber <= absoluteEncoderCcOffset + 8
    ) {
      const encoderIndex = controllerNumber - absoluteEncoderCcOffset;
      this.logIncoming('Absolute encoder value change', encoderIndex, value);
      this.emit('absoluteEncoderUpdated', encoderIndex, value);
    }
    if (
      controllerNumber >= relativeEncoderCcOffset &&
      controllerNumber <= relativeEncoderCcOffset + 8
    ) {
      const encoderIndex = controllerNumber - relativeEncoderCcOffset;
      this.logIncoming('Absolute encoder value change', encoderIndex, value);
      this.emit('relativeEncoderUpdated', encoderIndex, value);
    }
    if (this.sku === 'regular') {
      // TODO: faders & fader buttons
    }
  };

  private handleMidiNoteOn = (e: WebMidi.NoteMessageEvent) => {
    this.logIncoming('Keyboard note on', e.note.number, e.note.rawAttack);

    if (e.note.rawAttack === 0) {
      // I'm pretty sure WebMidi handles this for us, but just in case
      this.handleMidiNoteOff(e);
      return;
    }
    this.emit(
      'keyboardNoteOn',
      e.message.channel,
      e.note.number,
      e.note.rawAttack,
    );
  };

  private handleMidiNoteOff = (e: WebMidi.NoteMessageEvent) => {
    this.logIncoming('Keyboard note off', e.note.number);
    this.emit('keyboardNoteOff', e.message.channel, e.note.number);
  };

  private log(...args: unknown[]) {
    console.log('*** Launchkey Controller:', ...args);
  }

  private logOutgoing(...args: unknown[]) {
    console.debug('Launchkey Controller >>', ...args);
  }

  private logIncoming(...args: unknown[]) {
    console.debug('Launchkey Controller <<', ...args);
  }
}

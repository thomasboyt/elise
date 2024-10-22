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
import { MidiInputPort, MidiOutputPort } from '../../midi/MidiPort';

export class LaunchkeyControllerSurface extends ControllerSurface {
  private initialized = false;

  // Launchkey state
  private launchkeyPadMode: LKPadMode | null = null;
  private launchkeyEncoderMode: EncoderMode | null = null;
  private funcHeld: boolean = false;
  private launchHeld: boolean = false;

  private midiInput: MidiInputPort;
  private dawInput: MidiInputPort;
  private dawOutput: MidiOutputPort;
  private sku: LaunchkeySkuType;

  constructor(
    midiInput: MidiInputPort,
    dawInput: MidiInputPort,
    dawOutput: MidiOutputPort,
    sku: LaunchkeySkuType,
  ) {
    super();
    this.sku = sku;
    this.midiInput = midiInput;
    this.dawInput = dawInput;
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
    this.dawOutput.sendControlChange(4, buttonCCs['Pads Function'], 63);
    this.dawOutput.sendControlChange(4, buttonCCs['Pads Launch'], 63);
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
    if (padMode === 'clip') {
      this.setStationaryDisplay('Sequence', 'Bar x of y');
    } else if (padMode === 'track') {
      this.setStationaryDisplay('', 'Select track');
    } else if (padMode === 'scene') {
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
      this.dawOutput.sendNoteOn(1, note, padColors[color]);
    } else if (this.launchkeyPadMode === 'drum') {
      const note = DrumModePad.toNote(padIndex);
      this.logOutgoing('Set drum mode pad', padIndex, color);
      this.dawOutput.sendNoteOn(10, note, padColors[color]);
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
      this.dawOutput.sendControlChange(16, midiCc, value);
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
    this.dawOutput.sendRaw(data);
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
    this.dawOutput.sendControlChange(
      4,
      buttonCCs['Encoders Up'],
      upState ? 63 : 0,
    );
    this.dawOutput.sendControlChange(
      4,
      buttonCCs['Encoders Down'],
      downState ? 63 : 0,
    );
  }

  private registerEventListeners() {
    this.log('Registered event listeners');

    // TODO: logging?
    // this.dawInput.addListener('midimessage', this.handleMidiMessage);
    // this.midiInput.addListener('midimessage', this.handleMidiMessage);
    this.dawInput.on('noteOn', this.handleDawInputNoteOn);
    this.dawInput.on('noteOff', this.handleDawInputNoteOff);
    this.midiInput.on('noteOn', this.handleMidiInputNoteOn);
    this.midiInput.on('noteOff', this.handleMidiInputNoteOff);
    this.dawInput.on('controlChange', this.handleDawInputControlChange);
  }

  private unregisterEventListeners() {
    this.log('Unregistered event listeners');
    // this.dawInput.removeListener('midimessage', this.handleMidiMessage);
    // this.midiInput.removeListener('midimessage', this.handleMidiMessage);
    this.dawInput.off('noteOn', this.handleDawInputNoteOn);
    this.dawInput.off('noteOff', this.handleDawInputNoteOff);
    this.midiInput.off('noteOn', this.handleMidiInputNoteOn);
    this.midiInput.off('noteOff', this.handleMidiInputNoteOff);
    this.dawInput.off('controlChange', this.handleDawInputControlChange);
  }

  private handleDawInputNoteOn = (
    channel: number,
    note: number,
    velocity: number,
  ) => {
    if (channel === 1) {
      if (velocity > 0) {
        this.handleDawModePadNoteOn(note, velocity);
      } else {
        this.handleDawModePadNoteOff(note);
      }
    } else if (channel === 10) {
      if (velocity > 0) {
        this.handleDrumModePadNoteOn(note, velocity);
      } else {
        this.handleDrumModePadNoteOff(note);
      }
    }
  };

  private handleDawInputNoteOff = (channel: number, note: number) => {
    if (channel === 1) {
      this.handleDawModePadNoteOff(note);
    } else if (channel === 10) {
      this.handleDrumModePadNoteOff(note);
    }
  };

  private handleDawModePadNoteOn = (note: number, velocity: number) => {
    const padIndex = DawModePad.fromNote(note);
    this.logIncoming('Pad DAW mode note on', padIndex, note, velocity);
    this.emit('padOn', padIndex, velocity);
  };

  private handleDawModePadNoteOff = (note: number) => {
    const padIndex = DawModePad.fromNote(note);
    this.logIncoming('Pad DAW mode note off', padIndex);
    this.emit('padOff', padIndex);
  };

  private handleDrumModePadNoteOn = (note: number, velocity: number) => {
    const padIndex = DrumModePad.fromNote(note);
    this.logIncoming('Pad drum mode note on', padIndex, velocity);
    this.emit('padOn', padIndex, velocity);
  };

  private handleDrumModePadNoteOff = (note: number) => {
    const padIndex = DrumModePad.fromNote(note);
    this.logIncoming('Pad drum mode note off', padIndex);
    this.emit('padOff', padIndex);
  };

  private handleMidiInputNoteOn = (
    channel: number,
    note: number,
    velocity: number,
  ) => {
    if (velocity === 0) {
      this.handleMidiInputNoteOff(channel, note);
      return;
    }
    this.logIncoming('Keyboard note on', note, velocity);
    this.emit('keyboardNoteOn', channel, note, velocity);
  };

  private handleMidiInputNoteOff = (channel: number, note: number) => {
    this.logIncoming('Keyboard note off', note);
    this.emit('keyboardNoteOff', channel, note);
  };

  // private handleMidiMessage = (e: WebMidi.MessageEvent) => {
  //   console.debug(
  //     `MIDI: ${e.port.id}/${e.message.channel} - ${e.message.type} ${e.message.data}`,
  //   );
  // };

  private handleDawInputControlChange = (
    channel: number,
    controllerNumber: number,
    value: number | null,
  ) => {
    if (value === null) {
      // TODO: is there ever a case where we need to support this?
      return;
    }

    if (channel === 1) {
      this.handleControlChangeCh1(controllerNumber, value);
    } else if (channel === 7) {
      this.handleControlChangeCh7(controllerNumber, value);
    } else if (channel === 16) {
      this.handleControlChangeCh16(controllerNumber, value);
    }
  };

  private handleControlChangeCh1 = (
    controllerNumber: number,
    value: number,
  ) => {
    const buttonCCs = this.sku === 'mini' ? miniButtonCCs : regularButtonCCs;
    if (controllerNumber === buttonCCs['Encoders Up'] && value) {
      this.emit('prevEncoderBank');
    } else if (controllerNumber === buttonCCs['Encoders Down'] && value) {
      this.emit('nextEncoderBank');
    } else if (controllerNumber === buttonCCs['Pads Up'] && value) {
      this.emit('prevClipBar');
    } else if (controllerNumber === buttonCCs['Pads Down'] && value) {
      this.emit('nextClipBar');
    } else if (controllerNumber === regularButtonCCs['Pads Launch']) {
      this.launchHeld = !!value;
      this.setShiftMode();
    } else if (controllerNumber === regularButtonCCs['Pads Function']) {
      if (this.state.padMode === 'clip' && this.state.isPadHeld) {
        // TODO
        // this.emit('toggleParameterToggleMode');
      } else {
        this.funcHeld = !!value;
        this.setShiftMode();
      }
    }
  };

  private setShiftMode() {
    if (
      this.state.padMode === 'clip' ||
      this.state.padMode === 'track' ||
      this.state.padMode === 'scene' ||
      this.state.padMode === 'mute'
    ) {
      if (!this.launchHeld && !this.funcHeld && this.state.padMode !== 'clip') {
        this.emit('enterPadClipMode');
      } else if (
        this.launchHeld &&
        !this.funcHeld &&
        this.state.padMode !== 'scene'
      ) {
        this.emit('enterPadSceneMode');
      } else if (
        !this.launchHeld &&
        this.funcHeld &&
        this.state.padMode !== 'track'
      ) {
        this.emit('enterPadTrackMode');
      } else if (
        this.launchHeld &&
        this.funcHeld &&
        this.state.padMode !== 'mute'
      ) {
        this.emit('enterPadMuteMode');
      }
    }
  }

  private handleControlChangeCh7 = (
    controllerNumber: number,
    value: number,
  ) => {
    if (controllerNumber === 29) {
      this.handleChangeLKPadMode(value);
    }
    if (controllerNumber === 30) {
      this.handleChangeEncoderMode(value);
    }
  };

  private handleChangeLKPadMode = (value: number) => {
    const lkPadMode = midiCCToPadMode.get(value);
    if (!lkPadMode) {
      throw new Error(`Unrecognized pad mode CC ${value}`);
    }
    this.logIncoming('Launchkey pad mode change', lkPadMode);
    this.launchkeyPadMode = lkPadMode;
    // TODO: emit page change?
  };

  private handleChangeEncoderMode = (value: number) => {
    const encoderMode = midiCCToEncoderMode.get(value);
    if (!encoderMode) {
      throw new Error(`Unrecognized encoder mode CC value ${value}`);
    }
    this.logIncoming('Launchkey encoder mode change', encoderMode);
    this.launchkeyEncoderMode = encoderMode;
    // TODO: emit page change?
  };

  private handleControlChangeCh16 = (
    controllerNumber: number,
    value: number,
  ) => {
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

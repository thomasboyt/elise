import * as WebMidi from 'webmidi';
import { HardwareControllerSurface } from '../ControllerSurface';
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
  padColors,
  PadMode,
  relativeEncoderCcOffset,
} from './LaunchkeyConstants';
import { PadColor } from '../../util/PadColor';
import { UIPage } from '../../util/UIPage';
import { ControllerStateSnapshot } from '../ControllerState';

export class LaunchkeyControllerSurface extends HardwareControllerSurface {
  private sku: LaunchkeySkuType;

  // Launchkey state
  private padMode: PadMode | null;
  private encoderMode: EncoderMode | null;

  constructor(
    input: WebMidi.Input,
    output: WebMidi.Output,
    sku: LaunchkeySkuType,
  ) {
    super(input, output);
    this.sku = sku;
    this.padMode = null;
    this.encoderMode = null;
  }

  initController(): void {
    this.log('Initializing');
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

    this.padMode = 'daw';
    this.encoderMode = 'plugin';
  }

  teardownController(): void {
    this.log('Teardown');
    this.unregisterEventListeners();
    this.sendRawMessage(launchkeySysexMessageFactories.disableDawMode());
  }

  resetFromState(snapshot: ControllerStateSnapshot): void {
    this.log('Reset from state');
    this.changePage(snapshot.page);
    for (let idx = 0; idx < snapshot.encoders.length; idx++) {
      const { name, value } = snapshot.encoders[idx];
      this.updateEncoderName(idx, name);
      this.updateEncoderValue(idx, value);
    }
    for (let idx = 0; idx < snapshot.pads.length; idx++) {
      this.updatePadColor(idx, snapshot.pads[idx]);
    }
  }

  changePage(page: UIPage): void {
    this.logOutgoing('Change page', page);
    // TODO
  }

  updatePadColor(padIndex: number, color: PadColor): void {
    if (this.padMode === 'daw') {
      const note = DawModePad.toNote(padIndex);
      this.logOutgoing('Set DAW mode pad', padIndex, color);
      this.output.channels[1].sendNoteOn(note, {
        rawAttack: padColors[color],
      });
    } else if (this.padMode === 'drum') {
      const note = DrumModePad.toNote(padIndex);
      this.logOutgoing('Set drum mode pad', padIndex, color);
      this.output.channels[10].sendNoteOn(note, {
        rawAttack: padColors[color],
      });
    }
  }

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

  updateEncoderValue(encoderIndex: number, value: number): void {
    let midiCc;
    if (
      this.encoderMode === 'plugin' ||
      this.encoderMode === 'mixer' ||
      this.encoderMode === 'sends'
    ) {
      midiCc = encoderIndex + absoluteEncoderCcOffset;
    } else if (this.encoderMode === 'transport') {
      midiCc = encoderIndex + relativeEncoderCcOffset;
    }
    if (midiCc) {
      this.logOutgoing('Set encoder value ', encoderIndex, value);
      this.output.channels[16].sendControlChange(midiCc, value);
    }
  }

  private sendRawMessage(data: number[]) {
    this.output.send(data);
  }

  private registerEventListeners() {
    this.log('Registered event listeners');
    this.input.channels[1].addListener('noteon', this.handleDawModePadNote);
    this.input.channels[10].addListener('noteon', this.handleDrumModePadNote);
    this.input.channels[7].addListener(
      'controlchange',
      this.handleControlChangeCh7,
    );
    this.input.channels[16].addListener(
      'controlchange',
      this.handleControlChangeCh16,
    );
  }

  private unregisterEventListeners() {
    this.log('Unregistered event listeners');
    this.input.channels[1].removeListener('noteon', this.handleDawModePadNote);
    this.input.channels[10].removeListener(
      'noteon',
      this.handleDrumModePadNote,
    );
    this.input.channels[7].removeListener(
      'controlchange',
      this.handleControlChangeCh7,
    );
    this.input.channels[16].removeListener(
      'controlchange',
      this.handleControlChangeCh16,
    );
  }

  private handleDawModePadNote = (e: WebMidi.NoteMessageEvent) => {
    const padIndex = DawModePad.fromNote(e.note.number);
    this.logIncoming('Pad DAW mode note', padIndex, e.note.rawAttack);
    this.emit('padPressed', padIndex, e.note.rawAttack);
  };

  private handleDrumModePadNote = (e: WebMidi.NoteMessageEvent) => {
    const padIndex = DrumModePad.fromNote(e.note.number);
    this.logIncoming('Pad drum mode note', padIndex, e.note.rawAttack);
    this.emit('padPressed', padIndex, e.note.rawAttack);
  };

  private handleControlChangeCh7 = (e: WebMidi.ControlChangeMessageEvent) => {
    if (e.controller.number === 29) {
      this.handleChangePadMode(e);
    }
    if (e.controller.number === 30) {
      this.handleChangeEncoderMode(e);
    }
  };

  private handleChangePadMode = (e: WebMidi.ControlChangeMessageEvent) => {
    const padMode = midiCCToPadMode.get(e.rawValue!);
    if (!padMode) {
      throw new Error(`Unrecognized pad mode CC ${e.rawValue}`);
    }
    this.logIncoming('Pad mode change', padMode);
    console.log(e);
    this.padMode = padMode;
    // TODO: emit page change?
  };

  private handleChangeEncoderMode = (e: WebMidi.ControlChangeMessageEvent) => {
    const encoderMode = midiCCToEncoderMode.get(e.rawValue!);
    if (!encoderMode) {
      throw new Error(`Unrecognized encoder mode CC value ${e.rawValue}`);
    }
    this.logIncoming('Encoder mode change', encoderMode);
    this.encoderMode = encoderMode;
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

  private log(...args: unknown[]) {
    console.log('*** Launchkey Controller:', ...args);
  }

  private logOutgoing(...args: unknown[]) {
    console.log('*** Launchkey Controller >>', ...args);
  }

  private logIncoming(...args: unknown[]) {
    console.log('*** Launchkey Controller <<', ...args);
  }
}

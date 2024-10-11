// import { PadColor } from '../util/PadColor';
// import { UIPage } from '../util/UIPage';
// import { ControllerState } from './ControllerState';
// import { ControllerSurface } from './ControllerSurface';

// class VirtualControllerSurface extends ControllerSurface {
//   private subscribers = new Set<() => void>([]);
//   private state?: ControllerState;

//   subscribe = (cb: () => void) => {
//     this.subscribers.add(cb);
//     return () => {
//       this.subscribers.delete(cb);
//     };
//   };

//   getSnapshot() {
//     return this.state;
//   }

//   initController(): void {}

//   teardownController(): void {}

//   resetFromState(snapshot: ControllerState): void {
//     this.state = JSON.parse(JSON.stringify(snapshot));
//   }

//   changePage(page: UIPage): void {
//     if (this.state) {
//       this.state.page = page;
//     }
//   }

//   updateEncoderName(encoderIndex: number, name: string): void {
//     if (this.state) {
//       this.state.encoders[encoderIndex].name = name;
//     }
//   }

//   updateEncoderValue(encoderIndex: number, value: number): void {
//     if (this.state) {
//       this.state.encoders[encoderIndex].value = value;
//     }
//   }

//   updatePadColor(padIndex: number, color: PadColor): void {
//     if (this.state) {
//       this.state.pads[padIndex] = color;
//     }
//   }
// }

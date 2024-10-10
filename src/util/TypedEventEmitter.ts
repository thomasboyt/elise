import { EventEmitter } from 'events';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class TypedEventEmitter<TEvents extends Record<string, any>> {
  private emitter = new EventEmitter();

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  on<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.emitter.on(eventName, handler as any);
  }

  off<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.emitter.off(eventName, handler as any);
  }
}

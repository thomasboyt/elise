import { useEffect, useRef, useState } from 'react';
import { MessageEvent } from 'webmidi';
import { useMidiController } from './controllers/useMidiController';
import { HardwareControllerSurface } from './controllers/ControllerSurface';

export function DebugLog() {
  const controller = useMidiController();
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  function handleMidiMessage(e: MessageEvent) {
    setMessageLog((messageLog) => [
      ...messageLog,
      `Message: ${e.message.channel}/${e.message.type} ${JSON.stringify(e.message.data)}`,
    ]);
  }

  useEffect(() => {
    if (controller instanceof HardwareControllerSurface) {
      controller.input.addListener('midimessage', handleMidiMessage);
    }

    return () => {
      if (controller instanceof HardwareControllerSurface) {
        controller.input.removeListener('midimessage', handleMidiMessage);
      }
    };
  }, [controller]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messageLog]);

  return (
    <>
      <div
        ref={logRef}
        style={{ display: 'block', height: '300px', overflowY: 'scroll' }}
      >
        <ul>
          {messageLog.map((message, idx) => (
            <li key={idx}>{message}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { MessageEvent, WebMidi } from 'webmidi';
import { EliseMIDIDevice } from './types';

interface Props {
  inputDevices: EliseMIDIDevice[];
  outputDevices: EliseMIDIDevice[];
}

export function DebugLog(props: Props) {
  const { inputDevices } = props;

  const [messageLog, setMessageLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  function handleMidiMessage(e: MessageEvent) {
    setMessageLog((messageLog) => [
      ...messageLog,
      `Message: ${e.message.channel}/${e.message.type} ${JSON.stringify(e.message.data)}`,
    ]);
  }

  useEffect(() => {
    for (const { id } of inputDevices) {
      const controller = WebMidi.getInputById(id);
      controller.addListener('midimessage', handleMidiMessage);
    }

    return () => {
      for (const { id } of inputDevices) {
        const controller = WebMidi.getInputById(id);
        controller.removeListener('midimessage', handleMidiMessage);
      }
    };
  }, [inputDevices]);

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

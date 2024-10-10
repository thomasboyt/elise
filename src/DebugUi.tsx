import { useEffect, useRef, useState } from 'react';
import { MessageEvent, WebMidi } from 'webmidi';
import { SendControls } from './SendControls';

interface Props {
  inputId: string;
  outputId: string;
}

export function DebugUi(props: Props) {
  const { inputId, outputId } = props;
  const [messageLog, setMessageLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  function handleMidiMessage(e: MessageEvent) {
    setMessageLog((messageLog) => [
      ...messageLog,
      `Message: ${e.message.channel}/${e.message.type} ${JSON.stringify(e.message.data)}`,
    ]);
  }

  function handleSendSysex(data: number[]) {
    WebMidi.getOutputById(outputId)?.send(data);
  }

  useEffect(() => {
    WebMidi.getInputById(inputId).addListener('midimessage', handleMidiMessage);

    return () => {
      WebMidi.getInputById(inputId).removeListener(
        'midimessage',
        handleMidiMessage,
      );
    };
  }, [inputId]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [messageLog]);

  return (
    <>
      <div>
        <SendControls onSendSysex={handleSendSysex} />
      </div>

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

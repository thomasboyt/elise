import { ReactNode, useEffect, useState } from 'react';
import { WebMidi } from 'webmidi';
import { WebMidiPortProvider } from './WebMidiPortProvider';

interface Props {
  children: ReactNode;
}

export const WebMidiLoader = ({ children }: Props) => {
  const [webMidiEnabled, setWebMidiEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function startWebMidi() {
      await WebMidi.enable({ sysex: true });

      if (!cancelled) {
        setWebMidiEnabled(true);
      }
    }
    startWebMidi();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!webMidiEnabled) {
    return <div>Waiting for web MIDI to be enabled...</div>;
  }

  return <WebMidiPortProvider>{children}</WebMidiPortProvider>;
};

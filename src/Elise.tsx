import { useEffect, useRef, useState } from 'react';
import { NoteMessageEvent, WebMidi } from 'webmidi';
import * as LaunchkeyMIDIConstants from './controllers/launchkey/LaunchkeyConstants';
import { ControllerSurface } from './controllers/ControllerSurface';

interface Props {
  controller: ControllerSurface;
}

export function Elise(props: Props) {
  const { inputId, outputId } = props;
  const [steps, setSteps] = useState([...new Array(16)].map(() => false));

  // This gets around the useEffectEvent problem. If we didn't use it, updatePad()
  // would reference stale steps, or we'd need to constantly unregister/reregister
  // the note event, which is a nonstarter.
  const stepsRef = useRef(steps);
  useEffect(() => {
    stepsRef.current = steps;
  });

  function sendPadColor(padIndex: number, color: number) {
    const note = LaunchkeyMIDIConstants.DawModePad.toNote(padIndex);
    WebMidi.getOutputById(outputId)?.channels[1].sendNoteOn(note, {
      rawAttack: color,
    });
  }

  function updatePad(e: NoteMessageEvent) {
    const noteNumber = e.note.number;
    const padIndex = LaunchkeyMIDIConstants.DawModePad.fromNote(noteNumber);
    console.log(stepsRef.current);
    if (stepsRef.current[padIndex]) {
      sendPadColor(padIndex, 0);
    } else {
      sendPadColor(padIndex, 17);
    }
    setSteps((steps) => {
      const newSteps = [...steps];
      newSteps[padIndex] = !steps[padIndex];
      console.log(newSteps);
      return newSteps;
    });
  }

  useEffect(() => {
    function handlePadPress(e: NoteMessageEvent) {
      updatePad(e);
    }

    WebMidi.getInputById(inputId).channels[1].addListener(
      'noteon',
      handlePadPress,
    );

    return () => {
      WebMidi.getInputById(inputId).channels[1].removeListener(
        'noteon',
        handlePadPress,
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputId, outputId]);

  return <div />;
}

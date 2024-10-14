import { getTrackOrThrow } from '../../state/accessors';
import {
  addMidiParameterConfigurationForTrack,
  changeMidiNoteChannelForTrack,
  setControllerNumberForParameter,
  setMidiChannelForParameter,
  setTypeForParameter,
} from '../../state/updateState';
import { useEliseContext } from '../../state/useEliseContext';
import { ChannelSelect } from './ChannelSelect';
import { ControllerNumberSelect } from './ControllerNumberSelect';
import { ParamTypeSelect } from './ParamTypeSelect';

export function MIDIConfiguration() {
  const { state, update } = useEliseContext();
  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );
  const parameters = track.parameterOrder;

  return (
    <>
      <h3>Note output</h3>
      <ChannelSelect
        value={track.midiNoteChannel}
        onChange={(channel) =>
          changeMidiNoteChannelForTrack(
            update,
            state.ui.currentScene,
            state.ui.currentTrack,
            channel,
          )
        }
      />

      <h3>Parameters</h3>

      <table>
        <thead>
          <tr>
            <th scope="col">Channel</th>
            <th scope="col">Type</th>
            <th scope="col">Controller</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((id) => {
            const param = track.parameterConfiguration[id];
            return (
              <tr key={id}>
                <td>
                  <ChannelSelect
                    value={param.channel}
                    onChange={(channel) =>
                      setMidiChannelForParameter(
                        update,
                        state.ui.currentScene,
                        state.ui.currentTrack,
                        id,
                        channel,
                      )
                    }
                  />
                </td>
                <td>
                  <ParamTypeSelect
                    value={param.type}
                    onChange={(type) =>
                      setTypeForParameter(
                        update,
                        state.ui.currentScene,
                        state.ui.currentTrack,
                        id,
                        type,
                      )
                    }
                  />
                </td>
                <td>
                  {param.type === 'midiCc' && (
                    <ControllerNumberSelect
                      value={param.controllerNumber}
                      onChange={(controllerNumber) =>
                        setControllerNumberForParameter(
                          update,
                          state.ui.currentScene,
                          state.ui.currentTrack,
                          id,
                          controllerNumber,
                        )
                      }
                    />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <button
        onClick={() =>
          addMidiParameterConfigurationForTrack(
            update,
            state.ui.currentScene,
            state.ui.currentTrack,
            crypto.randomUUID(),
            {
              channel: null,
              type: 'midiCc',
              controllerNumber: 1,
              destination: null,
              displayValueType: 'number',
              label: 'TODO',
            },
          )
        }
      >
        Add
      </button>
    </>
  );
}

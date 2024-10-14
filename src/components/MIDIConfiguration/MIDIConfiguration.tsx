import { getTrackOrThrow } from '../../state/accessors';
import {
  addMidiParameterConfigurationForTrack,
  changeMidiNoteChannelForTrack,
  setMidiParameterControllerNumber,
  setMidiParameterChannel,
  setMidiParameterType,
  setMidiParameterLabel,
  removeMidiParameterConfigurationForTrack,
} from '../../state/updateState';
import { useEliseContext } from '../../state/useEliseContext';
import {
  getDefaultMidiParameterLabel,
  getMidiParameterLabel,
} from '../../ui/uiParameters';
import { ChannelSelect } from './ChannelSelect';
import { ControllerNumberSelect } from './ControllerNumberSelect';
import { ParamTypeSelect } from './ParamTypeSelect';
import css from './MIDIConfiguration.module.css';

export function MIDIConfiguration() {
  const { state, update } = useEliseContext();
  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );
  const parameters = track.parameterOrder;

  return (
    <div className={css.midiConfiguration}>
      <div className={css.headerGroup}>
        <h3>Note output</h3>
        <div className={css.headerGroupControls}>
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
        </div>
      </div>

      <div className={css.headerGroup}>
        <h3>Parameters</h3>

        <div className={css.headerGroupControls}>
          <button disabled>Save template</button>
          <button disabled>Load template</button>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th scope="col" />
            <th scope="col">Label</th>
            <th scope="col">Channel</th>
            <th scope="col">Type</th>
            <th scope="col">Controller</th>
          </tr>
        </thead>
        <tbody>
          {parameters.map((id) => {
            const param = track.parameterConfiguration[id];
            const label = getMidiParameterLabel(param);
            const hasCustomLabel = param.label !== null;

            return (
              <tr key={id}>
                <td>
                  <button
                    onClick={() =>
                      removeMidiParameterConfigurationForTrack(
                        update,
                        state.ui.currentScene,
                        state.ui.currentTrack,
                        id,
                      )
                    }
                  >
                    x
                  </button>
                </td>
                <td>
                  <input
                    type="text"
                    aria-label="Label"
                    value={hasCustomLabel ? label : ''}
                    placeholder={getDefaultMidiParameterLabel(param)}
                    onChange={(e) => {
                      const value =
                        e.target.value === '' ? null : e.target.value;
                      setMidiParameterLabel(
                        update,
                        state.ui.currentScene,
                        state.ui.currentTrack,
                        id,
                        value,
                      );
                    }}
                  />
                </td>
                <td>
                  <ChannelSelect
                    noteChannel={track.midiNoteChannel}
                    value={param.channel}
                    onChange={(channel) =>
                      setMidiParameterChannel(
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
                      setMidiParameterType(
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
                        setMidiParameterControllerNumber(
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

      {parameters.length < 8 && (
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
                label: null,
              },
            )
          }
        >
          + Add
        </button>
      )}
    </div>
  );
}

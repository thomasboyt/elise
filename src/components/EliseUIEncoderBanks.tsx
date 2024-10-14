import { getUIMidiParameter, noteParameters } from '../ui/uiParameters';
import { EliseUIEncoderBank } from './EliseUIEncoderBank';
import { EliseUINoteDisplay } from './EliseUINoteDisplay';
import { EliseUIParameterList } from './EliseUIParameterList';
import { useEliseContext } from '../state/useEliseContext';
import { getTrackOrThrow } from '../state/accessors';
import css from './EliseUI.module.css';

export function EliseUIEncoderBanks() {
  const { state } = useEliseContext();
  const track = getTrackOrThrow(
    state,
    state.ui.currentScene,
    state.ui.currentTrack,
  );
  const midiParameters = track.parameterOrder.map((id) =>
    getUIMidiParameter(id),
  );

  return (
    <div className={css.encoderBanks}>
      <EliseUIEncoderBank encoderBank="note" label="Note">
        <EliseUINoteDisplay />
        <EliseUIParameterList
          parameters={[
            noteParameters.velocity,
            noteParameters.gate,
            noteParameters.offset,
          ]}
        />
      </EliseUIEncoderBank>
      <EliseUIEncoderBank encoderBank="parameters" label="Params">
        <EliseUIParameterList parameters={midiParameters} />
      </EliseUIEncoderBank>
      <EliseUIEncoderBank encoderBank="lfo" label="LFO">
        <span />
      </EliseUIEncoderBank>
    </div>
  );
}

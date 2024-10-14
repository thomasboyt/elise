import { getUIMidiParameter, noteParameters } from '../ui/uiParameters';
import { EliseUIEncoderBank } from './EliseUIEncoderBank';
import { EliseUINoteDisplay } from './EliseUINoteDisplay';
import { EliseUIParameterList } from './EliseUIParameterList';
import css from './EliseUI.module.css';

export function EliseUIEncoderBanks() {
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
        <EliseUIParameterList
          parameters={[...new Array(8)].map((_, idx) =>
            getUIMidiParameter(idx),
          )}
        />
      </EliseUIEncoderBank>
      <EliseUIEncoderBank encoderBank="lfo" label="LFO">
        <span />
      </EliseUIEncoderBank>
    </div>
  );
}

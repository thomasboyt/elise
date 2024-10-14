import { Fragment } from 'react/jsx-runtime';
import { useEliseContext } from '../../state/useEliseContext';
import css from './GridView.module.css';
import classNames from 'classnames';
import { extendArrayToLength } from '../../util/extendArrayToLength';
import { EliseState } from '../../state/state';

// TODO: memoize this? feels expensive idk
type StepState = 'on' | 'off' | 'disabled';
function getSteps(state: EliseState): StepState[][] {
  const scene = state.project.scenes[state.ui.currentScene];
  if (!scene) {
    throw new Error(`missing scene ${state.ui.currentScene}`);
  }
  return scene.tracks.map((track) => {
    const steps: StepState[] = (track?.steps ?? []).map((step) =>
      step ? 'on' : 'off',
    );
    return extendArrayToLength(steps, 64, 'disabled');
  });
}

export function GridView() {
  const { state } = useEliseContext();
  const steps = getSteps(state); // memoize me probably

  return (
    <div className={css.gridView}>
      {steps.map((track, idx) => (
        <Fragment key={idx}>
          <div className={css.gridTrackLabel}>Track {idx}</div>
          <div className={css.gridTrack}>
            {track.map((step, idx) => {
              return (
                <div
                  key={idx}
                  className={classNames(css.step, {
                    [css.filledStep]: step === 'on',
                    [css.emptyStep]: step === 'off',
                    [css.disabledStep]: step === 'disabled',
                  })}
                />
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}

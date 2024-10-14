import { useEliseContext } from '../../state/useEliseContext';
import { extendArrayToLength } from '../../util/extendArrayToLength';
import { EliseState } from '../../state/state';
import { BaseGrid } from '../BaseGrid/BaseGrid';
import { GridRow } from '../BaseGrid/GridRow';
import { CellState, GridCell } from '../BaseGrid/GridCell';

function getCells(state: EliseState): CellState[][] {
  const scene = state.project.scenes[state.ui.currentScene];
  if (!scene) {
    throw new Error(`missing scene ${state.ui.currentScene}`);
  }
  return scene.tracks.map((track) => {
    const steps: CellState[] = (track?.steps ?? []).map((step) =>
      step ? 'on' : 'off',
    );
    return extendArrayToLength(steps, 64, 'disabled');
  });
}

export function GridView() {
  const { state } = useEliseContext();
  const steps = getCells(state); // memoize me probably

  return (
    <BaseGrid labelWidth={100}>
      {steps.map((track, idx) => (
        <GridRow key={idx} rowLabel={`Track ${idx}`}>
          {track.map((step, idx) => (
            <GridCell key={idx} state={step} />
          ))}
        </GridRow>
      ))}
    </BaseGrid>
  );
}

import { SceneGestures } from './support';
import { cameraChanges } from 'viz-client/legacy';
import { SCENE_TOUCH_START } from 'viz-shared/actions/scene';
import { atom as $atom, pathValue as $value } from '@graphistry/falcor-json-graph';

export function moveCamera(actions) {

    const moveCameraStarts = SceneGestures
        .startFromActions(actions
            .ofType(SCENE_TOUCH_START)
            .filter(({ event, selectionType, selectionMask }) =>  (
                !selectionType || (selectionType === 'window' && selectionMask)) && !(
                 event.getModifierState('Shift'))
            )
        );

    const cameraMoves = SceneGestures
        .pan(moveCameraStarts)
        .repeat()
        .mergeMap((drag) => drag
            .stopPropagation()
            .moveCameraInWorldCoords()
            .do(({ camera }) => {
                if (camera) {
                    cameraChanges.next(camera);
                }
            })
            .takeLast(1)
        );

    return cameraMoves.map(toValuesAndInvalidations);
}

function toValuesAndInvalidations({ falcor, camera: { center: { x, y } } }) {
    return {
        falcor, values: [{
            json: {
                camera: {
                    center: {
                        x, y
                    }
                }
            }
        }]
    };
}
import { container } from 'reaxtor-redux';

export const Labels = container(
    ({ edge = [], point = [], settings = [] } = {}) => `{
        id, name,
        selection, timeZone,
        opacity, enabled, poiEnabled,
        ['background', 'foreground']: { color },
        edge: { length, [0...${edge.length}]  },
        point: { length, [0...${point.length}] }
    }`
)(renderLabels);

function renderLabels({ edge, point }) {
    return (
        <h1>LABELS</h1>
    )
}

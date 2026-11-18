import pocReducer, { initialState, roundIdFor, areaProgress, inspectionKey } from '../src/store/poc';
import { AREAS, findEquipment } from '../src/data/tepeagua';
import { buildVosoaHtml } from '../src/poc/report';

const AREA = AREAS[0];
const EQ = AREA.equipment[0];
const ROUND = roundIdFor(AREA.id, '2026-11-17');
const run = (actions, s = { ...initialState, technician: { name: 'Ana' } }) => actions.reduce(pocReducer, s);

test('catalog matches the VOSOA forms', () => {
  expect(AREAS.map((a) => a.equipment.length)).toEqual([10, 9, 12]);
  const crit = AREAS.flatMap((a) => a.equipment).reduce((m, e) => ({ ...m, [e.criticality]: (m[e.criticality] || 0) + 1 }), {});
  expect(crit).toEqual({ A: 24, B: 7 });
  expect(AREAS[0].equipment.reduce((n, e) => n + e.items.length, 0)).toBe(126);
  expect(findEquipment('HZA0.331-TB1').equipment.items).toHaveLength(17);
});

test('a Malo becomes an open fault on completion and disappears if changed back', () => {
  const at = 1;
  const base = { areaId: AREA.id, roundId: ROUND, equipmentId: EQ.id, at };
  let s = run([
    { type: 'SET_ALL_GOOD', ...base },
    { type: 'SET_RESULT', ...base, itemId: EQ.items[1].id, patch: { outcome: 'bad', note: 'Fuga' } },
    { type: 'COMPLETE_EQUIPMENT', ...base },
  ]);
  const faults = Object.values(s.faults);
  expect(faults).toHaveLength(1);
  expect(faults[0]).toMatchObject({ status: 'open', criticality: 'B', note: 'Fuga', reportedBy: 'Ana' });
  expect(areaProgress(s, AREA, ROUND)).toMatchObject({ done: 1, bad: 1, points: EQ.items.length });

  s = run(
    [
      { type: 'SET_RESULT', ...base, itemId: EQ.items[1].id, patch: { outcome: 'good' } },
      { type: 'COMPLETE_EQUIPMENT', ...base },
    ],
    s,
  );
  expect(Object.values(s.faults)).toHaveLength(0);
});

test('VOSOA html lists every equipment and the signature', () => {
  const base = { areaId: AREA.id, roundId: ROUND, equipmentId: EQ.id, at: Date.now() };
  const s = run([
    { type: 'SET_ALL_GOOD', ...base },
    { type: 'COMPLETE_EQUIPMENT', ...base },
    { type: 'CLOSE_ROUND', roundId: ROUND, comments: 'Todo <ok>', signature: { paths: ['M1,1 L2,2'], width: 300, height: 180 }, at: Date.now() },
  ]);
  const html = buildVosoaHtml(s, ROUND);
  for (const e of AREA.equipment) expect(html).toContain(e.tag);
  expect(html).toContain('NO REVISADO');
  expect(html).toContain('Todo &lt;ok&gt;');
  expect(html).toContain('<path d="M1,1 L2,2"');
  expect(s.inspections[inspectionKey(ROUND, EQ.id)].completedAt).toBeTruthy();
});

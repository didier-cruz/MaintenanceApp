import pocReducer, { initialState, roundIdFor, areaProgress, inspectionKey } from '../src/store/poc';
import { AREAS, findEquipment } from '../src/data/tepeagua';
import { buildVosoaHtml } from '../src/poc/report';
import { parseQr, qrPayload, buildQrLabelsHtml } from '../src/poc/qr';

const AREA = AREAS[0];
const EQ = AREA.equipment[0];
const ROUND = roundIdFor(AREA.id, '2026-11-17');
const run = (actions, s = { ...initialState, technician: { name: 'Ana' } }) => actions.reduce(pocReducer, s);

test('catalog matches the VOSOA forms', () => {
  expect(AREAS.map((a) => a.equipment.length)).toEqual([10, 9, 12]);
  const crit = AREAS.flatMap((a) => a.equipment).reduce((m, e) => ({ ...m, [e.criticality]: (m[e.criticality] || 0) + 1 }), {});
  expect(crit).toEqual({ A: 24, B: 7 });
  expect(AREAS[0].equipment.reduce((n, e) => n + e.items.length, 0)).toBe(135);
  expect(findEquipment('HZA0.331-TB1').equipment.items).toHaveLength(17);
  const tunel = findEquipment('HZA0.321-BT1').equipment.items;
  expect(tunel).toHaveLength(18);
  expect(tunel[11].text).toMatch(/detector de metales/);
  expect(tunel[12].allowsNA).toBe(true);
  for (const tag of ['HZA0.331-BT4', 'HZA0.331-BTA']) {
    const items = findEquipment(tag).equipment.items;
    expect(items).toHaveLength(17);
    expect(items[4].text).toMatch(/sensores ópticos/);
  }
  expect(findEquipment('HZA0.331-BT1').equipment.items).toHaveLength(16);
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

test('QR codes resolve to their equipment and the label sheet covers all 31', () => {
  expect(parseQr(qrPayload('HZA0.311-TY1')).equipment.name).toBe('Tolva metálica de alimentación');
  expect(parseQr(' vosoa:HZA0.331-BTA ').area.id).toBe('HZA0.331');
  expect(parseQr('HZA0.321-TI1').equipment.id).toBe('HZA0.321-TI1');
  expect(parseQr('https://example.com')).toBeNull();
  const html = buildQrLabelsHtml();
  expect((html.match(/class="label"/g) || []).length).toBe(31);
  expect((html.match(/class="qr"><svg/g) || []).length).toBe(31);
});

test('item galleries go to the fault and to the PDF annex', () => {
  const base = { areaId: AREA.id, roundId: ROUND, equipmentId: EQ.id, at: Date.now() };
  const [first, second] = EQ.items;
  const s = run([
    { type: 'SET_RESULT', ...base, itemId: first.id, patch: { outcome: 'bad', note: 'Fuga', photos: ['ph_a', 'ph_b'] } },
    { type: 'SET_RESULT', ...base, itemId: second.id, patch: { outcome: 'good', photos: ['ph_c'] } },
    { type: 'SET_ALL_GOOD', ...base },
    { type: 'COMPLETE_EQUIPMENT', ...base },
    { type: 'CLOSE_ROUND', roundId: ROUND, comments: '', signature: null, at: Date.now() },
  ]);
  expect(s.faults[`${ROUND}|${first.id}`].photos).toEqual(['ph_a', 'ph_b']);
  const html = buildVosoaHtml(s, ROUND, { ph_a: 'data:image/jpeg;base64,AAA', ph_b: 'data:image/jpeg;base64,BBB', ph_c: 'data:image/jpeg;base64,CCC' });
  expect(html).toContain('Anexo — Evidencia fotográfica');
  expect((html.match(/<img src="data:image\/jpeg/g) || []).length).toBe(3);
});

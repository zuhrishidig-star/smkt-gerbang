/* Run with: node --test tests/program-permissions.test.cjs */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '..', 'tatib.js'), 'utf8');

function setup(previous) {
  const state = { data: { program: [], bolehAtur: false }, rinci: {}, renders: 0 };
  if (previous !== undefined) state.rinci.p1 = { bolehUnggah: previous };
  const context = vm.createContext({
    PR: state,
    renderProgram() { state.renders++; },
    esc: String, tglManis: String, namaPendek: String,
    kalenderHariHtml() { return ''; }, ikon() { return ''; },
  });
  // Exercise the production update and renderer without starting browser/login code.
  const renderer = source.slice(source.indexOf('  function rinciProgramHtml('), source.indexOf('  async function klikProgram('));
  const update = source.slice(source.indexOf('  function gantiProgram('), source.indexOf('  async function unggahPersetujuan('));
  assert.ok(renderer.includes('return h;'), 'production renderer was located');
  assert.ok(update.includes('renderProgram();'), 'production updater was located');
  vm.runInContext(renderer + '\n' + update, context);
  return { state, context };
}

for (const [label, previous, allowed] of [
  ['missing capability', undefined, false],
  ['explicit denial', false, false],
  ['explicit grant', true, true],
]) {
  test('program update preserves ' + label, () => {
    const { state, context } = setup(previous);
    context.gantiProgram({ id: 'p1', status: 'Berjalan', jumlah: 3, hari: [] });
    const detail = state.rinci.p1;
    assert.equal(detail.bolehUnggah, allowed);
    assert.equal(context.rinciProgramHtml(detail).includes('data-unggah='), allowed);
    assert.equal(state.data.program.length, 1);
    assert.equal(state.renders, 1);
    context.gantiProgram({ id: 'p1', status: 'Berjalan', jumlah: 5, hari: [] });
    assert.equal(state.rinci.p1.bolehUnggah, allowed);
    assert.equal(state.data.program.length, 1);
    assert.equal(state.data.program[0].jumlah, 5);
  });
}
test('a different program does not inherit an upload grant', () => {
  const { state, context } = setup(true);
  context.gantiProgram({ id: 'p2', status: 'Berjalan', hari: [] });
  assert.equal(state.rinci.p2.bolehUnggah, false);
  assert.equal(context.rinciProgramHtml(state.rinci.p2).includes('data-unggah='), false);
});
test('an update before the program list loads is ignored', () => {
  const { state, context } = setup();
  state.data = null;
  context.gantiProgram({ id: 'p1' });
  assert.equal(state.renders, 0);
  assert.equal(Object.keys(state.rinci).length, 0);
});

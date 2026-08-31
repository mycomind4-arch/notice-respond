import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
test('platform UI exposes core navigation',()=>{
  for (const label of ['Command Center','Cases','Documents','Agents','Automations','Intelligence','Actions','Proof','Knowledge','Integrations','Activity','Settings']) assert.match(app,new RegExp(label));
});
test('platform UI includes responsive visual system',()=>{
  assert.match(css,/grid-template-columns/);
  assert.match(css,/@media/);
  assert.match(css,/backdrop-filter/);
});

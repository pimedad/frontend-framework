import { expect, test } from 'vitest';
import { objectsDiff } from '../utils/objects';

test('same object, no change', () => {
  const oldObj = { old: 'new' };
  const newObj = { old: 'new' };
  const { added, removed, updated } = objectsDiff(oldObj, newObj);

  expect(added).toEqual([]);
  expect(removed).toEqual([]);
  expect(updated).toEqual([]);
});

test('add key', () => {
  const oldObj = {};
  const newObj = { old: 'new' };
  const { added, removed, updated } = objectsDiff(oldObj, newObj);

  expect(added).toEqual(['old']);
  expect(removed).toEqual([]);
  expect(updated).toEqual([]);
});

test('remove key', () => {
  const oldObj = { old: 'new' };
  const newObj = {};
  const { added, removed, updated } = objectsDiff(oldObj, newObj);

  expect(added).toEqual([]);
  expect(removed).toEqual(['old']);
  expect(updated).toEqual([]);
});

test('update value', () => {
  const oldObj = { old: 'new' };
  const newObj = { old: 'update' };
  const { added, removed, updated } = objectsDiff(oldObj, newObj);

  expect(added).toEqual([]);
  expect(removed).toEqual([]);
  expect(updated).toEqual(['old']);
});
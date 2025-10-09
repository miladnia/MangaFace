import type { ManifestDTO } from '@data/dtos';
import { ManifestMapper } from '@data/mappers';
import type { Manifest } from '@domain/models';
import JsonFetch from '@data/JsonFetch';

let packName: string;
let manifest: Manifest;

beforeAll(async () => {
  packName = 'manga_male_pack';
  const manifestUrl = `/manifest/${packName}.json`;
  const manifestDTO = await JsonFetch.getData<ManifestDTO>(manifestUrl);
  manifest = ManifestMapper.dtoToDomainModel(manifestDTO);
});

it('should contain valid pack name', () => {
  expect(manifest?.packName).toBe(packName);
});

it('should contain initializer script', () => {
  expect(manifest?.initializerScript?.name).toBe('initializer_script');
});

it('should contain at least one navigator', () => {
  expect(manifest?.navigators?.length ?? 0).toBeGreaterThan(0);
});

it('should contain at least one command', () => {
  expect(Object.entries(manifest?.commands ?? {}).length).toBeGreaterThan(0);
});

it('should contain the same instance for the same command', () => {
  const navCommand = manifest?.navigators[0]?.options[0]?.command;
  const realCommand = manifest?.commands[navCommand?.name ?? ''];
  expect(navCommand).toBe(realCommand);
});

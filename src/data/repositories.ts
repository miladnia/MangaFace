import JsonFetch from './JsonFetch';
import type { ManifestDTO } from './dtos';
import { ManifestMapper } from './mappers';
import type { ManifestRepository } from '@domain/interfaces/repositories';

export const HttpManifestRepository: ManifestRepository = {
  async getByPackName(packName: string) {
    const manifestUrl = `${__STATIC_BASE_URL__}/manifest/${packName}.json`;
    const manifestDTO = await JsonFetch.getData<ManifestDTO>(manifestUrl);

    if (!manifestDTO) {
      throw new Error(`Invalid pack name '${packName}'.`);
    }

    return ManifestMapper.dtoToDomainModel(manifestDTO);
  },
};

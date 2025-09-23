import JsonFetch from '../src/utils/JsonFetch';
import type { ManifestDTO } from '../src/data/dtos';

it('should return a valid manifest dto', async () => {
    const packName = "manga_male_pack";
    const manifestUrl = `/manifest/${packName}.json`;
    const manifestDTO = await JsonFetch.getData<ManifestDTO>(manifestUrl);
    expect(manifestDTO.pack_name).toBe(packName);
});

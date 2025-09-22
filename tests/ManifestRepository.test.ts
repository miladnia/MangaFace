import { manifestRepository } from '../src/data/repositories';

it('should return a valid manifest entity', async () => {
    const packName = "manga_male_pack";
    const manifest = await manifestRepository.getByPackName(packName);
    expect((manifest).packName).toBe(packName);
});

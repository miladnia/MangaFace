import type { Manifest } from "./models";

export interface ManifestRepository {
  getByPackName(packName: string): Promise<Manifest>;
}

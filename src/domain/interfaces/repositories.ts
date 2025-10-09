import type { Manifest } from "../models/Manifest";

export interface ManifestRepository {
  getByPackName(packName: string): Promise<Manifest>;
}

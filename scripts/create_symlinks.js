import fs from "fs";
import path from "path";

const symlinks = {
  [path.resolve("app/app_storage")]: path.resolve("public/app_storage"),
  [path.resolve("app/manifest")]: path.resolve("public/manifest"),
  [path.resolve("app/src")]: path.resolve("src"),
};

for (const [linkPath, targetPath] of Object.entries(symlinks)) {
  if (!fs.existsSync(targetPath)) {
    console.warn(`Target directory "${targetPath}" does not exist.`);
    continue;
  }

  if (fs.existsSync(linkPath)) {
    console.log(`Symlink already exists: ${linkPath}`);
    continue;
  }

  try {
    fs.symlinkSync(targetPath, linkPath, "junction");
    console.log(`Created symlink: ${linkPath} -> ${targetPath}`);
  } catch (err) {
    console.error(`Failed to create symlink "${linkPath}":`, err);
  }
}

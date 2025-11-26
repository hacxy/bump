import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { consola } from 'consola';
import prompts from 'prompts';
import semver, { valid } from 'semver';
import { version, versionIncrements } from '../const/index.js';

// 更新package.json中的版本号
export function changePackageVersion(version: string) {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  pkg.version = version;

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  consola.success(`Updated package.json version to ${version}`);
}

// 更新版本号
export const inc = (i: any, type?: string, identifier?: any) => semver.inc(version, i, type, identifier);

// 获取目标版本
export async function getTargetVersion(): Promise<string> {
  let targetVersion = version;
  const versions = versionIncrements
    .map(i => {
      if (i === 'beta' || i === 'alpha') {
        return `${i} (${inc('prerelease', i)})`;
      }
      return `${i} (${inc(i)})`;
    })
    .concat('custom');

  const { release } = await prompts({
    type: 'select',
    name: 'release',
    message: 'Select release type',
    choices: versions.map((item, index) => ({ title: item, value: index })),
  });

  if (release === 5) {
    targetVersion = (
      await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: version,
      })
    ).version;
  }
  else {
    targetVersion = versions[release!]?.match(/\((.*)\)/)?.[1] as string;
  }

  if (!valid(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }

  return targetVersion;
}

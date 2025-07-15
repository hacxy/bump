import { readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { cwd } from 'node:process';
import { ConventionalChangelog } from 'conventional-changelog';
import { execa } from 'execa';
import c from 'picocolors';
import semver from 'semver';

const pkgString = readFileSync(path.resolve(process.cwd(), './package.json'), { encoding: 'utf8' });

export const version = JSON.parse(pkgString).version;

export function run(bin: string, args: any, opts = {}) {
  return execa(bin, args, { stdio: 'inherit', ...opts });
}

export const inc = (i: any, type?: string, identifier?: any) => semver.inc(version, i, type, identifier);

export const step = (msg: string) => console.log(c.cyan(msg));

export function updatePackage(version: string) {
  const pkgPath = path.resolve(process.cwd(), 'package.json');
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

  pkg.version = version;

  writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
}

export const versionIncrements = ['patch', 'minor', 'major', 'beta', 'alpha'];

export const tags = ['latest', 'next'];

/**
 * changelog generator
 */
export async function generateChangelog() {
  const generator = new ConventionalChangelog()
    .readPackage()
    .loadPreset('angular');

  const changelogPath = path.resolve(cwd(), 'CHANGELOG.md');

  try {
    statSync(changelogPath);
  }
  // eslint-disable-next-line unused-imports/no-unused-vars
  catch (_) {
    writeFileSync(changelogPath, '');
  }

  const existingContent = readFileSync(changelogPath, 'utf8');

  let changelogData = '';
  for await (const chunk of generator.write()) {
    changelogData += chunk;
  }

  // 将新日志插入到顶部
  const updatedContent = `${changelogData}\n\n${existingContent}`;

  writeFileSync(changelogPath, updatedContent);
}


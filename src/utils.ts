import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
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


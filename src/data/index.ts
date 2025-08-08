import { readFileSync } from 'node:fs';
import path from 'node:path';

const pkgString = readFileSync(path.resolve(process.cwd(), './package.json'), { encoding: 'utf8' });
const pkg = JSON.parse(pkgString);
const version = pkg.version;
const versionIncrements = ['patch', 'minor', 'major', 'beta', 'alpha'];

const tags = ['latest', 'next'];

export { pkg, tags, version, versionIncrements };

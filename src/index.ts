import prompts from 'prompts';
import { valid } from 'semver';
import { inc, run, step, tags, updatePackage, version, versionIncrements } from './utils';

export async function bootstrap() {
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
    targetVersion = versions[release].match(/\((.*)\)/)?.[1] as string;
  }

  if (!valid(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }

  const { tag } = await prompts({
    type: 'select',
    name: 'tag',
    message: 'Select tag type',
    choices: tags.map((item, index) => ({ title: item, value: index })),
  });

  const { yes: tagOk } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion} on ${tags[tag]}. Confirm?`,
  });

  if (!tagOk) {
    process.exit(0);
  }

  // Update the package version.
  step('\nUpdating the package version...');
  updatePackage(targetVersion);

  // Build the package.
  step('\nBuilding the package...');
  await run('npm', ['run', 'build']);

  // Generate the changelog.
  step('\nGenerating the changelog...');

  await run('npx', ['conventional-changelog', '-p', 'angular', '-i', 'CHANGELOG.md', '-s']);
  await run('eslint', ['CHANGELOG.md', '--fix', '--no-ignore']);

  const { yes: changelogOk } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: 'Changelog generated. Does it look good?',
  });

  if (!changelogOk) {
    process.exit(0);
  }

  // Commit changes to the Git and create a tag.
  step('\nCommitting changes...');
  await run('git', ['add', 'package.json', 'CHANGELOG.md']);
  await run('git', ['commit', '-m', `chore: release: v${targetVersion}`]);
  await run('git', ['tag', `v${targetVersion}`]);

  step('\nPublishing the package...');

  const { pkgManage } = await prompts({
    type: 'select',
    name: 'pkgManage',
    message: 'Select a package management tool to execute the publish command.',
    choices: [
      {
        title: 'npm',
        value: 'npm',
      },
      {
        title: 'pnpm',
        value: 'pnpm'
      }
    ]
  });

  if (pkgManage === 'npm') {
    await run('npm', ['publish', '--tag', tags[tag], '--ignore-scripts']);
  }
  else if (pkgManage === 'pnpm') {
    await run('pnpm', ['publish', '--tag', tags[tag], '--ignore-scripts', '--no-git-checks']);
  }

  // Push to GitHub.
  step('\nPushing to GitHub...');
  await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  await run('git', ['push']);
}

bootstrap().catch(e => console.log(e));

import { ConventionalChangelog, runProgram } from 'conventional-changelog';
import mri from 'mri';
import prompts from 'prompts';
import { valid } from 'semver';
import { inc, run, step, tags, updatePackage, version, versionIncrements } from './utils';

const argv = process.argv.slice(2);

const { changelog, build, tag, message } = mri(argv, {
  alias: {
    c: 'changelog',
    b: 'build',
    t: 'tag',
    m: 'message'
  }
});

// 获取目标版本
async function getTargetVersion(): Promise<string> {
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

  return targetVersion;
}

// 获取标签类型
async function getTagType(): Promise<number> {
  const { tag } = await prompts({
    type: 'select',
    name: 'tag',
    message: 'Select tag type',
    choices: tags.map((item, index) => ({ title: item, value: index })),
  });
  return tag;
}

// 确认发布
async function confirmRelease(targetVersion: string, tagIndex: number): Promise<boolean> {
  const { yes: tagOk } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion} on ${tags[tagIndex]}. Confirm?`,
  });
  return tagOk;
}

// 更新包版本
async function updateVersion(targetVersion: string): Promise<void> {
  step('\nUpdating the package version...');
  updatePackage(targetVersion);
}

// 构建包
async function buildPackage(): Promise<void> {
  step('\nBuilding the package...');
  await run('npm', ['run', 'build']);
}

// 生成变更日志
async function generateChangelog(): Promise<boolean> {
  step('\nGenerating the changelog...');

  runProgram(new ConventionalChangelog(process.cwd()), { preset: 'angular', infile: 'CHANGELOG.md' });

  await run('npx', ['eslint', 'CHANGELOG.md', '--fix', '--no-ignore']);

  const { yes: changelogOk } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: 'Changelog generated. Does it look good?',
  });

  return changelogOk;
}

// 提交更改
async function commitChanges(targetVersion: string): Promise<void> {
  step('\nCommitting changes...');
  // 判断是否有changelog选项，如果有则添加CHANGELOG.md
  if (changelog) {
    await run('git', ['add', 'package.json', 'CHANGELOG.md']);
  }
  else {
    await run('git', ['add', 'package.json']);
  }

  // 使用自定义提交信息模板或默认模板
  const commitMessage = message
    ? message.replace(/\{version\}/g, targetVersion)
    : `chore: release: v${targetVersion}`;

  await run('git', ['commit', '-m', commitMessage]);

  if (tag) {
    await run('git', ['tag', `v${targetVersion}`]);
  }
}

// 发布包
async function publishPackage(tagIndex: number): Promise<void> {
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
    await run('npm', ['publish', '--tag', tags[tagIndex], '--ignore-scripts']);
  }
  else if (pkgManage === 'pnpm') {
    await run('pnpm', ['publish', '--tag', tags[tagIndex], '--ignore-scripts', '--no-git-checks']);
  }
}

// 推送到GitHub
async function gitPush(targetVersion: string): Promise<void> {
  step('\nPushing to GitHub...');
  if (tag) {
    await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
  }
  // 判断是否为首次推送, 如果是则添加-u参数
  const isFirstPush = await run('git', ['rev-parse', 'origin/main']);
  if (isFirstPush) {
    await run('git', ['push', '-u', 'origin', 'main']);
  }
  else {
    await run('git', ['push']);
  }
}

export async function bootstrap() {
  // 根据命令行选项决定执行流程

  // 获取目标版本
  const targetVersion = await getTargetVersion();

  // 获取标签类型
  const tagIndex = await getTagType();

  // 确认发布
  const confirmed = await confirmRelease(targetVersion, tagIndex);
  if (!confirmed) {
    process.exit(0);
  }

  // 更新包版本
  await updateVersion(targetVersion);

  // 根据选项决定是否构建
  if (build) {
    await buildPackage();
  }

  // 根据选项决定是否生成变更日志
  if (changelog) {
    const changelogOk = await generateChangelog();
    if (!changelogOk) {
      process.exit(0);
    }
  }

  // 提交更改
  await commitChanges(targetVersion);

  // 发布包
  await publishPackage(tagIndex);

  await gitPush(targetVersion);
}

bootstrap().catch(e => console.log(e));

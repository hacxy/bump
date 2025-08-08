import { buildPackage, gitAdd, gitCommit, gitPush, gitTag, hasGit } from './utils/exec.js';
import { generateChangelog } from './utils/generate.js';
import { confirmBuild, confirmChangelog, confirmCommit, confirmPush, confirmRelease, confirmTag, getTagType } from './utils/prompts.js';
import { changePackageVersion, getTargetVersion } from './utils/version.js';

// const argv = process.argv.slice(2);

// const { changelog, build, tag, message } = mri(argv, {
//   alias: {
//     c: 'changelog',
//     b: 'build',
//     t: 'tag',
//     m: 'message'
//   }
// });

// // 更新包版本
// async function updateVersion(targetVersion: string): Promise<void> {
//   step('\nUpdating the package version...');
//   updatePackage(targetVersion);
// }

// // 构建包
// async function buildPackage(): Promise<void> {
//   step('\nBuilding the package...');
//   await execa`npm run build`;
// }

// 提交更改
// async function commitChanges(targetVersion: string): Promise<void> {
//   step('\nCommitting changes...');
//   // 判断是否有changelog选项，如果有则添加CHANGELOG.md
//   if (changelog) {
//     await run('git', ['add', 'package.json', 'CHANGELOG.md']);
//   }
//   else {
//     await run('git', ['add', 'package.json']);
//   }

//   // 使用自定义提交信息模板或默认模板
//   const commitMessage = message
//     ? message.replace(/\{version\}/g, targetVersion)
//     : `chore: release: v${targetVersion}`;

//   await run('git', ['commit', '-m', commitMessage]);

//   if (tag) {
//     await run('git', ['tag', `v${targetVersion}`]);
//   }
// }

// 发布包
// async function publishPackage(tagIndex: number): Promise<void> {
//   step('\nPublishing the package...');

//   const { pkgManage } = await prompts({
//     type: 'select',
//     name: 'pkgManage',
//     message: 'Select a package management tool to execute the publish command.',
//     choices: [
//       {
//         title: 'npm',
//         value: 'npm',
//       },
//       {
//         title: 'pnpm',
//         value: 'pnpm'
//       }
//     ]
//   });

//   if (pkgManage === 'npm') {
//   }
//   else if (pkgManage === 'pnpm') {
//     await execa`pnpm publish --tag ${tags[tagIndex]} --ignore-scripts --no-git-checks`;
//   }
// }

// 推送到GitHub
// async function gitPush(targetVersion: string): Promise<void> {
//   step('\nPushing to GitHub...');
//   if (tag) {
//     await run('git', ['push', 'origin', `refs/tags/v${targetVersion}`]);
//   }
//   // 判断是否为首次推送, 如果是则添加-u参数
//   const isFirstPush = await run('git', ['rev-parse', 'origin/main']);
//   if (isFirstPush) {
//     await run('git', ['push', '-u', 'origin', 'main']);
//   }
//   else {
//     await run('git', ['push']);
//   }
// }

export async function bootstrap() {
  const targetVersion = await getTargetVersion();
  const tagIndex = await getTagType();
  const confirmed = await confirmRelease(targetVersion, tagIndex);
  if (!confirmed) {
    process.exit(0);
  }
  await changePackageVersion(targetVersion);
  const build = await confirmBuild();
  if (build) {
    await buildPackage();
  }

  const git = await hasGit();
  console.log(git);
  if (git) {
    const changelog = await confirmChangelog();
    if (changelog) {
      await generateChangelog();
    }

    const commit = await confirmCommit();
    if (commit) {
      if (changelog) {
        await gitAdd(['package.json', 'CHANGELOG.md']);
      }
      else {
        await gitAdd(['package.json']);
      }
      await gitCommit(`chore: release: v${targetVersion}`);
    }

    const tag = await confirmTag(targetVersion);
    if (tag) {
      await gitTag(`v${targetVersion}`);
    }

    const push = await confirmPush();
    if (push) {
      await gitPush(`v${targetVersion}`);
    }
  }

  // 发布包
  // await publishPackage(tagIndex);

  // await gitPush(targetVersion);
}

bootstrap().catch(e => console.log(e));

import process from 'node:process';
import consola from 'consola';
import { tags } from './const/index.js';
import { buildPackage, gitAdd, gitCommit, gitPush, gitTag, hasGit, npmPublish, revertChanges, revertLastCommit } from './utils/exec.js';
import { generateChangelog } from './utils/generate.js';

import { confirmBuild, confirmChangelog, confirmNpmPublish, confirmPush, confirmRelease, getTagType } from './utils/prompts.js';
import { changePackageVersion, getTargetVersion } from './utils/version.js';

export async function bootstrap() {
  // 获取版本
  const targetVersion = await getTargetVersion();
  // 获取发布标签
  const tagIndex = await getTagType();

  // 确认版本
  const confirmed = await confirmRelease(targetVersion, tagIndex);
  if (!confirmed) {
    process.exit(0);
  }

  // 修改版本号
  changePackageVersion(targetVersion);

  // 是否需要执行build命令
  const build = await confirmBuild().catch(async e => {
    await revertChanges(false);
    consola.error(e.message);
    process.exit(0);
  });

  if (build) {
    await buildPackage().catch(async e => {
      await revertChanges(false);
      consola.error(e.message);
      process.exit(0);
    });
  }

  // 判断是否有git仓库
  const git = await hasGit();

  if (git) {
    // 是否需要生成changelog
    const changelog = await confirmChangelog().catch(async e => {
      await revertChanges(false);
      consola.error(e.message);
      process.exit(0);
    });

    if (changelog) {
      await generateChangelog().catch(async e => {
        await revertChanges(changelog);
        consola.error(e.message);
        process.exit(0);
      });
    }

    // 是否需要提交更改
    const push = await confirmPush().catch(async e => {
      await revertChanges(changelog);
      consola.error(e.message);
      process.exit(0);
    });

    if (push) {
      // 暂存变更
      await gitAdd(changelog).catch(async e => {
        await revertChanges(changelog);
        consola.error(e.message);
        process.exit(0);
      });

      // 提交变更
      await gitCommit(`chore: release: v${targetVersion}`).catch(async e => {
        await revertChanges(changelog);
        consola.error(e.message);
        process.exit(0);
      });

      // const tag = await confirmTag(targetVersion).catch(async e => {
      //   consola.error(e.message);
      //   await revertLastCommit();
      //   process.exit(0);
      // });

      // 打标签
      await gitTag(`v${targetVersion}`).catch(async e => {
        await revertLastCommit();
        consola.error(e.message);
        process.exit(0);
      });

      // 推送变更和标签
      await gitPush(`v${targetVersion}`).catch(async e => {
        await revertLastCommit();
        consola.error(e.message);
        process.exit(0);
      });
    }
  }

  // 发布包到npm
  const publish = await confirmNpmPublish();

  if (publish) {
    await npmPublish(tags[tagIndex] || 'latest');
  }
}

bootstrap().catch(e => {
  consola.error(e);
  process.exit(0);
});

import process from 'node:process';
import consola from 'consola';
import { tags } from './const/index.js';
import { buildPackage, gitAdd, gitCommit, gitPush, gitTag, hasGit, npmPublish, revertChanges, revertLastCommit } from './utils/exec.js';
import { generateChangelog } from './utils/generate.js';

import { confirmBuild, confirmChangelog, confirmCommit, confirmNpmPublish, confirmRelease, confirmTag, getTagType } from './utils/prompts.js';
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

  if (!confirmed) {
    process.exit(0);
  }

  // 修改版本号
  changePackageVersion(targetVersion);

  // 是否需要执行build命令
  const build = await confirmBuild().catch(() => {
    revertChanges(false);
  });

  if (build) {
    await buildPackage().catch(() => {
      revertChanges(false);
    });
  }

  // 判断是否有git仓库
  const git = await hasGit();

  if (git) {
    // 是否需要生成changelog
    const changelog = await confirmChangelog().catch(() => {
      revertChanges(false);
      return false;
    });

    if (changelog) {
      await generateChangelog().catch(() => {
        revertChanges(changelog);
      });
    }

    // 是否需要提交更改
    const commit = await confirmCommit().catch(() => {
      revertChanges(changelog);
    });

    if (commit) {
      // 提交并发布
      await gitAdd(changelog).catch(() => revertChanges(changelog));
      await gitCommit(`chore: release: v${targetVersion}`).catch(() => revertChanges(changelog));

      const tag = await confirmTag(targetVersion).catch(() => revertLastCommit());
      if (tag) {
        await gitTag(`v${targetVersion}`).catch(() => revertLastCommit());
      }

      await gitPush(`v${targetVersion}`).catch(() => revertLastCommit());
    }
  }

  // 发布包
  const publish = await confirmNpmPublish();

  if (publish) {
    await npmPublish(tags[tagIndex] || 'latest');
  }
}

bootstrap().catch(e => {
  consola.error(e.message);
  process.exit(0);
});

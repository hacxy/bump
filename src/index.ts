import process from 'node:process';
import consola from 'consola';
import { tags } from './const/index.js';
import { buildPackage, gitAdd, gitCommit, gitPush, gitTag, hasGit, npmPublish } from './utils/exec.js';
import { generateChangelog } from './utils/generate.js';

import { confirmBuild, confirmChangelog, confirmCommit, confirmNpmPublish, confirmPush, confirmRelease, confirmTag, getTagType } from './utils/prompts.js';
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
  const build = await confirmBuild();

  if (build) {
    await buildPackage();
  }

  // 判断是否有git仓库
  const git = await hasGit();

  if (git) {
    // 是否需要生成changelog
    const changelog = await confirmChangelog();
    if (changelog) {
      await generateChangelog();
    }

    // 是否需要提交更改
    const commit = await confirmCommit();
    if (commit) {
      await gitAdd(changelog);
      await gitCommit(`chore: release: v${targetVersion}`);
    }

    if (commit) {
      const tag = await confirmTag(targetVersion);
      if (tag) {
        await gitTag(`v${targetVersion}`);
      }
    }

    const push = await confirmPush();
    if (push) {
      await gitPush(`v${targetVersion}`);
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

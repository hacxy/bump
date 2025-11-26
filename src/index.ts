import process from 'node:process';
import { tags } from './const/index.js';
import { buildPackage, gitAdd, gitCommit, gitPush, gitTag, hasGit, npmPublish } from './utils/exec.js';
import { generateChangelog } from './utils/generate.js';
import { confirmBuild, confirmChangelog, confirmCommit, confirmNpmPublish, confirmPush, confirmRelease, confirmTag, getTagType } from './utils/prompts.js';
import { changePackageVersion, getTargetVersion } from './utils/version.js';

export async function bootstrap() {
  const targetVersion = await getTargetVersion();
  const tagIndex = await getTagType();
  const confirmed = await confirmRelease(targetVersion, tagIndex);
  if (!confirmed) {
    process.exit(0);
  }

  changePackageVersion(targetVersion);

  const build = await confirmBuild();
  if (build) {
    await buildPackage();
  }

  const git = await hasGit();
  if (git) {
    const changelog = await confirmChangelog();
    if (changelog) {
      await generateChangelog();
    }

    const commit = await confirmCommit();
    if (commit) {
      await gitAdd(changelog);
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
  const publish = await confirmNpmPublish();

  if (publish) {
    await npmPublish(tags[tagIndex] || 'latest');
  }
}

bootstrap().catch(e => console.log(e));

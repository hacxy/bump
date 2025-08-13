import { buildPackage, gitAdd, gitCommit, gitPush, gitTag, hasGit } from './utils/exec.js';
import { generateChangelog } from './utils/generate.js';
import { confirmBuild, confirmChangelog, confirmCommit, confirmPush, confirmRelease, confirmTag, getTagType } from './utils/prompts.js';
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
  // await npmPublish(tag);

  // await gitPush(targetVersion);
}

bootstrap().catch(e => console.log(e));

import process from 'node:process';
import { confirm, select } from '@inquirer/prompts';
import consola from 'consola';
import { tags } from '../const/index.js';

// 获取标签类型
export async function getTagType(): Promise<number> {
  const tag = await select({
    message: 'Select tag type',
    choices: tags.map((item, index) => ({ name: item, value: index })),
    theme: {
      keybindings: ['vim']
    }
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return tag;
}

export async function confirmRelease(targetVersion: string, tagIndex: number): Promise<boolean> {
  const tagOk = await confirm({
    message: `Releasing v${targetVersion} on ${tags[tagIndex]}. Confirm?`,
    default: true,
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return tagOk;
}

// 询问用户是否需要构建
export async function confirmBuild(): Promise<boolean> {
  const build = await confirm({
    message: 'Do you need to build the package?',
    default: true
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return build;
}

export async function confirmChangelog(): Promise<boolean> {
  const changelog = await confirm({
    message: 'Do you need to generate changelog? ',
    default: true,
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return changelog;
}

export async function confirmCommit(): Promise<boolean> {
  const commit = await confirm({
    message: 'Do you need to commit the changes to the repository?',
    default: true,
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return commit;
}

export async function confirmTag(targetVersion: string): Promise<boolean> {
  const tag = await confirm({
    message: `Do you need to tag the changes? (tag: v${targetVersion})`,
    default: true,
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return tag;
}

export async function confirmPush(): Promise<boolean> {
  const push = await confirm({
    message: 'Do you need to push the changes to the remote repository?',
    default: true,
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return push;
}

export async function confirmNpmPublish(): Promise<boolean> {
  const npmPublish = await confirm({
    message: 'Do you need to publish the package to npm?',
    default: true,
  }).catch(e => {
    consola.warn(e.message);
    process.exit(0);
  });
  return npmPublish;
}

import prompts from 'prompts';
import { tags } from '../data/index.js';

// 获取标签类型
export async function getTagType(): Promise<number> {
  const { tag } = await prompts({
    type: 'select',
    name: 'tag',
    message: 'Select tag type',
    choices: tags.map((item, index) => ({ title: item, value: index })),
  });
  return tag;
}

export async function confirmRelease(targetVersion: string, tagIndex: number): Promise<boolean> {
  const { yes: tagOk } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing v${targetVersion} on ${tags[tagIndex]}. Confirm?`,
    initial: true,
  });
  return tagOk;
}

// 询问用户是否需要构建
export async function confirmBuild(): Promise<boolean> {
  const { build } = await prompts({
    type: 'confirm',
    name: 'build',
    message: 'Do you need to build the package?',
    initial: true,
  });
  return build;
}

export async function confirmChangelog(): Promise<boolean> {
  const { changelog } = await prompts({
    type: 'confirm',
    name: 'changelog',
    message: 'Do you need to generate changelog? ',
    initial: true,
  });
  return changelog;
}

export async function confirmCommit(): Promise<boolean> {
  const { commit } = await prompts({
    type: 'confirm',
    name: 'commit',
    message: 'Do you need to commit the changes to the repository?',
    initial: true,
  });
  return commit;
}

export async function confirmTag(targetVersion: string): Promise<boolean> {
  const { tag } = await prompts({
    type: 'confirm',
    name: 'tag',
    message: `Do you need to tag the changes? (tag: v${targetVersion})`,
    initial: true,
  });
  return tag;
}

export async function confirmPush(): Promise<boolean> {
  const { push } = await prompts({
    type: 'confirm',
    name: 'push',
    message: 'Do you need to push the changes to the remote repository?',
    initial: true,
  });
  return push;
}

import { consola } from 'consola';
import { execa } from 'execa';
import { pkg } from '../data/index.js';
// 构建包
export async function buildPackage(): Promise<void> {
  // 先判断下有没有build命令
  if (!pkg.scripts?.build) {
    throw new Error('No build command found in package.json');
  }

  consola.start('Building the package...');
  await execa`npm run build`;
  consola.success('Build completed');
}

// 添加文件到git
export async function gitAdd(files: string[]) {
  await execa`git add ${files.join(' ')}`;
}

// 提交更改
export async function gitCommit(message: string) {
  await execa`git commit -m ${message}`;
}

// 打标签
export async function gitTag(tag: string) {
  await execa`git tag ${tag}`;
}

// 将提交和tag推送到远程仓库
export async function gitPush(tag: string) {
  // 判断是否有远程仓库
  const hasRemote = await execa`git remote -v`;
  if (hasRemote.exitCode === 0) {
    await execa`git push origin ${tag}`;
    await execa`git push -u origin main`;
  }
  else {
    consola.error('No remote repository found, please add a remote repository first.');
  }
}

export async function npmPublish(tag: string) {
  await execa`npm publish --tag ${tag} --ignore-scripts`;
}

// 判断用户有没有git, 并且是否为git仓库
export async function hasGit() {
  const isGit = await execa`git --version`;
  if (isGit.exitCode === 0) {
    const isGitRepo = await execa`git status`;
    if (isGitRepo.exitCode === 0 && isGitRepo.stdout.includes('git status')) {
      return true;
    }
  }
  return false;
}

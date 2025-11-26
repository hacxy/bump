import process from 'node:process';
import { ConventionalChangelog, runProgram } from 'conventional-changelog';
import { execa } from 'execa';

// 生成变更日志
export async function generateChangelog() {
  runProgram(new ConventionalChangelog(process.cwd()), { preset: 'angular', infile: 'CHANGELOG.md' });

  // 判断下项目中有没有eslint
  const hasEslint = await execa`npx eslint --version`;
  if (hasEslint.exitCode === 0) {
    await execa`npx eslint CHANGELOG.md --fix --no-ignore`;
  }
}

import process from 'node:process';
import { ConventionalChangelog, runProgram } from 'conventional-changelog';
import { execa } from 'execa';
import ora from 'ora';

// 生成变更日志
export async function generateChangelog() {
  const spinner = ora('Generating changelog...').start();
  runProgram(new ConventionalChangelog(process.cwd()), { preset: 'angular', infile: 'CHANGELOG.md' }).catch(e => {
    spinner.fail(e.message);
    process.exit(0);
  });
  spinner.succeed('Changelog generated');

  // 判断下项目中有没有eslint
  const hasEslint = await execa`npx eslint --version`;
  if (hasEslint.exitCode === 0) {
    const spinner = ora('Fixing changelog...').start();
    await execa`npx eslint CHANGELOG.md --fix --no-ignore`;
    spinner.succeed('Changelog fixed');
  }
}

const commander = require("commander");
const sh = require("shelljs");
const chalk = require("chalk");
const path = require("path");
const fs = require("fs");
const os = require("os");
const rimraf = require("rimraf");

commander
  .command("deploy")
  .description("Deploys this library to your dokku")
  .requiredOption(
    "-g, --giturl <giturl>",
    "The dokku git url (eg: user@host:app)"
  )
  .requiredOption("-d, --dist <directory>", "The static directory")
  .action((options) => {
    const { giturl, dist } = options;
    if (!checkIsGitUrl(giturl)) {
      console.log(chalk.red('--giturl must of the format "user@host:app"'));
      console.log(chalk.red("  example:    dokku@example.com:myapp"));
      return;
    }
    const distFull = path.resolve(dist);
    const tempPrefix = path.join(os.tmpdir(), "dokku-pages-");
    const tempDir = fs.mkdtempSync(tempPrefix);

    console.log("Deploying giturl: " + giturl);
    console.log("Deploying dist: " + distFull);
    console.log("Deploying tempDir: " + tempDir);

    sh.cp("-R", path.join(__dirname, "deploy-src", "*"), tempDir);
    sh.cp("-R", path.join(distFull, "*"), path.join(tempDir, "public"));

    function execTemp(cmd) {
      sh.exec(cmd, { cwd: tempDir });
    }

    const remoteBranch = "dokku";

    execTemp("git init");
    execTemp("git add .");
    execTemp('git commit -am "Deploy"');
    execTemp(`git remote add ${remoteBranch} ${giturl}`);
    execTemp(`git push -f ${remoteBranch} master`);

    rimraf(tempDir, (err) => {
      if (err) {
        console.log(chalk.red(err));
      }
    });
  });

function checkIsGitUrl(giturl) {
  const result = /[\w-\.]*\@[\w-\.]*:[\w-\.]*/.exec(giturl);
  const isGitUrl = !!result && !!result.length;
  return isGitUrl;
}

commander.parse(process.argv);

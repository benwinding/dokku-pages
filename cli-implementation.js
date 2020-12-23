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
  .option(
    "--minimal",
    "Use minimal docker image instead of herokuish buildpack"
  )
  .action((options) => {
    const { giturl, dist, minimal } = options;
    if (!checkIsGitUrl(giturl)) {
      console.log(chalk.red('--giturl must of the format "user@host:app"'));
      console.log(chalk.red("  example:    dokku@example.com:myapp"));
      return;
    }
    const distFull = path.resolve(dist);
    const tempPrefix = path.join(os.tmpdir(), "dokku-pages-");
    const tempDir = fs.mkdtempSync(tempPrefix);
    const [dokkuUserHost, dokkuApp] = giturl.split(":");

    console.log(
      chalk.green(`============================
 Deploying with Dokku Pages
============================`)
    );
    console.log(
      chalk.blue(`
 dokku giturl = ${giturl}
  dokku login = ${dokkuUserHost}
    dokku app = ${dokkuApp}
      app dir = ${distFull}
     temp dir = ${tempDir}
`)
    );

    if (minimal) {
      HandleMinimalDockerImage(dokkuUserHost, dokkuApp, tempDir);
    } else {
      HandleNormalStaticServer(dokkuUserHost, dokkuApp, tempDir);
    }

    CopyDistToTempPublic(distFull, tempDir);

    PushToDokku(giturl, tempDir);

    rimraf(tempDir, (err) => {
      if (err) {
        console.log(chalk.red(err));
      }
    });
  });

function PushToDokku(giturl, tempDir) {
  function execTemp(cmd) {
    sh.exec(cmd, { cwd: tempDir });
  }

  const remoteBranch = "dokku";

  execTemp("git init");
  execTemp("git add .");
  execTemp('git commit -am "Deploy"');
  execTemp(`git remote add ${remoteBranch} ${giturl}`);
  execTemp(`git push -f ${remoteBranch} master`);
}

function HandleNormalStaticServer(dokkuUserHost, dokkuApp, tempDir) {
  // const dokkuCmdSetMinimal = `ssh ${dokkuUserHost} config:set --no-restart ${dokkuApp} DOKKU_PROXY_PORT_MAP="http\\:80\\:5000\\ https\\:443\\:5000"`;
  // sh.exec(dokkuCmdSetMinimal);
  sh.cp("-R", path.join(__dirname, "deploy-src", "*"), tempDir);
}

function HandleMinimalDockerImage(dokkuUserHost, dokkuApp, tempDir) {
  // const dokkuCmdSetMinimal = `ssh ${dokkuUserHost} config:set --no-restart ${dokkuApp} DOKKU_PROXY_PORT_MAP="http\\:80\\:5000\\ https\\:443\\:5000"`;
  // const dokkuCmdSetMinimal = `ssh ${dokkuUserHost} config:unset --no-restart ${dokkuApp} DOKKU_PROXY_PORT_MAP`;
  // sh.exec(dokkuCmdSetMinimal);
  sh.cp("-R", path.join(__dirname, "deploy-minimal", "*"), tempDir);
}

function CopyDistToTempPublic(distFull, tempDir) {
  sh.cp("-R", path.join(distFull, "*"), path.join(tempDir, "public"));
}

function checkIsGitUrl(giturl) {
  const result = /[\w-\.]*\@[\w-\.]*:[\w-\.]*/.exec(giturl);
  const isGitUrl = !!result && !!result.length;
  return isGitUrl;
}

commander.parse(process.argv);

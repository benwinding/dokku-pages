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
    "Use minimal docker image instead of herokuish buildpack (96% smaller!)"
  )
  .option("--dry-run", "Only build the image, won't deploy to dokku")
  .option(
    "--allow-cors <domains>",
    `Allow CORS for a domains 

  CORS Example Arguments:
   '*'                ANY domain
   'a1.com'           a1.com OR www.a2.com
   'a1.com|a2.com'    a1.com OR a2.com
   '.+\\.example.com'  ANY subdomain of example.com
   'localhost:.+'     ANY port on localhost
`
  )
  .action((options) => {
    const { giturl, dist, minimal, allowCors, dryRun } = options;
    if (!checkIsGitUrl(giturl)) {
      console.log(chalk.red('--giturl must of the format "user@host:app"'));
      console.log(chalk.red("  example:    dokku@example.com:myapp"));
      return;
    }
    const distFull = path.resolve(dist);
    const tempPrefix = path.join(os.tmpdir(), "dokku-pages-");
    const tempDir = fs.mkdtempSync(tempPrefix);
    const [dokkuUserHost, dokkuApp] = giturl.split(":");
    const tempDirConfPath = path.join(tempDir, "default.conf");

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
    temp conf = ${tempDirConfPath}
`)
    );

    if (minimal) {
      HandleMinimalDockerImage(tempDir);
      SetCorsToConfig(allowCors, tempDirConfPath);
    } else {
      HandleNormalStaticServer(tempDir);
    }

    CopyDistToTempPublic(distFull, tempDir);

    if (!dryRun) {
      PushToDokku(giturl, tempDir);
    }
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

  execTemp("git init -b master");
  execTemp("git add .");
  execTemp('git commit -am "Deploy"');
  execTemp(`git remote add ${remoteBranch} ${giturl}`);
  execTemp(`git push -f ${remoteBranch} master`);
}

function HandleNormalStaticServer(tempDir) {
  sh.cp("-R", path.join(__dirname, "deploy-src", "*"), tempDir);
}

function HandleMinimalDockerImage(tempDir) {
  sh.cp("-R", path.join(__dirname, "deploy-minimal", "*"), tempDir);
}

function SetCorsToConfig(allowCorsDomain, nginxConfigPath) {
  const hasCors = !!allowCorsDomain;
  let corsConfigText = "";
  if (hasCors) {
    corsConfigText = `
    SetEnvIf Origin "http(s)?://(www\.)?(${allowCorsDomain})$" CORS_ALLOW_ORIGIN=$0
    Header add Access-Control-Allow-Origin %{CORS_ALLOW_ORIGIN}e env=CORS_ALLOW_ORIGIN
    Header add Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header add Access-Control-Allow-Headers "DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range"
    Header add Access-Control-Expose-Headers "Content-Length,Content-Range"
    Header merge Vary Origin`;
  }
  const file = fs.readFileSync(nginxConfigPath).toString();
  const fileNew = file.replace("CORS_CONFIG", corsConfigText);
  console.log(chalk.green(fileNew));
  fs.writeFileSync(nginxConfigPath, fileNew);
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

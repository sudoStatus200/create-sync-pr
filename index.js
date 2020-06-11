const core = require("@actions/core");
const github = require("@actions/github");
const createBranch = require("./create-branch");
//
async function run() {
  try {
    const sourceBranch = core.getInput("SOURCE_BRANCH", { required: true });
    const targetBranches = core.getInput("TARGET_BRANCH", { required: true });
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });

    const targetBranchesArray = targetBranches.split(",");

    for (let branch of targetBranchesArray) {
      console.log(`Making a pull request for ${branch} from ${sourceBranch}.`);
      const {
        payload: { repository },
      } = github.context;

      const octokit = new github.GitHub(githubToken);
      //part of test
      const { data: currentPulls } = await octokit.pulls.list({
        owner: repository.owner.login,
        repo: repository.name,
      });
      //create new branch from master branch and PR between new branch and target branch

      const context = github.context;
      const newBranch = `${branch}-sync-${context.sha.slice(-4)}`;
      await createBranch(octokit, context, newBranch);

      const currentPull = currentPulls.find((pull) => {
        return pull.head.ref === newBranch && pull.base.ref === branch;
      });

      if (!currentPull) {
        const { data: pullRequest } = await octokit.pulls.create({
          owner: repository.owner.login,
          repo: repository.name,
          head: newBranch,
          base: branch,
          title: `sync: ${branch}  with ${newBranch}`,
          body: `sync-branches: syncing branch with ${newBranch}`,
          draft: false,
        });

        console.log(
          `Pull request (${pullRequest.number}) successful! You can view it here: ${pullRequest.url}.`
        );

        core.setOutput("PULL_REQUEST_URL", pullRequest.url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", pullRequest.number.toString());
      } else {
        console.log(
          `There is already a pull request (${currentPull.number}) to ${branch} from ${newBranch}.`,
          `You can view it here: ${currentPull.url}`
        );

        core.setOutput("PULL_REQUEST_URL", currentPull.url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", currentPull.number.toString());
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();

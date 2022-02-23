const core = require("@actions/core");
const github = require("@actions/github");
const createOrUpdateBranch = require("./create-branch");

async function run() {
  try {
    const sourceBranch = core.getInput("SOURCE_BRANCH", { required: true });
    const targetBranches = core.getInput("TARGET_BRANCH", { required: true });
    const githubToken = core.getInput("GITHUB_TOKEN", { required: true });

    const reviewers = core.getInput("REVIEWERS", { required: false });
    const teamReviewers = core.getInput("TEAM_REVIEWERS", { required: false });

    const reviewersArray = teamReviewersArray = [];

    if (reviewers) {
      reviewersArray = reviewers.split(",");
    }

    if (teamReviewers) {
        teamReviewersArray = teamReviewers.split(",");
    }

    const targetBranchesArray = targetBranches.split(",");

    for (let branch of targetBranchesArray) {
      console.log(`Making a pull request for ${branch} from ${sourceBranch}.`);
      const context = github.context;

      const octokit = new github.getOctokit(githubToken);
      //part of test
      const { data: currentPulls } = await octokit.rest.pulls.list({
        ...context.repo,
      });
      //create new branch from source branch and PR between new branch and target branch

      const {
        data: { object: { sha } }
      } = await octokit.rest.git.getRef({
        ref: `heads/${sourceBranch}`,
        ...context.repo,
      });
      console.log(`${sourceBranch} is at ${sha}.`);

      //compare diffs between branches in order to avoid creating empty pull request
      const { data: branchDiff } = await octokit.rest.repos.compareCommitsWithBasehead({
           ...context.repo,
            basehead: `${branch}...${sourceBranch}`,
      });

      if (branchDiff.files.length == 0) {
          console.log(`No need to create new PR, there are no file changes between ${sourceBranch} and ${branch}`)
          continue;
      }

      const newBranch = `promote-to-${branch}`;
      await createOrUpdateBranch(octokit, context.repo, sha, newBranch);
      console.log(`Intermediate branch for PR: ${newBranch}.`);

      const currentPull = currentPulls.find((pull) => {
        return pull.head.ref === newBranch && pull.base.ref === branch;
      });
      console.log(`currentPull: ${currentPull}`);

      core.setOutput("PULL_REQUEST_BRANCH", newBranch);
      if (!currentPull) {
        const { data: pullRequest } = await octokit.rest.pulls.create({
          head: newBranch,
          base: branch,
          title: `sync: ${branch}  with ${newBranch}`,
          body: `sync-branches: syncing branch with ${newBranch}`,
          draft: false,
          ...context.repo,
        });

        console.log(
          `Pull request (${pullRequest.number}) successful! You can view it here: ${pullRequest.html_url}`
        );

        core.setOutput("PULL_REQUEST_URL", pullRequest.url.toString());
        core.setOutput("PULL_REQUEST_NUMBER", pullRequest.number.toString());

        if (reviewers || teamReviewers) {
          await octokit.rest.pulls.requestReviewers({
            pull_number: pullRequest.number,
            reviewers: reviewersArray,
            team_reviewers: teamReviewersArray,
            ...context.repo,
          });

        }
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

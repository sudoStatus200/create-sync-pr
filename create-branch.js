const github = require("@actions/github");

async function createBranch(octokit, context, branch) {
  branch = branch.replace("refs/heads/", "");

  try {
    await octokit.repos.getBranch({
      ...context.repo,
      branch,
    });
  } catch (e) {
    if (error.name === "HttpError" && error.status === 404) {
      await toolkit.git.createRef({
        ref: `refs/heads/${branch}`,
        sha: context.sha,
        ...context.repo,
      });
    } else {
	console.log("Error while creating new branch");
      throw Error(error);
    }
  }
}

module.exports = createBranch;

async function createOrUpdateBranch(octokit, repo, sha, branch) {
  try {
    await octokit.repos.getBranch({
      ...repo,
      branch,
    });
    // If branch already exists, update ref
    await octokit.git.updateRef({
      ref: `heads/${branch}`,
      sha: sha,
      ...repo,
    });
  } catch (error) {
    if (error.name === "HttpError" && error.status === 404) {
      await octokit.git.createRef({
        ref: `refs/heads/${branch}`,
        sha: sha,
        ...repo,
      });
    } else {
      console.log("Error while creating new branch");
      throw Error(error);
    }
  }
}

module.exports = createOrUpdateBranch;

# sync-branches

GitHub Action to sync one branch when another is updated.

## Inputs

### `GITHUB_TOKEN`

**Required** The token to be used for creating the pull request. Can be set to the one given for the workflow or another user.

### `SOURCE_BRANCH`

**Required** The branch you want to make the pull request from.

### `TARGET_BRANCH`

**Required** The branch you want to make the pull request to.

## Outputs

### `PULL_REQUEST_URL`

Set to the URL of either the pull request that was opened by this action or the one that was found to already be open between the two branches.

### `PULL_REQUEST_NUMBER`

Pull request number from generated pull request or the currently open one

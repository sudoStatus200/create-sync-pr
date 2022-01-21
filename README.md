# create-sync-pr

GitHub Action to sync branchs with one source branch. First a new branch is created from source then PR is created between new branch and target branch.
New branch is created so that you can fix conflicts if any cause source branch might be protected in some case.
To work properly delete created branches after merging them.

## Inputs

### `GITHUB_TOKEN`

**Required** The token to be used for creating the pull request. Can be set to the one given for the workflow or another user.

### `SOURCE_BRANCH`

**Required** The branch you want to make the pull request from.

### `TARGET_BRANCH`

**Required** The branches you want to make the pull request to. Multiple branches need to be separated by comma like in example

### `REVIEWERS`

A list of user logins that will be requested to review the Pull Request. Mutiple users need to be separated by comma

### `TEAM_REVIEWERS`
A list of team slugs that will be requested to review the Pull Request. Multiple slugs need to be separated by comma


## Outputs

### `PULL_REQUEST_URL`

Set to the URL of either the pull request that was opened by this action or the one that was found to already be open between the two branches.

### `PULL_REQUEST_NUMBER`

Pull request number from generated pull request or the currently open one

### `PULL_REQUEST_NUMBER`

The intermediate branch name used to create the pull request.

### Example

```yml
name: Sync
on:
  push:
    branches:
      - master

jobs:
  sync-branches:
    runs-on: ubuntu-latest
    name: Syncing branches
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Set up Node
        uses: actions/setup-node@v1
        with:
          node-version: 12
      - name: Create Sync PR
        uses: sudoStatus200/create-sync-pr@0.3.1
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          SOURCE_BRANCH: "master"
          TARGET_BRANCH: "develop,experiment"
```

Modified version of action [Sync branches](https://github.com/TreTuna/sync-branches) with support of multiple target branches and creating new branch for PR

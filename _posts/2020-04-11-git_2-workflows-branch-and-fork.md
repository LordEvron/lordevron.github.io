---
id: 779
title: 'GIT_2 : Workflows: branch and fork'
date: '2020-04-11T19:37:41+01:00'
author: Lord_evron
layout: post
permalink: /2020/04/11/git_2-workflows-branch-and-fork/
categories:
    - Technical
tags:
    - code
    - git
    - technology
---

In the [last article](/2020/04/11/git_1-not-so-basic-concepts/) we discussed some basic git concept. 
Now I want to introduce some Git workflows to be used while developing code in teams, that utilize Pull Requests and code reviewers.
In particular, I want to explain how to keep the master history clean and how to avoid all those ugly merges and unnecessary commits that 
many teams encounter in their master history.

Before we begin, I want to emphasize one point: this discussion focuses on the code workflow within a team. 
I am not considering multiple branches within the main repository, such as "release," "staging," etc., at this time. 
I am solely focusing on the workflow for bringing code "into" the main master branch of the repository.

However, these principles can be easily extended to more complex scenarios with multiple branches.

In Git, there are two basic workflows:

- Using Branches
- Using Forks

Even though these workflows employ different concepts, they generally converge on the following five key steps:

1. Develop the new feature on a new feature branch.
2. Open a Pull Request from that branch to the main repository.
3. Address reviewer comments: Repeat this step as necessary.
4. After the reviewer approve your requests, you can (squash and) merges your request into the master branch. 
5. update your local master branch and delete your feature branch.

These steps are implemented slightly differently depending on whether you are working with branches within the main repository or with forks

## Working with Branches

Working with branches is quite common, especially when all developers are from the same company. Typically, there is a 
master branch that is protected, meaning no one can push code directly to it. Each feature or bug fix is developed in 
its own branch to ensure the stability of the master branch.
When developing a new feature, a developer creates a new branch and starts committing changes to it. 
If multiple developers are working on the same feature, they can use the same branch and push their changes collaboratively.
Once the feature is ready, they open a Pull Request (PR) to merge the changes into the master branch.
Code reviewers then examine the proposed changes, leaving comments or requesting modifications. 
Developers address these comments by updating the code and making additional commits. 
This iterative process continues until all concerns are resolved. Over time, the feature branch accumulates multiple commits, 
often including minor fixes and style changes.
Meanwhile, other updates, such as hotfixes or bug fixes, may be merged into the master branch.
For example, if hotfix/bug1 is merged while the feature branch is still under review, the master branch advances.
The developers working on the feature branch must update their branch accordingly before merging their work into master. 
The goal now is to have only a single commit called "dev:feat1" appended at master Head, without the other branch specific commits. Lets see how to do that.

### Develop the New Feature on a New Feature Branch

Before working on a new feature, create a dedicated branch:
```bash
# Create and switch to a new branch
git checkout -b feature-branch
```
Make changes and commit them:
```
# Stage changes
git add .

# Commit changes
git commit -m "Add new feature"
```
### Open a Pull Request (PR) to the Main Repository

Once your feature is complete, push your branch to the remote repository:

```shell
git push origin feature-branch
```
Then, open a Pull Request to propose merging your changes into master.


### Address Reviewer Comments
Reviewers may suggest changes. Implement them by making additional commits:

```bash
# Edit files and commit updates
git add .
git commit -m "Address reviewer comments"

git push origin feature-branch
```
Repeat until all concerns are addressed. when this step is completed we will end up in a situation like this:

<div style="width: 100%; max-width: 500px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2020/04/image-1.png" 
       alt="hotfix1" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    Hotfix
  </div>
</div>


### Merge the Pull Request into the Master Branch
After approval, we merge the feature branch into master. If needed, squash commits to keep a clean history. 
This merge process is typically handled directly within the GitHub/GitLab/Bitbucket web interface.
These platforms offer options to squash commits (combining them into one) and delete the source branch after merging. 
It's generally recommended to enable both of these features, resulting in a clean, single commit (e.g., `feat:feature1`) and the removal 
of the now-obsolete feature branch.
In case someone else pushed some other hotfix in the master branch like in our example, then we can easily integrate that into the feature branch, 
before we squash merge

```bash
git checkout feature-branch 
git pull origin master  # this will merge the remote master into your local feature-branch
git push origin feature-branch # you can push to your remote branch and will get appended to the Pull request,
```

### Update Your Local Master Branch and Delete the Feature Branch
```bash
git checkout master
git pull origin master
git branch -d feature-branch
git push origin --delete feature-branch # if you have not already deleted on merge
```
If you have done all correct, your master branch history will look like this: 

<div style="width: 100%; max-width: 500px; margin: 2rem auto; padding: 0 10px; box-sizing: border-box;">
  <img src="{{ site.baseurl }}/assets/images/2020/04/image-4.png" 
       alt="cleanhistory" 
       style="width: 100%; height: auto; display: block;">
  <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
    clean master history
  </div>
</div>

## Working with Forks

When working in an open-source project or collaborating with external contributors, developers often do not have direct access to the main repository. 
Instead, they use a fork-based workflow. A fork is a personal copy of the repository where the developer can freely make changes before proposing 
them to the original project.  working with Forks is basically the same except that you will have your own local copy of the repo ,
the online forked (origin) and the original repo (upstream). The workflow is this:

- You create a branch `dev/feat1` and start to develop the feature. Once done, you push the code to your origin.
- Open a PR from the `origin/dev/feat1` to `upstream/master`
- Address the reviewer comments.
- Rebase your commit onto of upstream master. In order to do this you can for example from your local master you do `git pull upstream master`
- now you can `git checkout dev/feat1` and rebase to master `git rebase master`.
- push –foce-with-lease the new commit to `origin/dev/feat1`
- once those are merged into `upstream/master` you can sync your repo with:
```bash 
git checkout master
git pull upstream master #(this will pull the dev/feat1 commit into your local master)
git push # (update the origin/master with the dev/feat1 commits)
# Delete feature branches
git branch -d feature-branch
git push origin --delete feature-branch
```


## Which workflow is better?

Typically, code development within the same team follows a branch-based workflow, while cross-team collaboration or projects 
that tend to diverge significantly use a fork-based workflow.
However, forks provide stronger isolation, which can be beneficial especially if the team is not highly proficient with Git. 
In such cases, a fork-based approach can also be used for intra-team development.
Each developer can create branches and push changes freely to their own fork, while the upstream repository remains clean and branch free.
That said, forks can become cumbersome when multiple developers work on the same feature. In such scenarios, teams may either maintain a 
shared branch on the upstream repository or manage multiple remotes for instance, by pulling code directly from a colleague’s remote repository.

Ultimately, as long as you understand these concepts, the choice of workflow within your team won’t make a significant difference.

## Final Remarks 

At this point, I just want to highlight a few important takeaways. Several powerful Git commands have been mentioned, so keep these key points in mind:

- PROTECT YOUR MASTER: No, this is not a Jedi motto! It simply means you should prevent the history of your `origin/master` branch from being rewritten. This can be enforced as a repository setting in Git.
- Git rebase modifies history: Only use it on branches that you are certain no one else is actively working on.
- When using force, ALWAYS use `--force-with-lease`: (And no, this is not a Star Wars reference either!) Never blindly use `git push --force`, as this can overwrite changes and increase the risk of conflicts or even workplace violence.
- `git rebase -i` can do much more: It allows you to modify commit messages, squash commits, and reorder changes. But remember, it still rewrites history, so use it carefully.

Well there would be much more to talk about, but I think we can stop here for now. I hope these two articles have been useful.

Happy quarantined Easter!

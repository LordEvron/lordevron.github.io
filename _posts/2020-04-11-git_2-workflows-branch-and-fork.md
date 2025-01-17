---
id: 779
title: 'GIT_2 : Workflows: branch and fork'
date: '2020-04-11T19:37:41+01:00'
author: Lord_evron
layout: post
guid: 'http://localhost:8080/?p=779'
permalink: /2020/04/11/git_2-workflows-branch-and-fork/
yasr_schema_additional_fields:
    - 'a:22:{s:18:"yasr_product_brand";s:0:"";s:16:"yasr_product_sku";s:0:"";s:37:"yasr_product_global_identifier_select";s:5:"gtin8";s:36:"yasr_product_global_identifier_value";s:0:"";s:18:"yasr_product_price";s:0:"";s:27:"yasr_product_price_currency";s:0:"";s:30:"yasr_product_price_valid_until";s:0:"";s:31:"yasr_product_price_availability";s:12:"Discontinued";s:22:"yasr_product_price_url";s:0:"";s:26:"yasr_localbusiness_address";s:0:"";s:29:"yasr_localbusiness_pricerange";s:0:"";s:28:"yasr_localbusiness_telephone";s:0:"";s:20:"yasr_recipe_cooktime";s:0:"";s:23:"yasr_recipe_description";s:0:"";s:20:"yasr_recipe_keywords";s:0:"";s:21:"yasr_recipe_nutrition";s:0:"";s:20:"yasr_recipe_preptime";s:0:"";s:26:"yasr_recipe_recipecategory";s:0:"";s:25:"yasr_recipe_recipecuisine";s:0:"";s:28:"yasr_recipe_recipeingredient";s:0:"";s:30:"yasr_recipe_recipeinstructions";s:0:"";s:17:"yasr_recipe_video";s:0:"";}'
categories:
    - Technical
tags:
    - code
    - git
---

In the [last article](http://localhost:8080/2020/04/11/git_1-not-so-basic-concepts/) we discussed some basic git concept. Now I want to introduce some GIT workflows to be used while developing code in teams, that uses Pull Requests and code reviewers. In particular I want to explain how to keep the master history clean and how to avoid all those ugly merges and unnecessary commits that a lot of teams have in their master history.

So. Before to start i want to pinpoint one thing: I am focusing on the code workflow between team. I am not considering here multiples branches in the main repo such as release, staging etc. I am just focusing on the workflow to bringing code “in” the main master branch repo. However you can easily extend it to your specific use case.   
So in GIT there are two basic workflows :  
1\. Using Branches  
2\. Using Forks.  
  
Even if they use very different concept, they both boils down to the same five steps:

1. Develop the new feature on a new feature branch
2. Open a PR from that branch to the main repo
3. Fix the reviewers comments: repeat if necessary
4. Fix the commit to look nice.
5. After the reviewer merges your requests, update your master branch, and delete your feature branch.

Those steps are done in a slightly different way if you are working with branches or with forks.

## Working with Branches

Working with branches is quite common if all the developers are from the same company. Basically there is a “master” branch that is protected (meaning that no-one can push code directly to it) and each feature and or bug is developed in its own branch. So when developing a new feature, a developer needs to create a new branch and then start to push commit to it. If multiple developers are working on the same features, they can use the same branch and all of them push to it. When the feature is ready they can open a Pull request asking those changes to be merged within to the master. The code reviewers review the code and maybe makes some comments. The developers can address those comments for example changing some part of the code and making more commit. The process can go on for a while. Once all the code comments are addressed, that branch may have multiple commits, mostly of them addressing small fixes, and style changes. Also, for making things more interesting, lets suppose that in the meantime, hotfix/bug1 has also been merged into the master repo. For example at current stage the diagram may looks like this:

<div class="wp-block-image"><figure class="aligncenter size-large">![](http://localhost:8080/wp-content/uploads/2020/04/image-1.png)</figure></div>If the reviewer at this stage it just approve and merge in the code, then a merge commit will appear. Indeed, as you can see, the dev/feat1 is “attached” on 67ce4, while master is on “ca23a”. The only way for git to “fuse” those two branches together is with adding a merge commit. The resulting master history is very polluted. In particular it will look like this:

<div class="wp-block-image"><figure class="aligncenter size-large">![](http://localhost:8080/wp-content/uploads/2020/04/image-2.png)</figure></div>This is not what we want for two reason. There is a confusing merge commit, and there are 4 useless commit that are not interesting. So in order to avoid that there are two things that must be done :

1. Avoiding the merge commit can be done by rebasing dev/feat1 on top of master. Indeed if we attach dev/feat1 on ca23a commit instead of 67ce4, then git can just “append” all the commit to master without making any merge! This process is called rebase, and thus we move the complete dev/feat1 branch on the last commit of master.
2. In order to remove the useless commit, we need to squash all those green commit into one single commit.

for rebasing the code, is enough to checkout the dev/feat1 branch and typing :

<div class="wp-block-syntaxhighlighter-code ">```

git rebase master
```

</div>This will move the block on top of last master commit. Just a couple of notes. If the hotfix/bug1 commit has touched any of the file that you also touched in the dev/feature1, then you need to handle the conflict. Also, you do not necessary need to rebase on top of master, but you can rebase any branch to any other branch or specific commit. After that we need to squash all the commit into 1. for doing so we checkout the dev/feat1 branch and type:

<div class="wp-block-syntaxhighlighter-code ">```

git rebase -i HEAD~4
```

</div>This is called interactive rebasing and we can do a lot of magics from here. HEAD~4 means that we want to modify the last 4 commits, You can set a different number if you want. The first thing that will open will be a page in your default editor (usually VIM or Nano). Now do not get scared because is actually quite easy. So you will be presented with all the 4 commit (latest in the bottom), with pick as default value. Just change this value to squash (or s) like in the following picture. This will tell git to squash the last three commit into the first one.

<div class="wp-block-image"><figure class="aligncenter size-large">![](http://localhost:8080/wp-content/uploads/2020/04/image-3.png)</figure></div>once that you save and close this, a new page will appear, where you can set the new commit message. Just delete all the other comment except the first one. you can even modify it if you like. Let’s call it something meaningful such as “implemented feature1 and relative apis”. Once you save and close also that second page, the rebase is done. Your local repo now looks like this:

<div class="wp-block-image"><figure class="aligncenter size-large">![](http://localhost:8080/wp-content/uploads/2020/04/image-4.png)</figure></div>As you can see the green branch is now completely different from the one you started with. Is appended to ca23a and has a single commit with a new hash. When you try to push this branch to the remote, git will complain and refuse to push because the history of that branch has changed. We can tell git to force push, in order to rewrite also the history for the online version of that branch. However, if in the mean time someone else has appended a new commit to the dev/feat1 branch, and you push force your version, his commit will be lost. Luckily git comes with a safe push called with lease. In this case the push only succeed if noone has appended new commits to the dev/feat1 branch. So basically now is enough for us to do:

<div class="wp-block-syntaxhighlighter-code ">```

git push --force-with-lease
```

</div>to have the new branch history pushed to the remote. Once the reviewer will merge the code and delete the branch, it will look like this on master:

<div class="wp-block-image"><figure class="aligncenter size-large">![](http://localhost:8080/wp-content/uploads/2020/04/image-5.png)</figure></div>Which looks much cleaner and tidy.

## Working with Forks

working with Forks is basically the same except that you will have your own local copy of the repo , the online forked (origin) and the original repo (upstream). The workflow is this:

- You create a branch ***dev/feat1*** and start to develop the feature. Once done, you push the code to your origin.
- Open a PR from the origin/dev/feat1 to upstream/master
- Address the reviewer comments.
- Rebase your commit onto of upstream master. In order to do this you can for example from your local master you do “**git pull upstream master”**
- now you ca**n checkout dev/feat1** and rebase to master.
- squash all commit into 1
- push –foce-with-lease the new commit to origin/dev/feat1
- once those are merged into upstream/master you can sync your repo with:
- git checkout master
- git pull upstream master (this will pull the dev/feat1 commit into your local master)
- git push (update the origin/master with the dev/feat1 commits)

## Which workflow is better?

Usually developing code within the same team is done with branches workflow, while cross team works and works that tend to diverge is done with fork workflow. However forks gives a better isolation especially if the team is not good with git and can be preferred also with code development within the same team. In that case, everyone can create any branch, push whatever shit they want on their fork, but the upstream fork can be enforced to be very clean and branch free (and I like that.). However forks can be really pain if multiple people are working with the same feature, so in that case you can ending up having a common branch on upstream or having to handle multiple remotes, for example pulling code from your colleague remote repo. As far as you understand the these concepts it will not really matter what workflow you will use within your team…

## Final Remarks 

Arrived here I just want to point out a couple of things: there are a couple of powerful git commands presented here so keep few things in mind.

- PROTECT YOUR MASTER: no, is not a Jedi motto, but it simply means to do not allow to rewrite history of your origin master branch. This is a setting that can be turned on on all the git repo.
- Git rebase changes the history. do it only on branches that you are sure no-one else is actively working on.
- When using force, ALWAYS use it with-lease (again, it is not a start wars thing). DO not just force push branches, otherwise you will increase the risk of murder between colleagues.
- **Git rebase -i** can be used to do a lot of more stuffs, such as changing commit messages. But keep in mind that you do rewrite history.

Well there would be much more to talk about but I think we can stop here for now. I hope these two articles have been useful.

Happy quarantined Easter!
---
title: Git
intro: Everyday Git version-control shortcuts and workflow.
tags: [vcs, github, linux]
categories: [Keyboard Shortcuts]
---

# Git

## Local Commands

| Command                   | Purpose                       |
| ------------------------- | ----------------------------- |
| `git init`                | Start a new repository        |
| `git add .`               | Stage all changes             |
| `git commit -m "msg"`     | Commit staged changes         |
| `git status`              | Show working tree status      |
| `git log --oneline`       | Compact commit history        |
| `git diff`                | Show unstaged changes         |
| `git checkout -b feat`    | Create and switch to a branch |
| `git branch`              | List branches                 |
| `git merge feat`          | Merge a branch into current   |
| `git reset --hard HEAD~1` | Undo the last commit          |

## Remotes

| Command                       | Purpose                     |
| ----------------------------- | --------------------------- |
| `git remote add origin <url>` | Add a remote                |
| `git push -u origin main`     | Push and track upstream     |
| `git pull --rebase`           | Pull and rebase onto remote |
| `git fetch`                   | Fetch without merging       |
| `git clone <url>`             | Clone a repository          |

## Troubleshooting

```bash
# Recover a staged file
git restore --staged file.txt

# Discard local changes
git checkout -- file.txt

# Amend the last commit message
git commit --amend -m "new message"
```

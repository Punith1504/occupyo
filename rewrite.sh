#!/bin/bash
export FILTER_BRANCH_SQUELCH_WARNING=1
git filter-branch -f --env-filter '
if [ "$GIT_AUTHOR_EMAIL" = "andluru.tech@gmail.com" ]; then
    export GIT_AUTHOR_NAME="Andluru Sai Punith Reddy"
    export GIT_AUTHOR_EMAIL="punithreddyforstudy@gmail.com"
    export GIT_COMMITTER_NAME="Andluru Sai Punith Reddy"
    export GIT_COMMITTER_EMAIL="punithreddyforstudy@gmail.com"
fi
' HEAD
git push origin main --force
git stash pop

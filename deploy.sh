#!/bin/sh

deploy_folder=/app/deploy/like_wechat

if [ ! -d $deploy_folder ]
then
    echo "Directory $DEPLOY_FOLDER not exist."
    exit 1
else
    cd $deploy_folder
    echo "svn update"
    svn update
fi

npm install

m=`ps aux | grep "like_wechat.js" |grep -v grep| grep -v tail | awk '{print $2}'`

if [ -z "$m" ]
then
    echo "start ......."
    forever start -l $deploy_folder/logs/forever.log -a like_wechat.js  --NODE_ENV=prd
else
    echo "restart ......."
    forever restart -l $deploy_folder/logs/forever.log -a like_wechat.js  --NODE_ENV=prd
fi

echo "start success"

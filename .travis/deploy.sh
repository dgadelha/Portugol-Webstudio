#!/bin/bash
remote_path=/home/dgadelha/Portugol-Webstudio
echo "Preparando para fazer deploy em $remote_path..."
ssh ${STUDIOHOST}
cd $remote_path
git pull
pm2 restart 0
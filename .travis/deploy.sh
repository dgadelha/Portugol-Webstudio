#!/bin/bash
ssh ${STUDIOHOST} "cd /home/dgadelha/Portugol-Webstudio; git pull; yarn install; pm2 restart 0"

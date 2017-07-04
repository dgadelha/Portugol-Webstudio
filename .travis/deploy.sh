#!/bin/bash
ssh ${STUDIOHOST} "cd /home/dgadelha/Portugol-Webstudio; git pull; pm2 restart 0"

#!/bin/bash
DATE=`date +"%Y/%m/%d %T"`
PSSTATUS=`ps -ef | grep Make_ | grep -v grep | wc -l`
if [ $PSSTATUS -ge 1 ]; then
  echo "$DATE run_make_track.sh is already running. Script is stopped."
else
  echo "$DATE run_make_track.sh is started."
  ./Make_TRACK_image.sh

  DATE=`date +"%Y/%m/%d %T"`
  echo "$DATE run_make_track.sh is finished."
fi


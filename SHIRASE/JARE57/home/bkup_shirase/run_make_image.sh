#!/bin/bash
DATE=`date +"%Y/%m/%d %T"`
PSSTATUS=`ps -ef | grep Make_ | grep -v grep | wc -l`
if [ $PSSTATUS -ge 1 ]; then
  echo "$DATE run_make_image.sh is already running. Script is stopped."
else
  echo "$DATE run_make_image.sh is started."
  ./Make_IC0_image.sh
  ./Make_SST_image.sh
  ./Make_PRMSL_image.sh
  ./Make_WIND_image.sh
  ./Make_HTSGW_image.sh
  ./Make_WAVE_image.sh
  ./Make_TMP_image.sh
  ./Make_TRACK_image.sh
  DATE=`date +"%Y/%m/%d %T"`
  echo "$DATE run_make_image.sh is finished."
fi

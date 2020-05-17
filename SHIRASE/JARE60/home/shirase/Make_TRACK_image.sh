#!/bin/bash
now=`date`
echo $now "Maiking TRACKING image from GPS data"
idir1="/home/shirase/Data/"
odir="/var/www/shirase/data/track"
shotALL="Long Middle Close"
gmtscript="${idir1}/gmt4_make_track.sh"
cd ${gmtscript%/*}
script="./${gmtscript
for shot in $shotALL; do
  ${script} $shot
  mv $shot.png $odir/$shot.png
done

#!/bin/bash
now=`date`
currentdir=`pwd`
idir1="$currentdir/Data/"

odir="$currentdir/Data/WEB/data/track"

shotALL="Long Close"
gmtscript="${idir1}/gmt4_make_track.sh"

cd ${gmtscript%/*}
script="./${gmtscript##*/}"

for shot in $shotALL; do
  ${script} $shot
  mv $shot.png $odir/$shot.png
done


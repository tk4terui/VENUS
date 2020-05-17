#!/bin/bash
MAILDIR=$HOME/Maildir
ARCHDIR=arch
WORKDIR=$HOME/Data/GPV
DATE=`date +"%Y/%m/%d %T"`
for VARS in  PRMSL UGRD VGRD TMP HTSGW DIRPW PERPW; do 
  if ls $MAILDIR/$VARS/* > /dev/null 2>&1; then
    echo "$DATE Found the latest mail with $VARS nc file"
    for fMAIL in  `find $MAILDIR/$VARS -type f`; do
      uudeview -i -v $fMAIL
      bunzip2 -f *$VARS*.bz2
      rm $fMAIL
    done
    for fdat in  `ls *$VARS*.nc`; do
      yymm=${fdat:3:6}      
      echo "$yymm"
      if [ ! -e $WORKDIR/$VARS/$yymm ]; then
        mkdir $WORKDIR/$VARS/$yymm
      fi
      mv -f $fdat $WORKDIR/$VARS/$yymm
    done
  else
    echo "$DATE There are no $VARS mails"
  fi
done

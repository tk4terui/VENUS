#!/bin/bash
MAILDIR=$HOME/Maildir
ARCHDIR=arch
WORKDIR=$HOME/VENUS
DATE=`date +"%Y/%m/%d %T"`
for VARS in IC0 SST 89GH 89GV GPM; do 
  if ls $MAILDIR/$VARS/* > /dev/null 2>&1; then
    echo "$DATE Found the latest mail with $VARS dat file"
    for fMAIL in  `find $MAILDIR/$VARS -type f`; do
      uudeview -i -v $fMAIL
      bunzip2 -f *$VARS*.bz2
      rm $fMAIL
    done
    for fdat in  `ls *$VARS*.dat`; do
      yymm=${fdat:6:6}      
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

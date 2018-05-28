#!/bin/bash
# set MailDir
SHAREDIR=Attachedfile
WORKDIR=Data/AMSR2
DATE=`date +"%Y/%m/%d %T"`

# confirm if there are appropriate files in $MAILDIR/$VARNAME
for VARS in IC0 SST SIT; do 
  if ls $SHAREDIR/*$VARS* > /dev/null 2>&1; then
    echo "$DATE Found the latest mail with $VARS dat file"
    for fMAIL in  `find $SHAREDIR/ -type f -name "*$VARS*"`; do
# move found files
      mv $fMAIL .
# extend an attached file
      bunzip2 -f *$VARS*.bz2
    done
# move $VARS dat files to $WORKDIR/$VARS/$yymm
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
#echo "Finish Extend_AMSR2_in_Maildir.sh"

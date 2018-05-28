#!/bin/bash
# set MailDir
SHAREDIR=Attachedfile
ARCHDIR=arch
WORKDIR=Data/GPV
DATE=`date +"%Y/%m/%d %T"`

# confirm if there are appropriate files in $MAILDIR/$VARNAME
for VARS in  PRMSL UGRD VGRD TMP HTSGW DIRPW PERPW; do 
  if ls $SHAREDIR/*$VARS* > /dev/null 2>&1; then
    echo "$DATE Found the latest mail with $VARS nc file"
    for fMAIL in  `find $SHAREDIR/ -type f -name "*$VARS*"`; do
# move file
      mv $fMAIL .
# extend an attached file
      bunzip2 -f *$VARS*.bz2
    done
# move $VARS nc files to $WORKDIR/$VARS/$yymm
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
#echo "Finish Extend_GPV_in_Maildir.sh"

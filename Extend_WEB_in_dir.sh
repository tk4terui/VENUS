#!/bin/bash
# set MailDir
SHAREDIR=Attachedfile
ARCHDIR=Arch
WORKDIR=Data/WEB
DATE=`date +"%Y/%m/%d %T"`
YYMMDD=`date +"%Y%m%d"`

# confirm if there are appropriate files in $MAILDIR/$VARNAME
for VARS in WEB; do 
  if ls $SHAREDIR/*$VARS*.tar.bz2 > /dev/null 2>&1; then
    echo "$DATE Found the latest mail with $VARS file"
# archive target dir before update
    pushd $WORKDIR
      tar -cjf $VARS$YYMMDD.tar.bz2 *
      mv $VARS$YYMMDD.tar.bz2 $ARCHDIR/
    popd
    for fMAIL in  `find $SHREDIR -type f -name "*$VARS*.tar.bz2"`; do
# extend an attached file
      tar -xjf $fMAIL -C $WORKDIR
# remove mail to $ARCHDIR
      rm $fMAIL
    done
  else
    echo "$DATE There are no $VARS mails"
  fi
done
#echo "Finish Extend_GPV_in_Maildir.sh"

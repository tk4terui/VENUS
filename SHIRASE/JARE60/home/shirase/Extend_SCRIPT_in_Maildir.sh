#!/bin/bash
MAILDIR=$HOME/Maildir
ARCHDIR=/home/Arch
WORKDIR=/home/bkup_shirase
DATE=`date +"%Y/%m/%d %T"`
YYMMDD=`date +"%Y%m%d"`
for VARS in SCRIPT; do 
  if ls $MAILDIR/$VARS/* > /dev/null 2>&1; then
    echo "$DATE Found the latest mail with $VARS file"
    pushd $WORKDIR
      tar -cjf $VARS$YYMMDD.tar.bz2 * -X exlist_bkup.txt
      mv $VARS$YYMMDD.tar.bz2 $ARCHDIR/
    popd
    for fMAIL in  `find $MAILDIR/$VARS -type f`; do
      uudeview -i -v $fMAIL
      tar -xjf $VARS.tar.bz2 -C $WORKDIR 
      rm $fMAIL
      rm $VARS.tar.bz2
    done
  else
    echo "$DATE There are no $VARS mails"
  fi
done

#!/bin/bash
to_address="Mail_Address"
from_address="Mail_Address"
bcc_address="Mail_Address"
WorkDirPath="DirPath"
vars=("DRLON" "DRLAT")
days=("2")
pushd $WorkDirPath
date="date"
today=`$date +"%Y/%m/%d"`
for var  in ${vars[@]}; do
for nday  in ${days[@]}; do
  day=`$date -d"${nday}days ago" +"%Y%m%d"`
  echo $pastday
  filename=GW1AM2${day}_000${var}SP.dat
  filebzip=${filename}.bz2
  echo $var $day
  echo $filebzip
  cp ./AMSR2SID/${var}/${day:0:6}/$filename .
  bzip2 --best $filename
  title="ADS-AMSR2-$var shirase ${day}$orbit"
  body=""
  opts="-a $filebzip -r ${from_address}"
  if [ -n "$bcc_address" ]; then
    opts=$opts" -b ${bcc_address}"
  fi
  echo "$body" | mail -s "$title" $opts ${to_address}
  echo $title
  rm -fr $filebzip
done
done
popd

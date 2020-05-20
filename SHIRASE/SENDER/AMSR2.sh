#!/bin/bash
to_address="Mail_Address"
from_address="Mail_Address"
bcc_address="Mail_Address"
WorkDirPath="DirPath"
vars=("IC0")
days=("1days ago")
orbits=("A")
pushd $WorkDirPath
date="date"
today=`$date +"%Y/%m/%d"`
for nv  in `seq 0 $((${
for orbit  in ${orbits[@]}; do
  var=${vars[$nv]}
  day=`$date -d"$today ${days[$nv]}" +"%Y%m%d"`
  filename=GW1AM2${day}${orbit}_${var}SP.dat
  filebzip=${filename}.bz2
  echo $var $day $orbit
  echo $filebzip
  ./undef_clean $day$orbit SP $var
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

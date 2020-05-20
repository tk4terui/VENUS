#!/bin/bash
export LANG=C
to_address="Mail_Address"
from_address="Mail_Address"
bcc_address="Mail_Address"
WorkDirPath="DirPath"
vars=("PRMSL" "UGRD" "VGRD" "HTSGW" "DIRPW" "PERPW")
day=("0days")
fdays=("01" "02")
pushd $WorkDirPath
date="date"
yesterday=`$date -d"1days ago" +"%Y/%m/%d"`
AMPM=`$date +"%p"`
  orbit=00
for var  in ${vars[@]}; do
for fday  in ${fdays[@]}; do
  yymmdd=`$date -d"$yesterday + $day" +"%Y%m%d"`
  filename=GPV${yymmdd}${orbit}0000FD${fday}00_${var}.nc
  filebzip=${filename}.bz2
  echo $var $day $orbit
  echo $filebzip
  case $var in
    PRMSL)
      region=0/360/-90/-40
      ncid=PRMSL_meansealevel
      echo "set $region and $ncid for $var" ;;
    UGRD)
      region=0/360/-90/-40
      ncid=UGRD_10maboveground
      echo "set $region and $ncid for $var" ;;
    VGRD)
      region=0/360/-90/-40
      ncid=VGRD_10maboveground
      echo "set $region and $ncid for $var" ;;
    TMP)
      region=0/360/-90/-40
      ncid=TMP_2maboveground
      echo "set $region and $ncid for $var" ;;
    HTSGW)
      region=0/360/-75/-40
      ncid=HTSGW_surface
      echo "set $region and $ncid for $var" ;;
    DIRPW)
      region=0/360/-75/-40
      ncid=DIRPW_surface
      echo "set $region and $ncid for $var" ;;
    PERPW)
      region=0/360/-75/-40
      ncid=PERPW_surface
      echo "set $region and $ncid for $var" ;;
  esac
  GMT grdreformat -R$region "./GPV/${var}/${yymmdd:0:6}/$filename?$ncid" ./$filename
  echo "resized $var"
  bzip2 --best $filename
  title="ADS-GPV-$var shirase ${yymmdd}$orbit"
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

#!/bin/bash
now=`date`
currentdir=`pwd`
echo $now "Maiking PRMSL images from GPV data"

idir0="$currentdir/Data/GPV"
idir1="$currentdir/Data/"
ifile="${idir0}/%V/%Y%m/GPV%Y%m%d%R0000FD%F00_%V.nc"

vars=("PRMSL")
ofile="$currentdir/Data/WEB/data/%Y%m/GPV%Y%m%d%RFD%F00_%V%S_%P.png"

yymmdds=20160701
yymmdde=100000000
poleALL="NP"
adALL="00 12"
shotALL="L C"
forecasts="00 01 02 03"
gmtscript="${idir1}/gmt4_make_gpv.sh"

cd ${gmtscript%/*}
script="./${gmtscript##*/}"

i=0
while [ $i -lt ${#vars[@]} ]; do
  var=${vars[$i]}

  yymms=`ls ${idir0}/${var}/ | head -1`
  files=`ls ${idir0}/${var}/${yymms} | head -1`
  tmps=`echo $files | sed -e "s/.*GPV//"`
  tmps=${tmps:0:8}
  if [ ${tmps} -gt ${yymmdds} ]; then yymmdds=$tmps; fi

  yymme=`ls ${idir0}/${var}/ | tail -1`
  filee=`ls ${idir0}/${var}/${yymme} | tail -1`
  tmpe=`echo $filee | sed -e "s/.*GPV//"`
  tmpe=${tmpe:0:8}
  if [ ${tmpe} -lt ${yymmdde} ]; then yymmdde=$tmpe; fi

  i=`expr $i + 1`
done

for var in ${vars[@]}; do
for pole in $poleALL; do
  yymmdd=$yymmdds
  while [ $yymmdd -le $yymmdde ]; do
    yy=${yymmdd:0:4}
    mm=${yymmdd:4:2}
    dd=${yymmdd:6:2}
    for ad in $adALL; do
    for fore in $forecasts; do
      flg0=1
      flg1=0
      
      file0=`echo $ifile | sed -e "s/%Y/$yy/g" \
                               -e "s/%m/$mm/g" \
                               -e "s/%d/$dd/g" \
                               -e "s/%R/$ad/g" \
                               -e "s/%F/$fore/g" \
                               -e "s/%V/$var/g" \
                               -e "s/%P/$pole/g"`
      if [ ! -e $file0 ]; then
        flg0=0
      fi
      for shot in $shotALL; do
        if [ $flg0 -eq 1 ]; then
          file1=`echo $ofile | sed -e "s/%Y/$yy/g" \
                                   -e "s/%m/$mm/g" \
                                   -e "s/%d/$dd/g" \
                                   -e "s/%R/$ad/g" \
                                   -e "s/%F/$fore/g" \
                                   -e "s/%V/$var/g" \
                                   -e "s/%S/$shot/g" \
                                   -e "s/%P/$pole/g"`
          if [ ! -e $file1 ]; then
            flg1=1
          else
            if [ $file1 -ot $file0 ]; then
              flg1=1
            fi
          fi
        fi

        flg=$(( $flg0 * $flg1 ))

        if [ $flg -eq 1 ]; then
#        echo $yymmdd$pole $file1 ${file1##*/}
          ${script} $yymmdd$ad $pole $var $shot $fore
          mv -f ${file1##*/} ${file1}
        fi
      done
    done
    done
    yymmdd=`date -d"${yy}/${mm}/${dd} 1days" +%Y%m%d`
  done
done
done

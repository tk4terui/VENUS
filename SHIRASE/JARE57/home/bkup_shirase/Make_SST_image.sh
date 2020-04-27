#!/bin/bash
now=`date`
echo $now "Maiking SST images from AMSR2 data"
idir0="/home/shirase/Data/AMSR2"
idir1="/home/shirase/Data/"
ifile="${idir0}/%V/%Y%m/GW1AM2%Y%m%d%R_%V%P.dat"
vars=("SST")
ofile="/var/www/shirase/data/%Y%m/AM2SI%Y%m%d%R_SST%S_%P.png"
yymmdds=20151101
yymmdde=100000000
poleALL="SP"
adALL="A"
shotALL="L M C"
gmtscript="${idir1}/gmt4_make_amsr2.sh"
cd ${gmtscript%/*}
script="./${gmtscript
i=0
while [ $i -lt ${
  var=${vars[$i]}
  yymms=`ls ${idir0}/${var}/ | head -1`
  files=`ls ${idir0}/${var}/${yymms} | head -1`
  tmps=`echo $files | sed -e "s/.*GW1AM2//"`
  tmps=${tmps:0:8}
  if [ ${tmps} -gt ${yymmdds} ]; then yymmdds=$tmps; fi
  yymme=`ls ${idir0}/${var}/ | tail -1`
  filee=`ls ${idir0}/${var}/${yymme} | tail -1`
  tmpe=`echo $filee | sed -e "s/.*GW1AM2//"`
  tmpe=${tmpe:0:8}
  if [ ${tmpe} -lt ${yymmdde} ]; then yymmdde=$tmpe; fi
  i=`expr $i + 1`
done
for pole in $poleALL; do
  yymmdd=$yymmdds
  while [ $yymmdd -le $yymmdde ]; do
    yy=${yymmdd:0:4}
    mm=${yymmdd:4:2}
    dd=${yymmdd:6:2}
    for ad in $adALL; do
      flg0=1
      flg1=0
      for var in ${vars[@]}; do
        file0=`echo $ifile | sed -e "s/%Y/$yy/g" \
                                 -e "s/%m/$mm/g" \
                                 -e "s/%d/$dd/g" \
                                 -e "s/%R/$ad/g" \
                                 -e "s/%V/$var/g" \
                                 -e "s/%P/$pole/g"`
        if [ ! -e $file0 ]; then
          flg0=0
        fi
      done
      for shot in $shotALL; do
        if [ $flg0 -eq 1 ]; then
          file1=`echo $ofile | sed -e "s/%Y/$yy/g" \
                                   -e "s/%m/$mm/g" \
                                   -e "s/%d/$dd/g" \
                                   -e "s/%R/$ad/g" \
                                   -e "s/%S/$shot/g" \
                                   -e "s/%P/$pole/g"`
          if [ ! -e $file1 ]; then
            flg1=1
          else
            for var in ${vars[@]}; do
              file0=`echo $ifile | sed -e "s/%Y/$yy/g" \
                                       -e "s/%m/$mm/g" \
                                       -e "s/%d/$dd/g" \
                                       -e "s/%V/$var/g" \
                                       -e "s/%S/$shot/g" \
                                       -e "s/%P/$pole/g"`
              if [ $file1 -ot $file0 ]; then
                flg1=1
              fi
            done
          fi
        fi
        flg=$(( $flg0 * $flg1 ))
        if [ $flg -eq 1 ]; then
          ${script} $yymmdd$ad $pole $var $shot
          mv -f ${file1
        fi
      done
    done
    yymmdd=`date -d"${yy}/${mm}/${dd} 1days" +%Y%m%d`
  done
done

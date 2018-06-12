#!/bin/bash
now=`date`
currentdir=`pwd`
echo $now "Maiking IC0 images from AMSR2 data"
idir0="$currentdir/Data/AMSR2"
idir1="$currentdir/Data/"
ifile="${idir0}/%V/%Y%m/GW1AM2%Y%m%d%R_%V%P.dat"

vars=("IC0")
ofile="$currentdir/Data/WEB/data/%Y%m/AM2SI%Y%m%d%R_IC0%S_%P.png"
odir="$currentdir/Data/WEB/data/%Y%m"

yymmdds=20160701
yymmdde=100000000
poleALL="NP"
adALL="D"
shotALL="L C"
gmtscript="${idir1}/gmt4_make_amsr2.sh"

cd ${gmtscript%/*}
script="./${gmtscript##*/}"

i=0
while [ $i -lt ${#vars[@]} ]; do
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
  ys=${yymmdd:0:4}
  ms=${yymmdd:4:2}
  ds=${yymmdd:6:2}
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
          odir1=`echo $odir | sed -e "s/%Y/$yy/g" \
                                 -e "s/%m/$mm/g"`
          if [ ! -e $file1 ]; then
            flg1=1
          else
            for var in ${vars[@]}; do
              file0=`echo $ifile | sed -e "s/%Y/$yy/g" \
                                       -e "s/%m/$mm/g" \
                                       -e "s/%d/$dd/g" \
                                       -e "s/%R/$ad/g" \
                                       -e "s/%V/$var/g" \
                                       -e "s/%P/$pole/g"`
              if [ $file1 -ot $file0 ]; then
                flg1=1
              fi
            done
          fi
        fi

        flg=$(( $flg0 * $flg1 ))

        if [ $flg -eq 1 ]; then
#        echo $yymmdd$pole $file1 ${file1##*/}
          ${script} $yymmdd$ad $pole $var $shot
          if [ ! -e $odir1 ]; then
            mkdir $odir1
          fi
          mv -f ${file1##*/} ${file1}
        fi
      done
    done
    yymmdd=`date -d"${yy}/${mm}/${dd} 1days" +%Y%m%d`
  done
done

echo "var start  = {"y":$ys,"m":$ms,"d":$ds};" > $currentdir/Data/WEB/js/param.js
echo "var latest  = {"y":$yy,"m":$mm,"d":$dd};" >> $currentdir/Data/WEB/js/param.js
odir="Data/WEB/data/%Y%m"

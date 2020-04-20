idir0="/home/shirase/VENUS"
ifile="${idir0}/%V/%Y%m/GW1AM2%Y%m%dA_100%V%P.dat"
vars=("SST" )
ofile="/var/www/vishop/data/%Y%m/AM2SI%Y%m%dSSTM_%P.png"
yymmdds=20141001
yymmdde=100000000
gmtscript="/home/shirase/VENUS/gmt4_make_sst_image.sh"
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
for pole in NP SP; do
  yymmdd=$yymmdds
  while [ $yymmdd -le $yymmdde ]; do
    yy=${yymmdd:0:4}
    mm=${yymmdd:4:2}
    dd=${yymmdd:6:2}
    flg0=1
    flg1=0
    for var in ${vars[@]}; do
      file0=`echo $ifile | sed -e "s/%Y/$yy/g" \
                               -e "s/%m/$mm/g" \
                               -e "s/%d/$dd/g" \
                               -e "s/%V/$var/g" \
                               -e "s/%P/$pole/g"`
      if [ ! -e $file0 ]; then
        flg0=0
      fi
    done
    if [ $flg0 -eq 1 ]; then
      file1=`echo $ofile | sed -e "s/%Y/$yy/g" \
                               -e "s/%m/$mm/g" \
                               -e "s/%d/$dd/g" \
                               -e "s/%P/$pole/g"`
      if [ ! -e $file1 ]; then
        flg1=1
      else
        for var in ${vars[@]}; do
          file0=`echo $ifile | sed -e "s/%Y/$yy/g" \
                                   -e "s/%m/$mm/g" \
                                   -e "s/%d/$dd/g" \
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
      ${script} $yymmdd$pole
      mv -f ${file1
    fi
    yymmdd=`date -d"${yy}/${mm}/${dd} 1days" +%Y%m%d`
  done
done

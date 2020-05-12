#!/bin/bash
TMPDIR=/tmp/shirase
WORKDIR=/home/shirase/Data/TRACK
POSITION=sod.dat
LOGFILE=sod.log
LONLAT=position.txt
HOST=133.57.52.23
PORT=15100
(sleep 10) | telnet $HOST $PORT > $TMPDIR/$POSITION
cat $TMPDIR/$POSITION | grep "^\$SOD" | tail -1 >> $WORKDIR/$LOGFILE
cat $TMPDIR/$POSITION | grep "^\$SOD" | tail -1 |\
awk -F, '{print $9,$10}'     |\
sed -e "s/-/,/g"              \
    -e "s/,/\ /g"	      \
> $TMPDIR/$LONLAT
SODSTRING=`cat $TMPDIR/$LONLAT`
DLAT=`echo $SODSTRING | awk '{print $1}'`
MLAT=`echo $SODSTRING | awk '{print substr($2, 0, 8)}'`
NS=`echo $SODSTRING | awk '{print substr($2, 9, 1)}'`
DLON=`echo $SODSTRING | awk '{print $3}'`
MLON=`echo $SODSTRING | awk '{print substr($4, 0, 8)}'`
WE=`echo $SODSTRING | awk '{print substr($4, 9, 1)}'`
if [ $NS = "S" ]; then
  LAT=`echo "scale=6; -1*($DLAT+($MLAT/60.))" | bc` 
else
  LAT=`echo "scale=6; 1*($DLAT+($MLAT/60.))" | bc` 
fi
if [ $WE = "W" ]; then
  LAT=`echo "scale=6; -1*($DLON+($MLON/60.))" | bc` 
else
  LON=`echo "scale=6; 1*($DLON+($MLON/60.))" | bc` 
fi
echo $LON $LAT > $TMPDIR/$LONLAT

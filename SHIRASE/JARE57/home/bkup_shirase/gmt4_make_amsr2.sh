#!/bin/bash
export GMT_TMPDIR=/tmp
export TMPDIR=/tmp
yymmddad=$1
pole=$2
var=$3
shot=$4
tmpdir=/tmp
gmtdir=`pwd`
outdir=/var/www/vishop/data
./amsr2gmt $yymmddad $pole $var
echo $yymmddad $pole $var $shot
TXT=$tmpdir/$var.txt
EPS=$tmpdir/$var.eps
PNG=$tmpdir/$var.png
OUT=AM2SI${yymmddad:0:9}_${var}${shot:0:1}_${pole}.png
TMPOUT=$tmpdir/$OUT
OUTIC0=AM2SI${yymmddad:0:9}_IC0${shot:0:1}_${pole}.png
echo $OUT
Color=CPT/$var.cpt
case $shot in 
  L)
    Offset=0.1c
    TLength=-0.2c
    Oblique=1
    Region=0/360/-90/-50
    proJ=s0/-90/1:142000000
    Symbol=c0.01
    Base1=a20
    Base2=
    Ytext=7.09
    NorthSpace=0x0
    SouthSpace1=0x100
    SouthSpace2=0x0
    WestSpace=83x0
    EastSpace=84x0
    Angle=Long\ Shot ;;
  M)
    Offset=0.1c
    TLength=0.1c
    Oblique=3
    Region=20/140/-70/-40
    proJ=m1:177000000
    Symbol=c0.01
    Base1=WeSng10a10f1
    Base2=
    Ytext=3.87
    NorthSpace=0x100
    SouthSpace1=0x100
    SouthSpace2=0x268
    WestSpace=0x0
    EastSpace=1x0
    Angle=Middle\ Shot ;;
  C)
    Offset=0.1c
    TLength=0.1c
    Oblique=6
    Region=32/52/-70/-63
    proJ=m1:29600000
    Symbol=c0.05
    Base1=a2f1g1/a1f30mg30mWeSn
    Base2=
    Ytext=6.985
    NorthSpace=0x0
    SouthSpace1=0x100
    SouthSpace2=0x0
    WestSpace=11x0
    EastSpace=0x0
    Angle=Close\ Shot ;;
esac
case ${yymmddad:8} in
  A) Orbit=Ascending ;;
  D) Orbit=Descending ;;
esac
echo $Orbit
case $var in
  IC0)
    Vtext="$var"
    Alpha=Off ;;
  SIT)
    Vtext="$var"
    Alpha=Off ;;
  SST) 
    Vtext="      +$var"
    Alpha=Set ;;
esac
GMT gmtdefaults -D > /tmp/.gmtdefault4
GMT gmtset ANNOT_FONT_SIZE_PRIMARY 6p
GMT gmtset ANNOT_OFFSET_PRIMARY $Offset
GMT gmtset BASEMAP_TYPE plain
GMT gmtset GRID_PEN_PRIMARY 0.1p/dimgray
GMT gmtset FRAME_PEN 0.4p
GMT gmtset TICK_LENGTH $TLength
GMT gmtset TICK_PEN 0.25p
GMT gmtset OBLIQUE_ANNOTATION $Oblique
GMT gmtset PLOT_DEGREE_FORMAT ddd:mm:ssF
GMT pscoast -R$Region -J$proJ -W0.01/darkgray -G218/218/182 -Df -K > $EPS
GMT psxy $TXT -R$Region -J$proJ -S$Symbol  -C$Color -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base1 -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base2 -K -O >> $EPS
GMT pstext -R0/10/0/20 -Jx1 -O <<EOF >> $EPS
0 $Ytext 8 0 0 BL AMSR2 $Angle for ${yymmddad:0:8} $Orbit $Vtext
EOF
pushd $tmpdir
GMT ps2raster $EPS -A -TG
convert $PNG -rotate +90 \
             -gravity north -splice $NorthSpace \
             -gravity south -splice $SouthSpace1 \
             -gravity west -splice $WestSpace \
             -gravity east -splice $EastSpace \
             $gmtdir/LOGO/logo.png -gravity southeast -composite \
             $gmtdir/CPT/ColorScale_$var.png -gravity southwest -composite \
             -gravity south -splice $SouthSpace2 -alpha $Alpha $TMPOUT
popd
if [ "$var" != "SST" ] ; then
  cp $TMPOUT $OUT
else 
  convert $outdir/${yymmddad:0:6}/$OUTIC0 $TMPOUT -composite $OUT
fi
rm $TXT $EPS $PNG $TMPOUT

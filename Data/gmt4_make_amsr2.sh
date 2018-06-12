#!/bin/bash
gmtdir=`pwd`
export GMT_TMPDIR=$gmtdir/tmp
export TMPDIR=$gmtdir/tmp
yymmddad=$1
pole=$2
var=$3
shot=$4
tmpdir=$gmtdir/tmp
if [ ! -e $tmpdir ]; then
  mkdir $tmpdir
fi
echo $yymmddad $pole $var $shot

TXT=$tmpdir/$var.txt
EPS=$tmpdir/$var.eps
PNG=$tmpdir/$var.png
GRD=AMSR2/$var/${yymmddad:0:6}/GW1AM2${yymmddad}_$var$pole.dat
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
    Region=0/360/50/90
    proJ=s180/90/1:142000000
    Symbol=c0.01
    Base1=a20
    Base2=
    DegreeFormat=ddd:mm:ss
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
    Region=140/59/270/70r
    proJ=e180/75/1:61810000
    Symbol=c0.03
    Base1=WESg10a20f5
    Base2=WEg10/10g5a10
    DegreeFormat=ddd:mm:ss
    Ytext=4.87
    NorthSpace=0x100
    SouthSpace1=0x100
    SouthSpace2=0x150
    WestSpace=0x0
    EastSpace=0x0
    Angle=Middle\ Shot ;;
  C)
    Offset=0.1c
    TLength=0.1c
    Oblique=6
    Region=175/200/55/73
    proJ=m1:73000000
    Symbol=c0.05
    Base1=WeSng10a10f1
    Base2=
    DegreeFormat=ddd:mm:ss
    Ytext=6.985
    NorthSpace=0x0
    SouthSpace1=0x100
    SouthSpace2=0x0
    WestSpace=160x0
    EastSpace=50x0
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
    Vtext="IC0+$var"
    Alpha=Set ;;
esac

GMT gmtdefaults -D > $tmpdir/.gmtdefaults4
GMT gmtset ANNOT_FONT_SIZE_PRIMARY 6p
GMT gmtset ANNOT_OFFSET_PRIMARY $Offset
GMT gmtset BASEMAP_TYPE plain
GMT gmtset GRID_PEN_PRIMARY 0.1p/dimgray
GMT gmtset FRAME_PEN 0.4p
GMT gmtset TICK_LENGTH $TLength
GMT gmtset TICK_PEN 0.25p
GMT gmtset OBLIQUE_ANNOTATION $Oblique
GMT gmtset PLOT_DEGREE_FORMAT $DegreeFormat
GMT pscoast -R$Region -J$proJ -G218/218/182 -Dc -K > $EPS

case $var in
  IC0)
    ./amsr2gmt $yymmddad $pole $var
    GMT psxy $TXT -R$Region -J$proJ -S$Symbol  -C$Color -K -O >> $EPS
    echo ;;
  SIT)
    ./amsr2gmt $yymmddad $pole $var
    GMT psxy $TXT -R$Region -J$proJ -S$Symbol  -C$Color -K -O >> $EPS
    echo ;;
  SST)
    ./amsr2gmt $yymmddad $pole IC0
    GMT psxy $tmpdir/IC0.txt -R$Region -J$proJ -S$Symbol -CCPT/$var.IC0.cpt -K -O >> $EPS
    ./amsr2gmt $yymmddad $pole $var
    GMT psxy $TXT -R$Region -J$proJ -S$Symbol -C$Color -K -O >> $EPS
    echo ;;
esac

GMT pscoast -R$Region -J$proJ -G218/218/182 -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base1 -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base2 -K -O >> $EPS
GMT pstext -R0/10/0/20 -Jx1 -O <<EOF >> $EPS
0 $Ytext 8 0 0 BL AMSR2 $Angle for ${yymmddad:0:8} $Orbit $Vtext
EOF
pushd $tmpdir

GMT ps2raster "$EPS" -A -TG
convert $PNG -rotate +90 \
             -gravity north -splice $NorthSpace \
             -gravity south -splice $SouthSpace1 \
             -gravity west -splice $WestSpace \
             -gravity east -splice $EastSpace \
             $gmtdir/LOGO/logo.png -gravity southeast -composite \
             $gmtdir/CPT/ColorScale_$var.png -gravity southwest -composite \
             -gravity south -splice $SouthSpace2 -alpha $Alpha $TMPOUT

popd
cp $TMPOUT $OUT
rm $TXT $EPS $PNG $TMPOUT $tmpdir/.gmtdefaults4
if [ "$var" = "SST" ]; then
  rm $tmpdir/IC0.txt
fi

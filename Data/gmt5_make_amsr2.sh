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
    Region=170/240/65/85
    proJ=d205/100/70/80/1:41750000
    Symbol=c0.05
    Base1=Sa10f1
    Base2=WEg5/5g1a5f1
    DegreeFormat=ddd:mm:ss
    Ytext=6.5
    NorthSpace=0x40
    SouthSpace1=0x100
    SouthSpace2=0x20
    WestSpace=0x0
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
    Vtext="IC0+$var"
    Alpha=Set ;;
esac

gmt gmtdefaults -D > $tmpdir/.gmtdefaults4
gmt gmtset ANNOT_FONT_SIZE_PRIMARY 6p
gmt gmtset ANNOT_OFFSET_PRIMARY $Offset
gmt gmtset BASEMAP_TYPE plain
gmt gmtset GRID_PEN_PRIMARY 0.1p/dimgray
gmt gmtset FRAME_PEN 0.4p
gmt gmtset TICK_LENGTH $TLength
gmt gmtset TICK_PEN 0.25p
gmt gmtset OBLIQUE_ANNOTATION $Oblique
gmt gmtset PLOT_DEGREE_FORMAT $DegreeFormat
gmt pscoast -R$Region -J$proJ -G218/218/182 -Dc -K > $EPS

case $var in
  IC0)
    ./amsr2gmt $yymmddad $pole $var
    gmt psxy $TXT -R$Region -J$proJ -S$Symbol  -C$Color -K -O >> $EPS
    echo ;;
  SIT)
    ./amsr2gmt $yymmddad $pole $var
    gmt psxy $TXT -R$Region -J$proJ -S$Symbol  -C$Color -K -O >> $EPS
    echo ;;
  SST)
    ./amsr2gmt $yymmddad $pole IC0
    gmt psxy $tmpdir/IC0.txt -R$Region -J$proJ -S$Symbol -CCPT/$var.IC0.cpt -K -O >> $EPS
    ./amsr2gmt $yymmddad $pole $var
    gmt psxy $TXT -R$Region -J$proJ -S$Symbol -C$Color -K -O >> $EPS
    echo ;;
esac

gmt pscoast -R$Region -J$proJ -G218/218/182 -K -O >> $EPS
gmt psbasemap -R$Region -J$proJ -B$Base1 -K -O >> $EPS
gmt psbasemap -R$Region -J$proJ -B$Base2 -K -O >> $EPS
gmt pstext -R0/10/0/20 -Jx1 -O <<EOF >> $EPS
0 $Ytext 8 0 0 BL AMSR2 $Angle for ${yymmddad:0:8} $Orbit $Vtext
EOF
pushd $tmpdir

gmt ps2raster "$EPS" -A -TG
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
rm $TXT $EPS $PNG $TMPOUT $tmpdir/.gmtdefaults
if [ "$var" = "SST" ]; then
  rm $tmpdir/IC0.txt
fi

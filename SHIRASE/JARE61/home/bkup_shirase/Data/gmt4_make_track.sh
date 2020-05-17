#!/bin/bash
export GMT_TMPDIR=/tmp/shirase
export TMPDIR=/tmp/shirase
shot=$1
tmpdir=/tmp/shirase
sharedir=/mnt/share/public
gmtdir=`pwd`
POSITION=$tmpdir/position.txt
PLANPATH=$tmpdir/planpath.txt
PLANPATHORG=$sharedir/planpath.txt
if [ ! -e $tmpdir ]; then
  mkdir $tmpdir
fi
cat $POSITION
if [ -e $PLANPATHORG ]; then
  cp -f $PLANPATHORG $PLANPATH
fi
echo "Ship position and path" $shot
EPS=$tmpdir/temp.eps
PNG=$tmpdir/temp.png
PNGTMP1=$tmpdir/temp1.png
OUT=${shot}.png
TMPOUT=$tmpdir/$OUT
echo $OUT
case ${shot:0:1} in 
  L)
    Offset=0.1c
    TLength=-0.2c
    Oblique=1
    Region=0/360/-90/-50
    proJ=s0/-90/1:142000000
    Symbol=D0.1
    Base1=a20
    Base2=
    Ytext=6.46
    Yaxis=6.8
    NorthSpace=0x64
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
    Symbol=D0.1
    Base1=WeSng10a10f1
    Base2=
    Ytext=3.64
    Yaxis=7.5
    NorthSpace=0x134
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
    Symbol=D0.1
    Base1=a2f1g1/a1f30mg30mWeSn
    Base2=
    Ytext=6.750
    Yaxis=7.5
    NorthSpace=0x35
    SouthSpace1=0x100
    SouthSpace2=0x0
    WestSpace=11x0
    EastSpace=0x0
    Angle=Close\ Shot ;;
esac
Vtext="SHIP"
Alpha=Set
GMT gmtdefaults -D > $tmpdir/.gmtdefaults4
GMT gmtset ANNOT_FONT_SIZE_PRIMARY 6p
GMT gmtset ANNOT_OFFSET_PRIMARY $Offset
GMT gmtset BASEMAP_TYPE plain
GMT gmtset GRID_PEN_PRIMARY 0.1p/dimgray
GMT gmtset FRAME_PEN 0.4p
GMT gmtset TICK_LENGTH $TLength
GMT gmtset TICK_PEN 0.25p
GMT gmtset OBLIQUE_ANNOTATION $Oblique
GMT gmtset PLOT_DEGREE_FORMAT ddd:mm:ssF
GMT pscoast -R$Region -J$proJ -W0.01/darkgray -Df -K > $EPS
if [ -e $PLANPATH ]; then
  GMT psxy $PLANPATH -R$Region -J$proJ -W2/darkgreen -K -O >> $EPS
fi
GMT psxy $POSITION -R$Region -J$proJ -S$Symbol -Ggreen -W2/black -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base1 -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base2 -K -O >> $EPS
GMT pstext -R0/10/0/20 -Jx1 -O <<EOF >> $EPS
$Yaxis $Ytext 8 0 0 BR $Vtext
EOF
pushd $tmpdir
GMT ps2raster $EPS -A -TG
convert $PNG -rotate +90 \
             -gravity north -splice $NorthSpace \
             -gravity south -splice $SouthSpace1 \
             -gravity west -splice $WestSpace \
             -gravity east -splice $EastSpace \
             $gmtdir/LOGO/logo.png -gravity southeast -composite \
             $gmtdir/CPT/ColorScale_SHIP.png -gravity southwest -composite \
             -gravity south -splice $SouthSpace2 -alpha $Alpha $PNGTMP1
convert -transparent white $PNGTMP1 $TMPOUT
popd
cp $TMPOUT $OUT
rm $EPS $PNG $PNGTMP1 $TMPOUT $tmpdir/.gmtdefaults4
if [ -e $PLANPATH ]; then
  rm $PLANPATH
fi

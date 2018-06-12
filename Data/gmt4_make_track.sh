#!/bin/bash
gmtdir=`pwd`
export GMT_TMPDIR=$gmtdir/tmp
export TMPDIR=$gmtdir/tmp
shot=$1
tmpdir=$gmtdir/tmp
gmtdir=`pwd`
POSITION=$gmtdir/TRACK/position.txt
PLANPATH=$gmtdir/TRACK/planpath.txt
#PLANPATHORG=$sharedir/planpath.txt
if [ ! -e $tmpdir ]; then
  mkdir $tmpdir
fi
# convert SOD format to GMT format
#./track2gmt
cat $POSITION
cat $PLANPATH
# Selecting each objective data row, and making the xyz text file witout NaN data.
echo "Ship position and path" $shot

EPS=$tmpdir/temp.eps
PNG=$tmpdir/temp.png
PNGTMP1=$tmpdir/temp1.png
OUT=${shot}.png
TMPOUT=$tmpdir/$OUT
echo $OUT
# Parameter set
#Color=CPT/$var.cpt
case ${shot:0:1} in 
  L)
    Offset=0.1c
    TLength=-0.2c
    Oblique=1
    Region=0/360/50/90
    proJ=s180/90/1:142000000
    Symbol=D0.1
    Base1=a20
    Base2=
    DegreeFormat=ddd:mm:ss
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
    Region=140/59/270/70r
    proJ=e180/75/1:61810000
    Symbol=D0.1
    Base1=WESg10a20f5
    Base2=WEg10/10g5a10
    DegreeFormat=ddd:mm:ss
    Ytext=3.64
    Yaxis=9.0
    NorthSpace=0x202
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
    Ytext=6.750
    Yaxis=6.0
    NorthSpace=0x75
    SouthSpace1=0x100
    SouthSpace2=0x0
    WestSpace=160x0
    EastSpace=300x0
    Angle=Close\ Shot ;;
esac
#
Vtext="SHIP"
Alpha=Set

# Reconfigure GMT parameter
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
# Writting coast line.
GMT pscoast -R$Region -J$proJ -W0.01/darkgray -K > $EPS
# Plotting value with color.
if [ -e $PLANPATH ]; then
#  GMT psxy $PLANPATH -R$Region -J$proJ -S$Symbol -Gdarkgreen -K -O >> $EPS
  GMT psxy $PLANPATH -R$Region -J$proJ -W2/darkgreen -K -O >> $EPS
fi
GMT psxy $POSITION -R$Region -J$proJ -S$Symbol -Ggreen -W2/black -K -O >> $EPS
# Writting the longitude and latitude line.
GMT psbasemap -R$Region -J$proJ -B$Base1 -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base2 -K -O >> $EPS
# Writting texts. -F option provide font size and justification. 
GMT pstext -R0/10/0/20 -Gwhite -Jx1 -O <<EOF >> $EPS
$Yaxis $Ytext 0 0 0 BR $Vtext
EOF
# Convert from eps to png.
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
# Clean files
rm $EPS $PNG $PNGTMP1 $TMPOUT $tmpdir/.gmtdefaults4
#if [ -e $PLANPATH ]; then
#  rm $PLANPATH
#fi

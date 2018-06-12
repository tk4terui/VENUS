#!/bin/bash
gmtdir=`pwd`
export GMT_TMPDIR=$gmtdir/tmp
export TMPDIR=$gmtdir/tmp
yymmddhh=$1
pole=$2
var=$3
shot=$4
fday=$5
tmpdir=$gmtdir/tmp
if [ ! -e $tmpdir ]; then
  mkdir $tmpdir
fi
echo $yymmddhh $pole $var $shot

Hour=`expr $fday \* 24`
EPS=$tmpdir/$var.eps
PNG=$tmpdir/$var.png
PNGTMP1=$tmpdir/$var.tmp1.png
OUT=GPV${yymmddhh:0:10}FD${fday}00_${var}${shot:0:1}_${pole}.png
TMPOUT=$tmpdir/$OUT
echo $OUT
Color=CPT/$var.cpt
Color2=CPT/$var.2.cpt

case $shot in 
  L)
    Offset=0.1c
    TLength=-0.2c
    Oblique=1
    Region=0/360/50/90
    proJ=s180/90/1:142000000
    Symbol=c0.01
    LabelFont=f6t
    LabelGrid=-Gd5c
    Interval=5
    Base1=a20
    Base2=
    DegreeFormat=ddd:mm:ss
    Ytext=6.80
    NorthSpace=0x34
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
    LabelFont=f4t
    LabelGrid=-Gd14.5c
    Interval=2
    Base1=WESg10a20f5
    Base2=WEg10/10g5a10
    DegreeFormat=ddd:mm:ss
    Ytext=4.55
    NorthSpace=0x138
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
    LabelFont=f5t
    LabelGrid=-GD2d
    Interval=0.5
    Base1=WeSng10a10f1
    Base2=
    DegreeFormat=ddd:mm:ss
    Ytext=6.6
    NorthSpace=0x45
    SouthSpace1=0x100
    SouthSpace2=0x0
    WestSpace=160x0
    EastSpace=300x0
    Angle=Close\ Shot ;;
esac

case $var in
  MAP)
    Vtext="MAP"  
    Alpha=Set ;;
  PRMSL)
    NCORG=GPV/${var}/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_${var}.nc
    NCVAR=$tmpdir/$var.nc
    Vtext="+$Hour hours $var"
    Alpha=Set ;;
  WIND) 
    NCORG=GPV/UGRD/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_UGRD.nc
    NCORG1=GPV/UGRD/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_UGRD.nc
    NCORG2=GPV/VGRD/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_VGRD.nc
    NCVAR=$tmpdir/WINDspeed.nc
    NCVAR1=$tmpdir/UGRD.nc
    NCVAR2=$tmpdir/VGRD.nc
    Vtext="+$Hour hours              $var"
    Alpha=Set ;;
  TMP)
    NCORG=GPV/${var}/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_${var}.nc
    NCVAR=$tmpdir/$var.nc
    Vtext="+$Hour hours                         $var"
    Alpha=Set ;;
  HTSGW)
    NCORG=GPV/${var}/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_${var}.nc
    NCVAR=$tmpdir/$var.nc
    Vtext="+$Hour hours                                  $var"
    Alpha=Set ;;
  WAVE)
    NCORG=GPV/DIRPW/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_DIRPW.nc
    NCORG1=GPV/DIRPW/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_DIRPW.nc
    NCORG2=GPV/PERPW/${yymmddhh:0:6}/GPV${yymmddhh}0000FD${fday}00_PERPW.nc
    NCVAR=$tmpdir/WAVE.nc
    NCVAR1=$tmpdir/DIRPW.nc
    NCVAR1N=$tmpdir/DIRPWN.nc
    NCVAR2=$tmpdir/PERPW.nc
    TXTVARS=$tmpdir/DIRPWPERPW.txt
    TXTVAR1=$tmpdir/DIRPW.txt
    TXTVAR2=$tmpdir/PERPW.txt
    TXTVAR=$tmpdir/WAVE.txt
    Vtext="+$Hour hours                                                 $var"
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
GMT gmtset VECTOR_SHAPE 1
GMT gmtset PLOT_DEGREE_FORMAT $DegreeFormat
GMT pscoast -R$Region -J$proJ -W0.01/darkgray -K > $EPS

case $var in
  MAP)
    GMT pscoast -R$Region -J$proJ -W0.01/black -K -O >> $EPS
    cat $MAPTEXT |\
    awk -F, '{print $1, $2}' |\
    GMT psxy -R$Region -J$porJ -Sa0.2 -W0.1/black -Gdarkgreen -K -O >> $EPS
    GMT pstext $MAPTEXT -R$Region -J$porJ -Gdarkgreen -Dj0.1/0.1 -K -O >> $EPS
    echo ;;
  PRMSL)
    GMT grdreformat "${NCORG}?PRMSL_meansealevel" $NCVAR
    GMT grdcontour $NCVAR -R$Region -J$proJ -W1/black/ta -C$Interval -K -O >> $EPS
    GMT grdcontour $NCVAR -R$Region -J$proJ -W+3 -A$LabelFont $LabelGrid -C$Color -K -O >> $EPS
    echo ;;
  WIND)
    GMT grdvector $NCORG1 $NCORG2 -R$Region -J$proJ -I$Interval -Gdarkgray -Q0.01c/0.05c/0.05c -S30c -C$Color -K -O >> $EPS
    echo ;;
  TMP)
    GMT grdreformat "${NCORG}?TMP_2maboveground" $NCVAR
    GMT grdcontour $NCVAR -R$Region -J$proJ -W+1 -A- -C$Color -K -O >> $EPS
    GMT grdcontour $NCVAR -R$Region -J$proJ -W+2 -A$LabelFont $LabelGrid -C$Color2 -K -O >> $EPS
    echo ;;
  HTSGW)
    GMT grdimage $NCORG -R$Region -J$proJ -C$Color -K -O >> $EPS
    GMT grdcontour $NCORG -R$Region -J$proJ -W1/black/ta -A$LabelFont  $LabelGrid -C0.5 -K -O >> $EPS
    echo ;;
  WAVE)
    cp -f $NCORG1 $NCVAR1
    cp -f $NCORG2 $NCVAR2
    GMT grdmath $NCVAR1 180 SUB = $NCVAR1N
    mv -f $NCVAR1N $NCVAR1
    GMT grd2xyz $NCVAR1 > $TXTVAR1
    GMT grd2xyz $NCVAR2 > $TXTVAR2
    paste $TXTVAR1 $TXTVAR2 | awk '{if($3!=-190) print $1, $2, $6, $3, 0.2}' > $TXTVARS
    awk -v I=$Interval '{if(($1%I==0)&&($2%I==0)) print $1, $2, $3, $4, $5}' $TXTVARS > $TXTVAR
    GMT psxy $TXTVAR -R$Region -J$proJ -SV0.02c/0.1c/0.1c -W0.01,black -C$Color -K -O >> $EPS
    echo ;;
esac

GMT psbasemap -R$Region -J$proJ -B$Base1 -K -O >> $EPS
GMT psbasemap -R$Region -J$proJ -B$Base2 -K -O >> $EPS
GMT pstext -R0/10/0/20 -Jx1 -O <<EOF >> $EPS
0 $Ytext 8 0 0 BL GPV $Vtext
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
             -gravity south -splice $SouthSpace2 -alpha $Alpha $PNGTMP1
convert -transparent white $PNGTMP1 $TMPOUT
popd
cp $TMPOUT $OUT
rm $EPS $PNG $PNGTMP1 $TMPOUT $tmpdir/.gmtdefaults4

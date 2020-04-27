#!/bin/bash
tmpdir=/tmp
for i in $@
do
./amsr2gmt $i SST
echo $i
SST=$tmpdir/SST_$i.txt
EPS=$tmpdir/temp.eps
PNG=$tmpdir/temp.png
OUT=$tmpdir/outpu.png
GMT gmtset ANNOT_FONT_SIZE_PRIMARY 6p
GMT pscoast -R20/140/-75/-45 -Jm0.0569 -W0.1 -Gdarkgray -K  > $EPS
GMT psxy $SST -R -J -Ss0.01 -CsstSP.cpt -K -O  >> $EPS
GMT psbasemap -R -J -Ba10g5 -K -O  >> $EPS
GMT pstext -R0/10/0/6 -Jx1 -K -O  <<EOF >> $EPS
0 4.5 8 0 0 BL AMSR2 IC0+SST
EOF
GMT pstext -R0/10/0/6 -Jx1 -O  <<EOF >> $EPS
7 4.5 8 0 0 BR Mercator 20E-140E for ${i:0:8}
EOF
GMT ps2raster $EPS -A -TG -Qt
convert $PNG -rotate +90 \
               -gravity north -splice 0x128 \
               -gravity south -splice 0x100 \
               NiPR-JAXA.logo.png -gravity southeast -composite \
               ColorScale_sst.png -gravity southwest -composite \
               ColorScale_ic0.png -gravity southwest -composite \
               -gravity south -splice 0x150 $OUT
mv $OUT AM2SI${i:0:8}SSTM_${i:8:2}.png
rm $SST $EPS $PNG
done

# VENUS
このリポジトリにあるVENUSのファイルはローカルPC上でVENUSを実行するためのスクリプトです。
ファイル/ディレクトリの役割を記します。

Attachfile => メールに添付された圧縮ファイルの置き場所

run_extend_file.sh => Attachedfile以下の圧縮ファイルの自動展開スクリプト

run_make_image.sh => 展開されたファイルから画像を作成するスクリプト

以下に上記スクリプトを実行する前の注意事項を記しております。

## Data/amsr2gmt.f90を再コンパイルしてください
アーキテクチャに合わせてamsr2gmt.f90を再コンパイルしてください。
コンパイル後の実行ファイルはamsr2gmtである必要があります。
よく使われるコンパイラはgfortranです。コンパイル時に参考コマンドを記します。

#gfortran -O2 -o amsr2gmt amsr2gmt.f90

## OSXの場合はdateコマンドに注意ください
VENUSの動作環境はDebianおよびRaspbianを想定しており、GNU版のdateを使用しております。
OSXの標準のdateコマンドではなくgdateコマンドへの置換が必要です。

## GMT4のスクリプトからGMT5のスクリプトへの置換
オリジナルVENUSはGMT4で作られております。GMT5で実行できるスクリプトも用意されております。
Data/gmt4で始まるスクリプトはGMT4を前提としたコマンドです。
Data/gmt5で始まるスクリプトはGMT5でも動くように変更を加えておりますが、pstextについては据え置いております。
場合によってはpstextで始まるコマンドは削除が必要です。
Makeで始まるシェルスクリプトは標準でgmt4を呼び出します。
GMT5で使用する場合はgmt5へ置換が必要です。
一括置換の方法について参考まで以下の方法を利用しております。
#grep 'gmt4' -rl ./*.sh | xargs sed -i 's/gmt4/gmt5/g'

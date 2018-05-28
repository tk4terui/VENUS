program amsr2gmt

  integer, parameter :: INDEX_MAX = 2
  integer, parameter :: UNDEF_MAX = 4

  integer, parameter :: nx = 900              ! 横グリッド数（変更の必要なし）
  integer, parameter :: ny = 900              ! 縦グリッド数（変更の必要なし）
  integer, parameter :: is = 1                ! 左下のi番号（変更の必要なし）
  integer, parameter :: js = 1                ! 左下のj番号（変更の必要なし）
  integer, parameter :: ie = 900              ! 右上のi番号（変更の必要なし）
  integer, parameter :: je = 900              ! 右上のj番号（変更の必要なし）
  character(len=9)   :: dateorbit             ! 引数 YYYYMMDDO (20130830A)の形式でバイナリ実行時に渡す
  character(len=2)   :: pole                  ! 引数 NP or SP (SP)の形式でバイナリ実行時に渡す

  integer             :: ihem                 ! 1: North Pole, 2: South Pole 
  integer, parameter  :: iNP = 1, iSP = 2

  integer :: iunit = 30
  integer :: junit = 31
  integer :: ounit = 40
  integer :: iundef (UNDEF_MAX) = (/-128, -7777, -8888, -9999 /)

  character(len=128) :: tmpdir = "tmp/"       ! テンポラリーディレクトリ
  character(len=128) :: iname                 ! バイナリファイルのファイル名
  character(len=128) :: jname                 ! 緯度経度ファイルのファイル名
  character(len=128) :: ofile                 ! 出力ファイル名
  character(len=3)   :: findex                ! "SST", "IC0", "SND"
  real    :: iscale, ioffset

  integer(2), allocatable :: fx16(:,:), ilat(:,:), ilon(:,:)
  real    :: lat, lon, ofx
!
! 引数をdateorbitへ格納
  call getarg(1,dateorbit)
! 引数をpoleへ格納
  call getarg(2,pole)
! 引数をfindexへ格納
  call getarg(3,findex)
! 引数の文字列から北極か南極を判定
  if(pole == "NP") then 
    ihem=iNP 
  elseif(pole == "SP") then
    ihem=iSP
  endif
! 引数の文字列からscaleとoffsetを決定
  if(findex == "SST") then 
    iscale = 1.0
    ioffset= 0.0 
  elseif(findex == "IC0") then
    iscale = 1.0
    ioffset= 0.0 
  elseif(findex == "SND") then
    iscale = 1.0
    ioffset= 0.0 
  elseif(findex == "SIT") then
    iscale = 1.0
    ioffset= 0.0 
  endif
! 引数から出力ファイルを作成
  ofile = trim(tmpdir)//findex//".txt"                                      !ofileに出力ファイルを入力
  open(ounit,file=trim(ofile),action='write',form='formatted')
! 引数から入力ファイルを作成
  iname = "AMSR2/"//findex//"/"//dateorbit(1:6)//"/GW1AM2"//dateorbit//"_"//findex//pole//".dat"  !inameにバイナリファイルを入力
  jname = "MAP/latlon_low_"//pole                                                                 !jnameに緯度経度ファイルを入力
  open(unit=iunit,file=trim(iname),action="read", &
       form='unformatted',access='direct',status="old",recl=2*nx*ny)
  open(unit=junit,file=trim(jname),action="read", &
       form='unformatted',access='direct',status="old",recl=2*nx*ny)
!
  allocate( fx16(nx,ny), ilat(nx,ny), ilon(nx,ny) )
  read(iunit,rec=1) ((fx16(i,j),i=1,nx),j=1,ny)    !バイナリファイルの読み込み
  read(junit,rec=1) ((ilat(i,j),i=1,nx),j=1,ny)    !緯度の読み込み
  read(junit,rec=2) ((ilon(i,j),i=1,nx),j=1,ny)    !経度の読み込み
  close(iunit)
  close(junit)

  do i = is, ie
  do j = js, je
    lat=real(ilat(i,j)) * 0.01
    lon=real(ilon(i,j)) * 0.01
    if(fx16(i,j) == iundef(1) .or. &
       fx16(i,j) == iundef(2) .or. &
       fx16(i,j) == iundef(3) .or. &
       fx16(i,j) == iundef(4)) then                !配列内の数値がUNDEFの場合は処理をスキップ
    else                                           !UNDEF以外の処理を実行
      ofx = fx16(i,j) * iscale + ioffset           !scaleとoffsetから正しい値を計算
      write(ounit,*) lon, lat, ofx                 !出力ファイルへ書き出し
    endif
  enddo 
  enddo 
  close(ounit)

end program amsr2gmt

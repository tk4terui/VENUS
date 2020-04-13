program amsr2gmt
  integer, parameter :: INDEX_MAX = 2
  integer, parameter :: UNDEF_MAX = 2
  integer, parameter :: nx = 900              
  integer, parameter :: ny = 900              
  integer, parameter :: is = 1                
  integer, parameter :: js = 1                
  integer, parameter :: ie = 900              
  integer, parameter :: je = 900              
  character(len=10) :: datepole               
  real, parameter :: xc = 450.5               
  real, parameter :: yc = 450.5               
  real, parameter :: dlat = 54.36             
  integer             :: ihem                 
  integer, parameter  :: iNP = 1, iSP = 2
  integer :: iunit = 30
  integer :: ounit = 40
  integer :: iundef (UNDEF_MAX) = (/ -8888, -9999 /)
  character(len=128) :: tmpdir = "/tmp/"                 
  character(len=128) :: fname                 
  character(len=128) :: ofile                 
  character(len=3)   :: findex                
  real    :: iscale, ioffset
  real :: lat, lon
  integer(2), allocatable :: fx16(:,:)
  real    :: ofx
  call getarg(1,datepole)
  call getarg(2,findex)
  if(datepole(9:10) == "NP") then 
    ihem=iNP 
  elseif(datepole(9:10) == "SP") then
    ihem=iSP
  endif
  if(findex == "SST") then 
    iscale = 0.1
    ioffset= 0.0 
  elseif(findex == "IC0") then
    iscale = 1.0
    ioffset= 0.0 
  endif
  ofile = trim(tmpdir)//findex//"_"//datepole//".txt"  
  open(ounit,file=trim(ofile),action='write',form='formatted')
  fname = findex//"/"//datepole(1:6)//"/GW1AM2"//datepole(1:8)//"A_100"//findex//datepole(9:10)//".dat"  
  open(unit=iunit,file=trim(fname),action="read", &
       form='unformatted',access='direct',status="old",recl=2*nx*ny)
  allocate( fx16(nx,ny) )
  read(iunit,rec=1) ((fx16(i,j),i=1,nx),j=ny,1,-1) 
  close(iunit)
  do i = is, ie
  do j = js, je
    if(fx16(i,j) == iundef(1) .or. &
       fx16(i,j) == iundef(2)) then                
    else                                           
      call ij2latlonPS(i,j,ihem,xc,yc,dlat,lat,lon)
      ofx = fx16(i,j) * iscale + ioffset           
      write(ounit,*) lon, lat, ofx                 
    endif
  enddo 
  enddo 
  close(ounit)
end program amsr2gmt
subroutine ij2latlonPS(i,j,ihem,xc,yc,dlat,lat,lon)
  integer, intent(in)  :: i, j, ihem
  real,    intent(in)  :: xc, yc, dlat
  real,    intent(out) :: lat, lon
  integer :: dir
  real :: PI
  real :: deg2rad, rad2deg
  real :: r0, phi0, rate
  real :: di, dj
  real :: alpha, a2, phi
  if( ihem == 1 ) then
    dir = 1
  else
    dir = -1
  end if
  PI = 4.0 * atan(1.0)
  deg2rad = PI/180.0
  rad2deg = 180.0/PI
  r0 = sqrt((xc-1)*(xc-1)+(yc-1)*(yc-1))
  phi0 = dlat * deg2rad
  rate = r0 * (1.0+cos(phi0)) / sin(phi0);
  di = xc - i;
  dj = j - yc;
  alpha = sqrt(di*di+dj*dj) / rate
  a2 = alpha * alpha;
  phi = acos( (1.0-a2)/(1.0+a2) )
  lon = atan2(dir*di,dj) * rad2deg
  lat = dir * ( 90.0 - phi * rad2deg )
  if( lon > 180.0 ) then
    lon = lon - 360.0
  end if
end subroutine ij2latlonPS

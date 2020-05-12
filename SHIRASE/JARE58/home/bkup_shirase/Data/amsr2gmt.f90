program amsr2gmt
  integer, parameter :: INDEX_MAX = 2
  integer, parameter :: UNDEF_MAX = 3
  integer, parameter :: nx = 900              
  integer, parameter :: ny = 900              
  integer, parameter :: is = 1                
  integer, parameter :: js = 1                
  integer, parameter :: ie = 900              
  integer, parameter :: je = 900              
  character(len=9)   :: dateorbit             
  character(len=2)   :: pole                  
  integer             :: ihem                 
  integer, parameter  :: iNP = 1, iSP = 2
  integer :: iunit = 30
  integer :: junit = 31
  integer :: ounit = 40
  integer :: iundef (UNDEF_MAX) = (/-7777, -8888, -9999 /)
  character(len=128) :: tmpdir = "/tmp/shirase/"      
  character(len=128) :: iname                 
  character(len=128) :: jname                 
  character(len=128) :: ofile                 
  character(len=3)   :: findex                
  real    :: iscale, ioffset
  integer(2), allocatable :: fx16(:,:), ilat(:,:), ilon(:,:)
  real    :: lat, lon, ofx
  call getarg(1,dateorbit)
  call getarg(2,pole)
  call getarg(3,findex)
  if(pole == "NP") then 
    ihem=iNP 
  elseif(pole == "SP") then
    ihem=iSP
  endif
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
  ofile = trim(tmpdir)//findex//".txt"                                      
  open(ounit,file=trim(ofile),action='write',form='formatted')
  iname = "AMSR2/"//findex//"/"//dateorbit(1:6)//"/GW1AM2"//dateorbit//"_"//findex//pole//".dat"  
  jname = "MAP/latlon_low_"//pole                                                                 
  open(unit=iunit,file=trim(iname),action="read", &
       form='unformatted',access='direct',status="old",recl=2*nx*ny)
  open(unit=junit,file=trim(jname),action="read", &
       form='unformatted',access='direct',status="old",recl=2*nx*ny)
  allocate( fx16(nx,ny), ilat(nx,ny), ilon(nx,ny) )
  read(iunit,rec=1) ((fx16(i,j),i=1,nx),j=1,ny)    
  read(junit,rec=1) ((ilat(i,j),i=1,nx),j=1,ny)    
  read(junit,rec=2) ((ilon(i,j),i=1,nx),j=1,ny)    
  close(iunit)
  close(junit)
  do i = is, ie
  do j = js, je
    lat=real(ilat(i,j)) * 0.01
    lon=real(ilon(i,j)) * 0.01
    if(fx16(i,j) == iundef(1) .or. &
       fx16(i,j) == iundef(2) .or. &
       fx16(i,j) == iundef(3)) then                
    else                                           
      ofx = fx16(i,j) * iscale + ioffset           
      write(ounit,*) lon, lat, ofx                 
    endif
  enddo 
  enddo 
  close(ounit)
end program amsr2gmt

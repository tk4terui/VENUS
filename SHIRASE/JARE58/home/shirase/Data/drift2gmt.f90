program drift2gmt
  integer, parameter :: INDEX_MAX = 2
  integer, parameter :: UNDEF_MAX = 1
  integer, parameter :: nx = 145              
  integer, parameter :: ny = 145              
  integer, parameter :: is = 1                
  integer, parameter :: js = 1                
  integer, parameter :: ie = 145              
  integer, parameter :: je = 145              
  character(len=8)   :: date                  
  character(len=2)   :: pole                  
  character(len=3)   :: vscale                
  integer             :: ihem                 
  integer             :: iscale, ioffset
  integer, parameter  :: iNP = 1, iSP = 2
  integer :: iunitlon = 31
  integer :: iunitlat = 32
  integer :: junit    = 35
  integer :: ounit    = 40
  real    :: iundef (UNDEF_MAX) = (/999. /)
  real,parameter :: pi = 3.1415926
  character(len=128) :: tmpdir = "/tmp/shirase/"      
  character(len=128) :: inamelon                
  character(len=128) :: inamelat                
  character(len=128) :: jname                 
  character(len=128) :: ofile                 
  character(len=5)   :: findex                
  real, allocatable :: fxlon(:,:), fxlat(:,:), flat(:,:), flon(:,:)
  real    :: lat, lon, oft, ofr
  call getarg(1,date)
  call getarg(2,pole)
  if(pole == "NP") then 
    ihem=iNP 
  elseif(pole == "SP") then
    ihem=iSP
  endif
  ofile = trim(tmpdir)//"SID.txt"                                      
  open(ounit,file=trim(ofile),action='write',form='formatted')
  inamelon = "AMSR2/"//"DRLON"//"/"//date(1:6)//"/GW1AM2"//date//"_000"//"DRLON"//pole//".dat"  
  inamelat = "AMSR2/"//"DRLAT"//"/"//date(1:6)//"/GW1AM2"//date//"_000"//"DRLAT"//pole//".dat"  
  jname = "MAP/latlon_DR_"//pole                                                                 
  open(unit=iunitlon,file=trim(inamelon),action="read", &
       form='unformatted',access='direct',status="old",recl=4*nx*ny)
  open(unit=iunitlat,file=trim(inamelat),action="read", &
       form='unformatted',access='direct',status="old",recl=4*nx*ny)
  open(unit=junit,file=trim(jname),action="read", &
       form='unformatted',access='direct',status="old",recl=4*nx*ny)
  allocate( fxlon(nx,ny), fxlat(nx,ny), flat(nx,ny), flon(nx,ny) )
  read(iunitlon,rec=1) ((fxlon(i,j),i=1,nx),j=1,ny)    
  read(iunitlat,rec=1) ((fxlat(i,j),i=1,nx),j=1,ny)    
  read(junit,rec=1) ((flat(i,j),i=1,nx),j=1,ny)    
  read(junit,rec=2) ((flon(i,j),i=1,nx),j=1,ny)    
  close(iunit)
  close(junit)
  do j = js, je
  do i = is, ie
    lat=flat(i,j)
    lon=flon(i,j)
    if(fxlon(i,j) == iundef(1)  .or. &
       fxlat(i,j) == iundef(1)) then
    else                                            
      oft = atan2(fxlat(i,j),fxlon(i,j)) * 180. / pi           
      ofr = sqrt(fxlat(i,j)**2 + fxlon(i,j)**2)     
      write(ounit,*) lon, lat, oft, ofr                 
    endif
  enddo 
  enddo 
  close(ounit)
end program drift2gmt

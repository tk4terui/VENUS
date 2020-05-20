program long2short
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
  integer(1)         :: undef
  character(len=128) :: tmpdir = "/tmp/"      
  character(len=128) :: iname                 
  character(len=128) :: jname                 
  character(len=128) :: ofile                 
  character(len=3)   :: findex                
  real    :: iscale, ioffset
  integer(2), allocatable :: fx16(:,:), ilat(:,:), ilon(:,:)
  integer(2), allocatable :: fx16out(:,:)
  call getarg(1,dateorbit)
  call getarg(2,pole)
  call getarg(3,findex)
  if(pole == "NP") then 
    ihem=iNP 
  elseif(pole == "SP") then
    ihem=iSP
  endif
  if(findex == "SST") then 
    undef=-128
  elseif(findex == "IC0") then
    undef=0
  elseif(findex == "SND") then
    undef=-128
  elseif(findex == "SIT") then
    undef=-128
  endif
  ofile = "GW1AM2"//dateorbit//"_"//findex//pole//".dat"  
  open(ounit,file=trim(ofile),action='write',form='unformatted',access='direct',recl=2*nx*ny)
  iname = "AMSR2/"//findex//"/"//dateorbit(1:6)//"/GW1AM2"//dateorbit//"_"//findex//pole//".dat"  
  open(unit=iunit,file=trim(iname),action="read",form='unformatted',access='direct',status="old",recl=2*nx*ny)
  allocate (fx16(nx,ny),fx16out(nx,ny))
  read(iunit,rec=1) ((fx16(i,j),i=1,nx),j=1,ny)    
  close(iunit)
  do i = is, ie
  do j = js, je
    if(fx16(i,j) == iundef(1) .or. &
       fx16(i,j) == iundef(2) .or. &
       fx16(i,j) == iundef(3)) then                
      fx16out(i,j) = undef
    else                                           
      fx16out(i,j) = fx16(i,j)
    endif
  enddo 
  enddo 
  write(ounit,rec=1) ((fx16out(i,j),i=1,nx),j=1,ny) 
  close(ounit)
end program long2short

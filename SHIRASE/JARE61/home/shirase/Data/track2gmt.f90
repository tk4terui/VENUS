program track2gmt
  integer :: ipunit = 30
  integer :: ifunit = 31
  integer :: opunit = 40
  integer :: ofunit = 41
  
  integer :: ifmax
  character(len=128) :: tmpdir = "/tmp/"      
  character(len=128) :: ipfile                
  character(len=128) :: iffile                
  character(len=128) :: opfile                
  character(len=128) :: offile                
  real    :: lat, lon
  real    :: dlat, dlon, mlat, mlon
  character(len=1)   :: NS, WE
  integer :: io
  ipfile = trim(tmpdir)//"position.csv"       
  iffile = trim(tmpdir)//"futurepath.csv"     
  opfile = trim(tmpdir)//"position.txt"       
  offile = trim(tmpdir)//"futurepath.txt"     
  open(ipunit,file=trim(ipfile),action='read' ,form='formatted')
  open(ifunit,file=trim(iffile),action='read' ,form='formatted')
  open(opunit,file=trim(opfile),action='write',form='formatted')
  open(ofunit,file=trim(offile),action='write',form='formatted')
  read(ipunit,'(f2.0,f9.5,A,f5.0,f9.5,A)') dlat,mlat,NS,dlon,mlon,WE
  lat = dlat + (mlat / 60.)
  if(WE == 'E') then
    lon = dlon + (mlon / 60.) 
  else
    lon = - dlon + (mlon / 60.)
  endif
  write(opunit,*) lon,  lat
  
  do while (io==0)
    read(ifunit,'(f2.0,f8.4,A,f4.0,f8.4,A)', IOSTAT=io) dlat,mlat,NS,dlon,mlon,WE
    lat = dlat + (mlat / 60.)
    if(WE == 'E') then
      lon = dlon + (mlon / 60.) 
    else
      lon = - dlon + (mlon / 60.)
    endif
    write(ofunit,*) lon, lat
    write(*,*) lon, lat
  enddo
  close(opunit)
  close(ofunit)
  close(ipunit)
  close(ifunit)
end program track2gmt

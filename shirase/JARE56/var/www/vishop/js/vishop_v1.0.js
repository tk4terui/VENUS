/* _/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/
 Seaice Monitor
  海氷モニタ表示用 Javascript

_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/_/ */
/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Global Value
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
// コンテンツが格納されているURL
// 最新日を再取得する際に必要ですので、適宜更新して下さい。

// 画像が格納されている日付の初期値

var startObj;
var latestObj;

var shwmsg = ["overlay","displaying"];

//var rightClickFlg = true;

var noDataFlg = false;
var noDataFlgOverlay = false;

var overlay = false;

// 画像の拡大領域
var imageZoomArea  = { xl : 0, xr : 700, yt : 0, yb : 700 };
var imageZoomParam = { dx : 0, dy : 0, rx : 1, ry : 1, rfix : true };

var lonRegion = [  20, 140 ];
var latRegion = [ -75, -45 ];
var xRegion = [ 68, 632 ];
var yRegion = [  478, 170 ];

window.onload = initialize;

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. Initialize
   初期設定
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function initialize(){
  startObj = new Date(start.y,start.m-1,start.d);
  latestObj = new Date(latest.y,latest.m-1,latest.d);

  // Set Latest Date
  chgDay(latest.y,latest.m,latest.d);

  chgImg(true);

  makeTimeSlideBar();

  $("#mainimg").on("contextmenu", function(e){ e.preventDefault(); }, false);

  // Mouse wheel
  $(function() {
    $('#mainimg').on("mousewheel",function(){return false});
    $('#mainimg').on("mousewheel",wheelFunc);
  });
  // Mouse drag (zoom)
  $(function() {
    $('#mainimg').on("mousedown",function(){return false});
    $('#mainimg').on("mousedown",mouseOperate);
    $('#mainimg').on("dblclick",resetImageZoom);
  });
}

function wheelFunc(event, delta) {
  $('#mainimg').off("mousewheel",wheelFunc);
  if (delta > 0){
    var flg = true;
    var dir = -1;
  }else if (delta < 0){
    var lty = latest.y;
    var ltm = latest.m;
    var ltd = latest.d;
    if(ltm<10){ ltm = '0'+ltm; }
    if(ltd<10){ ltd = '0'+ltd; }
    var ltdate = lty+''+ltm+''+ltd;

    var chky = document.srch.year.value;
    var chkm = document.srch.month.value;
    if(chkm<10){ chkm = '0'+chkm; }
    var chkd = document.srch.day.value;
    if(chkd<10){ chkd = '0'+chkd; }
    var chkdate = chky+''+ chkm+''+chkd;
    var flg = (parseInt(chkdate)<ltdate);
    var dir = 1;
  }
  if( flg ) {
    dateCal(dir,false).always(function(){
      $('#mainimg').on("mousewheel",wheelFunc);
    });
  } else {
    $('#mainimg').on("mousewheel",wheelFunc);
  }
  return false; // prevent default
}

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. Set Latest
  「最新表示」を押したときの動作設定
   最新日付格納ファイルを再取得する。
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function setLatest(){
  animStop();

  chgDay(latestObj.getFullYear(), latestObj.getMonth() + 1, latestObj.getDate());
  timeSlide.setAttr({"dateNow":latestObj});
  timeSlide.updateCalendar("dateCalendar",timeSlide.dateNow);
  chgImg(true);
}

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. setDateValue
  入力フォームから選択日付を取得し、0埋めをして返す
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function setDateValue() {
  var ty  = parseInt(document.srch.year.value,10);
  var tm  = parseInt(document.srch.month.value,10);
  var td  = parseInt(document.srch.day.value,10);

  if(tm<10){
    tm = '0'+tm;
  }
  if(td<10){
    td = '0'+td;
  }

  return {
    y  : ty,
    m  : tm,
    d  : td
  };
}
/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. Change Image
  指定日の画像表示
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function chgImg(loading,animation){
  var rcnt = document.srch.base.length;
  var obs = setDateValue();
  var img = new Image();
  var file;

  var df = new $.Deferred();

  if( loading ) document.images["baseimg"].src = 'images/loading.gif';

  for(i=0; i<rcnt; i++){
    if(document.srch.base[i].checked==true){
      var tprd = document.srch.base[i].value;
    }
  }
  if( tprd == "SSTM" ) {
    overlay = true;
    var tprd1 = tprd;
    tprd = "IC0M";
  } else {
    overlay = false;
    $("#overlay").hide();
  }

  var tdate = obs.y+''+obs.m+''+obs.d;
  if(parseInt(tdate)<=20111003){
    var sensor = 'P1AME';
  }else if(parseInt(tdate)<=20120723){
    var sensor = 'WNDSI';
  }else{
    var sensor = 'AM2SI';
  }

  var area = 'S';

  noDataFlg = false;
  img.src = 'data/'+obs.y+''+obs.m+'/'+sensor+tdate+tprd+'_'+area+'P.png';

  img.onload = function(){
    if( animation && $("#dateAnimButton").attr("class")=="stop" ) {
      df.reject();
    } else {
      document.images["baseimg"].src = img.src;
      zoomImage(false);
      delete img;
      chgOverlayImg(animation,tprd1,sensor,area).then(function(){
        df.resolve();
      });
    }
  }

  img.onerror = function(){
    noDataFlg = true;
    document.images["baseimg"].src = "images/no_data_base.png";
    $("#overlay").hide();
    zoomImage(false);
    delete img;
    df.resolve();
  }

  return df.promise();
}


function chgOverlayImg(animation,tprd,sensor,area){
  var rcnt = document.srch.base.length;
  var obs = setDateValue();
  var img = new Image();
  var file;

  var df = new $.Deferred();

  if( !overlay ) {
    return df.resolve().promise();
  }

  noDataFlgOverlay = false;
  var tdate = obs.y+''+obs.m+''+obs.d;
  img.src = 'data/'+obs.y+''+obs.m+'/'+sensor+tdate+tprd+'_'+area+'P.png';

  img.onload = function(){
    document.images["overlayimg"].src = img.src;
    $("#overlay").show();
    zoomImage(false);
    delete img;
    df.resolve();
  }

  img.onerror = function(){
    noDataFlgOverlay = true;
    $("#overlay").hide();
    zoomImage(false);
    delete img;
    df.resolve();
  }

  return df.promise();
}

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. chgDay
  日付を切り替えた際のドロップダウンリスト再作成
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function chgDay(inY,inM,inD){
  var tForm = 'srch';
  var tYer  = parseInt(inY,10);
  var tMon  = parseInt(inM,10);
  var tDay  = parseInt(inD,10);

  if (tMon=='4'||tMon=='6'||tMon=='9'||tMon=='11'){
    var mend = 30;
  }else if (tMon=='2'){
    if((tYer%4 ==0)&&((tYer%100 !=0)||(tYer%400 ==0))){
      var mend = 29;
    }else{
      var mend = 28;
    }
  }else{
    var mend = 31;
  }

  var work = document.forms[tForm].year;
  var latesty = latestObj.getFullYear();
  work.options.length = parseInt(latesty-start.y+1,10);
  var j = 0;
  for (var i=start.y;i<=latesty;i++){
    work.options[j].value = i;
    work.options[j].text  = i;
    if (work.options[j].value == tYer){
      work.options[j].selected = true;
    }
    j++;
  }

  var work = document.forms[tForm].month;
  work.options.length = 12;
  for (var i=0;i<12;i++){
    work.options[i].value = i+1;
    work.options[i].text  = i+1;
    if (work.options[i].value == tMon){
      work.options[i].selected = true;
    }
  }

  var work = document.forms[tForm].day;
  work.options.length   = mend;
  for (i=0;i<mend;i++){
    work.options[i].value = i+1;
    work.options[i].text  = i+1;
    if (work.options[i].value == tDay){
      work.options[i].selected = true;
    }
  }
}

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. Date Calculate
  前後の日付計算
 *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function dateCal(tflg,loading,animation){
  var ty = parseInt(document.srch.year.value,10);
  var tm = parseInt(document.srch.month.value,10);
  var td = parseInt(document.srch.day.value,10);

  var df = new $.Deferred();

  if( !animation ) animStop();

  var dtobj = new Date(ty,tm-1,td+parseInt(tflg,10));

  if( dtobj - startObj  < 0 || dtobj - latestObj > 0 ) {
    df.reject();
    return df.promise();
  }

  var cky = dtobj.getFullYear();
  var ckm = dtobj.getMonth()+1;
  var ckd = dtobj.getDate();

  document.srch.year.value = cky;
  document.srch.month.value = ckm;
  document.srch.day.value = ckd;

  chgDay(cky,ckm,ckd);
  chgImg(loading,animation).then(function(){
    timeSlide.setAttr({"dateNow":new Date(cky,ckm-1,ckd)});
    timeSlide.updateCalendar("dateCalendar",timeSlide.dateNow);
  }).always(function(){
    df.resolve();
  });
  return df.promise();
}


function overlayPoint() {
  if( $("#overlaypointButton input").val() == 'displaying') {
    $("#overlaypointButton input")
      .val('Overlay')
      .css('background-color','');
    $("#pointOverlayImg").hide();
    $("#overlaypointLat input").off('change');
    $("#overlaypointLon input").off('change');
    return;
  }

  $("#overlaypointButton input")
    .val('displaying')
    .css('background-color','hotpink');
  $("#pointOverlayImg").show();

  $("#overlaypointLat input").on('change',setOverlayPointPos);
  $("#overlaypointLon input").on('change',setOverlayPointPos);

  $("#pointOverlayImg").html('<circle stroke="black" fill="yellow">');

  setOverlayPointPos();
}


function setOverlayPointPos() {
  var lat = Number(document.srch.pointlat.value);
  var lon = Number(document.srch.pointlon.value);

  if( lat == undefined || lon == undefined || isNaN(lat) || isNaN(lon) ) {
    alert("please input correct LAT/LON value");
    overlayPoint();
  }
  if( lat < latRegion[0] || lat > latRegion[1] ||
    lon < lonRegion[0] || lon > lonRegion[1] ) {
    $("#pointOverlayImg circle").hide();
    return;
  }

  var pos = latlon2xy(lat,lon);
  var dr = 5 * Math.max(imageZoomParam.rx,imageZoomParam.ry);
  var dl = 1 * Math.max(imageZoomParam.rx,imageZoomParam.ry);
  $("#pointOverlayImg circle").show();
  d3.selectAll("#pointOverlayImg circle")
    .attr('cx',pos[0])
    .attr('cy',pos[1])
    .attr('r',dr)
    .attr('stroke-width',dl);
}


function latlon2xy(lat,lon) {
  var ax = ( lon - lonRegion[0] ) / ( lonRegion[1] - lonRegion[0] );

  var q  = Math.log(Math.tan(Math.PI*(lat+90)/360));
  var q0 = Math.log(Math.tan(Math.PI*(latRegion[0]+90)/360));
  var q1 = Math.log(Math.tan(Math.PI*(latRegion[1]+90)/360));
  var ay = ( q - q0 ) / ( q1 - q0 );

  var x0 = xRegion[0] + ax * ( xRegion[1] - xRegion[0] );
  var y0 = yRegion[0] + ay * ( yRegion[1] - yRegion[0] );

  var x = Math.floor( ( x0-imageZoomParam.dx ) * imageZoomParam.rx );
  var y = Math.floor( ( y0-imageZoomParam.dy ) * imageZoomParam.ry );
  return [ x, y ];
}

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. mouseOperate
 マウス操作
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function mouseOperate(e) {

  if( e.button == 0 ) {
    if( e.ctrlKey ) {
      var mode = 1;
    } else {
      var mode = 2;
    }
  } else if( e.button == 2 ) {
    var mode = 1;
  } else {
    return false;
  }

  var clrect = $("#mainimg")[0].getBoundingClientRect();
  var q0 = { x : e.clientX, y : e.clientY };
  var p0 = { x : q0.x-clrect.left, y : q0.y-clrect.top };
console.log(p0);

  if( mode == 2 ) {
    var $rect = $('<div id="zoomrect">')
      .css({
        position : "absolute",
        border : "solid 2px black",
        width : 0,
        height : 0
      });
    $("#mainimg").append($rect);
//  } else {
//    if( rightClickFlg ) return false;
  }

  $(document).on("mousemove",function(){return false;});
  $(document).on("mouseup"  ,function(){return false;});

  $(document).on("mousemove",mouseFunc);
  $(document).on("mouseup"  ,releaseFunc);

  var x0, x1, y0, y1;
  function mouseFunc(e){
    var xx = e.clientX - clrect.left;
    var yy = e.clientY - clrect.top;

    if( mode == 1 ) {
      var dx = ( xx - p0.x ) / imageZoomParam.rx;
      var dy = ( yy - p0.y ) / imageZoomParam.ry;

      var w0 = imageZoomArea.xr - imageZoomArea.xl;
      var h0 = imageZoomArea.yb - imageZoomArea.yt;
      dx = Math.max( Math.min( dx, imageZoomParam.dx ), imageZoomParam.dx-w0*(1-1/imageZoomParam.rx) );
      dy = Math.max( Math.min( dy, imageZoomParam.dy ), imageZoomParam.dy-h0*(1-1/imageZoomParam.ry) );

      imageZoomParam.dx = imageZoomParam.dx - dx;
      imageZoomParam.dy = imageZoomParam.dy - dy;
      p0.x = xx;
      p0.y = yy;

      zoomImage(true);

    } else {
      if( imageZoomParam.rfix ) {
        var dd = Math.max( Math.abs(xx-p0.x), Math.abs(yy-p0.y) )
        xx = p0.x + (xx-p0.x) / Math.abs(xx-p0.x) * dd;
        yy = p0.y + (yy-p0.y) / Math.abs(yy-p0.y) * dd;
	if( xx < imageZoomArea.xl || xx > imageZoomArea.xr ) {
	        xx = Math.min( Math.max( xx, imageZoomArea.xl ), imageZoomArea.xr );
        	var dd = Math.abs(xx-p0.x);
	        yy = p0.y + (yy-p0.y) / Math.abs(yy-p0.y) * dd;
	}
	if( yy < imageZoomArea.yt || yy > imageZoomArea.yb ) {
        	yy = Math.min( Math.max( yy, imageZoomArea.yt ), imageZoomArea.yb );
        	var dd = Math.abs(yy-p0.y);
        	xx = p0.x + (xx-p0.x) / Math.abs(xx-p0.x) * dd;
	}
      }

      x0 = Math.min( Math.max( Math.min( p0.x, xx ), imageZoomArea.xl ), imageZoomArea.xr );
      x1 = Math.min( Math.max( Math.max( p0.x, xx ), imageZoomArea.xl ), imageZoomArea.xr );
      y0 = Math.min( Math.max( Math.min( p0.y, yy ), imageZoomArea.yt ), imageZoomArea.yb );
      y1 = Math.min( Math.max( Math.max( p0.y, yy ), imageZoomArea.yt ), imageZoomArea.yb );

      $rect.css({
        left   : x0-1,
        top    : y0-1,
        width  : x1-x0-2,
        height : y1-y0-2,
      });
    }
  }


  function releaseFunc(){
    if( mode == 2 ) {
      if( x0 && x1 && y0 && y1 ) {
        var dx0 = imageZoomArea.xr - imageZoomArea.xl;
        var dy0 = imageZoomArea.yb - imageZoomArea.yt;

        var xs = (x0-imageZoomArea.xl) / imageZoomParam.rx;
        var ys = (y0-imageZoomArea.yt) / imageZoomParam.ry;

        var rx = dx0 / (x1-x0);
        var ry = dy0 / (y1-y0);

        if( imageZoomParam.rfix ) {
          var rr = Math.max(rx,ry);
          rx = rr;
          ry = rr;
        }

        imageZoomParam.rx = imageZoomParam.rx * rx;
        imageZoomParam.ry = imageZoomParam.ry * ry;
        imageZoomParam.dx = imageZoomParam.dx + xs;
        imageZoomParam.dy = imageZoomParam.dy + ys;

        zoomImage(true);

//        if( rightClickFlg ) {
//          $("#mainimg").on("contextmenu", function(e){ e.preventDefault(); }, false);
//          rightClickFlg = false;
//        }
      }
    }

    $(document).off("mousemove",mouseFunc);
    $(document).off("mouseup",releaseFunc);
    $(document).off("mouseup");
    if( mode == 2 ) $rect.remove();
  }

};

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. zoomImage
 画像の拡大操作
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function zoomImage(make,id) {
  if( $("#base_copy").size() == 0 ) {
    if( !make ) return;

    var $p = $('<p id="base_copy">').css({
      display : "block",
      width   : imageZoomArea.xr - imageZoomArea.xl,
      height  : imageZoomArea.yb - imageZoomArea.yt,
      left    : imageZoomArea.xl,
      top     : imageZoomArea.yt,
      overflow : "hidden",
      position : "absolute",
      margin : 0,
      offset : 0,
    }).appendTo($("#mainimg>div"));

    $("#base img").clone().attr("id","base_copy_image").appendTo($p);

    var $p = $('<p id="overlay_copy">').css({
      display : "block",
      width   : imageZoomArea.xr - imageZoomArea.xl,
      height  : imageZoomArea.yb - imageZoomArea.yt,
      left    : imageZoomArea.xl,
      top     : imageZoomArea.yt,
      overflow : "hidden",
      position : "absolute",
      margin : 0,
      offset : 0,
    }).appendTo($("#mainimg>div"));

    $("#overlay img").clone().attr("id","overlay_copy_image").appendTo($p);
  }

  if( noDataFlg ) {
    $("#base_copy img:first").hide();
  } else {
    $("#base_copy img:first").show();
  }

  var w0 = $("#base img").width();
  var h0 = $("#base img").height();

  var w = Math.floor( w0 * imageZoomParam.rx );
  var h = Math.floor( h0 * imageZoomParam.ry );
  var xs = -Math.floor( (imageZoomArea.xl+imageZoomParam.dx) * imageZoomParam.rx )
  var ys = -Math.floor( (imageZoomArea.yt+imageZoomParam.dy) * imageZoomParam.ry )

  $("#base_copy img").css({
    position : "absolute",
    left   : xs,
    top    : ys,
    width  : w,
    height : h
  });

  $("#base_copy_image").attr("src",$("#base img").attr("src"));

  if( overlay ) {
    if( noDataFlgOverlay ) {
      $("#overlay_copy img:first").hide();
    } else {
      $("#overlay_copy img:first").show();

      $("#overlay_copy img").css({
        position : "absolute",
        left   : xs,
        top    : ys,
        width  : w,
        height : h
      });

      $("#overlay_copy_image").attr("src",$("#overlay img").attr("src"));
    }
  } else {
    $("#overlay_copy img:first").hide();
  }

  setOverlayPointPos();
}

/* *-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*
 Func. resetImageZoom
 画像拡大の解除
*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-* */
function resetImageZoom() {
  imageZoomParam = { dx : 0, dy : 0, rx : 1, ry : 1, rfix : true };
  $("#base_copy").remove();
  $("#overlay_copy").remove();
  setOverlayPointPos();
//  $("#mainimg").off("contextmenu");
//  rightClickFlg = true;
}

//-->

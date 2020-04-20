
var saveTs, saveTe;
var flgSaveAnimation;
var filenameFlg;
var first = true;
var saveMode;

var fileFormats    = ["WebM","GIF"];
var fileExtensions = ["webm","gif"];
var fileFormatNum = 0;

function makeSavePopup(mode) {
	saveMode = mode;

	$("#gray_panel").show();
	$("#popupWindow").show();

	$("#gray_panel").on('click',finishSavePopup);

	var $target = $("#mainimg");
	var x0 = $target.offset().left;
	var y0 = $target.offset().top;
	var w0 = $target.outerWidth(true);
	var h0 = $target.outerHeight(true);

	$("#popupWindow")
		.css("left",x0)
		.css("top",y0)
		.css("width",w0)
		.css("height",h0);

	var h = $("#popupWindow > div").outerHeight(true);
	$("#popupWindow > div").css("top",0.5*(h0-h));

	filenameFlg = true;

	if( saveMode == 2 ) {
		$("#saveTimeSpanDiv").hide();
		$("#saveFormatDiv").hide();

		if( filenameFlg ) {
			var ext = "png";
			var yy = parseInt(document.srch.year.value);
			var mm = parseInt(document.srch.month.value);
			var dd = parseInt(document.srch.day.value);
			document.save.fname.value = 'vishop_'+yy+''+mm+''+dd+'.'+ext;
		}

	} else {
		$("#saveTimeSpanDiv").show();
		$("#saveFormatDiv").show();

		var yys = parseInt(document.srch.year.value);
		var mms = parseInt(document.srch.month.value);
		var dds = parseInt(document.srch.day.value);
		var yye = latestObj.getFullYear();
		var mme = latestObj.getMonth()+1;
		var dde = latestObj.getDate();

		saveTs = new Date(yys,mms-1,dds);
		saveTe = latestObj;

		var yys = saveTs.getFullYear();
		var mms = saveTs.getMonth()+1;
		var dds = saveTs.getDate();
		var yye = saveTe.getFullYear();
		var mme = saveTe.getMonth()+1;
		var dde = saveTe.getDate();
		chgDaySelector(yys,mms,dds,"s");
		chgDaySelector(yye,mme,dde,"e");

		if( first ) {
			for ( var i=0; i<fileFormats.length; i++ ) {
				$("<option>").text(fileFormats[i]).appendTo($("#saveFormatDiv select"));
			}

			timeSlide.makeCalendar("saveTimeStartCalendar",saveTs,[0,0,1,0,0,0]);
			timeSlide.makeCalendar("saveTimeEndCalendar"  ,saveTe,[0,0,1,0,0,0]);
			$("#saveTimeStartCalendar").hide();
			$("#saveTimeEndCalendar"  ).hide();
			$("#saveTimeStartCalendar").click(function(e){e.stopPropagation()});
			$("#saveTimeEndCalendar"  ).click(function(e){e.stopPropagation()});

			$(document).on("click",function(){
				hideCalendar(100);
			});
	
			timeSlide.onchangeCalendar("saveTimeStartCalendar",function(d){
				saveTs = d;
				checkDateCond("s");
				hideCalendar(100);
			});
			timeSlide.onchangeCalendar("saveTimeEndCalendar",function(d){
				saveTe = d;
				checkDateCond("e");
				hideCalendar(100);
			});

			$("div#saveTimeStart select[name='yys']" ).on('change',function(){
				saveTs = timeSlide.__dateParse__(this.value, "yyyy", saveTs);
				checkDateCond("s");
			});
			$("div#saveTimeStart select[name='mms']" ).on('change',function(){
				saveTs = timeSlide.__dateParse__(this.value, "MM", saveTs);
				checkDateCond("s");
			});
			$("div#saveTimeStart select[name='dds']" ).on('change',function(){
				saveTs = timeSlide.__dateParse__(this.value, "dd", saveTs);
				checkDateCond("s");
			});
			$("div#saveTimeEnd select[name='yye']" ).on('change',function(){
				saveTe = timeSlide.__dateParse__(this.value, "yyyy", saveTe);
				checkDateCond("e");
			});
			$("div#saveTimeEnd select[name='mme']" ).on('change',function(){
				saveTe = timeSlide.__dateParse__(this.value, "MM", saveTe);
				checkDateCond("e");
			});
			$("div#saveTimeEnd select[name='dde']" ).on('change',function(){
				saveTe = timeSlide.__dateParse__(this.value, "dd", saveTe);
				checkDateCond("e");
			});
			$("#saveFormatDiv select").on('change',function(){
				fileFormatNum = parseInt(document.save.fileFormat.selectedIndex);
				checkDateCond();
			});
			$("#saveFrameRateDiv input").on('change',function(){
				printAnimLog();
			});
			$("#saveFileNameDiv input").on('change',function(){
				filenameFlg = false;
			});

			first = false;
		} else {
			timeSlide.updateCalendar("saveTimeStartCalendar",saveTs);
			timeSlide.updateCalendar("saveTimeEndCalendar",  saveTe);
		}

		$("#saveTimeStartCalendarIcon").on("click",function(e){ showCalendar(e,"saveTimeStartCalendar",100); });
		$("#saveTimeEndCalendarIcon"  ).on("click",function(e){ showCalendar(e,"saveTimeEndCalendar"  ,100); });

		checkDateCond("e");
	}

	document.save.width.value = $("div#mainimg").width();
	document.save.frate.value = 10;

	return;


	function checkDateCond(id) {
		if( saveTe - saveTs <= 0 ) {
			if( id == "s" ) {
				saveTe = new Date((saveTs-0)+24*3600*1000);
			} else {
				saveTs = new Date((saveTe-0)-24*3600*1000);
			}
		}
		if( saveTe - latestObj > 0 ) {
			saveTe = latestObj;
			if( saveTs - (latestObj-24*3600*1000) > 0 ) {
				saveTs = new Date(latestObj-24*3600*1000);
			}
		}
		if( saveTs - startObj < 0 ) {
			saveTs = startObj;
			if( saveTe - (startObj+24*3600*1000) < 0 ) {
				saveTe = new Date(startObj-0+24*3600*1000);
			}
		}
		timeSlide.updateCalendar("saveTimeStartCalendar",saveTs);
		timeSlide.updateCalendar("saveTimeEndCalendar"  ,saveTe);

		var yys = saveTs.getFullYear();
		var mms = saveTs.getMonth()+1;
		var dds = saveTs.getDate();
		var yye = saveTe.getFullYear();
		var mme = saveTe.getMonth()+1;
		var dde = saveTe.getDate();
		chgDaySelector(yys,mms,dds,"s");
		chgDaySelector(yye,mme,dde,"e");

		if( filenameFlg ) {
			var ext = fileExtensions[fileFormatNum];

			var ts = timeSlide.__dateFormat__(saveTs,"yyyyMMdd");
			var te = timeSlide.__dateFormat__(saveTe,"yyyyMMdd");
			var vname = setVarName();
			document.save.fname.value = "vishop_"+vname+'_'+ts+'_'+te+'.'+ext;
		}

		printAnimLog();
	}

	function showCalendar(e,id,dt) {
		e.stopPropagation();
		$("#"+id).toggle(dt);
	}

	function hideCalendar(dt) {
		$("#saveTimeStartCalendar").hide(dt);
		$("#saveTimeEndCalendar"  ).hide(dt);
	}

	function chgDaySelector(inY,inM,inD,id){
		var tYer  = parseInt(inY,10);
		var tMon  = parseInt(inM,10);
		var tDay  = parseInt(inD,10);
		var work, mend;
		var j = 0;

		if (tMon=='4'||tMon=='6'||tMon=='9'||tMon=='11'){
			mend = 30;
		}else if (tMon=='2'){
			if((tYer%4 ==0)&&((tYer%100 !=0)||(tYer%400 ==0))){
				mend = 29;
			}else{
				mend = 28;
			}
		}else{
			mend = 31;
		}

		work = document.save["yy"+id];
		var latesty = latestObj.getFullYear();
		var starty  = startObj.getFullYear();
		work.options.length = parseInt(latesty-starty+1,10);
		for (i=starty;i<=latesty;i++){
			work.options[j].value = i;
			work.options[j].text  = i;
			if (work.options[j].value == tYer){
				work.options[j].selected = true;
			}
			j++;
		}

		work = document.save["mm"+id];
		work.options.length = 12;
		for (i=0;i<12;i++){
			work.options[i].value = i+1;
			work.options[i].text  = i+1;
			if (work.options[i].value == tMon){
				work.options[i].selected = true;
			}
		}

		work = document.save["dd"+id];
		work.options.length = mend;
		for (i=0;i<mend;i++){
			work.options[i].value = i+1;
			work.options[i].text  = i+1;
			if (work.options[i].value == tDay){
				work.options[i].selected = true;
			}
		}
	}

	function printAnimLog() {
		var nstep = ( saveTe - saveTs ) / (24*3600*1000) + 1;
		var frate = document.save.frate.value;
		var time = nstep / frate;
		if( time >= 0.01 ) {
			var n = 1 - Math.floor(Math.min(Math.max(Math.log(time)*Math.LOG10E,-1),1));
			time = time.toFixed(n);
		} else {
			time = time.toPrecision(1);
		}
		switch( document.srch.lang.value ) {
			case('e') : $("#saveLog").text("total : "+nstep+" frame ["+time+" sec]"); break;
			case('j') : $("#saveLog").text("total : "+nstep+" フレーム ["+time+" 秒]"); break;
		}
	}
}


function setSave() {
	disableSaveButtons();

	$("#gray_panel").off('click');

	var fname = document.save.fname.value;
	var width = parseInt(document.save.width.value);

	if( saveMode == 1 ) {
		var frate = parseInt(document.save.frate.value);

		var yys = document.save.yys.value;
		var mms = document.save.mms.value;
		var dds = document.save.dds.value;
		var yye = document.save.yye.value;
		var mme = document.save.mme.value;
		var dde = document.save.dde.value;

		var progress = $("#saveProgress progress")[0];

		progress.value = 0;
		progress.max = ( saveTe - saveTs ) / (24*3600*1000) + 1;

		var txt = "Drawing Frames : 0 / "+progress.max+" [0%]";
		$("#saveProgress div").text(txt);

		$("#saveProgress").show();

		flgSaveAnimation = true;
		saveAnimation(fname,frate,width,saveTs,saveTe,progress,finishSavePopup);
	} else {
		saveImage(fname,width,finishSavePopup);
	}
}


function finishSavePopup() {
	$("#saveProgress").hide();
	$("#gray_panel").hide();
	$("#popupWindow").hide();
	enableSaveButtons();
}

function disableSaveButtons() {
	$("#popupWindow input").attr("disabled","disabled");
	$("#popupWindow select").attr("disabled","disabled");
	$("#saveCancel").removeAttr("disabled");

	$("#saveTimeStartCalendarIcon").off("click");
	$("#saveTimeEndCalendarIcon"  ).off("click");
}

function enableSaveButtons() {
	$("#popupWindow input").removeAttr("disabled","disabled");
	$("#popupWindow select").removeAttr("disabled","disabled");
}


function saveImage(fname,w,finishcallback) {
	if( fname == "" ) {
		alert("please input file name");
		return false;
	}

	var ctx = $("#saveCanvas")[0].getContext("2d");
	var h = w;
	ctx.canvas.width  = w;
	ctx.canvas.height = h;

	var yy = parseInt(document.srch.year.value);
	var mm = parseInt(document.srch.month.value);
	var dd = parseInt(document.srch.day.value);
	var tt = new Date(yy,mm-1,dd);

	var fname0 = setMainImageName(tt);
	var fname1 = setOverlayImageName(tt);

	setImage(fname0,w,h).then(function() {
		return setImage(fname1,w,h,true);
	}).then(function(){
		setOverlayPoint(w,h);
		finalizeImage(fname);
	});

	function finalizeImage(fname){
		var type = "image/png";
		var url = $("#saveCanvas")[0].toDataURL(type);

		var bin = atob(url.split(',')[1]);
		var buffer = new Uint8Array(bin.length);
		for( var i=0; i<bin.length; i++ ) {
			buffer[i] = bin.charCodeAt(i);
		}
		var blob = new Blob([buffer.buffer],{type:type});
		var url = window.URL.createObjectURL(blob);

		var tmp = fname.split(".");
		if( tmp[tmp.length-1] != "png" ) fname += ".png";

		var a = d3.select("body")
			.append("a")
			.attr("download",fname)
			.attr("href",url)
			.style("display","none");

		a.node().click();

		setTimeout(function(){
			window.URL.revokeObjectURL(url)
			a.remove();
			finishcallback();
		},10);
	}
}


function saveAnimation(fname,frate,w,ts,te,progress,finishcallback) {
	var animTimer;

	if( fname == "" ) {
		alert("please input file name");
		return false;
	}

	var ctx = $("#saveCanvas")[0].getContext("2d");
	var h = w;
	ctx.canvas.width  = w;
	ctx.canvas.height = h;

	if( fileFormats[fileFormatNum] == "WebM" ) {
		var video = new Whammy.Video(frate);
	} else if( fileFormats[fileFormatNum] == "GIF" ) {
        	var video = new GIFEncoder();
        	video.setRepeat(0);
        	video.setDelay(1000/frate);
        	video.setSize(w, h);
        	video.start();
	}

	var noDataFlg = false;

	stepAnimation(w,h);

	return;


	function stepAnimation(w,h) {
		if( !flgSaveAnimation ) {
			clearTimeout(animTimer);
			return;
		}

		var date = new Date( (ts-0) + progress.value * 24 * 3600 * 1000 );
		var fname0 = setMainImageName(date);
		var fname1 = setOverlayImageName(date);

		setImage(fname0,w,h).then(function() {
			return setImage(fname1,w,h,true);
		}).then(function(){
			setOverlayPoint(w,h);

			progress.value++;

			var percent = Math.round( (progress.value/progress.max) * 100 );
			var txt = "Drawing Frames : "+progress.value+" / "+progress.max+" ["+percent+"%]";
			$("#saveProgress div").text(txt);

			if( fileFormats[fileFormatNum] == "WebM" ) {
				video.add(ctx);
			} else if( fileFormats[fileFormatNum] == "GIF" ) {
				video.addFrame(ctx);
			}

			if( progress.value < progress.max ){
				animTimer = setTimeout(function(){
					stepAnimation(w,h);
				},10);
			} else {
				finalizeVideo();
			}
		});
	}

	function finalizeVideo(){
		$("#saveProgress div").text("Compliing Video");

		if( fileFormats[fileFormatNum] == "WebM" ) {
			var output = video.compile();
		} else if( fileFormats[fileFormatNum] == "GIF" ) {
			var bin = new Uint8Array(video.stream().bin);
			var output = new Blob([bin.buffer], {type:'image/gif'});
		}

		var url = webkitURL.createObjectURL(output);

		var ext = fileExtensions[fileFormatNum];

		var tmp = fname.split(".");
		if( tmp[tmp.length-1] != ext ) fname += ext;

		var a = d3.select("body")
			.append("a")
			.attr("download",fname)
			.attr("href",url)
			.style("display","none");
		a.node().click();

		setTimeout(function(){
			window.URL.revokeObjectURL(url)
			a.remove();
			finishcallback();
		},10);
	}
}

function setMainImageName(date) {
	var yy = timeSlide.__dateFormat__(date,'yyyy');
	var mm = timeSlide.__dateFormat__(date,'MM');
	var dd = timeSlide.__dateFormat__(date,'dd');

	var area  = document.srch.area.value;
	var tdate = yy + '' + mm + '' + dd;
	if(date<=new Date(2011,10,3)){
		sensor = 'P1AME';
	}else if(date<=new Date(2012,7,23)){
		sensor = 'WNDSI';
	}else{
		sensor = 'AM2SI';
	}

	var vname = setVarName();
	var ext   = setExtension();

	return 'data/'+yy+''+mm+'/'+sensor+tdate+vname+'_'+area+'P.'+ext;
}

function setOverlayImageName(date) {
	var yy = timeSlide.__dateFormat__(date,'yyyy');
	var mm = timeSlide.__dateFormat__(date,'MM');
	var dd = timeSlide.__dateFormat__(date,'dd');

	var area  = document.srch.area.value;
	var tdate = yy + '' + mm + '' + dd;
	if(date<=new Date(2011,10,3)){
		sensor = 'P1AME';
	}else if(date<=new Date(2012,7,23)){
		sensor = 'WNDSI';
	}else{
		sensor = 'AM2SI';
	}

	var vname = 'SSTM';
	var ext   = setExtension();

	return 'data/'+yy+''+mm+'/'+sensor+tdate+vname+'_'+area+'P.'+ext;
}


function setImage(fname,w,h,overlayflg) {
	var df = new $.Deferred();

	if( overlayflg && !overlay ) {
		return df.resolve().promise();
	}

	var img = new Image();
	img.src = fname;

	img.onload = function() {
		var w0 = img.width;
		var h0 = img.height;

		var ctx = $("#saveCanvas")[0].getContext("2d");
		if( !( imageZoomParam.rx == 1 && imageZoomParam.ry == 1 ) ) {
			var w1 = imageZoomArea.xr-imageZoomArea.xl;
			var h1 = imageZoomArea.yb-imageZoomArea.yt;

			var rx = img.width  / $("div#mainimg").width();
			var ry = img.height / $("div#mainimg").height();

			var srcX = Math.floor( (imageZoomArea.xl+imageZoomParam.dx)*rx );
			var srcY = Math.floor( (imageZoomArea.yt+imageZoomParam.dy)*ry );
			var srcW = Math.floor( w1 * rx / imageZoomParam.rx );
			var srcH = Math.floor( h1 * ry / imageZoomParam.ry );
			var dstX = Math.floor( imageZoomArea.xl * rx * w / w0 );
			var dstY = Math.floor( imageZoomArea.yt * ry * h / h0 );
			var dstW = Math.floor( w1 * rx * w / w0 );
			var dstH = Math.floor( h1 * ry * h / h0 );
			ctx.drawImage( img, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH );
		} else {
			ctx.drawImage(img,0,0,w0,h0,0,0,w,h);
		}

		df.resolve();
	};
	img.onerror = function() {
		if( !overlayflg ) {
			img.src = "images/no_data_base.png";
		}
		df.resolve();
	}
	return df.promise();
}

function setOverlayPoint(w,h) {
	if( $("#overlaypointButton input").val() != 'displaying') return;

	var lat = Number(document.srch.pointlat.value);
	var lon = Number(document.srch.pointlon.value);
	var pos = latlon2xy(lat,lon);
	var dr = 5 * Math.max(imageZoomParam.rx,imageZoomParam.ry);
	var dl = 1 * Math.max(imageZoomParam.rx,imageZoomParam.ry);

	var ctx = $("#saveCanvas")[0].getContext("2d");

	var x = pos[0] * w / $("div#mainimg").width();
	var y = pos[1] * h / $("div#mainimg").height();

	ctx.beginPath();
	ctx.arc(x,y,dr,0,Math.PI*2,true);
	ctx.fillStyle = 'yellow';
	ctx.fill();
	ctx.strokeStyle = 'black';
	ctx.lineWidth = dl;
	ctx.stroke();

	return;
}

function stopSave() {
	flgSaveAnimation = false;
	finishSavePopup();
}


function setVarName() {
  	var rcnt = document.srch.base.length;
	var vname;
	for(i=0; i<rcnt; i++){
		if(document.srch.base[i].checked==true){
			var tprd = document.srch.base[i].value;
		}
	}
	if( tprd == "SSTM" ) {
		tprd = "IC0M";
	}
	return tprd;
}


function setExtension() {
	return 'png';
/*
  	var rcnt = document.srch.base.length;
	var ext;
	for(i=0; i<rcnt; i++){
		if(document.srch.base[i].checked==true){
			var tprd = document.srch.base[i].value;
		}
	}
	switch(tprd){
		case "ITD":
			ext = 'png';
		break;
		case "SIC":
			ext = 'png';
		break;
	}

	return ext;
*/
}



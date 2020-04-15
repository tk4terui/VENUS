"use strict";

var timeSlide;
var timeAnim;
var animDelayTime = 100;
function makeTimeSlideBar() {
//	var tmin = new Date(2012,6,24);
//	var tmax = new Date(2014,2,28);
	var tmin = startObj;
	var tmax = latestObj;
//	var ts = new Date(2013,0,1);
	var date = tmax;
	timeSlide = new TimeSlideBar("timeSlideBar",tmin,tmax,{
		dateNow   : date,
		dateLControl : null,
//		dateLControl : ts,
		dateRControl : null,
//		axisTicksOrient : "bottom",
//		axisTicksTxtFormat : [[ d3.time.format("%Y-%m-%d"), function() { return true; } ]],
		axisTicksTxtFormat : [
			[d3.time.format("%Y"), function() { return true; }],
			[d3.time.format("%b"), function(d) { return d.getMonth(); }],
			[d3.time.format("%m/%d"), function(d) { return d.getDate() != 1; }],
			[d3.time.format("%d"), function(d) { return d.getDay() && d.getDate() != 1; }],
			[d3.time.format("%I %p"), function(d) { return d.getHours(); }],
			[d3.time.format("%I:%M"), function(d) { return d.getMinutes(); }],
//			[d3.time.format("%H:%M"), function(d) { return d.getHours(); }],
//			[d3.time.format("%H:%M"), function(d) { return d.getMinutes(); }],
			[d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
			[d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
		],
//		axisTicksTxtRotate : 0,
		axisTicksTxtAnchor : "center",
		axisTicksNum : 4,
//		axisTicksTxtDX : null,
//		axisTicksTxtDY : null,
	});

	timeSlide.makeAxis("timeSlideAxis");


	timeSlide.makeCalendar("dateCalendar",date,[0,0,1,0,0,0]);
	$("#dateCalendar").hide();
	$("#dateCalendar").click(function(e){e.stopPropagation()});
	var dt = 100;
	$("#dateCalendarIcon").on("click",function(e){ showCalendar(e,"dateCalendar",dt); });
	timeSlide.onchangeCalendar("dateCalendar",function(d){
		timeSlide.setAttr({"dateNow":d});
		$("#dateCalendar").hide(dt);
		update();
	});


	$(document).on("click",hidefunc);

	function showCalendar(e,id,dt) {
		e.stopPropagation();
		$("#"+id).toggle(dt);
	}
	function hidefunc() {
		$("#dateCalendar").hide(dt);
	};


	timeSlide.onmouseup(function(){
		update();
	});

	$("div#selectdate select[name='year']").on("change",function(){
		var tt = timeSlide.__dateParse__(this.value, "yyyy", timeSlide.dateNow);
		checkDate(tt);
	});
	$("div#selectdate select[name='month']").on("change",function(){
		var tt = timeSlide.__dateParse__(this.value, "MM", timeSlide.dateNow);
		checkDate(tt);
	});
	$("div#selectdate select[name='day']").on("change",function(){
		var tt = timeSlide.__dateParse__(this.value, "dd", timeSlide.dateNow);
		checkDate(tt);
	});
	function checkDate(tt) {
		timeSlide.setAttr({"dateNow":tt});
		if( timeSlide.dateNow - startObj < 0 ) {
			timeSlide.setAttr({"dateNow":startObj});
			$("div#selectdate select[name='year']")
				.val(timeSlide.dateNow.getFullYear());
			$("div#selectdate select[name='month']")
				.val(timeSlide.dateNow.getMonth()+1);
			$("div#selectdate select[name='day']")
				.val(timeSlide.dateNow.getDate());
		} else if( timeSlide.dateNow - latestObj > 0 ) {
			timeSlide.setAttr({"dateNow":latestObj});
			$("div#selectdate select[name='year']")
				.val(timeSlide.dateNow.getFullYear());
			$("div#selectdate select[name='month']")
				.val(timeSlide.dateNow.getMonth()+1);
			$("div#selectdate select[name='day']")
				.val(timeSlide.dateNow.getDate());
		}
		update();
	}

	function update() {
		animStop();
		var yy = timeSlide.__dateFormat__(timeSlide.dateNow,"yyyy");
		var mm = timeSlide.__dateFormat__(timeSlide.dateNow,"MM");
		var dd = timeSlide.__dateFormat__(timeSlide.dateNow,"dd");
		$("div#selectdate select[name='year']" ).val(yy);
		$("div#selectdate select[name='month']").val(mm);
		$("div#selectdate select[name='day']"  ).val(dd);
		timeSlide.updateCalendar("dateCalendar",timeSlide.dateNow);
		chgDay(yy,mm,dd);
		chgImg(true);
	}
}

function animStart(dir) {
	animStop();

	if( dir == 1 ) {
		$("#dateAnimButton").attr("class","forward");
		var $btn1 = $("#startButton");
		var $btn2 = $("#backButton");
	} else {
		$("#dateAnimButton").attr("class","backward");
		var $btn1 = $("#backButton");
		var $btn2 = $("#startButton");
	}
	$btn1.attr("disabled","disabled").css("background-color","hotpink");
	$btn2.removeAttr("disabled").css("background-color","");

	animStep(dir);
}

function animStep(dir) {
        if( $("#dateAnimButton").attr("class") == "stop" ) return;

	dateCal(dir,false,true).then(function(){
		var dirname = $("#dateAnimButton").attr("class");
        	if( ( dir ==  1 && dirname == "forward" ) || ( dir == -1 && dirname == "backward" ) ) {
			timeAnim = setTimeout(function(){animStep(dir)},animDelayTime);
		}
	},function(){
		animStop();
	});
}

function animStop() {
	clearTimeout(timeAnim);
	$("#dateAnimButton").attr("class","stop");
	$(".animButton")
		.removeAttr("disabled")
		.css("background-color","");
}


function animSpeed(d) {
	var dtime = 100;

	if( ( animDelayTime == dtime && d == 1 ) || animDelayTime < dtime ) {
		animDelayTime = animDelayTime * Math.pow(2,-d);
	} else {
		animDelayTime -= d * dtime;
	}
	animDelayTime = Math.max( animDelayTime, 6.25 );
}


var TimeSlideBar = function(id,min,max,opts) {
	this.__init__(id,min,max,opts);
}


TimeSlideBar.prototype = {
	_axisArea : null,
	_dateNowFlg : false,
	_dateSelectFlg : false,
	_parentArea : null,
	_innerArea : null,
	_startTimeWidget : null,
	_endTimeWidget : null,
	_nowTimeWidget : null,
	_selectAreaWidget : null,

	_innerAreaHammer : null,

	_calendar : [],

	_eventFunc : [],

	dateMin : null,
	dateMax : null,
	dateLControl : null,
	dateRControl : null,
	dateStart : null,
	dateEnd : null,
	dateNow : null,
	timeInterval : [ 0, 0, 0, 0, 0, 1 ],
	parentAreaLeft : 0,
	parentAreaTop : 0,
	parentAreaWidth : 0,
	parentAreaHeight : 0,
	axisTicksOrient : "bottom",
	axisTicksNum : 8,
	axisTicksTxtFormat : null,
	axisTicksTxtRotate : 0,
	axisTicksTxtAnchor : null,
	axisTicksTxtDX : null,
	axisTicksTxtDY : null,
	baseZIndex : 1,


	update : function (dir,anim) {
		this.__timeCondition__(dir);

		if( !this._dateSelectFlg && ( this.dateStart!=null && this.dateEnd!=null ) ) {
			this.__makeSelectTimeWidget__();
//			this.__setSelectTimeSlideWidgetMove__();
		} else if( this._dateSelectFlg && ( this.dateStart==null || this.dateEnd==null ) ) {
			this.__deleteSelectTimeWidget__();
		}

		if( !this._dateNowFlg && this.dateNow!=null ) {
			this.__makeNowTimeWidget__();
//			this.__setNowTimeSlideWidgetMove__();
		} else if( this._dateNowFlg && this.dateNow==null ) {
			this.__deleteNowTimeWidget__();
		}

//		this.__setSlideWidgetMove__();
		this.__updateEventFunc__();

		if( !this._dateSelectFlg && ( this.dateStart!=null && this.dateEnd!=null ) ) {
			this._dateSelectFlg = true;
		} else if( this._dateSelectFlg && ( this.dateStart==null || this.dateEnd==null ) ) {
			this._dateSelectFlg = false;
		}
		if( !this._dateNowFlg && this.dateNow!=null ) {
			this._dateNowFlg = true;
		} else if( this._dateNowFlg && this.dateNow==null ) {
			this._dateNowFlg = false;
		}

		this.__updateLRControlWidget__();

		this.__setSlideWidgetPosition__(anim);
		if( this._axisArea ) this.__updateAxis__(anim);
	},

	getAttr : function (attr) {
		return this[attr];
	},

	setAttr : function (attrs) {
		var dir = 0;
		for( var k in attrs ) {
			this[k] = attrs[k];
			if( k=="dateStart" )  dir = dir + 1;
			if( k=="dateEnd"   )  dir = dir - 1;
		}
		this.update(dir);
	},

	on  : function(action,callback,name){ this.__addEventListener__(action,callback,name); },
	off : function(action,name) { this.__removeEventListener__(action,name); },

	onchange    : function(callback,name){ this.on("change",   callback,name); },
	onmouseup   : function(callback,name){ this.on("mouseup",  callback,name); },
	onmousedown : function(callback,name){ this.on("mousedown",callback,name); },
	onmousemove : function(callback,name){ this.on("mousemove",callback,name); },
	onclick     : function(callback,name){ this.on("click",    callback,name); },


	makeAxis : function(id) {
		this.__makeAxis__(id);
	},

	makeCalendar : function(id,date,dtime) {
		this.__makeCalendar__(id,date,this.dateMin,this.dateMax,dtime);
	},

	onchangeCalendar : function(id,callback) {
		this._calendar[id].onchangeFunc = callback;
	},
	onchangeCalendarDate : function(id,callback) {
		this._calendar[id].onchangeDateFunc = callback;
	},
	onchangeCalendarTime : function(id,callback) {
		this._calendar[id].onchangeTimeFunc = callback;
	},

	updateCalendar : function(id,date) {
		if( date==null ) return;
		this.__updateCalendar__(id,date);
	},


	__timeFormat__ : function(formats) {
		return function(date) {
			var i = formats.length - 1;
			var f = formats[i];
			while (!f[1](date)) f = formats[--i];
			return f[0](date);
		};
	},

	__init__ : function (id,min,max,opts) {
		this.dateMin = min;
		this.dateMax = max;

		var axisFormatDefault = [
			[d3.time.format("%Y"), function() { return true; }],
			[d3.time.format("%b"), function(d) { return d.getMonth(); }],
			[d3.time.format("%b %d"), function(d) { return d.getDate() != 1; }],
			[d3.time.format("%d"), function(d) { return d.getDay() && d.getDate() != 1; }],
			[d3.time.format("%I %p"), function(d) { return d.getHours(); }],
			[d3.time.format("%I:%M"), function(d) { return d.getMinutes(); }],
//			[d3.time.format("%H:%M"), function(d) { return d.getHours(); }],
//			[d3.time.format("%H:%M"), function(d) { return d.getMinutes(); }],
			[d3.time.format(":%S"), function(d) { return d.getSeconds(); }],
			[d3.time.format(".%L"), function(d) { return d.getMilliseconds(); }]
		];
		this.axisTicksTxtFormat = axisFormatDefault;

		for( var k in opts ) this[k] = opts[k];

		if( opts ) {
			this._dateNowFlg    = ( opts.dateNow!=null );
			this._dateSelectFlg = ( opts.dateStart!=null && opts.dateEnd!=null );
		}

		if( this.dateLControl==null ) {
			if( this._dateSelectFlg ) {
				this.dateLControl =
					new Date( 2 * this.dateStart - this.dateEnd );
			} else {
				this.dateLControl = this.dateMin;
			}
		}
		if( this.dateRControl==null ) {
			if( this._dateSelectFlg ) {
				this.dateRControl =
					new Date( 2 * this.dateEnd - this.dateStart );
			} else {
				this.dateRControl = this.dateMax;
			}
		}
		this.__timeCondition__();

		this._parentArea = $('#'+id);

		this.parentAreaLeft   = this._parentArea.offset().left;
		this.parentAreaTop    = this._parentArea.offset().top;
//		this.parentAreaWidth  = this._parentArea.width();
//		this.parentAreaHeight = this._parentArea.height();
		this.parentAreaWidth  = 
			Math.floor(parseInt(document.defaultView
				.getComputedStyle(this._parentArea[0], null).getPropertyValue("width")));
		this.parentAreaHeight = 
			Math.floor(parseInt(document.defaultView
				.getComputedStyle(this._parentArea[0], null).getPropertyValue("height")));

		this._eventFunc[0]           = [];
		this._eventFunc['change']    = [];
		this._eventFunc['mouseup']   = [];
		this._eventFunc['mousedown'] = [];
		this._eventFunc['mousemove'] = [];
		this._eventFunc['click']     = [];

		this.__make__();
	},

	__timeCondition__ : function(dir) {
		this.__setTimeInterval__();

		if( this.dateLControl - this.dateMin < 0 ) this.dateLControl = this.dateMin;
		if( this.dateRControl - this.dateMax > 0 ) this.dateRControl = this.dateMax;

//		if( this._dateSelectFlg ) {
		if( this._dateSelectFlg && ( this.dateStart!=null && this.dateEnd!=null ) ) {
			if( this.dateStart - this.dateMin      < 0 ) this.dateStart    = this.dateMin;
			if( this.dateEnd   - this.dateMax      > 0 ) this.dateEnd      = this.dateMax;
			if( this.dateStart - this.dateLControl < 0 ) this.dateLControl = this.dateStart;
			if( this.dateEnd   - this.dateRControl > 0 ) this.dateRControl = this.dateEnd;

			if( this.dateStart - this.dateEnd > 0 ) {
				if( dir== 1 ) {
					this.dateStart = this.dateEnd;
				} else {
					this.dateEnd   = this.dateStart;
				}
			}
		}
//		if( this._dateNowFlg ) {
		if( this._dateNowFlg && this.dateNow!=null ) {
			if( this.dateLControl > this.dateNow ) this.dateLControl = this.dateNow;
			if( this.dateRControl < this.dateNow ) this.dateRControl = this.dateNow;

			if( this._dateSelectFlg ) {
				var ts = this.dateStart;
				var te = this.dateEnd;
			} else {
				var ts = this.dateLControl;
				var te = this.dateRControl;
			}
			if( this.dateNow - ts < 0 )  this.dateNow = ts;
			if( this.dateNow - te > 0 )  this.dateNow = te;
		}
	},

	__setTimeInterval__ : function() {
		var dtint0 = this.timeInterval[5]
			+ 60 * ( this.timeInterval[4]
			+ 60 * ( this.timeInterval[3]
			+ 24 *   this.timeInterval[2] ) );

		if( this.timeInterval[0] == 0 && this.timeInterval[1] == 0 && dtint0 == 0 )  return;

		this.dateLControl = this.__setTimeIntervalSet__(this.dateMin,this.dateLControl,this.timeInterval);
		this.dateRControl = this.__setTimeIntervalSet__(this.dateMin,this.dateRControl,this.timeInterval);

		if( this.dateStart!=null ) 
			this.dateStart    = this.__setTimeIntervalSet__(this.dateMin,this.dateStart   ,this.timeInterval);
		if( this.dateEnd!=null ) 
			this.dateEnd      = this.__setTimeIntervalSet__(this.dateMin,this.dateEnd     ,this.timeInterval);
		this.dateNow      = this.__setTimeIntervalSet__(this.dateMin,this.dateNow     ,this.timeInterval);
	},

	__make__ : function () {
		this._parentArea.css("position","relative");

		var wrapcont  = $(this.__jQuery_create__('div',{
			'id':'timeSlideContentsWrap',
			'class':'timeSlideWrap'
		}));
		var wrapmain  = $(this.__jQuery_create__('div',{
			'id':'timeSlideMainContentsWrap',
			'class':'timeSlideWrap'
		}));
		var lcontrolwidget = $(this.__jQuery_create__('div',{
			'id':'timeSlideLControlWidget',
			'class':'timeSlideBox'
		}));
		var rcontrolwidget = $(this.__jQuery_create__('div',{
			'id':'timeSlideRControlWidget',
			'class':'timeSlideBox'
		}));
		var maincont  = $(this.__jQuery_create__('div',{
			'id':'timeSlideWidget',
			'class':'timeSlideBox'
		}));

		var lconp = $(this.__jQuery_create__('div',{
			'id':'timeSlideLControlPlus',
			'class':'timeSlideControl'
		}));
		var lconm = $(this.__jQuery_create__('div',{
			'id':'timeSlideLControlMinus',
			'class':'timeSlideControl'
		}));
		var rconp = $(this.__jQuery_create__('div',{
			'id':'timeSlideRControlPlus',
			'class':'timeSlideControl'
		}));
		var rconm = $(this.__jQuery_create__('div',{
			'id':'timeSlideRControlMinus',
			'class':'timeSlideControl'
		}));


		this._parentArea.append(wrapcont);
		this._parentArea.append(rcontrolwidget);

		wrapcont.append(wrapmain);
		wrapcont.append(lcontrolwidget);

		wrapmain.append(maincont);

		lcontrolwidget.append(lconm);
		lcontrolwidget.append(lconp);
		rcontrolwidget.append(rconm);
		rcontrolwidget.append(rconp);

		this._innerArea = maincont;

		if( this._innerArea.hammer ) {
			this._innerAreaHammer = this._innerArea.hammer({
				transform_always_block: true,
				transform_min_scale: 1,
				drag_block_horizontal: true,
				drag_block_vertical: true,
				drag_min_distance: 0
			});
		}

		var w  = Math.floor(this.parentAreaWidth);
		var h  = Math.floor(this.parentAreaHeight);
		var wlm = lconm.width();
		var wlp = lconp.width();
		var wrm = rconm.width();
		var wrp = rconp.width();
		var wl = wlm + wlp;
		var wr = wrm + wrp;
		var wi = w - wl - wr;

		this.__jQuery_setCSS__(wrapcont,{"height":h+"px","width":w+"px","float":"left","margin-right":"-"+wr+"px"});
		this.__jQuery_setCSS__(wrapmain,{"height":h+"px","width":w+"px","float":"right","margin-left":"-"+wl+"px"});
		this.__jQuery_setCSS__(lcontrolwidget,{"height":h+"px","width":wl+"px","float":"left"});
		this.__jQuery_setCSS__(rcontrolwidget,{"height":h+"px","width":wr+"px","float":"right"});
		this.__jQuery_setCSS__(this._innerArea,{"height":h+"px","width":wi+"px","position":"relative",
			"margin-left":wl+"px","margin-right":wr+"px","z-index":this.baseZIndex+1});

		this.__jQuery_setCSS__(lconm,{"height":h+"px","width":wlm+"px","float":"left"});
		this.__jQuery_setCSS__(lconp,{"height":h+"px","width":wlp+"px","float":"left"});
		this.__jQuery_setCSS__(rconm,{"height":h+"px","width":wrm+"px","float":"left"});
		this.__jQuery_setCSS__(rconp,{"height":h+"px","width":wrp+"px","float":"left"});

		if( this._dateSelectFlg ) this.__makeSelectTimeWidget__();
		if( this._dateNowFlg    ) this.__makeNowTimeWidget__();

		this.__setSlideWidgetPosition__();
		this.__setSlideWidgetMove__();

		this.__makeLRControlWidget__();
	},

	__makeSelectTimeWidget__ : function() {
		this._startTimeWidget
			= $(this.__jQuery_create__('div',{'id':'timeSlideStartDate','class':'timeSlideItem'}));
		this._endTimeWidget
			= $(this.__jQuery_create__('div',{'id':'timeSlideEndDate',  'class':'timeSlideItem'}));
		this._selectAreaWidget
			= $(this.__jQuery_create__('div',{'id':'timeSlideSelect',   'class':'timeSlideItem'}));

		this._innerArea.append(this._startTimeWidget);
		this._innerArea.append(this._endTimeWidget);
		this._innerArea.append(this._selectAreaWidget);

		this._startTimeWidget .css("z-index",this.baseZIndex+3);
		this._endTimeWidget   .css("z-index",this.baseZIndex+3);
		this._selectAreaWidget.css("z-index",this.baseZIndex+2);

		$(".timeSlideItem").css("position","absolute");
	},

	__makeNowTimeWidget__ : function() {
		this._nowTimeWidget
			= $(this.__jQuery_create__('div',{'id':'timeSlideNowDate','class':'timeSlideItem'}));
		this._innerArea.append(this._nowTimeWidget);
		this._nowTimeWidget.css("position","absolute");
		this._nowTimeWidget.css("z-index",this.baseZIndex+4);
	},

	__makeLRControlWidget__ : function() {
		var self = this;

		self._lControlPWidget = $('#timeSlideLControlPlus');
		self._lControlMWidget = $('#timeSlideLControlMinus');
		self._rControlPWidget = $('#timeSlideRControlPlus');
		self._rControlMWidget = $('#timeSlideRControlMinus');
		self._lControlPWidget.css("z-index",self.baseZIndex+4);
		self._lControlMWidget.css("z-index",self.baseZIndex+4);
		self._rControlPWidget.css("z-index",self.baseZIndex+4);
		self._rControlMWidget.css("z-index",self.baseZIndex+4);

		self._lControlMWidget.bind("contextmenu",function(){return false;});
		self._lControlPWidget.bind("contextmenu",function(){return false;});
		self._rControlMWidget.bind("contextmenu",function(){return false;});
		self._rControlPWidget.bind("contextmenu",function(){return false;});

		self._lControlMWidget.on("click",function(){
			self.__changeLRControl__(self,-1,-1);
		});
		self._lControlPWidget.on("click",function(){
			self.__changeLRControl__(self,-1, 1);
		});
		self._rControlMWidget.on("click",function(){
			self.__changeLRControl__(self, 1,-1);
		});
		self._rControlPWidget.on("click",function(){
			self.__changeLRControl__(self, 1, 1);
		});

		this.__updateLRControlWidget__();
	},

	__updateLRControlWidget__ : function() {
		this._lControlMWidget.attr('class','timeSlideControl');
		this._lControlPWidget.attr('class','timeSlideControl');
		this._rControlMWidget.attr('class','timeSlideControl');
		this._rControlPWidget.attr('class','timeSlideControl');

		if( this.dateLControl - this.dateMin == 0 ) {
			this._lControlMWidget.attr('class','timeSlideControl off');
		}
		if( this.dateLControl - this.dateStart == 0 ) {
			this._lControlPWidget.attr('class','timeSlideControl off');
		}
		if( this.dateRControl - this.dateEnd == 0 ) {
			this._rControlMWidget.attr('class','timeSlideControl off');
		}
		if( this.dateRControl - this.dateMax == 0 ) {
			this._rControlPWidget.attr('class','timeSlideControl off');
		}
	},

	__changeLRControl__ : function(self,lr,pm) {
		var ts = self.dateLControl.getTime();
		var te = self.dateRControl.getTime();
		var dt = te - ts;
		if( lr == -1 ) {
			if( pm == -1 ) {
				self.dateLControl = new Date( ts - dt/2 );
			} else {
				self.dateLControl = new Date( ts + dt/2 );
			}
		} else {
			if( pm == -1 ) {
				self.dateRControl = new Date( te - dt/2 );
			} else {
				self.dateRControl = new Date( te + dt );
			}
		}
		self.update(null,500);
	},

	__deleteSelectTimeWidget__ : function() {
		this._startTimeWidget.remove();
		this._endTimeWidget.remove();
		this._selectAreaWidget.remove();
	},

	__deleteNowTimeWidget__ : function() {
		this._nowTimeWidget.remove();
	},

	__setSlideWidgetPosition__ : function(anim) {
		var h = this._innerArea.height();

		if( this._dateSelectFlg ) {
//			var zi = this.baseZIndex + 1;
			var y0 = Math.round( 0.5 * ( h - this._startTimeWidget.height() ) );
			var y1 = Math.round( 0.5 * ( h - this._endTimeWidget.height() ) );
//			this.__jQuery_setCSS__(this._startTimeWidget,{ "top":y0+"px", "z-index":zi });
//			this.__jQuery_setCSS__(this._endTimeWidget,{ "top":y1+"px", "z-index":zi });
			this.__jQuery_setCSS__(this._startTimeWidget,{"top":y0+"px"});
			this.__jQuery_setCSS__(this._endTimeWidget,  {"top":y1+"px"});
			this.__setSlideWidgetXPosition__(this._startTimeWidget,this.dateStart,"r",anim);
			this.__setSlideWidgetXPosition__(this._endTimeWidget,this.dateEnd,"l",anim);
			this.__setSelectArea__(anim);
		}

		if( this._dateNowFlg ) {
//			var zi = this.baseZIndex + 2;
			var yy = Math.round( 0.5 *   h - this._nowTimeWidget.height() );
//			this.__jQuery_setCSS__(this._nowTimeWidget,{ "top":yy+"px", "z-index":zi });
			this.__jQuery_setCSS__(this._nowTimeWidget,{"top":yy+"px"});
			this.__setSlideWidgetXPosition__(this._nowTimeWidget,this.dateNow,"c",anim);
		}
	},

	__setSelectArea__ : function(anim) {
		var ys = Math.round(0.5*(this._innerArea.height()-this._selectAreaWidget.height()));

//		var x0 = this.__getLeftPos__(this._startTimeWidget) + this._startTimeWidget.width();
//		var x1 = this.__getLeftPos__(this._endTimeWidget);

		var xw = this._innerArea.width();
		var x0 = Math.round( this.__timePosition__(this.dateStart,xw) );
		var x1 = Math.round( this.__timePosition__(this.dateEnd,  xw) );

		if( anim==null ) {
			this.__jQuery_setCSS__(this._selectAreaWidget,{
				"left":x0+"px",
				"top":ys+"px",
				"width":(x1-x0)+"px",
				"cursor":"move",
//				"cursor": "col-resize",
			});
		} else {
			this._selectAreaWidget.css("cursor","col-resize").animate({
				left:x0+"px",
				top:ys+"px",
				width:(x1-x0)+"px",
			},{
				duration:anim,
				easing:'swing',
				queue:false,
			});
		}
	},

	__setSlideWidgetXPosition__ : function(widget,date,align,anim) {
		if( align == "l" ) var cx = 0;
		if( align == "r" ) var cx = widget.width();
		if( align == "c" ) var cx = 0.5*widget.width();
		var x = Math.round( this.__timePosition__(date,this._innerArea.width())-cx );
		if( anim==null ) {
			widget.css("left",x+"px");
		} else {
			widget.animate({left:x+"px"},{
				duration:anim,
				easing:'swing',
				queue:false,
			});
		}
	},

	__setSlideWidgetMove__ : function() {
		var self = this;

		if( self._dateSelectFlg ) {
			this._startTimeWidget .on("contextmenu",function(){return false;});
			this._endTimeWidget   .on("contextmenu",function(){return false;});
			this._selectAreaWidget.on("contextmenu",function(){return false;});
		}
		if( self._dateNowFlg ) {
			this._nowTimeWidget   .on("contextmenu",function(){return false;});
		}
		this._innerArea       .on("contextmenu",function(){return false;});

//		this._innerArea.off("mousedown");
//		this._innerArea.off("mousedown",moveFunc);
		this._innerArea.on("mousedown",moveFunc);
		if( this._innerAreaHammer ) {
			this._innerAreaHammer.on('touch',moveTouchFunc);
		}

		function moveTouchFunc(e) {
			moveFunc(e.gesture,true);
			return false;
		}

		function moveFunc(e,touch) {
			e.stopPropagation();
			if( touch ) {
				var elem = document.elementFromPoint(e.touches[0].clientX,e.touches[0].clientY);
			} else {
				var elem = document.elementFromPoint(e.clientX,e.clientY);
			}
			if( elem.id == "timeSlideStartDate" ) {
				self.__setStartTimeSlideWidgetMove__(e,touch);
			} else if( elem.id == "timeSlideEndDate" ) {
				self.__setEndTimeSlideWidgetMove__(e,touch);
			} else if( elem.id == "timeSlideNowDate" ) {
				self.__setNowTimeSlideWidgetMove__(e,touch);
			} else if( elem.id == "timeSlideSelect" ) {
				self.__setSelectAreaMove__(e,self,self._selectAreaWidget,touch);
/*
				if( e.button == 2 ) {
					self.__setSelectAreaMove__(e,self,self._selectAreaWidget);
				} else {
					if( self._dateNowFlg ) {
						self.__setNowTimeSlideWidgetTravel(e);
					} else if( self._dateSelectFlg ) {
						var x = ( e.pageX - self._selectAreaWidget.offset().left )
							/ self._selectAreaWidget.width();
						if( x<0.5 ) {
							self.__setStartTimeSlideWidgetTravel(e);
						} else {
							self.__setEndTimeSlideWidgetTravel(e);
						}
					}
				}
*/
			} else {
				if( self._dateSelectFlg ) {
					var x = e.pageX - self._innerArea.offset().left;
					var xw = self._innerArea.width();
					var xs = self.__timePosition__(self.dateStart,xw);
					var xe = self.__timePosition__(self.dateEnd,xw);
					if( x < xs ) {
						self.__setStartTimeSlideWidgetTravel(e,touch);
					} else if( x > xe ) {
						self.__setEndTimeSlideWidgetTravel(e,touch);
					}
				} else if( self._dateNowFlg ) {
					self.__setNowTimeSlideWidgetTravel(e,touch);
				}
			}
			return false;
		};
	},

	__setStartTimeSlideWidgetMove__ : function(e,touch) {
		var ts = this.dateLControl;
		var te = this.dateEnd;
		this.__setSlideMove__(e,this,this._startTimeWidget,"dateStart",ts,te,"r",1,touch);
	},

	__setEndTimeSlideWidgetMove__ : function(e,touch) {
		var ts = this.dateStart;
		var te = this.dateRControl;
		this.__setSlideMove__(e,this,this._endTimeWidget,"dateEnd",ts,te,"l",-1,touch);
	},

	__setNowTimeSlideWidgetMove__ : function(e,touch) {
		if( this._dateSelectFlg ) {
			var ts = this.dateStart;
			var te = this.dateEnd;
		} else {
			var ts = Math.max( this.dateMin, this.dateLControl );
			var te = Math.min( this.dateMax, this.dateRControl );
		}
		this.__setSlideMove__(e,this,this._nowTimeWidget,"dateNow",ts,te,"c",0,touch);
	},

	__setStartTimeSlideWidgetTravel : function(e,touch) {
		var ts = this.dateMin;
		var te = this.dateEnd;
		this.__setSlideTravel__(e,this,this._startTimeWidget,"dateStart",ts,te,"r",touch);
	},

	__setEndTimeSlideWidgetTravel : function(e,touch) {
		var ts = this.dateStart;
		var te = this.dateMax;
		this.__setSlideTravel__(e,this,this._endTimeWidget,"dateEnd",ts,te,"l",touch);
	},

	__setNowTimeSlideWidgetTravel : function(e,touch) {
		if( this._dateSelectFlg ) {
			var ts = this.dateStart;
			var te = this.dateEnd;
		} else {
			var ts = this.dateMin;
			var te = this.dateMax;
		}
		this.__setSlideTravel__(e,this,this._nowTimeWidget,"dateNow",ts,te,"c",touch);
	},

	__setSelectAreaMove__ : function(e,self,widget,touch) {
		if( touch ) {
			var mx = e.touches[0].pageX;
		} else {
			var mx = e.pageX;
		}
//		var x0 = widget.position().left;
//		var x0 = parseInt(widget.css("left"));
		var x0 = this.__getLeftPos__(widget);
		var xw = self._innerArea.width();
		var xl = xw - widget.width();
		if( touch && $(document).hammer ) {
			$(document).hammer()
				.on('drag',dragFunc)
				.on('release',releaseFunc);
		} else {
			$(document)
				.on('mousemove',moveFunc)
				.on('mouseup',mouseupFunc);
		}
		e.stopPropagation();

		function moveFunc(e,touch) {
			if( touch ) {
				var dx = e.touches[0].pageX - mx;
			} else {
				var dx = e.pageX - mx;
			}
			if( x0+dx < 0  ) dx =   -x0;
			if( x0+dx > xl ) dx = xl-x0;
			widget.css("left",Math.round(x0+dx)+"px");
			var xs = x0 + dx;
			var xe = xs + widget.width();
			self.dateStart = self.__timePositionInvert__(xs,xw);
			self.dateEnd   = self.__timePositionInvert__(xe,xw);
			self.__setSlideWidgetXPosition__(self._startTimeWidget,self.dateStart,"r");
			self.__setSlideWidgetXPosition__(self._endTimeWidget,self.dateEnd,"l");
			if( self._dateNowFlg ) {
				if( self.dateNow-self.dateStart < 0 )  self.dateNow = self.dateStart;
				if( self.dateNow-self.dateEnd   > 0 )  self.dateNow = self.dateEnd;
				self.__setSlideWidgetXPosition__(self._nowTimeWidget,self.dateNow,"c");
			}
			e.stopPropagation();
			return false;
		}

		function mouseupFunc(e) {
			$(document).off('mousemove');
			$(document).off('mouseup');
			self.__setTimeInterval__();
			self.__updateLRControlWidget__();
			e.stopPropagation();
			return false;
		}

		function dragFunc(e) {
			moveFunc(e.gesture,true);
			return false;
		}

		function releaseFunc(e) {
			$(document).hammer()
				.off('drag',dragFunc)
				.off('release',releaseFunc);
			self.__setTimeInterval__();
			self.__updateLRControlWidget__();
			e.gesture.stopPropagation();
			return false;
		}
	},

	__setSlideMove__ : function(e,self,widget,attr,ts,te,align,nowdir,touch) {
		if( touch ) {
			var mx = e.touches[0].pageX;
		} else {
			var mx = e.pageX;
		}
		var w0 = widget.width();
		if( align == "l" ) var cx = 0;
		if( align == "r" ) var cx = w0;
		if( align == "c" ) var cx = 0.5*w0;
//		var x0 = widget.position().left + cx;
		var x0 = this.__getLeftPos__(widget) + cx;
		var xw = self._innerArea.width();
		var xs = Math.round( self.__timePosition__(ts,xw) );
		var xe = Math.round( self.__timePosition__(te,xw) );

		if( touch && $(document).hammer ) {
			$(document).hammer()
				.on('drag',dragFunc)
				.on('release',releaseFunc);
		} else {
			$(document)
				.on('mousemove',moveFunc)
				.on('mouseup',mouseupFunc);
		}

		e.stopPropagation();

		function moveFunc(e,touch) {
			if( touch ) {
				var dx = e.touches[0].pageX - mx;
			} else {
				var dx = e.pageX - mx;
			}
			if( x0+dx < xs ) dx = xs-x0;
			if( x0+dx > xe ) dx = xe-x0;

			widget.css("left",Math.round(x0+dx-cx)+"px");
			self[attr] = self.__timePositionInvert__(x0+dx,xw);
			if( self._dateSelectFlg ) self.__setSelectArea__();
			if( self._dateNowFlg && nowdir ) {
				var dir = self.dateNow - self[attr];
				if( dir*nowdir< 0 ) {
					var w = self._nowTimeWidget.width();
					self._nowTimeWidget.css("left",Math.round(x0+dx-0.5*w)+"px");
					self.dateNow = self[attr];
				}
			}
			e.stopPropagation();
			return false;
		}

		function mouseupFunc(e) {
			$(document).off('mousemove');
			$(document).off('mouseup');
			self[attr] = self.__timePositionInvert__(self.__getLeftPos__(widget)+cx,xw);
			self.__setTimeInterval__();
			self.__updateLRControlWidget__();
			e.stopPropagation();
			return false;
		}

		function dragFunc(e){
			moveFunc(e.gesture,true);
			return false;
		}

		function releaseFunc(e){
			$(document).hammer()
				.off('drag',dragFunc)
				.off('release',releaseFunc);
			self[attr] = self.__timePositionInvert__(self.__getLeftPos__(widget)+cx,xw);
			self.__setTimeInterval__();
			self.__updateLRControlWidget__();
			e.gesture.stopPropagation();
			return false;
		}
	},

	__setSlideTravel__ : function(e,self,widget,attr,ts,te,align,touch) {
		if( touch ) {
			var mx = e.touches[0].pageX - self._innerArea.offset().left;
		} else {
			var mx = e.pageX - self._innerArea.offset().left;
		}

		var w0 = widget.width();
		if( align == "l" ) var cx = 0;
		if( align == "r" ) var cx = w0;
		if( align == "c" ) var cx = 0.5*w0;
		var xw = self._innerArea.width();
		var xs = Math.round( self.__timePosition__(ts,xw) );
		var xe = Math.round( self.__timePosition__(te,xw) );

		if( mx < xs ) mx = xs;
		if( mx > xe ) mx = xe;

		self[attr] = self.__timePositionInvert__(mx,xw);
/*
		if( self._dateNowFlg && nowdir ) {
			var dir = self.dateNow - self[attr];
			if( dir*nowdir< 0 ) {
				self.dateNow = self[attr];
			}
		}
*/

		widget.animate({left:(mx-cx)+"px"},{
			duration:300,
			easing:'swing',
			queue:false,
		});

		if( self._dateSelectFlg ) {
			var x0 = self.__timePosition__(self.dateStart,xw);
			var x1 = self.__timePosition__(self.dateEnd,xw);

			self._selectAreaWidget.animate({left:x0+"px",width:(x1-x0)+"px",},{
				duration:300,
				easing:'swing',
				queue:false,
			});
		}
/*
		if( self._dateNowFlg && nowdir ) {
			var dir = self.dateNow - self[attr];
			if( dir*nowdir< 0 ) {
				var w = self._nowTimeWidget.width();
				self._nowTimeWidget.animate({left:(mx-0.5*w)+"px"},{
					duration:300,
					easing:'swing',
					queue:false,
				});
			}
		}
*/

		self.__updateLRControlWidget__();
		return false;
	},

	__addEventListener__ : function(action,callback,elem,touch) {
		if( elem==null ) {
			if( this._eventFunc[action][0]!=null ) {
				if( this._dateSelectFlg ) {
					this.__unsetEventFunc__(action,this._startTimeWidget);
					this.__unsetEventFunc__(action,this._endTimeWidget);
					this.__unsetEventFunc__(action,this._selectAreaWidget);
				}
				if( this._dateNowFlg ) this.__unsetEventFunc__(action,this._nowTimeWidget);
				this.__unsetEventFunc__(action,this._innerArea);
			}

			this._eventFunc[action][0] = callback;

			if( this._dateSelectFlg ) {
				this.__setEventFunc__(this._startTimeWidget,callback,action);
				this.__setEventFunc__(this._endTimeWidget,callback,action);
				this.__setEventFunc__(this._selectAreaWidget,callback,action);
			}

			if( this._dateNowFlg ) this.__setEventFunc__(this._nowTimeWidget,callback,action);
			this.__setEventFunc__(this._innerArea,callback,action);
		} else {
			switch(elem) {
				case "dateStart" :
					var widget = this._startTimeWidget;
					var flg = this._dateSelectFlg;
					break;
				case "dateEnd"   :
					var widget = this._endTimeWidget;
					var flg = this._dateSelectFlg;
					break;
				case "dateNow"   :
					var widget = this._nowTimeWidget;
					var flg = this._dateNowFlg;
					break;
				case "selectArea":
					var widget = this._SelectAreaWidget;
					var flg = this._dateSelectFlg;
					break;
				case "innerArea":
					var widget = this._innerArea;
					var flg = true;
					break;
			}
			if( this._eventFunc[action][elem]!=null && flg )
				this.__unsetEventFunc__(action,widget);
			this._eventFunc[action][elem] = callback;
			if( flg ) this.__setEventFunc__(widget,callback,action);
		}
	},

	__removeEventListener__ : function(action,elem,touch) {
		if( elem==null ) {
			if( this._dateSelectFlg ) {
				this.__unsetEventFunc__(action,this._startTimeWidget);
				this.__unsetEventFunc__(action,this._endTimeWidget);
				this.__unsetEventFunc__(action,this._selectAreaWidget);
			}
			if( this._dateNowFlg ) this.__unsetEventFunc__(action,this._nowTimeWidget);
		} else {
			switch(elem) {
				case "dateStart" :
					var widget = this._startTimeWidget;
					break;
				case "dateEnd"   :
					var widget = this._endTimeWidget;
					break;
				case "dateNow"   :
					var widget = this._nowTimeWidget;
					break;
				case "selectArea":
					var widget = this._SelectAreaWidget;
					break;
			}
			this.__unsetEventFunc__(action,widget);
		}
	},

	__setEventFunc__ : function(elem,callback,action,unset){
		if( !unset ) {
			if( callback == null ) return;

			if( action == 'change' || action == 'mousemove' ) {
				this._innerArea.on("mousedown",__changeFunc__);
				if( this._innerAreaHammer ) this._innerAreaHammer.on("touch",__changeFunc__);
			} else if( action == 'mouseup' ) {
				this._innerArea.on("mousedown",__mouseupFunc__);
				if( this._innerAreaHammer ) this._innerAreaHammer.on("touch",__mouseupFunc__);
			} else if( action == 'mousedown' || action == 'click' ) {
				this._innerArea.on("mousedown",__clickFunc__);
				if( this._innerAreaHammer ) this._innerAreaHammer.on("touch",__clickFunc__);
			}
		} else {
			if( action == 'change' || action == 'mousemove' ) {
				this._innerArea.off("mousedown",__changeFunc__);
				if( this._innerAreaHammer ) this._innerAreaHammer.off("touch",__changeFunc__);
			} else if( action == 'mouseup' ) {
				this._innerArea.off("mousedown",__mouseupFunc__);
				if( this._innerAreaHammer ) this._innerAreaHammer.off("touch",__mouseupFunc__);
			} else if( action == 'mousedown' || action == 'click' ) {
				this._innerArea.off("mousedown",__clickFunc__);
				if( this._innerAreaHammer ) this._innerAreaHammer.off("touch",__clickFunc__);
			}
		}

		function __changeFunc__(e) {
			if( e.type == "touch" ) {
				e = e.gesture.touches[0];
				var target = document.elementFromPoint(e.clientX,e.clientY);
				if( target.id == elem.attr("id") ) {
					$(document).hammer()
						.on('drag',function(e){callback(e.gesture.touches[0])})
						.on('release',release);
				}
			} else {
				var target = document.elementFromPoint(e.clientX,e.clientY);
				if( target.id == elem.attr("id") ) {
					$(document)
						.on('mousemove',callback)
						.on('mouseup',mouseup);
				}
			}

			function mouseup() {
				$(document)
					.off('mousemove',callback)
					.off('mouseup',mouseup);
			}
			function release() {
				$(document).hammer()
					.off('drag',function(e){callback(e.gesture.touches[0])})
					.off('release',release);
			}
		}
		function __mouseupFunc__(e) {
			if( e.type == "touch" ) {
				e = e.gesture.touches[0];
				var target = document.elementFromPoint(e.clientX,e.clientY);
				if( target.id == elem.attr("id") ) {
					$(document).hammer().on('release',release);
				}
			} else {
				var target = document.elementFromPoint(e.clientX,e.clientY);
				if( target.id == elem.attr("id") ) {
					$(document).on('mouseup',mouseup);
				}
			}

			function mouseup(e) {
				callback(e);
				$(document).off('mouseup',mouseup);
			}
			function release(e) {
				callback(e.gesture.touches[0]);
				$(document).hammer().off('release',release);
			}
		}
		function __clickFunc__(e) {
			if( e.type == "touch" )  e = e.gesture.touches[0];
			var target = document.elementFromPoint(e.clientX,e.clientY);
			if( target.id == elem.attr("id") ) {
				callback(e);
			}
		}

	},

	__unsetEventFunc__ : function(action,elem){
			this.__setEventFunc__(elem,null,action,true);
	},

	__updateEventFunc__ : function(action){
		if( !this._dateSelectFlg && ( this.dateStart!=null && this.dateEnd!=null ) ) {
			this.__setEventFunc__(this._startTimeWidget,this._eventFunc[action][0]);
			this.__setEventFunc__(this._startTimeWidget,this._eventFunc[action]["dateStart"]);

			this.__setEventFunc__(this._endTimeWidget,this._eventFunc[action][0]);
			this.__setEventFunc__(this._endTimeWidget,this._eventFunc[action]["dateEnd"]);

			this.__setEventFunc__(this._selectAreaWidget,this._eventFunc[action][0]);
			this.__setEventFunc__(this._selectAreaWidget,this._eventFunc[action]["SelectArea"]);
		}
		if( !this._dateNowFlg && this.dateNow!=null ) {
			this.__setEventFunc__(this._nowTimeWidget,this._eventFunc[action][0]);
			this.__setEventFunc__(this._nowTimeWidget,this._eventFunc[action]["dateNow"]);
		}
	},

	__makeAxis__ : function(id) {
		this._axisArea = $("#"+id);

		this.__jQuery_setCSS__(this._axisArea,{"width":"100%", "clear":"both" });

		var xl = this.__getLeftPos__($("#timeSlideMainContentsWrap"));
//		var xl = $("#timeSlideMainContentsWrap").position().left;
//		var xl = parseInt($("#timeSlideMainContentsWrap").css("left"));
		var w  = this._innerArea.width();

//		this.__jQuery_setCSS__(this._axisArea,{"margin-left":xl+"px", "width":w+"px"});
		this.__jQuery_setCSS__(this._axisArea,{"width":"100%"});

		var svg = d3.select("#"+id).append("svg")
			.attr("id","timeSlideAxisSVG")
			.attr("class","timeSlideAxis")
			.attr("width","110%")
			.attr("height","100%");

		var xScale = d3.time.scale()
			.domain([this.dateLControl,this.dateRControl])
			.range([xl,xl+w]);
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient(this.axisTicksOrient)
			.ticks(this.axisTicksNum)
			.tickFormat(this.__timeFormat__(this.axisTicksTxtFormat));
		svg.append("g")
			.attr("id","timeSlideXAxis")
			.attr("class","timeSlideAxis")
			.call(xAxis);

		var txt = d3.select("#timeSlideAxis").selectAll("text");
		if( this.axisTicksTxtDX!=null ) txt.attr("dx",this.axisTicksTxtDX);
		if( this.axisTicksTxtDY!=null ) txt.attr("dy",this.axisTicksTxtDY);
		if( this.axisTicksTxtRotate!=0 ) txt.attr("transform","rotate("+this.axisTicksTxtRotate+")");
		if( this.axisTicksTxtAnchor!=null ) txt.style("text-anchor",this.axisTicksTxtAnchor);
	},

	__updateAxis__ : function(anim) {
//		var xl = $("#timeSlideMainContentsWrap").position().left;
//		var xl = parseInt($("#timeSlideMainContentsWrap").css("left"));
		var xl = this.__getLeftPos__($("#timeSlideMainContentsWrap"));
		var w  = this._innerArea.width();

		var xScale = d3.time.scale()
			.domain([this.dateLControl,this.dateRControl])
			.range([xl,xl+w]);
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient(this.axisTicksOrient)
			.ticks(this.axisTicksNum)
			.tickFormat(this.__timeFormat__(this.axisTicksTxtFormat));

		if( anim==null ) {
			d3.select("#timeSlideXAxis")
				.call(xAxis);
		} else {
			d3.select("#timeSlideXAxis")
				.transition()
				.duration(anim)
				.call(xAxis);
		}

		var txt = d3.select("#timeSlideAxis").selectAll("text");
		if( this.axisTicksTxtDX!=null ) txt.attr("dx",this.axisTicksTxtDX);
		if( this.axisTicksTxtDY!=null ) txt.attr("dy",this.axisTicksTxtDY);
		if( this.axisTicksTxtRotate!=0 ) txt.attr("transform","rotate("+this.axisTicksTxtRotate+")");
		if( this.axisTicksTxtAnchor!=null ) txt.style("text-anchor",this.axisTicksTxtAnchor);
	},

	__makeCalendar__ : function(id,date,dateMin,dateMax,dtime) {
		if( dateMin!=null && date-dateMin<0 ) date = dateMin;
		if( dateMax!=null && date-dateMax>0 ) date = dateMax;

		var yy = date.getFullYear();
		var mm = date.getMonth();
		var dd = date.getDate();

		if( dateMin!=null ) {
			var ymin = dateMin.getFullYear();
			var mmin = dateMin.getMonth();
			var dmin = dateMin.getDate();
		} else {
			var ymin = yy-20;
			var mmin = mm;
			var dmin = 0;
		}
		if( dateMax!=null ) {
			var ymax = dateMax.getFullYear();
			var mmax = dateMax.getMonth();
			var dmax = dateMax.getDate();
		} else {
			var ymax = yy+20;
			var mmax = mm+1;
			var dmax = 0;
		}

		var widget = $("#"+id);
		this.__jQuery_setCSS__(widget,{"display":"block"});

		var table = $(this.__jQuery_create__('table',{'id':'timeSlideCalendarTable','class':'timeSlideCalendar'}));
		widget.append(table);

		this._calendar[id] = {
			widget : widget,
			table : table,
			yy : yy,
			mm : mm,
			dd : dd,
			yyon : yy,
			mmon : mm,
			ymin : ymin,
			mmin : mmin,
			dmin : dmin,
			ymax : ymax,
			mmax : mmax,
			dmax : dmax,

                        hour : 0,
                        min : 0,
                        sec : 0,

			dtime : dtime,

			onchangeFunc : null,
			onchangeDateFunc : null,
			onchangeTimeFunc : null,
			flgFirst : true,
		};

		this.__makeCalendarCaption__(id);
		this.__makeCalendarBody__(id,yy,mm,dd);

		this.__setCalendarCaptionButton__(id);

		this._calendar[id].timeFlg = ( dtime[3] || dtime[4] || dtime[5] );
		if( this._calendar[id].timeFlg ) {
			var self = this;
			this.__makeCalendarTimeForm__(id,date);
			this.__setCalendarTimeFormButton__(id,self);
		}

		this._calendar[id].flgFirst = false;
	},

	__makeCalendarCaption__ : function(id) {
		var cap = $(this.__jQuery_create__('caption',{'id':'timeSlideCalendarCaption','class':'timeSlideCalendar'}));
		this._calendar[id].table.append(cap);

		var buttonS = $(this.__jQuery_create__('input',{'id':'timeSlideCalendarCaptionStart',   'value':'|<'}));
		var buttonP = $(this.__jQuery_create__('input',{'id':'timeSlideCalendarCaptionPrevious','value':'<' }));
		var buttonN = $(this.__jQuery_create__('input',{'id':'timeSlideCalendarCaptionNext',    'value':'>' }));
		var buttonE = $(this.__jQuery_create__('input',{'id':'timeSlideCalendarCaptionEnd',     'value':'>|'}));

		var attr = {
			'class':'timeSlideCalendar timeSlideCalendarCaption timeSlideCalendarButton',
			'type':'button'
		};
		this.__jQuery_setAttr__(buttonS,attr);
		this.__jQuery_setAttr__(buttonP,attr);
		this.__jQuery_setAttr__(buttonN,attr);
		this.__jQuery_setAttr__(buttonE,attr);

		var selectYear = $(this.__jQuery_create__('select',{
			'id':'timeSlideCalendarCaptionSelectYear',
			'class':'timeSlideCalendar timeSlideCalendarCaption selectYear',
		}));
		var selectMonth = $(this.__jQuery_create__('select',{
			'id':'timeSlideCalendarCaptionSelectMonth',
			'class':'timeSlideCalendar timeSlideCalendarCaption selectMonth',
		}));

		cap.append(buttonS);
		cap.append(buttonP);
		cap.append(selectYear);
		cap.append("/");
		cap.append(selectMonth);
		cap.append(buttonN);
		cap.append(buttonE);

		var yy = this._calendar[id].yyon;
		var mm = this._calendar[id].mmon;
		var y0 = this._calendar[id].ymin;
		var m0 = this._calendar[id].mmin;
		var te = new Date(this._calendar[id].ymax,this._calendar[id].mmax);
/*
		var time = new Date(y0,m0);
		var n = 0;
		while( time-te<=0 ) {
//			var cm = m0+1;
//			if( cm<10 ) cm = "0" + cm;
//			var when = y0+"-"+cm;
			when = this.__dateFormat__(time,"yyyy/MM");
			var option = $(this.__jQuery_create__('option',{'value':when}));
			option.html(when);
			selectYear.append(option);
			if( y0==yy && m0==mm ) selectYear.prop('selectedIndex',n);

			n++;
			var time = new Date(y0,m0+1);
			y0 = time.getFullYear();
			m0 = time.getMonth();
		}
*/

		var time = new Date(y0,m0);
		var n = 0;
		while( time-te<=0 ) {
			var when = this.__dateFormat__(time,"yyyy");
			var option = $(this.__jQuery_create__('option',{'value':when}));
			option.html(when);
			selectYear.append(option);
			if( y0==yy ) selectYear.prop('selectedIndex',n);
			n++;
			var time = new Date(y0+1,0);
			y0 = time.getFullYear();
		}

		for(var m0=0; m0<12; m0++ ) {
			when = m0 + 1;
			var option = $(this.__jQuery_create__('option',{'value':when}));
			option.html(when);
			selectMonth.append(option);
			if( m0==mm ) selectMonth.prop('selectedIndex',m0);
		}

		if( yy==this._calendar[id].ymax && mm==this._calendar[id].mmax ) {
			buttonN.attr("disabled","disabled");
		}
		if( yy!=this._calendar[id].ymax || mm!=this._calendar[id].mmax ) {
			buttonN.removeAttr("disabled");
		}

		if( yy==this._calendar[id].ymin && mm==this._calendar[id].mmin ) {
			buttonP.attr("disabled","disabled");
		}
		if( yy!=this._calendar[id].ymin || mm!=this._calendar[id].mmin ) {
			buttonP.removeAttr("disabled");
		}
	},

	__makeCalendarBody__ : function(id,yy,mm,dd) {
		var ymin = this._calendar[id].ymin;
		var mmin = this._calendar[id].mmin;
		var dmin = this._calendar[id].dmin;
		var ymax = this._calendar[id].ymax;
		var mmax = this._calendar[id].mmax;
		var dmax = this._calendar[id].dmax;

		if( !this._calendar[id].flgFirst ) {
			this._calendar[id].table.find("tr").remove();
		}

		var leap_year=false;
		if ((yy%4 == 0 && yy%100 != 0) || (yy%400 == 0)) leap_year=true;

		var lom = new Array(31,28+leap_year,31,30,31,30,31,31,30,31,30,31);
		var dow = new Array("SUN","MON","TUE","WED","THU","FRI","SAT");

		var days=0;
		for (var i=0; i < mm; i++) days+=lom[i];
		var week = Math.floor((yy*365.2425+days)%7);

		var ds = -1;
		var de = 100;
		if( yy < ymin || ( yy == ymin && mm < mmin ) ) {
			ds = 100;
		} else if( yy == ymin && mm == mmin ) {
			ds = dmin;
		}
		if( yy > ymax || ( yy == ymax && mm > mmax ) ) {
			de = -1;
		} else if( yy == ymax && mm == mmax ) {
			de = dmax;
		}

		var j=0;

		var tr = $(this.__jQuery_create__('tr'));
		this._calendar[id].table.append(tr);
		for (i=0; i < 7; i++) {
			var td = $(this.__jQuery_create__('td'));
			td.html(dow[i]);
			tr.append(td);
		}

		var tr = $(this.__jQuery_create__('tr'));
		this._calendar[id].table.append(tr);
		for (i=0; i < week; i++,j++) {
			var td = $(this.__jQuery_create__('td'));
			tr.append(td);
		}

		for (i=1; i <= lom[mm]; i++) {
			var td = $(this.__jQuery_create__('td'));
			if (dd == i) {
				td.attr("class","daySet");
			} else {
				if( i < ds || i > de ) {
					td.attr("class","dayUnSelect");
				} else {
					td.attr("class","daySelect");
				}
			}
			td.html(i);
			tr.append(td);
			j++;
			if (j > 6) { 
				var tr = $(this.__jQuery_create__('tr'));
				this._calendar[id].table.append(tr);
				j=0;
			}
		}
		for (i=j; i > 6; i++) {
			var td = $(this.__jQuery_create__('td'));
			tr.append(td);
		}
	},

	__makeCalendarTimeForm__ : function(id,date) {
		var tr = $(this.__jQuery_create__('tr',{'class':'timeTr'}));
		var td1 = $(this.__jQuery_create__('td'));
		var td2 = $(this.__jQuery_create__('td'));
		var td3 = $(this.__jQuery_create__('td',{'colspan':3}));
		var td4 = $(this.__jQuery_create__('td'));
		var td5 = $(this.__jQuery_create__('td'));
		this._calendar[id].table.append(tr);
		tr.append(td1);
		tr.append(td2);
		tr.append(td3);
		tr.append(td4);
		tr.append(td5);
		this._calendar[id].timeForm = $(this.__jQuery_create__('input',{
			'id':'timeSlideCalendarTimeForm',
			'class':'time',
			'type':'text'
		}));
		this._calendar[id].timeFormPrev = $(this.__jQuery_create__('input',{
			'id':'timeSlideCalendarTimePrev',
			'class':'timePrev',
			'type':'button',
			'value':'<',
		}));
		this._calendar[id].timeFormNext = $(this.__jQuery_create__('input',{
			'id':'timeSlideCalendarTimeNext',
			'class':'timeNext',
			'type':'button',
			'value':'>',
		}));
		td2.append(this._calendar[id].timeFormPrev);
		td3.append(this._calendar[id].timeForm);
		td4.append(this._calendar[id].timeFormNext);

		if( date ) {
			this._calendar[id].hour = date.getHours();
			this._calendar[id].min  = date.getMinutes();
			this._calendar[id].sec  = date.getSeconds();
		} else {
			var date = new Date(
				this._calendar[id].yy,
				this._calendar[id].mm,
				this._calendar[id].dd,
				this._calendar[id].hour,
				this._calendar[id].min,
				this._calendar[id].sec );
		}

		var form = "HH:mm";
		if( this._calendar[id].dtime[5] > 0 ) form = "HH:mm:ss";
		if( this._calendar[id].dtime[3]==0 &&
			this._calendar[id].dtime[4]==0 &&
			this._calendar[id].dtime[5]==0 ) {
			this._calendar[id].timeForm.attr("readonly",true);
		}

		this._calendar[id].timeForm.val( this.__dateFormat__(date,form) );
	},

	__setCalendarCaptionButton__ : function(id) {
		var buttonS = this._calendar[id].table.find("#timeSlideCalendarCaptionStart");
		var buttonP = this._calendar[id].table.find("#timeSlideCalendarCaptionPrevious");
		var buttonN = this._calendar[id].table.find("#timeSlideCalendarCaptionNext");
		var buttonE = this._calendar[id].table.find("#timeSlideCalendarCaptionEnd");
		var selectY = this._calendar[id].table.find("#timeSlideCalendarCaptionSelectYear");
		var selectM = this._calendar[id].table.find("#timeSlideCalendarCaptionSelectMonth");

		var self = this;

		buttonN.click(function(e){
			e.stopPropagation();
			self._calendar[id].mmon = self._calendar[id].mmon + 1;
			self.__resetCalendarBody__(id,self);
		});
		buttonP.click(function(e){
			e.stopPropagation();
			self._calendar[id].mmon = self._calendar[id].mmon - 1;
			self.__resetCalendarBody__(id,self);
		});

		buttonS.click(function(e){
			e.stopPropagation();
			self._calendar[id].yyon = self._calendar[id].ymin;
			self._calendar[id].mmon = self._calendar[id].mmin;
			self.__resetCalendarBody__(id,self);
		});
		buttonE.click(function(e){
			e.stopPropagation();
			self._calendar[id].yyon = self._calendar[id].ymax;
			self._calendar[id].mmon = self._calendar[id].mmax;
			self.__resetCalendarBody__(id,self);
		});
		selectY.change(function(){
			self._calendar[id].yyon = self._calendar[id].ymin + this.selectedIndex;;
			self.__resetCalendarBody__(id,self);
		});
		selectM.change(function(){
			self._calendar[id].mmon = this.selectedIndex;
			self.__resetCalendarBody__(id,self);
		});

		self.__setDaySelectButton__(id,self._calendar[id].yyon,self._calendar[id].mmon,self);
	},

	__resetCalendarBody__ : function(id,self) {
		var time = new Date(self._calendar[id].yyon,self._calendar[id].mmon);
		var yy = time.getFullYear();
		var mm = time.getMonth();
		self._calendar[id].yyon = yy;
		self._calendar[id].mmon = mm;

		var dd = -1;
		if( self._calendar[id].yy==yy && self._calendar[id].mm==mm ) {
			dd = self._calendar[id].dd;
		}

		self.__makeCalendarBody__(id,yy,mm,dd);

		if( yy==self._calendar[id].ymax && mm==self._calendar[id].mmax ) {
			this._calendar[id].table.find("#timeSlideCalendarCaptionNext")
				.attr("disabled","disabled");
		}
		if( yy!=self._calendar[id].ymax || mm!=self._calendar[id].mmax ) {
			this._calendar[id].table.find("#timeSlideCalendarCaptionNext")
				.removeAttr("disabled");
		}

		if( yy==self._calendar[id].ymin && mm==self._calendar[id].mmin ) {
			self._calendar[id].table.find("#timeSlideCalendarCaptionPrevious")
				.attr("disabled","disabled");
		}
		if( yy!=self._calendar[id].ymin || mm!=self._calendar[id].mmin ) {
			self._calendar[id].table.find("#timeSlideCalendarCaptionPrevious")
				.removeAttr("disabled");
		}

//		var n = (yy - self._calendar[id].ymin) * 12 + mm - self._calendar[id].mmin;
		var n = yy - self._calendar[id].ymin;
		self._calendar[id].table.find("#timeSlideCalendarCaptionSelectYear")
			.prop("selectedIndex",n);
		self._calendar[id].table.find("#timeSlideCalendarCaptionSelectMonth")
			.prop("selectedIndex",mm);

//		self.__setDaySelectButton__(id,self._calendar[id].yy,self._calendar[id].mm,self);
		self.__setDaySelectButton__(id,yy,mm,self);

		if( this._calendar[id].timeFlg ) {
			self.__makeCalendarTimeForm__(id);
			self.__setCalendarTimeFormButton__(id,self);
		}
	},

	__setDaySelectButton__ : function(id,yy,mm,self) {
		self._calendar[id].table.find("td.daySelect").click(function(e){
			e.stopPropagation();
			var dd = Number(this.innerHTML);
			self._calendar[id].yy   = yy;
			self._calendar[id].mm   = mm;
			self._calendar[id].dd   = dd;
			self._calendar[id].yyon = yy;
			self._calendar[id].mmon = mm;
			var hour = self._calendar[id].hour;
			var min  = self._calendar[id].min;
			var sec  = self._calendar[id].sec;
			self.__resetCalendarBody__(id,self);

			var date = new Date(yy,mm,dd,hour,min,sec);
			if( self._calendar[id].onchangeFunc!=null )
				self._calendar[id].onchangeFunc(date);
			if( self._calendar[id].onchangeDateFunc!=null )
				self._calendar[id].onchangeDateFunc(date);
		});
	},

	__setCalendarTimeFormButton__ : function(id,self) {
		this._calendar[id].timeForm.change(function(e){
			e.stopPropagation();

			var yy   = self._calendar[id].yy;
			var mm   = self._calendar[id].mm;
			var dd   = self._calendar[id].dd;

			var date0 = new Date(yy,mm,dd);

			var date = parseTimeForm(this.value,date0);

			date = self.__checkTimeInterval__(date,date0,self._calendar[id].dtime);

			if( date - self.dateMin < 0 )  date = self.dateMin;
			if( date - self.dateMax > 0 )  date = self.dateMax;

			self._calendar[id].hour = date.getHours();
			self._calendar[id].min  = date.getMinutes();
			self._calendar[id].sec  = date.getSeconds();

			self.__updateCalendar__(id,date);

			if( self._calendar[id].onchangeFunc!=null )
				self._calendar[id].onchangeFunc(date);
			if( self._calendar[id].onchangeTimeFunc!=null )
				self._calendar[id].onchangeTimeFunc(date);
		});
		this._calendar[id].timeFormPrev.click(function(e){
			e.stopPropagation();
			setStepTime(id,-1,self);
		});
		this._calendar[id].timeFormNext.click(function(e){
			e.stopPropagation();
			setStepTime(id,+1,self);
		});

		function parseTimeForm(ctime,date0) {
			var ctime1 = ctime.split(":");

			var hh = Number(ctime1[0]);
			var mm = Number(ctime1[1]);
			var ss = 0;
			if( ctime1.length == 3 ) {
				ss = Number(ctime1[2]);
			}
			var tt = 1000 * ( ss + 60 * ( mm + 60 * hh ) );

			return new Date( (date0-0) + tt );
		}

		function setStepTime(id,dir,self) {
			var yy   = self._calendar[id].yy;
			var mm   = self._calendar[id].mm;
			var dd   = self._calendar[id].dd;
			var hour = self._calendar[id].hour;
			var min  = self._calendar[id].min;
			var sec  = self._calendar[id].sec;

			yy   = yy   + dir * self._calendar[id].dtime[0];
			mm   = mm   + dir * self._calendar[id].dtime[1];
			dd   = dd   + dir * self._calendar[id].dtime[2];
			hour = hour + dir * self._calendar[id].dtime[3];
			min  = min  + dir * self._calendar[id].dtime[4];
			sec  = sec  + dir * self._calendar[id].dtime[5];

			var date = new Date(yy,mm,dd,hour,min,sec);

			if( date - self.dateMin < 0 )  date = self.dateMin;
			if( date - self.dateMax > 0 )  date = self.dateMax;

			self._calendar[id].yy   = date.getFullYear();
			self._calendar[id].mm   = date.getMonth()+1;
			self._calendar[id].dd   = date.getDate();
			self._calendar[id].hour = date.getHours();
			self._calendar[id].min  = date.getMinutes();
			self._calendar[id].sec  = date.getSeconds();

			self.__updateCalendar__(id,date);

			if( self._calendar[id].onchangeFunc!=null )
				self._calendar[id].onchangeFunc(date);
			if( self._calendar[id].onchangeTimeFunc!=null )
				self._calendar[id].onchangeTimeFunc(date);
		}
	},

	__checkTimeInterval__ : function (date,date0,dtime) {
		var dt = date - date0;
		var dint = 1000 * ( dtime[5] + 60 * ( dtime[4] + 60 * dtime[3] ) );
		var mdt = Math.round( dt / dint );
		return new Date( (date0-0) + mdt * dint );
	},

	__updateCalendar__ : function (id,date) {
		this._calendar[id].yyon = date.getFullYear();
		this._calendar[id].mmon = date.getMonth();
		this._calendar[id].yy   = date.getFullYear();
		this._calendar[id].mm   = date.getMonth();
		this._calendar[id].dd   = date.getDate();
		this._calendar[id].hour = date.getHours();
		this._calendar[id].min  = date.getMinutes();
		this._calendar[id].sec  = date.getSeconds();
		this.__resetCalendarBody__(id,this);
	},

	__timePosition__ : function (time,w) {
		var aa = ( time - this.dateLControl ) / ( this.dateRControl - this.dateLControl );
		if( w ) {
			return w * aa;
		} else {
			return aa;
		}
	},

	__timePositionInvert__ : function (x,w) {
		var time = ( this.dateLControl - 0 ) + x / w * ( this.dateRControl - this.dateLControl );
		return new Date(time);
	},

	__getLeftPos__ : function(elem) {
		var xx = parseInt(elem.css("left"));
		if( isNaN(xx) ) {
			xx = elem.position().left;
		}
		return xx;
	},


	__dateFormat__ : function (date, format){
		if( date == null ) return null;

		var result = format;
		var f, rep;
		var week = new Array('SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT');
		var ff = [ 'yyyy', 'MM', 'ddd', 'dd', 'HH', 'mm', 'ss', 'fff' ];

		for( var i=0; i<ff.length; i++ ) {
			f = ff[i];
			if ( result.indexOf(ff[i]) > -1 ) {
				switch(i) {
					case 0: rep = date.getFullYear(); break;
					case 1: rep = __zeroPadding__(date.getMonth()+1,2); break;
					case 2: rep = week[date.getDay()]; break;
					case 3: rep = __zeroPadding__(date.getDate(),2); break;
					case 4: rep = __zeroPadding__(date.getHours(),2); break;
					case 5: rep = __zeroPadding__(date.getMinutes(),2); break;
					case 6: rep = __zeroPadding__(date.getSeconds(),2); break;
					case 7: rep = __zeroPadding__(date.getMilliseconds(),3); break;
				}
				result = result.replace(ff[i], rep);
			}
		}

		return result;

		function __zeroPadding__(value, length){
		    return new Array(length - ('' + value).length + 1).join('0') + value;
		}
	},


	__dateParse__ : function(date, format, date0){
		var time = [ 0, 0, 1, 0, 0, 0, 0 ];
		if( date0 ) {
			time[0] = date0.getFullYear();
			time[1] = date0.getMonth();
			time[2] = date0.getDate();
			time[3] = date0.getHours();
			time[4] = date0.getMinutes();
			time[5] = date0.getSeconds();
			time[6] = date0.getMilliseconds();
		}

		var idx;
		var ff = [ 'yyyy', 'MM', 'dd', 'HH', 'mm', 'ss', 'fff' ];

		for( var i=0; i<ff.length; i++ ) {
			var f = ff[i];
			idx = format.indexOf(f);
			if ( idx > -1 ) {
				time[i] = date.substr(idx, f.length);
				if( i==1 ) time[i] = parseInt(time[i],10)-1;
			}
		}
		var result = new Date(time[0], time[1], time[2], time[3], time[4], time[5], time[6]);
		if( result=="Invalid Date" ) result = null;

		return result;
	},

	__jQuery_create__ : function() {
		if (arguments.length == 0) return [];
		var args = arguments[0] || {}, elem = null, elements = null;
		var siblings = null;

		// In case someone passes in a null object,
		// assume that they want an empty string.
		if (args == null) args = "";
		if (args.constructor == String) {
			if (arguments.length > 1) {
				var attributes = arguments[1];
				if (attributes.constructor == String) {
					elem = document.createTextNode(args);
					elements = [];
					elements.push(elem);
					siblings = this.__jQuery_create__.apply(null, Array.prototype.slice.call(arguments, 1));
					elements = elements.concat(siblings);
					return elements;

				} else {
					elem = document.createElement(args);

					// Set element attributes.
					var attributes = arguments[1];
					for (var attr in attributes)
						jQuery(elem).attr(attr, attributes[attr]);

					// Add children of this element.
					var children = arguments[2];
					children = this.__jQuery_create__.apply(null, children);
					jQuery(elem).append(children);

					// If there are more siblings, render those too.
					if (arguments.length > 3) {
						siblings = this.__jQuery_create__.apply(null, Array.prototype.slice.call(arguments, 3));
						return [elem].concat(siblings);
					}
					return elem;
				}
			} else {
//			return document.createTextNode(args);
				return document.createElement(args);
			}
		} else {
			elements = [];
			elements.push(args);
			siblings = this.__jQuery_create__.apply(null, (Array.prototype.slice.call(arguments, 1)));
			elements = elements.concat(siblings);
			return elements;
		}
	},


	__jQuery_setCSS__ : function(args,attributes) {
		// Set element attributes.
		for (var attr in attributes) {
			args.css(attr, attributes[attr]);
		}
	},

	__jQuery_setAttr__ : function(args,attributes) {
		// Set element attributes.
		for (var attr in attributes) {
			args.attr(attr, attributes[attr]);
		}
	},

	__setTimeToArray__ : function(time) {
		return [
			time.getFullYear(),
			time.getMonth(),
			time.getDate(),
			time.getHours(),
			time.getMinutes(),
			time.getSeconds(),
			time.getMilliseconds()
		];
	},

	__setTimeArrayToVar__ : function(tarray) {
		var yr0;
		var mo0 = 0;
		var dy0 = 1;
		var hr0 = 0;
		var mn0 = 0;
		var sc0 = 0;

		for( var i=0; i<tarray.length; i++ ) {
			switch(i) {
				case 0: yr0 = tarray[i]; break;
				case 1: mo0 = tarray[i]; break;
				case 2: dy0 = tarray[i]; break;
				case 3: hr0 = tarray[i]; break;
				case 4: mn0 = tarray[i]; break;
				case 5: sc0 = tarray[i]; break;
			}
		}
//	return new Date(yr0+"/"+(mo0+1)+"/"+dy0+" "+hr0+":"+mn0+":"+sc0);
		return new Date(yr0,mo0,dy0,hr0,mn0,sc0);
	},

	__setTimeDtPlus__ : function(tt,dt,num) {
		var tarr = this.__setTimeToArray__(tt);
		for( var i=0; i<tarr.length; i++ ) tarr[i] = tarr[i] + dt[i]*num;
		return this.__setTimeArrayToVar__(tarr);
	},

	__setTimeDtDivide__ : function(t0,t1,dt) {
		if( dt[0] == 0 && dt[1] == 0 ) {
			var dd = 1000 * ( dt[5] + 60 * ( dt[4] + 60 * ( dt[3] + 24 * dt[2] ) ) );
			return ( t1 - t0 ) / dd;
		} else {
			var dd = dt[0] * 12 + dt[1];
			var tt = ( t1.getFullYear() - t0.getFullYear() )*12
				+ ( t1.getMonth() - t0.getMonth() );
			return tt / dd;
		}
	},

	__setTimeIntervalSet__ : function(t0,t1,dt) {
		var nt = Math.round( this.__setTimeDtDivide__(t0,t1,dt) );
		return this.__setTimeDtPlus__(t0,dt,nt);
	},

}



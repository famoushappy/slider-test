;(function (global, factory) {
	typeof module === 'object' && typeof module.exports === 'object' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define([], factory) :
	(global.SliderTest = factory());
}(typeof window !== "undefined" ? window : this, (function () {
	// not support ------ start
	function NotSupport() {
		this.err();
	};
	NotSupport.prototype.err = function() {
		throw new Error( "current environment without a window with a document" );
	};
	if (typeof window === 'undefined' || typeof document === 'undefined') { //无法通过窗口获取元素的时候
		var SliderTest = this.SliderTest = NotSupport;
		return SliderTest;
	}
	// not support ------ end
	
	function SliderTest(options) {
		// 免费图片外链(路过图床)：https://imgchr.com
		this.img1 = "https://s2.ax1x.com/2019/07/16/Z7ycRO.png";
		this.img2 = "https://s2.ax1x.com/2019/07/16/Z76j1O.png";
		this.img3 = "https://s2.ax1x.com/2019/07/16/Z76xje.png";
		this.img4 = "https://s2.ax1x.com/2019/07/16/Z7cSnH.png";
		// this.logo = "https://s2.ax1x.com/2019/07/16/Z7667n.png";
		this.logo = "https://s2.ax1x.com/2019/07/19/Zvto9K.png";
		this.logoSuccess = "https://s2.ax1x.com/2019/07/19/ZvtqnH.png";
		this.successStatus = "https://s2.ax1x.com/2019/07/19/ZvUEse.png";
		this.readyBtnImg = "https://s2.ax1x.com/2019/07/16/Z7cpBd.png";
		this.moveBtnImg = "https://s2.ax1x.com/2019/07/16/Z7cPAI.png";
		this.closeImg = "https://s2.ax1x.com/2019/07/16/Z7cF4P.png";
		this.refreshImg = "https://s2.ax1x.com/2019/07/16/Z76onJ.png";
		this.wrapperBtnText = "加载中···"; // 点击按钮在图片加载时显示的文本
		this.loadedImgCount = 0; // 加载出的图片个数
		/*
			options参数说明：
			必传参数：  	el: 用户传入的element
						success: 验证成功回调函数
			可选参数：	width: 创建的点击按钮宽度，默认300
						height: 创建的点击按钮高度，默认40
						before: 若需要弹出滑块层之前，进行某些验证，可在options中添加before函数，若要继续弹出return true，反之return false
						showLogo: 是否显示按钮上右侧logo图标
						btnText: 创建的点击按钮在图片加载完成时显示的文本，默认为"点击按钮进行验证"
		*/
		this.ele = this.getEle(options.el); // 用户传入的element
		if (!options.hasOwnProperty('showLogo')) options.showLogo = true; //未传入showLogo时，默认显示按钮上右侧logo图标
		this.options = options;
		this.opening = false; //是否打开滑块图片, 默认未打开
		this.canMove = false; //canvas是否可以移动
		this.closeOrRefresh = true; //关闭、刷新是否可点击
		this.wrapperWidth = options.width || 300; //创建的点击按钮宽度，默认300
		this.wrapperHeight = options.height || 40; //创建的点击按钮高度，默认40
		this.sliderImgWidth = 260; // 滑块背景图宽度
		this.sliderImgHeight = 160; // 滑块背景图高度
		this.sliderbtnWidth = 58; // 滑动按钮宽高
		this.wh = 50; // 滑动图片的宽高
		this.r = 8; // 滑块图片上的小圆半径
		this.directions = ['lefttop', 'leftbottom', 'topleft', 'topright', 'righttop', 'rightbottom', 'bottomleft', 'bottomright']; // 去除上下方向和左右方向
		
		// 初始化
		this.init();
	};
	
	// 初始化
	SliderTest.prototype.init = function() {
		this.createButton();
		this.setStyle();
		this.setListeners();
	}
	
	// 监听函数
	SliderTest.prototype.setListeners = function() {
		// 图片加载
		this.imgLoaded();
		// 圆弧随着鼠标转动
		document.removeEventListener('mousemove', this.sectorRotateListener.bind(this), false);
		document.addEventListener('mousemove', this.sectorRotateListener.bind(this), false);
		// wrapperBtn点击监听
		this.wrapperBtn.removeEventListener('click', this.wrapperBtnClickListener.bind(this), false);
		this.wrapperBtn.addEventListener('click', this.wrapperBtnClickListener.bind(this), false);
		// 滚动条阻止默认行为
		document.removeEventListener('mousewheel', this.scrollPreventDefault.bind(this), { passive: false });
		document.addEventListener('mousewheel', this.scrollPreventDefault.bind(this), { passive: false });
		// 关闭按钮点击监听
		this.close.removeEventListener('click', this.closeClickListener.bind(this), false);
		this.close.addEventListener('click', this.closeClickListener.bind(this), false);
		// 刷新按钮点击监听
		this.refresh.removeEventListener('click', this.refreshClickListener.bind(this), false);
		this.refresh.addEventListener('click', this.refreshClickListener.bind(this), false);
		// sliderbtn监听事件
		this.sliderbtn.removeEventListener('mousedown', this.sliderbtnMouseDown.bind(this), false);
		this.sliderbtn.addEventListener('mousedown', this.sliderbtnMouseDown.bind(this), false);
		this.sliderbtn.removeEventListener('mousemove', this.sliderbtnMouseMove.bind(this), false);
		this.sliderbtn.addEventListener('mousemove', this.sliderbtnMouseMove.bind(this), false);
		document.removeEventListener('mouseup', this.sliderbtnMouseUp.bind(this), false);
		document.addEventListener('mouseup', this.sliderbtnMouseUp.bind(this), false);
		
	}
	// mousedown
	SliderTest.prototype.sliderbtnMouseDown = function(e) {
		e.preventDefault();
		if (!this.canMove) return;
		this.mouseDowned = true;
		this.startX = e.clientX || e.pageX;
		this.sliderbtn.children[0].style.display = 'none';//readimg
		this.sliderbtn.children[1].style.display = 'block';//moveimg
		this.sliderbtn.parentNode.children[0].style.opacity = 0;
	}
	// mousemove
	SliderTest.prototype.sliderbtnMouseMove = function(e) {
		if (!this.canMove || !this.mouseDowned) return;
		var x =  e.clientX || e.pageX,
			canvasGap = 12, // 小圆半径8 加上小圆阴影偏移量4  不能大于15，如果endCanvas刚好随机到最右侧，moveCanvas将移动不到那个位置
			btnGap = 5;
		if (x < this.startX) {
			this.sliderbtn.style.left = 0;
			this.moveCanvas.style.left = this.ranX - this.ranEndX + 'px';
		} else if ((x - this.startX) >= (this.sliderImgWidth - this.sliderbtnWidth - btnGap)) {
			this.sliderbtn.style.left = this.sliderImgWidth - this.sliderbtnWidth - btnGap + 'px';
		} else {
			this.sliderbtn.style.left = (x - this.startX) + 'px';
			var moveCanvasLeft = (this.ranX - this.ranEndX) + (x - this.startX),
				moveCanvasMaxL = (this.sliderImgWidth - this.ranEndX - this.wh - canvasGap);
			moveCanvasLeft = moveCanvasLeft >= moveCanvasMaxL ? moveCanvasMaxL : moveCanvasLeft;
			this.moveCanvas.style.left = moveCanvasLeft + 'px';
		}
	}
	// mouseup
	SliderTest.prototype.sliderbtnMouseUp = function(e) {
		if (!this.canMove || !this.mouseDowned) return;
		this.canMove = false;
		this.mouseDowned = false;
		this.closeOrRefresh = false;//禁止点击关闭、刷新
		this.sliderbtn.children[0].style.display = 'block';
		this.sliderbtn.children[1].style.display = 'none';
		var moveCanvasLeft = this.getStyle(this.moveCanvas, 'left'),
			absLeft = Math.abs(moveCanvasLeft),
			_this = this;
		if (absLeft <= 3) {//成功
			this.successtip.style.bottom = 0;
			setTimeout(function() {
				_this.show.style.display = 'none';
				_this.opening = false;
				document.body.style.overflow = '';
				_this.wrapperSuccess.style.display = 'block'; //显示成功状态
				_this.status = 1; // 验证成功
				_this.successtip.style.bottom = '-26px';
				_this.sliderbtn.style.left = 0;
				_this.moveCanvas.style.left = _this.ranX - _this.ranEndX + 'px';
				_this.canMove = true;
				_this.closeOrRefresh = true;
				_this.sliderbtn.parentNode.children[0].style.opacity = 1;
				_this.options.success && _this.options.success();
			}, 800);
		} else {//失败
			this.sliderbtn.style.transition = 'left .3s';
			this.moveCanvas.style.transition = 'left .3s';
			this.failtip.style.bottom = 0;
			setTimeout(function() {
				_this.sliderbtn.style.left = 0;
				_this.moveCanvas.style.left = _this.ranX - _this.ranEndX + 'px';
				setTimeout(function() {
					_this.failtip.style.bottom = '-26px';
					_this.canMove = true;
					_this.closeOrRefresh = true;
					_this.sliderbtn.style.transition = 'left 0s';
					_this.moveCanvas.style.transition = 'left 0s';
					_this.sliderbtn.parentNode.children[0].style.opacity = 1;
				}, 1000);
			}, 10);
		}
	}
	// 重置
	SliderTest.prototype.reset = function() {
		var _this = this;
		document.body.style.overflow = '';
		_this.wrapperSuccess.style.display = 'none'; //隐藏成功状态
		_this.show.style.display = 'none';
		_this.opening = false;
		_this.status = 0; 
		_this.canMove = true;
		_this.closeOrRefresh = true;
	}
	// 刷新按钮点击监听
	SliderTest.prototype.refreshClickListener = function(e) {
		if (!this.closeOrRefresh) return;
		e.stopPropagation();// 阻止冒泡
		this.sliderbtn.parentNode.children[0].innerText = '加载中···';
		this.canMove = false; //不能移动
		this.closeOrRefresh = false; //按钮开关，禁止
		var _this = this;
		this.sliderImg.src = this['img' + this.getRanNum(1, 4)];
		this.sliderImg.onload = function() {
			// 滑块图片小圆随机方向 和 x、y轴随机坐标值设置
			_this.getRanDirection();
			// 创建canvas
			_this.createMoveCanvas();
			_this.createEndCanvas();
			_this.sliderbtn.parentNode.children[0].innerText = '拖动左边滑块完成上方拼图';
			_this.canMove = true;
			_this.closeOrRefresh = true; //按钮开关，解除
		}
	}
	// 关闭按钮点击监听
	SliderTest.prototype.closeClickListener = function(e) {
		if (!this.closeOrRefresh) return;
		e && e.stopPropagation();// 阻止冒泡
		this.show.style.display = 'none';
		this.opening = false;
		document.body.style.overflow = '';
	}
	// 滚动条阻止默认行为
	SliderTest.prototype.scrollPreventDefault = function(e) {
		if (this.opening) {
			e.preventDefault && e.preventDefault();
			e.returnValue = false;
		}
	}
	// wrapperBtn点击监听
	SliderTest.prototype.wrapperBtnClickListener = function(e) {
		if ((this.loadedImgCount < this.imgs.length) || this.status) return;
		// 若需要弹出滑块层之前，进行某些验证，可在options中添加before函数，若要继续弹出return true，反之return false
		if (this.options.before && !this.options.before()) return;
		var wrapOffsetL = this.getElePos(this.wrapper).left, //slider-test-wrapper距离页面左侧距离
			wrapOffsetT = this.getElePos(this.wrapper).top, //slider-test-wrapper距离页面顶部距离
			offsetX = 48, //slider-test-points所占x轴位置
			offsetY = this.wrapperHeight / 2, //slider-test-points所占y轴位置
			sliderWrapW = 280, //滑块弹出窗区域宽度
			sliderWrapH = 286, //滑块弹出窗区域高度
			margin = 10; // 空隙
		this.winW = document.documentElement.clientWidth; //浏览器可视区域宽度
		this.winH = document.documentElement.clientHeight; //浏览器可视区域高度
		// 若超出当前屏幕范围
		if ((wrapOffsetL + offsetX + sliderWrapW + margin) > this.winW) {// x轴右侧超出时
			var overX = (wrapOffsetL + offsetX + sliderWrapW + margin) - this.winW;
			offsetX -= overX;
		}
		var overY;
		if ((wrapOffsetT + offsetY + sliderWrapH/2 + margin) > this.winH) {// y轴下侧超出时
			overY = (wrapOffsetT + offsetY + sliderWrapH/2 + margin) - this.winH;
			offsetY -= overY;
			this.arrow.style.top = - 8 + overY + 'px';
		} else if ((wrapOffsetT + offsetY + margin) < sliderWrapH/2) {// y轴上侧超出时
			overY = sliderWrapH/2 + margin - (wrapOffsetT + offsetY);
			offsetY += overY;
			this.arrow.style.top = - 8 - overY + 'px';
		} else {
			this.arrow.style.top = - 8 + 'px';
		}
		this.sliderWindow.style.left = wrapOffsetL + offsetX + 'px';
		this.sliderWindow.style.top = wrapOffsetT + offsetY + 'px';
		// 滑块图片小圆随机方向 和 x、y轴随机坐标值设置
		this.getRanDirection();
		// 创建canvas
		this.createMoveCanvas();
		this.createEndCanvas();
		// 显示滑块窗
		this.show.style.display = 'block';
		this.opening = true;
		document.body.style.overflow = 'hidden';
	}
	// 滑块图片小圆随机方向设置
	SliderTest.prototype.getRanDirection = function() {
		this.canMove = false; // canvas未创建完成，不能移动
		var ranIndex = this.getRanNum(0 , this.directions.length - 1);
		this.ranDirection = this.directions[ranIndex]; //随机方向
		this.ranX = this.getRanNum(12, 68); // x轴坐标
		this.ranEndX = this.getRanNum(142, 198); // 滑块终点x轴坐标
		this.ranY = this.getRanNum(12, 98); // y轴坐标
	}
	// 创建moveCanvas
	SliderTest.prototype.createMoveCanvas = function() {
		var canvas = this.moveCanvas = this.wrapper.querySelector('.slider-test-canvas-move') || document.createElement("canvas");
		canvas.width = this.sliderImgWidth;
		canvas.height = this.sliderImgHeight;
		canvas.className = 'slider-test-canvas slider-test-canvas-move';
		canvas.style.left = this.ranX - this.ranEndX + 'px';
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);//清空
		context.shadowBlur = 8; // 模糊尺寸
		context.shadowColor = 'rgba(0, 0, 0, 1)'; // 阴影颜色
		// drawImage前4个参数为被裁剪图片的x、y坐标和宽高，后4个参数为将要绘制在画布的x、y坐标和宽高
		context.drawImage(this.sliderImg, this.ranEndX, this.ranY, this.wh, this.wh, this.ranEndX, this.ranY, this.wh, this.wh);
		context.fillStyle = context.createPattern(this.sliderImg, 'no-repeat');
		context.shadowBlur = 4; // 模糊尺寸
		context.shadowColor = 'rgba(0, 0, 0, 0.6)'; // 阴影颜色
		// left
		if (this.ranDirection.indexOf('left') > -1) {
			context.beginPath(); 
			context.shadowOffsetX = -4;
			context.shadowOffsetY = 0;
			context.arc(this.ranEndX, this.ranY + this.wh/2, this.r, Math.PI/2, Math.PI * 3/2);
			context.fill();
		}
		// top
		if (this.ranDirection.indexOf('top') > -1) {
			context.beginPath(); 
			context.shadowOffsetX = 0;
			context.shadowOffsetY = -4;
			context.arc(this.ranEndX + this.wh/2, this.ranY, this.r, Math.PI, Math.PI * 2);
			context.fill();
		}
		// right
		if (this.ranDirection.indexOf('right') > -1) {
			context.beginPath(); 
			context.shadowOffsetX = 4;
			context.shadowOffsetY = 0;
			context.arc(this.ranEndX + this.wh, this.ranY + this.wh/2, this.r, -Math.PI/2, Math.PI/2);
			context.fill();
		}
		// bottom
		if (this.ranDirection.indexOf('bottom') > -1) {
			context.beginPath(); 
			context.shadowOffsetX = 0;
			context.shadowOffsetY = 4;
			context.arc(this.ranEndX + this.wh/2, this.ranY + this.wh, this.r, 0, Math.PI);
			context.fill();
		}
		// 黄色带透明的描边
		context.beginPath();
		// context.lineWidth = 0; //描边粗细
		context.lineWidth = 3;
		// context.strokeStyle = 'transparent';    //设定描边颜色，只要写在.stroke()方法前面即可
		context.strokeStyle = 'rgba(221, 221, 0, .4)';
		// context.shadowBlur = 0; // 模糊尺寸
		context.shadowBlur = 3;
		context.shadowOffsetX = context.shadowOffsetY = 0;
		context.shadowColor = 'rgba(221, 221, 0, .3)'; // 阴影颜色
		context.moveTo(this.ranEndX, this.ranY);
		if (this.ranDirection.indexOf('top') > -1) {
			context.lineTo(this.ranEndX + this.wh/2 - this.r, this.ranY);
			context.arcTo(this.ranEndX + this.wh/2 - this.r, this.ranY - this.r, this.ranEndX + this.wh/2, this.ranY - this.r, this.r);
			context.arcTo(this.ranEndX + this.wh/2 + this.r, this.ranY - this.r, this.ranEndX + this.wh/2 + this.r, this.ranY, this.r);
		}
		context.lineTo(this.ranEndX + this.wh, this.ranY);
		if (this.ranDirection.indexOf('right') > -1) {
			context.lineTo(this.ranEndX + this.wh, this.ranY + this.wh/2 -this.r);
			context.arcTo(this.ranEndX + this.wh + this.r, this.ranY + this.wh/2 - this.r, this.ranEndX + this.wh + this.r, this.ranY + this.wh/2, this.r);
			context.arcTo(this.ranEndX + this.wh + this.r, this.ranY + this.wh/2 + this.r, this.ranEndX + this.wh, this.ranY + this.wh/2 + this.r, this.r);
		}
		context.lineTo(this.ranEndX + this.wh, this.ranY + this.wh);
		if (this.ranDirection.indexOf('bottom') > -1) {
			context.lineTo(this.ranEndX + this.wh/2 + this.r, this.ranY + this.wh);
			context.arcTo(this.ranEndX + this.wh/2 + this.r, this.ranY + this.wh + this.r, this.ranEndX + this.wh/2, this.ranY + this.wh + this.r, this.r);
			context.arcTo(this.ranEndX + this.wh/2 - this.r, this.ranY + this.wh + this.r, this.ranEndX + this.wh/2 - this.r, this.ranY + this.wh, this.r);
		}
		context.lineTo(this.ranEndX, this.ranY + this.wh);
		if (this.ranDirection.indexOf('left') > -1) {
			context.lineTo(this.ranEndX, this.ranY + this.wh/2 + this.r);
			context.arcTo(this.ranEndX - this.r, this.ranY + this.wh/2 + this.r, this.ranEndX - this.r, this.ranY + this.wh/2, this.r);
			context.arcTo(this.ranEndX - this.r, this.ranY + this.wh/2 - this.r, this.ranEndX, this.ranY + this.wh/2 - this.r, this.r);
		}
		context.lineTo(this.ranEndX, this.ranY);
		context.stroke();
		this.sliderImg.parentNode.appendChild(canvas);
	}
	// 创建endCanvas
	SliderTest.prototype.createEndCanvas = function() {
		var canvas = this.endCanvas = this.wrapper.querySelector('.slider-test-canvas-end') || document.createElement("canvas");
		canvas.width = this.sliderImgWidth;
		canvas.height = this.sliderImgHeight;
		canvas.className = 'slider-test-canvas slider-test-canvas-end';
		var context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);//清空
		// 透明的描边
		context.beginPath();
		context.lineWidth = 0; //描边粗细
		context.strokeStyle = "transparent";    //设定描边颜色，只要写在.stroke()方法前面即可
		context.shadowBlur = 0; // 模糊尺寸
		context.shadowOffsetX = context.shadowOffsetY = 0;
		context.shadowColor = 'rgba(0, 0, 0, 1)'; // 阴影颜色
		context.moveTo(this.ranEndX, this.ranY);
		if (this.ranDirection.indexOf('top') > -1) {
			context.lineTo(this.ranEndX + this.wh/2 - this.r, this.ranY);
			context.arcTo(this.ranEndX + this.wh/2 - this.r, this.ranY - this.r, this.ranEndX + this.wh/2, this.ranY - this.r, this.r);
			context.arcTo(this.ranEndX + this.wh/2 + this.r, this.ranY - this.r, this.ranEndX + this.wh/2 + this.r, this.ranY, this.r);
		}
		context.lineTo(this.ranEndX + this.wh, this.ranY);
		if (this.ranDirection.indexOf('right') > -1) {
			context.lineTo(this.ranEndX + this.wh, this.ranY + this.wh/2 -this.r);
			context.arcTo(this.ranEndX + this.wh + this.r, this.ranY + this.wh/2 - this.r, this.ranEndX + this.wh + this.r, this.ranY + this.wh/2, this.r);
			context.arcTo(this.ranEndX + this.wh + this.r, this.ranY + this.wh/2 + this.r, this.ranEndX + this.wh, this.ranY + this.wh/2 + this.r, this.r);
		}
		context.lineTo(this.ranEndX + this.wh, this.ranY + this.wh);
		if (this.ranDirection.indexOf('bottom') > -1) {
			context.lineTo(this.ranEndX + this.wh/2 + this.r, this.ranY + this.wh);
			context.arcTo(this.ranEndX + this.wh/2 + this.r, this.ranY + this.wh + this.r, this.ranEndX + this.wh/2, this.ranY + this.wh + this.r, this.r);
			context.arcTo(this.ranEndX + this.wh/2 - this.r, this.ranY + this.wh + this.r, this.ranEndX + this.wh/2 - this.r, this.ranY + this.wh, this.r);
		}
		context.lineTo(this.ranEndX, this.ranY + this.wh);
		if (this.ranDirection.indexOf('left') > -1) {
			context.lineTo(this.ranEndX, this.ranY + this.wh/2 + this.r);
			context.arcTo(this.ranEndX - this.r, this.ranY + this.wh/2 + this.r, this.ranEndX - this.r, this.ranY + this.wh/2, this.r);
			context.arcTo(this.ranEndX - this.r, this.ranY + this.wh/2 - this.r, this.ranEndX, this.ranY + this.wh/2 - this.r, this.r);
		}
		context.lineTo(this.ranEndX, this.ranY);
		context.stroke();
		//水平渐变
        // var gr = context.createLinearGradient(this.ranEndX, this.ranY, this.ranEndX + this.wh, this.ranY);
		var gr = context.createLinearGradient(this.ranEndX - this.r, this.ranY - this.r, this.ranEndX + this.wh + this.r, this.ranY - this.r);
        //添加颜色端点
        gr.addColorStop(0,'rgba(0,0,0,.5)');
        gr.addColorStop(.22,'rgba(0,0,0,.2)');  
		gr.addColorStop(.5,'rgba(0,0,0,.2)'); 
		gr.addColorStop(.78,'rgba(0,0,0,.2)');
        gr.addColorStop(1,'rgba(0,0,0,.5)');        
        //应用fillStyle生成渐变
        context.fillStyle = gr;
		context.fill();
		// //垂直渐变
		// var gr = context.createLinearGradient(this.ranEndX, this.ranY, this.ranEndX, this.ranY + this.wh);
		var gr = context.createLinearGradient(this.ranEndX - this.r, this.ranY - this.r, this.ranEndX - this.r, this.ranY + this.wh + this.r);
		//添加颜色端点
		gr.addColorStop(0,'rgba(0,0,0,.5)');
		gr.addColorStop(.22,'rgba(0,0,0,.2)');  
		gr.addColorStop(.5,'rgba(0,0,0,.2)'); 
		gr.addColorStop(.78,'rgba(0,0,0,.2)');
		gr.addColorStop(1,'rgba(0,0,0,.5)');       
		//应用fillStyle生成渐变
		context.fillStyle = gr;
		context.fill();
		this.sliderImg.parentNode.appendChild(canvas);
		this.canMove = true; //canvas加载完成，可以移动
	}
	// 圆弧随着鼠标转动
	SliderTest.prototype.sectorRotateListener = function(e) {
		var wrapOffsetL = this.getElePos(this.wrapper).left, //slider-test-wrapper距离页面左侧距离
			wrapOffsetT = this.getElePos(this.wrapper).top, //slider-test-wrapper距离页面顶部距离
			circleCenterToWrapL = 25, //slider-test-sector圆心距离slider-test-wrapper左侧距离
			circleCenterToWrapT = 20, //slider-test-sector圆心距离slider-test-wrapper顶部距离
			totalL = wrapOffsetL + circleCenterToWrapL, //slider-test-sector圆心距离页面左侧距离
			totalT = wrapOffsetT + circleCenterToWrapT, //slider-test-sector圆心距离页面顶部距离
			pageX = e.clientX || e.pageX, //当前鼠标x轴坐标
			pageY = e.clientY || e.pageY, //当前鼠标y轴坐标
			angle = this.getAngle(totalL, totalT, pageX, pageY); //rotate角度值
		this.sector.style.transform = 'rotate(' + (angle) + 'deg)';
	}
	// 等待图片加载完成
	SliderTest.prototype.imgLoaded = function() {
		var imgs = this.imgs = this.wrapper.querySelectorAll('img'),
			_this = this;
		for (var i = 0; i < imgs.length; i++) {
			(function(i) {
				imgs[i].onload = function(e) {
					_this.loadedImgCount ++;
					if (_this.loadedImgCount === imgs.length) {
						_this.wrapperBtnText = _this.options.btnText || "点击按钮进行验证";//传入自定义文本时，使用传入的文本
						_this.wrapper.querySelector('.slider-test-wrapperbtn-text').innerText = _this.wrapperBtnText;
					}
				}
			})(i);
		}
	}
	
	// 创建点击按钮
	SliderTest.prototype.createButton = function() {
		var eleStr = `<div class='slider-test-wrapper'>
						<div class='slider-test-wrapper-btn slider-test-boxsizing'>
							<div class='slider-test-radar slider-test-boxsizing'>
								<div class='slider-test-infinity slider-test-boxsizing'></div>
								<div class='slider-test-ring slider-test-boxsizing'></div>
								<div class='slider-test-sector slider-test-boxsizing'></div>
								<div class='slider-test-dot'></div>
							</div>
							<div class='slider-test-wrapperbtn-text'>` + this.wrapperBtnText + `</div>
							<div class='slider-test-logo'>
								<img alt='' src='` + this.logo + `' />
							</div>
						</div>
						<div class='slider-test-wrapper-success slider-test-boxsizing'>
							<div class='slider-test-success-status'>
								<img alt='' src='` + this.successStatus + `' />
							</div>
							<div class='slider-test-success-text'>验证成功</div>
							<div class='slider-test-success-logo'>
								<img alt='' src='` + this.logoSuccess + `' />
							</div>
						</div>
						<div class='slider-test-show' style='display: none;'>
							<div class='slider-test-points'>···</div>
							<div class='slider-test-slider-window'>
								<div class='slider-test-ghost'></div>
								<div class='slider-test-slider-wrap slider-test-boxsizing'>
									<div class='slider-test-imgbox'>
										<img class='slider-test-img' src='` + this['img' + this.getRanNum(1, 4)] + `' alt='' />
										<div class='slider-test-successtip slider-test-result slider-test-boxsizing'>成功拖动滑块完成拼图</div>
										<div class='slider-test-failtip slider-test-result slider-test-boxsizing'>拖动滑块将悬浮图像正确拼合</div>
									</div>
									<div class='slider-test-sliderbtn-box slider-test-boxsizing'>
										<div class='slider-test-sliderbtn-text'>拖动左边滑块完成上方拼图</div>
										<div class='slider-test-sliderbtn'>
											<img src='` + this.readyBtnImg + `' class='slider-test-ready-img' alt='' />
											<img src='` + this.moveBtnImg + `' class='slider-test-move-img' alt='' style='display: none;' />
										</div>
									</div>
									<div class='slider-test-btns-box slider-test-boxsizing'>
										<img alt='' src='` + this.closeImg + `' class='slider-test-close' />
										<img alt='' src='` + this.refreshImg + `' class='slider-test-refresh' />
									</div>
								</div>
								<div class='slider-test-arrow'>
									<div class='slider-test-arrow-out'></div>
									<div class='slider-test-arrow-in'></div>
								</div>
							</div>
						</div>
					  </div>`;
		this.ele.innerHTML = eleStr;
		this.wrapper = this.ele.querySelector('.slider-test-wrapper');
		this.wrapperBtn = this.ele.querySelector('.slider-test-wrapper-btn');
		this.wrapperSuccess = this.ele.querySelector('.slider-test-wrapper-success');
		this.radar = this.ele.querySelector('.slider-test-radar');
		this.sector = this.ele.querySelector('.slider-test-sector');
		this.show = this.ele.querySelector('.slider-test-show');
		this.sliderWindow = this.ele.querySelector('.slider-test-slider-window');
		this.sliderImg = this.ele.querySelector('.slider-test-img');
		this.sliderbtn = this.ele.querySelector('.slider-test-sliderbtn');
		this.arrow = this.ele.querySelector('.slider-test-arrow');
		this.close = this.ele.querySelector('.slider-test-close');
		this.refresh = this.ele.querySelector('.slider-test-refresh');
		this.successtip = this.ele.querySelector('.slider-test-successtip');
		this.failtip = this.ele.querySelector('.slider-test-failtip');
	}
	
	// 样式
	SliderTest.prototype.setStyle = function() {
		var styleStr = 
		`
		.slider-test-wrapper {width: ` + this.wrapperWidth + `px; height: ` + this.wrapperHeight + `px; background-image: linear-gradient(180deg, #ffffff 0%,#f3f3f3 100%); position: relative; cursor: pointer; line-height: ` + (this.wrapperHeight  - 2) + `px; font-size: 14px; color: #666; user-select: none;}
		.slider-test-wrapper-success {display: none; width: ` + this.wrapperWidth + `px; height: ` + this.wrapperHeight + `px; border: 1px solid #26C267; position: absolute; left: 0px; top: 0px; background: #EEFFF5; padding-left: 50px;` + (this.options.showLogo ? `padding-right: 44px;` : ``) + ` border-radius: 4px; font-size: 14px; color: #26C267; user-select: none; z-index: 9; cursor: initial;}
		.slider-test-success-status {width: 24px; height: 24px; position: absolute; left: 13px; top: ` + (this.wrapperHeight - 24)/2 + `px;}
		.slider-test-success-logo, .slider-test-logo {display: ` + (this.options.showLogo ? `block` : `none`) + `; width: 20px; height: 20px; position: absolute; right: 12px; top: ` + (this.wrapperHeight - 20)/2 + `px;}
		.slider-test-success-text, .slider-test-wrapperbtn-text {white-space: nowrap;}
		.slider-test-success-status>img, .slider-test-success-logo>img {width: 100%; height: 100%; display: block; border: 0 none;}
		.slider-test-wrapper-btn {width: 100%; height: 100%; position: relative; padding-left: 50px;` + (this.options.showLogo ? `padding-right: 44px;` : ``) + ` border: 1px solid #ccc; border-radius: 4px;}
		.slider-test-wrapper-btn:hover {background-image: linear-gradient(0deg, #ffffff 0%,#f3f3f3 100%);} 
		.slider-test-wrapper-btn:hover .slider-test-radar .slider-test-sector, .slider-test-wrapper-btn:hover .slider-test-radar .slider-test-ring {display: none;}
		.slider-test-boxsizing {box-sizing: border-box;} 
		.slider-test-radar {position: absolute; left: 10px; top: ` + (this.wrapperHeight - 30 - 2)/2 + `px; width: 30px; height: 30px; border-radius: 50%;}
		.slider-test-infinity, .slider-test-ring {width: 30px; height: 30px; border: 1px solid #3873ff; border-radius: 50%; background: #C6D5F8; position: absolute; left: 0; top: 0;}
		.slider-test-infinity {animation: scale 1s ease 0s infinite;}
		.slider-test-sector {width: 30px; height: 30px; position: absolute; left: 0; top: 0; background-color: #80A6FC; border: 1px solid #3873ff; border-radius: 50%; background-image: linear-gradient(115deg, rgba(0,0,0,0) 50%,#c6d5f8 50%),linear-gradient(65deg, #c6d5f8 50%,rgba(0,0,0,0) 50%);}
		.slider-test-dot {width: 12px; height: 12px; background: #3873ff; border-radius: 50%; position: absolute; left: 9px; top: 9px;}
		.slider-test-logo>img {width: 100%; height: 100%; display: block; border: 0 none;}
		.slider-test-show {cursor: default; width: 0; height: 0; position: absolute; left: 0; top: 0; z-index: 999;}
		.slider-test-points {font-size: 45px; line-height: ` + (this.wrapperHeight - 2 - 4) + `px; width: 48px; height: ` + (this.wrapperHeight - 2) + `px; position: absolute; left: 1px; top: 1px; background: #efefef; color: #666; text-align: center;}
		.slider-test-slider-window {position: fixed; left: 10000px; top: 10000px; width: 0; height: 0;}
		.slider-test-ghost {position: fixed; width: 100%; height: 100%; left: 0; top: 0; background: transparent;}
		.slider-test-slider-wrap {width: 280px; height: 286px; padding-top: 10px; background-color: #fff; box-shadow: 0 0 10px #ccc; border: 1px solid #ccc; position: absolute; left: 0; top: 0; margin-top: -143px;}
		.slider-test-imgbox {width: 260px; height: 160px; overflow: hidden; position: relative; margin: 0 auto;}
		.slider-test-img {width: 100%; height: 100%; display: block; border: 0 none;}
		.slider-test-canvas {position: absolute; left: 0; top: 0;}
		.slider-test-canvas-move { z-index: 999;}
		.slider-test-canvas-end { z-index: 99;}
		.slider-test-sliderbtn-box {width: 260px; height: 38px; line-height: 38px; position: relative; margin: 15px auto; background: #efefef; border-radius: 19px; box-shadow: inset 0 0 4px #ccc; padding-left: 65px; color: #88949d; user-select: none;}
		.slider-test-sliderbtn-text {opacity: 1; transition: opacity .3s;}
		.slider-test-sliderbtn {position: absolute; left: 0; top: -10px; width: 58px; height: 58px; cursor: pointer;}
		.slider-test-sliderbtn>div {position: absolute; left: 0; top: 0; width: 100%; height: 100%;}
		.slider-test-ready-img, .slider-test-move-img {width: 100%; height: 100%; display: block;}
		.slider-test-btns-box {width: 100%; height: 48px; border-top: 1px solid #eee; line-height: 48px; padding-left: 15px; cursor: default;}
		.slider-test-btns-box>img {width: 20px; height: 20px; margin: 0 5px; vertical-align: text-bottom; cursor: pointer;}
		.slider-test-btns-box>img.slider-test-refresh {width: 18px; height: 18px;}
		.slider-test-btns-box>img:hover {opacity: .8;}
		.slider-test-arrow {margin-left: -15px; position: absolute; left: 0; top: -8px;}
		.slider-test-arrow-out {position: absolute; border: 8px solid #ccc; border-color: transparent #ccc transparent transparent;}
		.slider-test-arrow-in {position: absolute; border: 7px solid #fff; margin: 1px 0 1px 2px; border-color: transparent #fff transparent transparent;}
		.slider-test-result {width: 100%; height: 26px; position: absolute; padding-left: 16px; line-height: 26px; color: #fff; font-size: 14px; left: 0; bottom: -26px; transition: bottom .3s; z-index: 1000;}
		.slider-test-successtip {background: #18A452;}
		.slider-test-failtip {background: #de715b;}
		
		@keyframes scale 
		{
			0% {
				transform: scale(1);
			}
			50% {
				transform: scale(0.75);
			}
			100% {
				transform: scale(1);
			}
		}
		@-moz-keyframes scale /* Firefox */
		{
			0% {
				transform: scale(1);
			}
			50% {
				transform: scale(0.75);
			}
			100% {
				transform: scale(1);
			}
		}

		@-webkit-keyframes scale /* Safari 和 Chrome */
		{
			0% {
				transform: scale(1);
			}
			50% {
				transform: scale(0.75);
			}
			100% {
				transform: scale(1);
			}
		}
		`;
		var styleEle = document.getElementById('slider-test-style');
		if (styleEle) {
			style.innerText = styleStr;
		} else {
			var style = document.createElement('style');
			style.id = 'slider-test-style';
			style.type = 'text/css';
			style.innerText = styleStr;
			document.head.appendChild(style);
		}
	}
	
	//获取实例，可传入class、id、元素对象
	SliderTest.prototype.getEle = function(ele) {
	  if (typeof ele === 'string') return document.querySelector(ele);
	  else if (typeof ele === 'object') {
	    try {
	      var eleToStr = Object.prototype.toString.call(ele).toLowerCase();
	      if (eleToStr.indexOf('html') > -1 && eleToStr.indexOf('element') > -1) {
	        return ele;
	      }else {
	        throw new Error('please introduction a true element!');
	      }
	    }
	    catch(err) {
	      throw new Error('please introduction a true element!');
	    }
	  }
	};
	
	// 获取元素距离浏览器位置视窗的位置
	SliderTest.prototype.getElePos = function(ele) {
        var xy = ele.getBoundingClientRect();
        var top = xy.top - document.documentElement.clientTop,//document.documentElement.clientTop 在IE67中始终为2，其他高级点的浏览器为0
            bottom = xy.bottom,
            left = xy.left - document.documentElement.clientLeft,//document.documentElement.clientLeft 在IE67中始终为2，其他高级点的浏览器为0
            right = xy.right,
            width = xy.width || (right - left), //IE67不存在width 使用right - left获得
            height = xy.height || (bottom - top);
        return {
            top: top,
            right: right,
            bottom: bottom,
            left: left,
            width: width,
            height: height
        }
    }
	// 获取页面两点之间角度
	SliderTest.prototype.getAngle = function(px, py, mx, my){
		// px: 圆心距离左侧距离(pointX)    py: 圆心距离顶部距离(pointY)  
		// mx: 鼠标x轴坐标(mouseX)        my: 鼠标y轴坐标(mouseY)
        var x = Math.abs(px-mx);
        var y = Math.abs(py-my);
        var z = Math.sqrt(Math.pow(x,2)+Math.pow(y,2));
        var cos = y/z;
        var radina = Math.acos(cos); //用反三角函数求弧度
        var angle = Math.floor(180/(Math.PI/radina)); //将弧度转换成角度
		if(mx>px&&my>py){//鼠标在第四象限
            angle = 180 - angle;
        }
        if(mx==px&&my>py){//鼠标在y轴负方向上
            angle = 180;
        }
        if(mx>px&&my==py){//鼠标在x轴正方向上
            angle = 90;
        }
        if(mx<px&&my>py){//鼠标在第三象限
            angle = 180+angle;
        }
        if(mx<px&&my==py){//鼠标在x轴负方向
            angle = 270;
        }
        if(mx<px&&my<py){//鼠标在第二象限
            angle = 360 - angle;
        }
		return angle;
    }
	// 获取行内样式
	SliderTest.prototype.getStyle = function(el, prop) {
		return (window.getComputedStyle ? window.getComputedStyle(el, null)[prop].replace('px', '') : el.currentStyle[prop].replace('px', '')) - 0;
	};
	// 获取随机整数
	SliderTest.prototype.getRanNum = function(min, max) {
		return Math.floor((Math.random() * (max - min + 1)) + min);
	}
	
	var SliderTest = window.SliderTest = SliderTest;
	return SliderTest;
})));
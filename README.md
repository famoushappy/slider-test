## slider-test

a using canvas javascript plugin for image slider testing


## Github

https://github.com/famoushappy/slider-test.git


## Install

npm install slider-test -S


## Usage

组件化开发时，在组件中引入

import SliderTest from 'slider-test';

或者：   var SliderTest = require('slider-test');

或者直接script标签引入js  

< script src="dist/slider-test.min.js" >< /script >  

当页面加载完成时，进行实例化。  

let sliderTest = new SliderTest({  
	el: '#app',  
	success: () => {console.log('success')}  
});  

调用 sliderTest.reset() 方法可回到初始化状态  


options参数说明：  
必传参数：  	el: 用户传入的element  
			success: 验证成功回调函数  
			
可选参数：	width: 创建的点击按钮宽度，默认300  
			height: 创建的点击按钮高度，默认40  
			before: 若需要弹出滑块层之前，进行某些验证，可在options中添加before函数，若要继续弹出return true，反之return false  
			showLogo: 是否显示按钮上右侧logo图标  
			btnText: 创建的点击按钮在图片加载完成时显示的文本，默认为"点击按钮进行验证"  

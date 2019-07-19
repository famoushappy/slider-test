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

<script src="dist/slider-test.min.js"></script>

当页面加载完成时，进行实例化。

let sliderTest = new SliderTest({
	el: '#app',
	success: () => {console.log('success')}
});

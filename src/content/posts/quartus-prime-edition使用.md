---
title: 'quartus-prime-edition使用'
date: 2019-01-01
category: 'FPGA'
tags: []
lang: 'zh'
draft: true
---
听从EDA老师的教导， 去英特尔官网上下载了quartus和modelsim 来使用

良心的英特尔下载速度感人， 打开是这个界面
![](https://upload-images.jianshu.io/upload_images/10651191-b7d2fe97ac0523d8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

想要复习一下上个学期学过的quartus的使用。

新建了一个工程之后就编译， 但是失败了

布局有些不太一样
![](https://upload-images.jianshu.io/upload_images/10651191-81f1cee032b57535.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

在这里有快捷方式去新建文件
我们要新建的应该是这个
![](https://upload-images.jianshu.io/upload_images/10651191-8124fe5094d96228.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这就进入了一个熟悉的界面

![](https://upload-images.jianshu.io/upload_images/10651191-6b1235adc07c7601.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

编译速度感人

![](https://upload-images.jianshu.io/upload_images/10651191-a3170a16329f9f4c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

需要注意的是你的这个文件名字必须和工程文件的名字是一样的， 否则就会编译失败
原因嘛， 正在进一步的探索中。

接下来就是愉快的仿真过程了

但是你发现modelsim的安装目录下并没有一个叫做modelsim的exe文件。

![](https://upload-images.jianshu.io/upload_images/10651191-fada76d45a8c1ff5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后这个时候它要你去找一下exe文件的位置。。。
哦，原来modelsim的可执行文件不叫modelsim
叫vsim.exe

![](https://upload-images.jianshu.io/upload_images/10651191-e86c9c0cd3cdd809.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就开始报错。。

![image.png](https://upload-images.jianshu.io/upload_images/10651191-74b10ab391ba2763.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

不懂， 这个问题以后再解决

## quartus 编译verilog 代码的时候提示没有顶层实体

这个时候检查一下模块名字， 一定要确保模块名和当前的工程的名是一样的。

终于成功地生成了网表的文件

![网表文件](https://upload-images.jianshu.io/upload_images/10651191-f690eeea4f461730.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
module test(A, B, C, D, S1, S0, Y);
	input A, B, C, D, S1, S0;
	output Y;
	reg [1:0] SEL;
	reg Y;
	
	always @(A, B, C, D, SEL)
		begin
			SEL = {S1, S0};
			if(SEL == 0)
				Y = A;
			else if(SEL == 1)
				Y = B;
			else if(SEL == 2)
				Y = C;
			else if(SEL == 3)
				Y = D;
		end
	
endmodule
```

![所以这种情况下真的生成了不一样的网表文件？](https://upload-images.jianshu.io/upload_images/10651191-454aff3ea2d877b6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

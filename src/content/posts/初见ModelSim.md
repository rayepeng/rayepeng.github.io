---
title: '初见ModelSim'
date: 2019-01-01
category: 'FPGA'
tags: []
lang: 'zh'
draft: true
---
ModelSim是我见过的最难找到可执行文件的一个。。
![路径](https://upload-images.jianshu.io/upload_images/10651191-d424a02006477bb5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第一次接ModelSim， 跟着教程一步步的做一遍。

## 建立work library
![第一面](https://upload-images.jianshu.io/upload_images/10651191-4c652f9ca1f9505f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到第一个是一个work字样

所以我们要新建一个名字叫做work的library

## 新建verilog文件

ModelSim默认的为VHDL文件， 不要一下回车就爽到底了
![愉快的编辑代码](https://upload-images.jianshu.io/upload_images/10651191-36a5ea90fe07d074.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
module half_clk_dai(clk_in, rst, clk_out);

input clk_in;
input rst;

output clk_out;
reg clk_out;

always @(posedge clk_in or negedge rst)
	begin 
		if(!rst)
			clk_out<=0;
		else
			clk_out<=!clk_out;
	end
	
endmodule

```
遗憾的是sublime text是不支持verilog的

```
`timescale 1ns/1ns

module half_clk_top;

reg clk_in;
reg rst;

initial 
begin 
	clk_in=1;
	rst=1;
	#1000
	rst=0;
	#1000
	rst=1;
	end
	
	
always #200 clk_in=~clk_in;

half_clk_dai dai1(.clk_in(clk_in), .rst(rst), .clk_out(clk_out));

endmodule

```

大概上面一段代码的含义就是
如果是rst的下降沿， 就会清零， 如果是clk_in的上升沿， 就会反向。

![仿真](https://upload-images.jianshu.io/upload_images/10651191-a533a8420a707f98.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

基本操作就这些了，写的很粗略

---
title: 'EDA作业'
date: 2019-01-01
category: 'FPGA'
tags: []
lang: 'zh'
draft: true
---
开始的想法是这样子的
```verilog
/*
把例5-15改成一个异步清零，同步时钟使能和异步数据加载型8位二进制加法计数器
 */

//原来的程序,现在修改为异步数据加载
//

module CNT10(CLK, RST, EN, LOAD, COUT, DOUT, DATA);
	input CLK, EN, RST, LOAD;
	input [3:0] DATA;
	output [3:0] DOUT;
	output COUT;

	reg[3:0] Q1;
	reg COUT;

	assign DOUT = Q1;

	always @(posedge CLK or negedge RST or negedge LOAD)
	begin
		if(!RST)
			Q1 <= 0;
		else if(EN) begin
			if(!LOAD) 
				Q1 <= DATA;
			else if (Q1 < 9) 
				Q1 <= Q1 +1;
				
			else 
				Q1 <= 4'b0000;
			end
	end	
		
	

	always @(Q1)
	begin
		if(Q1 == 4'h9)
			COUT = 1'b1;
		else 
			COUT = 1'b0;
	end

endmodule

```

写了一个testbench
```
module CNT10_tb();

	reg CLK, EN, RST, LOAD;

	reg[3:0] DATA;

	wire[3:0] DOUT;

	wire COUT;

	
	initial
	begin
		CLK = 0;
		DATA = 4'b1110;
		EN = 1;
		RST = 1;
		LOAD = 1;

		# 100
		
		LOAD = 0;

	end

	always 
	begin
	# 10
		CLK = ~CLK;
	end

	CNT10 C1(
		.CLK(CLK),
		.RST(RST),
		.EN(EN),
		.LOAD(LOAD),
		.COUT(COUT),
		.DOUT(DOUT),
		.DATA(DATA)
		);

	

endmodule

```
开始给data赋值未1110
en信号有效
rst信号是1
load信号开始无效(低电平),过了100个单位之后有效

波形大概是这样子的

![](https://upload-images.jianshu.io/upload_images/10651191-3ad608ce171bf29f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

数据是加载进去了
但是还没看到COut的变化
ok那就修改一下testbench

突然傻逼了，是8位的

最后的仿真结果如下

![](https://upload-images.jianshu.io/upload_images/10651191-adec222abaa2dd02.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

算是异步加载吧

第二个题有点神奇，测试了半天没弄出结果

原始代码我是这样想的
```
/*
设计一个自动加载型16位二进制计数器
将其进位输出COUT与异步加载控制LOAD连在一起
构成一个自动加载型16位二进制计数器
 */

module CNT1058(CLK, RST, EN, LOAD, COUT, DOUT, DATA);
	input CLK, EN, RST, LOAD;
	input [15:0] DATA;
	output [15:0] DOUT;
	output COUT;

	reg[15:0] Q1;
	reg COUT;
	reg FULL;

	assign DOUT = Q1;

	always @(posedge CLK pr posedge LOAD or negedge RST)
	begin
		if(!RST)  //异步复位信号
		begin
			Q1 <= 0;
			FULL <= 0;
		end
		else if(LOAD)  //异步加载信号
		begin
			Q1 <= DATA;
			
		end
		else if(EN)  //同步使能信号
		begin
			Q1 <= Q1 + 1;
			
		end

	end

	always @(Q1)
	begin
		if(Q1 == 16'b1111111111111111)
			COUT = 1'b1;
		else 
			COUT = 1'b0;
	end
	assign LOAD = (Q1 == 16'd0) ; //产生加载信号
	assign DOUT = Q1;           //数据

endmodule

```

```
module CNT1058_tb();

	reg CLK, EN, RST, LOAD;

	reg [15:0] DATA;

	wire [15:0] DOUT;
	wire COUT;

	initial
	begin
		RST = 0;
		CLK = 0;

		LOAD = 1;

		EN = 0;
		DATA = 16'b1111111111111101;

		# 20
		RST = 1;
		EN = 1;
		LOAD = 0;

		# 10
		LOAD = 1;

	end

	always 
	 # 10
		CLK = ~CLK;
	

	CNT1058 C1(
		.CLK(CLK),
		.RST(RST),
		.EN(EN),
		.LOAD(LOAD),
		.COUT(COUT),
		.DOUT(DOUT),
		.DATA(DATA)
		);

endmodule

```

一定记得有复位信号的时候先初始化清零，不然信号啥都没有

![](https://upload-images.jianshu.io/upload_images/10651191-bf981a0b89d429e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

测试的结果是这样子的
异步加载了数据
同时有进位输出
并且load信号由内部产生，所以会变成红线

第三题

那个啥74LS160计数器
和书上的一样
就不改了

```
/*
用Verilog设计一个功能类似74LS160的计数器
74LS160是一个十进制的计数器
 */

module CNT74LS160(CLK, RST, EN, LOAD, COUT, DOUT, DATA);
	input CLK, RST, EN, LOAD;

	input [3:0] DATA;

	output [3:0] DOUT;
	output COUT;
	reg[3:0] Q1;

	reg COUT;

	assign DOUT = Q1;

	always @(posedge CLk or negedge RST)
	begin
		if(!RST)   //异步清零
			Q1 <= 0;
		else if(EN)  //同步使能
		begin
			if(!LOAD)  
				Q1 <= DATA;
			else if(Q1 < 9)
				Q1 <= Q1 + 1;
			else
				Q1 <= 4'b0000;
		end
	end

	always @(Q1)
		if(Q1 == 4'h9)
			COUT = 1'b1;
		else
			COUT = 1'b0;

endmodule

```

最后的仿真结果就是这样子的
![](https://upload-images.jianshu.io/upload_images/10651191-0df1fdc21eecf454.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最后一题

仿真波形如图

![](https://upload-images.jianshu.io/upload_images/10651191-f449882128d058d3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

代码
```
module updowncnt16(q, count, d, load, en, clk, clr, up_down);

	input [15:0] d;

	input load, en, clk, clr, up_down;

	output [15:0] q;
	reg [15:0] q;
	output count;
	always @(posedge clk or negedge clr)
	begin
		if(!clr)
			q = 16'd0;
		else if(en)     //使能信号
		begin
			if(!load)   //同步加载数据
				q = d;  
			if(up_down)  
				q = q + 1; //做加法
			else 
				q = q -1;  //做减法
		end
	end

	assign count = up_down ? &q : ~|q;
endmodule

```

tb
```
module updowncnt16_tb();

	reg [15:0] d;

	reg load, en, clk, clr, up_down;

	wire count;
	wire [15:0] q;

	initial
	begin
		clr = 0;
		load = 1;
		en = 0;
		clk = 0;
		d = 16'b1111_1111_1111_1101;
		up_down = 1;
		# 10

		clr = 1;
		load = 0;  //开始加载数据
		en = 1;

		
		# 10
		load = 1;
		# 200
		up_down = 0;

	end

	always 
	# 10
	clk = ~clk;

	updowncnt16 u1(
			.q(q),
			.count(count),
			.d(d),
			.load(load),
			.en(en),
			.clk(clk),
			.clr(clr),
			.up_down(up_down)
			);

endmodule
```

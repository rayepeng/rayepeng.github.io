---
title: '常用器件的Verilog表示'
date: 2019-01-01
category: 'FPGA'
tags: []
lang: 'zh'
draft: true
---
# 0x01原始加法器代码
```verilog
module ADDER8(CLK, SUM, A,B,COUT,CIN);
	input[7:0] A,B;
	input CLK,CIN;

	output COUT;
	output [7:0] SUM;
	reg COUT;
	reg[7:0] SUM;

	always @(posedge CLK)
	{COUT,SUM[7:0]} <= A+B+CIN;
endmodule
```
又是因为testbench的原因调试了好久才发现是漏了一个信号
testbench如下：
```verilog
module ADDER8_tb();

	reg[7:0] A,B;
	reg CLK,CIN;

	wire COUT;
	wire[7:0] SUM;

	initial
	begin
		CLK = 1;
		A ='d1;
		B = 'd2;
		CIN = 1;
	end

	always #10 CLK = ~CLK;

	always #5 A = A + 1;

	always # 15 B = B + 1;
	ADDER8 a(
		.CLK(CLK),
		.SUM(SUM),
		.A(A),
		.B(B),
		.COUT(COUT),
		.CIN(CIN)
		);

endmodule
```

仿真波形图：
![](https://upload-images.jianshu.io/upload_images/10651191-6a91b76e4c3fff0b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

只有在时钟上升沿的时候，送入的数据才会相加，当然这里比较神奇，因为A数据的变化和时钟是一摸一样的

# 0x0x 加法器用流水线优化的代码
```verilog
module ADDER8(CLK,SUM,A,B,COUT,CIN);
	input[7:0] A,B;
	input CLK,CIN;

	output COUT;
	output[7:0] SUM;
	reg TC,COUT;
	reg[3:0] TS,TA,TB;
	reg[7:0] SUM;

	always @(posedge CLK)
	begin
		{TC,TS}<=A[3:0]+B[3:0]+CIN;
		SUM[3:0] <= TS;
	end

	always @(posedge CLK)
	begin
		TA <= A[7:4];
		TB <= B[7:4];
		{COUT, SUM[7:4]} <= TA+TB+TC;
	end
endmodule
```
用的是同一份testbench代码
令人疑惑的是其中为什么在做第二次加法时，不是直接相加而是先将其非阻塞式赋值保存起来？
当然书上也意识到了这一点，此时的波形图上会有直接的体现：

由于采用了非阻塞式赋值，所以开始一段是没有东西的
![](https://upload-images.jianshu.io/upload_images/10651191-7b053576642c906e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

而且，整体往后移动了一段

于是就会有这样的疑问了：
我要是不用TA和TB保存呢？
直接赋值会怎样呢
由于之前的testbench存在一点问题
于是换了一个，波形图如下：
其中第一张是书上的
![](https://upload-images.jianshu.io/upload_images/10651191-47df37c0c0f17d1d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这一张是修改的
![](https://upload-images.jianshu.io/upload_images/10651191-ca9d480512ca6418.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

竟然没什么区别！

这就很神奇了

应该是好久没写代码了
testbench调试了好久，全是低级错误

# 0x03 异步加载计数器
代码：
```verilog

module fiv1(CLK,PM,D,DOUT,RST);

	input CLK,RST;
	input[3:0] D;

	output PM;
	output[3:0] DOUT;

	reg[3:0] Q1;
	reg FULL;
	wire LD;
	always @(posedge CLK or posedge LD or negedge RST)
	if(!RST)
	begin
		Q1<=0;FULL<=0;
	end
	else if(LD)
	begin	Q1<=D;FULL<=1; end
	else begin
		Q1<=Q1+1;FULL<=0;
	end

	assign LD = (Q1==4'b0000);
	assign PM = FULL;
	assign DOUT = Q1;
endmodule
```

testbench
```verilog
module fiv1_tb();

	reg CLK,RST;
	reg[3:0] D;
	wire PM;
	wire[3:0] DOUT;

	initial
	begin
		CLK = 1;
		D=4'b1101;
		RST=1;
		# 20
		RST=0;
		# 5
		RST = 1;
	end
	always #10 CLK = ~CLK;
	
	fiv0 f(
		.CLK(CLK),
		.PM(PM),
		.D(D),
		.DOUT(DOUT),
		.RST(RST)
		);

endmodule

```
重点关注为什么是Q1==4'b0000的时候才产生进位信号

![Q1==4'b0000的结果](https://upload-images.jianshu.io/upload_images/10651191-350e1a72aad39b17.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![Q1==4'b1111的结果](https://upload-images.jianshu.io/upload_images/10651191-eb2e2f1bacc95608.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

f被吃掉了

# 0x04 同步加载计数器

```verilog
//同步加载计数器
module fiv0(CLK,PM, D, DOUT, RST);

	input CLK, RST;
	input[3:0] D;

	output [3:0] DOUT;
	output PM;

	reg[3:0] Q1;
	reg FULL;
	wire LD;

	always @(posedge CLK or negedge RST)
	if(!RST)
	begin
		Q1<=0;FULL<=0;
	end
	else if(LD)
	begin
		Q1<=D;FULL<=1;
	end
	else 
	begin
		Q1<=Q1+1;
		FULL<=0;
	end

	assign LD = (Q1==4'b1111);
	assign DOUT = Q1;
	assign PM = FULL;

endmodule
```

惊奇的发现这样就可以了。。。
![Q1==4'b1111的结果](https://upload-images.jianshu.io/upload_images/10651191-5c22977045a395d0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

教材上也没有解释为什么。。

# 经典D触发器的Verilog表述
```verilog
module DEF1(CLK, D, Q);
	output Q;
	input CLK,D;

	reg Q;
	always @(posedge CLK)
	Q <= D;
endmodule
```

> 时钟上升沿到来时，对Q进行一次赋值(阻塞和非阻塞在这里失去了意义）

![RTL网表图](https://upload-images.jianshu.io/upload_images/10651191-529b92084955f5a8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为什么会有一个1'h0就很奇怪了

# 异步复位和时钟使能的D触发器

```verilog
//异步复位和时钟使能的D触发器
module DEF2(CLK,D, Q, RST, EN)
	output Q;
	input CLK, D, RST, EN;

	reg Q;
	always @(posedge CLK or negedge RST)
	begin
		if(!RST)
			Q <= 0;
		else if(EN)
			Q <= D;
	end

endmodule
```

> 时钟上升沿到来且使能信号有效则赋值，如果是复位信号的下降沿则直接清零

这种设计实现了复位信号不受时钟信号的影响
这里的异步及时指独立于时钟控制的复位控制端

![RTL网表图](https://upload-images.jianshu.io/upload_images/10651191-037629a57df32a6e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 同步复位时钟的D触发器

```verilog
//同步复位时钟的D触发器
module DEF3(CLK, D, Q, RST);
	output Q;
	input CLK,D,RST;

	reg Q;
	always @(posedge CLK)
	if(RST == 1)
		Q = 0;
	else if(RST == 0)
		Q = D;

endmodule
```

> 这里说的同步是指某控制信号只有在时钟信号有效时才起作用

所以将RST信号的判断置于时钟的统一控制下

![RTL网表图](https://upload-images.jianshu.io/upload_images/10651191-f160fa96a6b6a74d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

另一种实现同步复位的方式

```verilog
module DEF4(CLK, D, Q, RST);
	output Q;
	input CLK, D, RST;
	reg Q, Q1;
	always @(RST)
	if(RST == 1)
		Q1 = 0;
	else 
		Q1 = D;

	always @(posedge CLK)
		Q <= Q1;
endmodule
```

![RTL网表图](https://upload-images.jianshu.io/upload_images/10651191-da68baf8f52923ec.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

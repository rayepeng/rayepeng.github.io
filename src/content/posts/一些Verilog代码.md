---
title: '一些Verilog代码'
date: 2019-01-01
category: 'FPGA'
tags: []
lang: 'zh'
draft: true
---
# 0x01十进制计数器
```verilog

//同步清零的1位10进制计数器
module CNT10(y,clk,clr);
	input clk, clr;
	output[3:0] y;
	reg[3:0] y;
	always @(posedge clk)
	begin
		if(!clr)
			y<=0;
		else if(y<=4'd8) 
			y<=y+1;
		else 
			y<=0;
	end
endmodule
```

testbench
```verilog
module CNT10_tb();

	reg clk,clr;
	wire[3:0] y;

	initial
	begin
		clr=0;
		#10 clr = 1;
		clk = 0;
	end

	always #12 clk = ~clk;

	CNT10 cc(
		.clk(clk),
		.clr(clr),
		.y(y)
		);
endmodule
```
仿真：
![](https://upload-images.jianshu.io/upload_images/10651191-38397b0c54c2feb3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![网表文件](https://upload-images.jianshu.io/upload_images/10651191-18f927b9e418ac00.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 0x02
16进制异步清零，计数使能，加减可控的计数器设计
```verilog
//异步清零，计数使能，16位二进制加减可控计数器
module CNT16(clk,clr,en,ctrl,d);

	input clk,clr,en,ctrl;
	output[15:0] d;
	reg[15:0] d;
	always @(posedge clk or negedge clr)
	begin
		if(!clr)
			d<=0;
		else if(en)
		begin
			if(ctrl)//做加法
			begin
				d<=d+1;
			end
			else begin
				d<=d-1;
			end
				
		end
	end

endmodule;
```
tetsbench
```verilog
module CNT16_tb();

	reg clk,clr,en,ctrl;
	wire[15:0] d;

	initial
	begin
		clk = 0;
		clr = 0;
		# 3 clr = 1;
		en = 1;
		ctrl = 1;
	end

	always #10 clk = ~clk;
	always #50 ctrl = ~ctrl;
	CNT16 ccc(
		.clk(clk),
		.clr(clr),
		.en(en),
		.ctrl(ctrl),
		.d(d)
		);

endmodule
```
最后得到的波形：
![](https://upload-images.jianshu.io/upload_images/10651191-c593b64ffc979025.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

网表图
![](https://upload-images.jianshu.io/upload_images/10651191-b6a0e5d1f9079fa6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 0x03
fork和join语句
```verilog
module para_bloc_nested_in(A,B);

	output A,B;

	reg A,B;
	initial
	begin
		A=0;
		B=1;
		#10 A=1;
		fork
		B=0;
		#10 B=1;
		#20 A=0;
		join
		#10 B=0;
		#10 A=1
		B=1;
	end

endmodule
```
产生的波形如图：
![](https://upload-images.jianshu.io/upload_images/10651191-a7aef36d538a1535.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

至于fork和join其实就是并行的

# 0x04
四位移位寄存器的实现，使用4个D触发器

```verilog
module ShiftRegister(q3,data_in,clk,clr);

output[3:0] q3;
input[3:0] data_in;
input clk;
input clr;
reg[3:0] q3,q2,q1,q0;
always@(posedge clk or posedge clr)
    if (clr == 1)
         begin
              q3 <= 0;
                q2 <= 0;
                q1 <= 0;
                q0 <= 0;
          end
     else
        begin 
          q3<=q2;
          q2<=q1;
          q1<=q0;
          q0<=data_in;
        end
endmodule
```
这是得到的网表图：
![](https://upload-images.jianshu.io/upload_images/10651191-40a3297534cb3ded.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这是原题
![](https://upload-images.jianshu.io/upload_images/10651191-e4bbd258fec73725.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

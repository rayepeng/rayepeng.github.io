---
title: 'EDA第一次作业'
date: 2019-01-01
category: 'FPGA'
tags: []
lang: 'zh'
draft: true
---
EDA作业要求
1. 解题思路
2. 核心模块代码
3. 测试模块代码
4. 网表图
5. ModelSim仿真的结果

# 实现3_8译码器

第一种实现 用if_else

```
module yimaqi_if_else(A, D);

	input [2:0]A;
	output [7:0]D;

	
	reg  [7:0] D;

	always @(A)
		begin
			if(A[2:0]==3'b000)
				D[7:0]<=00000000;
			else if(A[2:0]==3'b001)
				D[7:0]<=00000001;
			else if(A[2:0]==3'b010)
				D[7:0]<=00000010;
			else if(A[2:0]==3'b011)
				D[7:0]<=00000100;
			else if(A[2:0]==3'b100)
				D[7:0]<=00001000;
			else if(A[2:0]==3'b101)
				D[7:0]<=00010000;
			else if(A[2:0]==3'b110)
				D[7:0]<=00100000;
			else if(A[2:0]==3'b111)
				D[7:0]<=01000000;
		end

endmodule

```

testBench
```
module yimaqi_if_else_tb();

	reg [2:0] A;
	wire [7:0] D;

	initial 
		begin
			A[2:0] = 001;

			#20

			A[2:0] = 010;

		end

	yimaqi_if_else t1(
		.A(A),
		.D(D)

		);

endmodule

```

总结了第一次仿真的时候失败的经验。
1. 模块实例化的时候， 别忘了分号
2. wire类型和reg类型一定要区分清楚， 要存值的一般用reg类型， 如果只是一根线， 用wire类型就够了
3. testbench中要记得实例化模块(我就是因为忘记实例化模块了， 结果，。。。。一直没看到信号有变化)
4. 如果reg类型或者是wire类型是向量形式的， 记得赋值的时候带上向量。 有时候没加[]也对了， 但是还是加的好。
5. timescale不加也无所谓， 但是加了就要很小心了， 有可能时间精度太高了， 导致你的仿真要跑很久才能跑完。 所以没看到信号的变化不用慌， 多跑，必要的时候可以直接run 10000000， 然后放到最小，就能看到波形的变化了。

![仿真结果](https://upload-images.jianshu.io/upload_images/10651191-bf6ae79e3bedb968.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 另一种 case类型的

使用case语句时候记得
1. 没有switch
2. 记得endcase

```
// 用verilog　设计一个3-8译码器， 分别使用case和if-else语句， 并比较这两种方式的不同

module yimaqi_case(A, D);
	
	input [2:0]A;
	
	output [7:0]D;

	

	reg [7:0] D;

	always @(A) 
		begin
			case (A[2:0])
				3'b000: D[7:0]=8'b00000001;
				3'b001: D[7:0]=8'b00000010;
				3'b010: D[7:0]=8'b00000100;
				3'b011: D[7:0]=8'b00001000;
				3'b100: D[7:0]=8'b00010000;
				3'b101: D[7:0]=8'b00100000;
				3'b110: D[7:0]=8'b01000000;
				3'b111: D[7:0]=8'b10000000;
				default: D[7:0]=8'bzzzzzzzz;
			endcase
		end

endmodule

```

testbench如下
```
`timescale 1ns/1ps
module yimaqi_case_tb();
	
	reg [2:0]A;
	wire [7:0] D;

	initial 
		begin
			A  = 001;

			# 20

			A = 010;

			# 10

			A = 111;

		end

	yimaqi_case t1(
		.A(A),
		.D(D)

		);
endmodule

```
波形仿真忘记截图了

# 第二题 对always语句的深入讨论

```
module MUXK(a1, a2,  a3, s0, s1, outy);

	input a1;
	input a2;
	input a3;
	input s0;
	input s1;
	output outy;

	reg outy;
	reg y;

	always @(s0, s1)
		begin
			if(s0==0)								
				y=a2;
			else 
				y=a3;

			if(s1==0)
				outy=a1;
			else 
				outy=y;
		end

endmodule

```

![](https://upload-images.jianshu.io/upload_images/10651191-efb1ac138ad13108.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果修改成assign连续赋值语句
代码如下:
 ```
module MUXK(a1, a2,  a3, s0, s1, outy);

	input a1;
	input a2;
	input a3;
	input s0;
	input s1;
	output outy;

	reg outy;
	reg y;

	assign y= s0?a2:a3;
	assign outy= s1?a1:y;
	// always @(s0, s1)
	// 	begin
	// 		if(s0==0)								
	// 			y=a2;
	// 		else 
	// 			y=a3;

	// 		if(s1==0)
	// 			outy=a1;
	// 		else 
	// 			outy=y;
	// 	end

endmodule
```

综合得到的网表文件位：

![](https://upload-images.jianshu.io/upload_images/10651191-ad0b7572f3801084.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可以看到结果其实并没有发生太大的变化
其中代码中对y和outy的类型做了修改， 因为是assign赋值语句， 所以采用reg类型会报错， 只能修改为wire类型。

可以这样理解， 因为assign的赋值是会瞬时变化的，寄存器是达不到这个要求的， 只有线才能瞬时地变化

最后的仿真波形应该是成功了。
![](https://upload-images.jianshu.io/upload_images/10651191-64b8d4311a9fad65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 第三题

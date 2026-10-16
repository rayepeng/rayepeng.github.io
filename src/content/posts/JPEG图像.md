---
title: 'JPEG图像'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
算是阅读隐写学原理与技术做的笔记

![JPEG图像编码流程](https://upload-images.jianshu.io/upload_images/10651191-dbbd9f7379a992db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

LSBR替换

![](https://upload-images.jianshu.io/upload_images/10651191-8bdd41062ec53c7f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
LSBR容易产生值对效应

LSB隐写代码：
```matlab

input = 'th.jpg'
file = 'message.txt'
output = 'scover.bmp'

	% 读入图像矩阵
	cover = imread(input);
	ste_cover = cover;
	ste_cover = double(ste_cover);

	%将文本文件转为二进制序列
	f_id = fopen(file, 'r');
	[msg, len_total] = fread(f_id, 'ubit1');

	%判断嵌入的消息是否过大
	[m, n] = size(ste_cover);
	if len_total > m*n
		error('嵌入消息过大，请更换图像');
	end

	%p作为消息嵌入位数计数器
	p = 1;
	for f2 = 1:n
		for f1=1:m
			ste_cover(f1,f2) = ste_cover(f1,f2) - mod(ste_cover(f1,f2),2) + msg(p,1);
			if p == len_total
				break;
			end
			p = p+1
		end
		if p == len_total
			break
		end
	end

	ste_cover = uint8(ste_cover);
	%生成信息隐秘后的图像
	imwrite(ste_cover, output)
	%显示实验结果
	subplot(121);imshow(cover);title('原始图像');
	subplot(122);imshow(output);title('信息隐藏的图像');
```
分析代码我们可以看出，
由于`ste_cover(f1,f2) = ste_cover(f1,f2) - mod(ste_cover(f1,f2),2) + msg(p,1);`并没有指定是拿一个通道，所以这里其实默认是在红色通道上进行隐写的

然后
```
[m, n] = size(ste_cover);
....
    for f2 = 1:n
        for f1=1:m
```

可以看到m是行，n是列，
我们这里是先确定第一列，然后每一行隐写一个bit

突然意识到这里是不是只能隐写灰度图

并且诡异的是，明明是LSB隐写结果我在用工具提取信息的时候发现。。

![zsteg](https://upload-images.jianshu.io/upload_images/10651191-c258a70557505e65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

并且用stegsolve`也没有发现其中的信息

## LSB基础知识

`bitand`函数会将矩阵中的每一个数都异或一下
然后一个rgb图，它的每一个存放的值都是255之间的，所以可以直接去与254将最后一位清零

然后就得到了这样的两幅图

![](https://upload-images.jianshu.io/upload_images/10651191-0e5261123fb9c346.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

哇太神奇了

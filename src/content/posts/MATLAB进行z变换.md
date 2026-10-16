---
title: 'MATLAB进行z变换'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
z变换的概念就不仔细解释了

来看MATLAB如何对数字信号进行处理

### MatlaB基础知识

#### stem函数

可以利用这个函数去绘制数字信号处理中常见的离散信号的波形图。

```matlab
figure;
Y = linspace(0, 2*pi, 50)' ;  % 生成一个0~2*pi的, 50 x 1的序列， 
stem(Y);
```

![绘图](https://upload-images.jianshu.io/upload_images/10651191-af49295557d4151a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 数字信号处理中常见的一些序列

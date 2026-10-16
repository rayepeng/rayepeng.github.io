---
title: '开始我的R学习之旅'
date: 2019-01-01
category: 'R'
tags: []
lang: 'zh'
draft: true
---
### 基本数据类型

#### 最常见的类型
numeric
logical
character
NA
double
complex
integer

辨别函数
is.numeric()

转换函数 
as.numeric()

![R的类型转换](https://upload-images.jianshu.io/upload_images/10651191-cf302e02a179c4c7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

感觉挺神奇的

> 1. c()函数声明一个向量
> 2. is的方法可以判断是不是某一种类型的
>3. as的方法可以转换
>4. as转换的只是副本， 并不会修改真正的值
>5. is的方法返回的是logical类型的
![](https://upload-images.jianshu.io/upload_images/10651191-06e5e7517323824c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
> 6.要想真正实现转换， 必须将as方法之后的返回值重新赋值
![](https://upload-images.jianshu.io/upload_images/10651191-a0f2dcf65efde853.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 时间变量与字符型日期的转换

![image.png](https://upload-images.jianshu.io/upload_images/10651191-5157f2d848e2d251.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

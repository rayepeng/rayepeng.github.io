---
title: 'xss相关'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
# 绕过html实体编码
![](https://upload-images.jianshu.io/upload_images/10651191-c58873a6917169dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![image.png](https://upload-images.jianshu.io/upload_images/10651191-146e3ce45d254749.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-24035a310869ced0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

实际上都是拼接语句
![](https://upload-images.jianshu.io/upload_images/10651191-518a64e8fe89bfa3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

看到这个拼接语句的时候就大概明白了

正是由于单引号无法被转义，才导致闭合了之前的语句
![](https://upload-images.jianshu.io/upload_images/10651191-90f96147eb43d11d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 第二题有时候要跳出你的思路
涉及到`$SERVER['PHP_SELF']`这个变量
在之前绕过360web的时候用到过

它表示的就是当前的路径
![](https://upload-images.jianshu.io/upload_images/10651191-ab367c310cf838f5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这一处是关键代码
![](https://upload-images.jianshu.io/upload_images/10651191-61c3db16d6d357dc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 将xss进行到底
![](https://upload-images.jianshu.io/upload_images/10651191-f53495e929fd2410.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可是我并没有成功。。
![](https://upload-images.jianshu.io/upload_images/10651191-8e72fa3334d26107.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 参考
[https://blog.csdn.net/u012763794/article/details/48215585](https://blog.csdn.net/u012763794/article/details/48215585)

---
title: 'return-to-mania'
date: 2019-01-01
category: 'pwn相关'
tags: []
lang: 'zh'
draft: true
---
Return To Mania

一道不算很难得栈溢出， 但是遇到了几个坑

运行的截图

![image](http://upload-images.jianshu.io/upload_images/10651191-3b7da366bea44445?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

IDA分析一下：

main函数

![image](http://upload-images.jianshu.io/upload_images/10651191-6017ad4612c2be33?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

欢迎的函数

![image](http://upload-images.jianshu.io/upload_images/10651191-c2be7cc3d622c8ac?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

然后这个题目名字就是return to mania

所以看到了mania函数

![image](http://upload-images.jianshu.io/upload_images/10651191-66e1f677b02523a1?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

意思就是覆盖返回地址跳转到mania函数去执行就行了

![image](http://upload-images.jianshu.io/upload_images/10651191-49c31e9bf612fb79?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

但是这个题目是开了PIE的，每一次执行的地址都不一样，这也就是为什么要打印出welcome的地址了

但是相对地址是固定的

welcome函数是 000006ED

mania函数是 0000065D

相差了144

ok思路就到这里

exp如下：

由于对python字符串的分割不是很熟悉，写了半天，可以在ipython中慢慢测

![image](http://upload-images.jianshu.io/upload_images/10651191-c8f8cefe11a98686?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240) 

emm还有一个坑，网速好慢如果不加延迟的话会出问题的。。。（就是收到的字符串不全，然后报索引错误)

---
title: 'Android-apk反编译smali文件，-并重新打包成apk'
date: 2019-01-01
category: 'Android开发'
tags: []
lang: 'zh'
draft: true
---
利用apktool反编译成smali文件

> apktool.bat d -f test.apk -o test   

语法如下：
```
apktool -f [待反编译的apk] -o [反编译之后存放文件夹] 
```

这是当前目录下的文件

![](https://upload-images.jianshu.io/upload_images/10651191-80ac29aada8af26e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

解压

![](https://upload-images.jianshu.io/upload_images/10651191-bed396c846b42f06.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
就可以得到smali文件了

![](https://upload-images.jianshu.io/upload_images/10651191-778230ca63963889.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

之后去修改相应的部分

这时候就会重新打包

![](https://upload-images.jianshu.io/upload_images/10651191-831f79ca7a34a596.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
然后就会得到一个dist文件夹， 里面就是重新打包过的文件

![](https://upload-images.jianshu.io/upload_images/10651191-74853fa9c73853d4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是需要加签名才能调试

![](https://upload-images.jianshu.io/upload_images/10651191-377d66311c37c341.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

加签名就很神奇了。。

# 先看一道mobile题目

定位到MainActivity函数

![](https://upload-images.jianshu.io/upload_images/10651191-087ad696e2e9dc02.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是这个Activity是没有flag的

这个题目的原理其实就是关于activity的

![](https://upload-images.jianshu.io/upload_images/10651191-41f0c1cf6c687fed.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-a413bdc512780969.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
title: 'python-杂记'
date: 2019-01-01
category: 'python'
tags: []
lang: 'zh'
draft: true
---
# __name__
__name__是一个变量。前后加了双下划线是因为是因为这是系统定义的名字。普通变量不要使用此方式命名变量。

比如

![](https://upload-images.jianshu.io/upload_images/10651191-ba4c52f1d32a4fa2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

__name__就是标识模块的名字的一个系统变量。这里分两种情况：假如当前模块是主模块（也就是调用其他模块的模块），那么此模块名字就是__main__，通过if判断这样就可以执行“__mian__:”后面的主函数内容；假如此模块是被import的，则此模块名字为文件名字（不加后面的.py），通过if判断这样就会跳过“__mian__:”后面的内容。

1. 如果模块是被导入，__name__的值为模块名字
2. 如果模块是被直接执行，__name__的值为’__main__’

通过 `dir(__builtin__)`
可以查看所有的内建函数和内建变量

![](https://upload-images.jianshu.io/upload_images/10651191-16d2ba78d3766053.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
title: 'bugctf-多次'
date: 2019-01-01
category: 'bugku-Writeup'
tags: []
lang: 'zh'
draft: true
---
开始看这道题目我还不太感觉那么相信，但是确实如此

进入的页面是一漂亮的蓝色底的页面，然后URL里面有一个id的参数
当id=5时
![id=5.png](https://upload-images.jianshu.io/upload_images/10651191-58cabd819ae308a0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后加单引号之后会出现error(**注意是加英文单引号**)
![加单引号.png](https://upload-images.jianshu.io/upload_images/10651191-8d9373cdc4f2791f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后在后面加一个--+惊奇的发现页面返回的是正常的
>存在注入，那要怎么注入呢？
?id=1'or 1=1--+ 也报错，可能存在过滤
尝试双写绕过，?id=1'oorr 1=1--+ 返回正常

dalao们告诉我要用异或注入

异或注入,当两个条件相同时（同真或者同假的时候）即为假
payload如下：
 ```
http://120.24.86.145:9004/index.php?id=1'^(length('union')!=0)--+
```

如果返回页面显示正常，那就证明 length('union') == 0,也就是union被过滤了
然后这样一个个地去试一试，发现被过滤的字符串有:and or union select

被过滤的字符串可以用双写来来绕过
构造payload如下：

```
http://120.24.86.145:9004/1ndex.php?id=-1' ununionion seselectlect 1,group_concat(table_name) from infoorrmation_schema.tables where table_schema=database()--+
```

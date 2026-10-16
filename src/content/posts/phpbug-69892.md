---
title: 'phpbug#69892'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
# phpbug#69892 
```
<?php
error_reporting(0);
$users = array(
        "0:9b5c3d2b64b8f74e56edec71462bd97a" ,
        "1:4eb5fb1501102508a86971773849d266",
        "2:facabd94d57fc9f1e655ef9ce891e86e",
        "3:ce3924f011fe323df3a6a95222b0c909",
        "4:7f6618422e6a7ca2e939bd83abde402c",
        "5:06e2b745f3124f7d670f78eabaa94809",
        "6:8e39a6e40900bb0824a8e150c0d0d59f",
        "7:d035e1a80bbb377ce1edce42728849f2",
        "8:0927d64a71a9d0078c274fc5f4f10821",
        "9:e2e23d64a642ee82c7a270c6c76df142",
        "10:70298593dd7ada576aff61b6750b9118"
);
 
$valid_user = false;
 
$input = $_COOKIE['user'];
$input[1] = md5($input[1]);
 
foreach ($users as $user)
{
        $user = explode(":", $user);
        if ($input === $user) {
                $uid = $input[0] + 0;
                $valid_user = true;
        }
}
 
if (!$valid_user) {
        die("not a valid user\n");
}
 
if ($uid == 0) {
 
        echo "Hello Admin How can I serve you today?\n";
        echo "SECRETS ....\n";
 
} else {
        echo "Welcome back user\n";
}

?>
```

解释一下代码的意思：
> 有一个 `$users` 数组， `$input` 接受cookie， 将`$input[1]` 进行MD5加密， 之后去遍历 数组 `$users` 

---
上面的都是一时之见， 毕竟水平太菜，  其实就是通过cookie接受参数然后逐一和 `$users` 数组进行对比， 有两个地方

## 如何在cookie中传递一个数组？

试了好半天才试出来：
  ![cookie](https://upload-images.jianshu.io/upload_images/10651191-227d38bd8ca02990.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## explode 函数

explode函数会把 `$users `中的每一个行都拆成关联数组。如下：
![$users数组](https://upload-images.jianshu.io/upload_images/10651191-2f26a89eb44be964.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

但是我这里忽视了有一个MD5加密的过程， 所以第一步要做的其实是去解密每个MD5。

按照dalao们的说法， 只有第5个能够查询得到， 其中
user[0] = 5, uesr[1] = hund

当然这还不够， 因为还不是admin！

所以最后见证奇迹的时候到了：

## payload
> Cookie: user[4294967296]=5;user[1]=hund;

## 原因：
**php运行在32位系统的会将数组的键 0x100000000=2^32=4294967296 变换为字符串，而在64位系统会直接 数组中的键4294967296 为unsigned long 类型 且等同于0**

# 参考资料
[代码审计练习笔记](https://blog.szfszf.top/tech/code-audit-challenge-%E4%BB%A3%E7%A0%81%E5%AE%A1%E8%AE%A1%E7%BB%83%E4%B9%A0%E7%AC%94%E8%AE%B0/)

[phpbug](https://www.jianshu.com/p/432699b8bdb3)

[官方解答](https://www.sektioneins.de/blog/15-08-03-php_challenge_2015_solution.html)

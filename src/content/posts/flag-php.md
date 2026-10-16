---
title: 'flag-php'
date: 2019-01-01
category: 'bugku-Writeup'
tags: []
lang: 'zh'
draft: true
---
#### 写在前面

好吧我承认我是看了别人的wp，目前还很菜c

---
然而我看了wp也不会做。

#### 初探
![页面](https://upload-images.jianshu.io/upload_images/10651191-271a38ff478ea62c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
进去之后是一个什么都点不动的页面。。

然后有提示 `hint`
联系到可能是SQL注入

于是在URL后面加一个hint参数
http://123.206.87.240:8002/flagphp/?hint=1

得到一串代码：
```
<?php 
error_reporting(0); 
include_once("flag.php"); 
$cookie = $_COOKIE['ISecer']; 
if(isset($_GET['hint'])){ 
    show_source(__FILE__); 
} 
elseif (unserialize($cookie) === "$KEY") 
{    
    echo "$flag"; 
} 
else { 
?> 
<html> 
<head> 
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"> 
<title>Login</title> 
<link rel="stylesheet" href="admin.css" type="text/css"> 
</head> 
<body> 
<br> 
<div class="container" align="center"> 
  <form method="POST" action="#"> 
    <p><input name="user" type="text" placeholder="Username"></p> 
    <p><input name="password" type="password" placeholder="Password"></p> 
    <p><input value="Login" type="button"/></p> 
  </form> 
</div> 
</body> 
</html> 

<?php 
} 
$KEY='ISecer:www.isecer.com'; 
?>
 ```

#### 分析代码
第一句话把报错信息都关掉了
然后包含了一个文件flag.php(这不正好是题目的名字？)
然后设置cookie
额。。
然后如果GET得到了hint， 就会把文件的代码都展示出来

否则如果\$cookie反序列化后得到的结果等于字符串"$KEY"，就会显示flag！

#### 补充：
目前为止这个题目还没做出来。
主要是对cookie和serialize这两个不熟悉

##### cookie
目前看到一篇 [cookie详解](https://blog.csdn.net/u013982161/article/details/55005542)

到底什么是cookie，怎样才会产生cookie， cookie的作用自不必言。
产生cookie有几种方式：
server端 的response中包含cookie设置

脚本方式种植cookie， 主要就是用javascript里的document.cookie对象来实现

通过在URL栏输入 `javascript:alert(document.cookie)`
可以查看这个页面的cookie

当然cookie还有很多 **属性**， 比如为了安全而设置的http only属性， cookie的生存周期等。

##### serialize
serialize() 函数用于序列化对象或数组，并返回一个字符串。
**serialize()** 函数序列化对象后，可以很方便的将它传递给其他需要它的地方，且其类型和结构不会改变。

如果想要将已序列化的字符串变回 PHP 的值，可使用 unserialize()

语法如下：
`string serialize ( mixed $value )`
将其看作一种变化或许可以

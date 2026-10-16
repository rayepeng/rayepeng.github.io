---
title: 'DVWA实战'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
#### 写在前面
[Brute Force](http://127.0.0.1/dvwa-master/vulnerabilities/brute/?username=admin&password=password&Login=Login#)

之前虽然早早地搭建好了DVWA这个漏洞平台， 但是却一直没有拿来做些什么。
今天挑了一道爆破题目， 然后解决了一点小问题
  ![不代理地址](https://upload-images.jianshu.io/upload_images/10651191-58d2b5ea65215dd5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
之前还一直没弄明白为什么Burp 不能抓到 本地发送的包。 原来是最后的那个不代理地址没有删掉。

##### Low
代码如下：
```
<?php

if(isset($_GET['Login'])){
//Getusername
$user=$_GET['username'];

//Getpassword
$pass=$_GET['password'];
$pass=md5($pass);

//Checkthedatabase
$query="SELECT*FROM`users`WHEREuser='$user'ANDpassword='$pass';";
$result=mysql_query($query)ordie('<pre>'.mysql_error().'</pre>');

if($result&&mysql_num_rows($result)==1){
//Getusersdetails
$avatar=mysql_result($result,0,"avatar");

//Loginsuccessful
echo"<p>Welcometothepasswordprotectedarea{$user}</p>";
echo"<imgsrc="{$avatar}"/>";
}
else{
//Loginfailed
echo"<pre><br/>Usernameand/orpasswordincorrect.</pre>";
}

mysql_close();
}

?>
```
漏洞是很明显的， 直接使用get 方式传递密码。。
用字典爆破攻击的流程也不用细说了

##### medium
```
<?php

if( isset( $_GET[ 'Login' ] ) ) {
    // Sanitise username input
    $user = $_GET[ 'username' ];
    $user = ((isset($GLOBALS["___mysqli_ston"]) && is_object($GLOBALS["___mysqli_ston"])) ? mysqli_real_escape_string($GLOBALS["___mysqli_ston"],  $user ) : ((trigger_error("[MySQLConverterToo] Fix the mysql_escape_string() call! This code does not work.", E_USER_ERROR)) ? "" : ""));

    // Sanitise password input
    $pass = $_GET[ 'password' ];
    $pass = ((isset($GLOBALS["___mysqli_ston"]) && is_object($GLOBALS["___mysqli_ston"])) ? mysqli_real_escape_string($GLOBALS["___mysqli_ston"],  $pass ) : ((trigger_error("[MySQLConverterToo] Fix the mysql_escape_string() call! This code does not work.", E_USER_ERROR)) ? "" : ""));
    $pass = md5( $pass );

    // Check the database
    $query  = "SELECT * FROM `users` WHERE user = '$user' AND password = '$pass';";
    $result = mysqli_query($GLOBALS["___mysqli_ston"],  $query ) or die( '<pre>' . ((is_object($GLOBALS["___mysqli_ston"])) ? mysqli_error($GLOBALS["___mysqli_ston"]) : (($___mysqli_res = mysqli_connect_error()) ? $___mysqli_res : false)) . '</pre>' );

    if( $result && mysqli_num_rows( $result ) == 1 ) {
        // Get users details
        $row    = mysqli_fetch_assoc( $result );
        $avatar = $row["avatar"];

        // Login successful
        echo "<p>Welcome to the password protected area {$user}</p>";
        echo "<img src=\"{$avatar}\" />";
    }
    else {
        // Login failed
        sleep( 2 );
        echo "<pre><br />Username and/or password incorrect.</pre>";
    }

    ((is_null($___mysqli_res = mysqli_close($GLOBALS["___mysqli_ston"]))) ? false : $___mysqli_res);
}

?> 
```
无法注入， 但是可以爆破

##### High

---
暂时写到这， 参考这篇[博客](https://www.freebuf.com/articles/web/116437.html)

[DVWA通关攻略](https://www.freebuf.com/author/lonehand)
[搭建渗透测试环境](https://www.freebuf.com/sectool/102661.html)

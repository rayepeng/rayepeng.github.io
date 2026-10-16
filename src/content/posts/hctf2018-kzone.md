---
title: 'hctf2018-kzone'
date: 2019-01-01
category: '代码审计'
tags: []
lang: 'zh'
draft: true
---
一直没来得及复现这道题
只能在本地试一试了

![](https://upload-images.jianshu.io/upload_images/10651191-ed9a70c24193d8f3.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

有漏洞的代码貌似就在这里：
```
include ("../include/common.php");
if (isset($_POST['user']) && isset($_POST['pass']) && isset($_POST['login'])) {
    $user = addslashes($_POST['user']);
    $pass = addslashes($_POST['pass']);
    $safepassword = $_POST['safepassword'];
    $row = $DB->get_row("SELECT * FROM fish_admin WHERE username='$user' limit 1");
    if ($row['username'] == '') {
        exit("<script language='javascript'>alert('The administrator account or password is incorrect!');history.go(-1);</script>");
    } elseif (md5($pass) != $row['password']) {
        exit("<script language='javascript'>alert('The administrator account or password is incorrect!');history.go(-1);</script>");
    } elseif ($row['username'] == $user && $row['password'] == md5($pass)) {
        if (isset($_POST['ispersis'])) {
            $login_data['admin_user']=$user;
            $login_data['admin_pass']=sha1(md5($pass) . LOGIN_KEY);
            setcookie("islogin", "1",time() + 604800 );
            setcookie("login_data",json_encode($login_data),time() + 604800,null,null,true);
            $realip = real_ip();
            $address = getCity($realip);
            $ua = $_SERVER['HTTP_USER_AGENT'];
            $device = get_device($ua);
            $time = date("Y-m-d H:i:s");
            $sql = "INSERT INTO `fish_ip` (`admin`, `ip`, `addres`, `platform`, `date`) VALUES ('{$row['id']}','{$realip}','{$address}','{$device}','{$time}');";
            $DB->query($sql);
            unset($login_data);
            exit("<script language='javascript'>alert('login successful!');window.location.href='./';</script>");
```

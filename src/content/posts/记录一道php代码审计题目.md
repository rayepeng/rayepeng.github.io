---
title: '记录一道php代码审计题目'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
如果我没猜错的话应该是综合了正则表达式， MD5()弱类型比较和反序列化的一道题目

先上源码

```
 <?php
error_reporting(0);
include 'flag.php';
highlight_file(__FILE__);

if (!$_COOKIE['admin']) {
    exit("\nNot authenticated.\n");
}

if (!preg_match('/^{"hash": [\w\"]+}$/', $_COOKIE['admin'])){
    exit("还看不懂正则表达式? 还不快去百度! \n");
}
$session_data = json_decode($_COOKIE['admin'], true);

if ($session_data['hash'] != strtoupper(MD5($flag))) {
    echo("给你个提示吧 \n");
    for ($i = 0; $i < 32; $i++) {
        echo(ord(MD5($flag)[$i]) >> 6);
    }
    exit("\n");
}

class WHUCTF {
    protected $stu;

    function __construct() {
        $this->stu = new Study();
    }
 
    function __destruct() {
        $this->stu->action();
    }
}
 
class Study {
    function action() {
        echo "CTF 真好玩~";
    }
}
 
class Evil {
    function action() {
        system('cat ./flag.php');
    }
}

echo "这么明显了,你懂我意思吧";
unserialize($_GET['whuctf']);
Not authenticated. 

```

绕过正则表达式很简单

之后json_decode()， 变成了数组

和一个MD5()之后的值去比较

问题就卡在这里

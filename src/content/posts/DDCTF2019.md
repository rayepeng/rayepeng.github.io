---
title: 'DDCTF2019'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
唉太菜了太菜了

# 滴~一道脑洞题

```
import binascii
import base64
filename = input().encode(encoding='utf-8')

hexstr = binascii.b2a_hex(filename)

base1 = base64.b64encode(hexstr)

base2 = base64.b64encode(base1)

print(base2.decode())
```

之后在这个路径下看到源码

![](https://upload-images.jianshu.io/upload_images/10651191-73b259eedc795387.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
<?php
/*
 * https://blog.csdn.net/FengBanLiuYun/article/details/80616607
 * Date: July 4,2018
 */
error_reporting(E_ALL || ~E_NOTICE);

header('content-type:text/html;charset=utf-8');
if(! isset($_GET['jpg']))
    header('Refresh:0;url=./index.php?jpg=TmpZMlF6WXhOamN5UlRaQk56QTJOdz09');
$file = hex2bin(base64_decode(base64_decode($_GET['jpg'])));
echo '<title>'.$_GET['jpg'].'</title>';
$file = preg_replace("/[^a-zA-Z0-9.]+/","", $file);
echo $file.'</br>';
$file = str_replace("config","!", $file);
echo $file.'</br>';
$txt = base64_encode(file_get_contents($file));

echo "<img src='data:image/gif;base64,".$txt."'></img>";
/*
 * Can you find the flag file?
 *
 */

?>

```

第二个源码

![](https://upload-images.jianshu.io/upload_images/10651191-aeabd94e90365b1b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
<?php
include('config.php');
$k = 'hello';
extract($_GET);
if(isset($uid))
{
    $content=trim(file_get_contents($k));
    if($uid==$content)
	{
		echo $flag;
	}
	else
	{
		echo'hello';
	}
}

?>
```

这样

![](https://upload-images.jianshu.io/upload_images/10651191-da627d67b253938f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# web签到题
![](https://upload-images.jianshu.io/upload_images/10651191-23dcf3862950ed0a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

进去之后发现没有管理员权限， 
![](https://upload-images.jianshu.io/upload_images/10651191-39a1e9b05bbd6713.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

分析流量包
很奇怪在这里我只能在chrome里才能看到

用插件修改

![](https://upload-images.jianshu.io/upload_images/10651191-cc02b2670166e9c0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-7283e10213dcfab2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

之后开始代码审计

```
url:app/Application.php

Class Application {
    var $path = '';

    public function response($data, $errMsg = 'success') {
        $ret = ['errMsg' => $errMsg,
            'data' => $data];
        $ret = json_encode($ret);
        header('Content-type: application/json');
        echo $ret;

    }

    public function auth() {
        $DIDICTF_ADMIN = 'admin';
        if(!empty($_SERVER['HTTP_DIDICTF_USERNAME']) && $_SERVER['HTTP_DIDICTF_USERNAME'] == $DIDICTF_ADMIN) {
            $this->response('您当前当前权限为管理员----请访问:app/fL2XID2i0Cdh.php');
            return TRUE;
        }else{
            $this->response('抱歉，您没有登陆权限，请获取权限后访问-----','error');
            exit();
        }

    }
    private function sanitizepath($path) {
    $path = trim($path);
    $path=str_replace('../','',$path);
    $path=str_replace('..\\','',$path);
    return $path;
}

public function __destruct() {
    if(empty($this->path)) {
        exit();
    }else{
        $path = $this->sanitizepath($this->path);
        if(strlen($path) !== 18) {
            exit();
        }
        $this->response($data=file_get_contents($path),'Congratulations');
    }
    exit();
}
}

```

```
url:app/Session.php

include 'Application.php';
class Session extends Application {

    //key建议为8位字符串
    var $eancrykey                  = '';
    var $cookie_expiration			= 7200;
    var $cookie_name                = 'ddctf_id';
    var $cookie_path				= '';
    var $cookie_domain				= '';
    var $cookie_secure				= FALSE;
    var $activity                   = "DiDiCTF";

    public function index()
    {
	if(parent::auth()) {
            $this->get_key();
            if($this->session_read()) {
                $data = 'DiDI Welcome you %s';
                $data = sprintf($data,$_SERVER['HTTP_USER_AGENT']);
                parent::response($data,'sucess');
            }else{
                $this->session_create();
                $data = 'DiDI Welcome you';
                parent::response($data,'sucess');
            }
        }

    }

    private function get_key() {
        //eancrykey  and flag under the folder
        $this->eancrykey =  file_get_contents('../config/key.txt');
    }

    public function session_read() {
        if(empty($_COOKIE)) {
        return FALSE;
        }

        $session = $_COOKIE[$this->cookie_name];
        if(!isset($session)) {
            parent::response("session not found",'error');
            return FALSE;
        }
        $hash = substr($session,strlen($session)-32);
        $session = substr($session,0,strlen($session)-32);

        if($hash !== md5($this->eancrykey.$session)) {
            parent::response("the cookie data not match",'error');
            return FALSE;
        }
        $session = unserialize($session);

        if(!is_array($session) OR !isset($session['session_id']) OR !isset($session['ip_address']) OR !isset($session['user_agent'])){
            return FALSE;
        }

        if(!empty($_POST["nickname"])) {
            $arr = array($_POST["nickname"],$this->eancrykey);
            $data = "Welcome my friend %s";
            foreach ($arr as $k => $v) {
                $data = sprintf($data,$v);
            }
            parent::response($data,"Welcome");
        }

        if($session['ip_address'] != $_SERVER['REMOTE_ADDR']) {
            parent::response('the ip addree not match'.'error');
            return FALSE;
        }
        if($session['user_agent'] != $_SERVER['HTTP_USER_AGENT']) {
            parent::response('the user agent not match','error');
            return FALSE;
        }
        return TRUE;

    }

    private function session_create() {
        $sessionid = '';
        while(strlen($sessionid) < 32) {
            $sessionid .= mt_rand(0,mt_getrandmax());
        }

        $userdata = array(
            'session_id' => md5(uniqid($sessionid,TRUE)),
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'user_agent' => $_SERVER['HTTP_USER_AGENT'],
            'user_data' => '',
        );

        $cookiedata = serialize($userdata);
        $cookiedata = $cookiedata.md5($this->eancrykey.$cookiedata);
        $expire = $this->cookie_expiration + time();
        setcookie(
            $this->cookie_name,
            $cookiedata,
            $expire,
            $this->cookie_path,
            $this->cookie_domain,
            $this->cookie_secure
            );

    }
}

$ddctf = new Session();
$ddctf->index();

```

# homebrew event loop

woc 居然是URL编码
果然是自己见识太少了

![](https://upload-images.jianshu.io/upload_images/10651191-ce605d8481ae169b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

那到底什么时候需要URL编码什么时候不需要呢？

`action:trigger_event%23;action:buy;111%23action:get_flag; `
  

![](https://upload-images.jianshu.io/upload_images/10651191-8b3a9e8bf76cc5fe.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

![](https://upload-images.jianshu.io/upload_images/10651191-227f44c7afa4fad0.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

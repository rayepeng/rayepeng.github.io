---
title: 'php-manual-note-0'
date: 2019-07-30
category: 'note'
tags:
  - 'php'
lang: 'zh'
draft: false
---
# php doc阅读笔记0

## array

数组是php的key=>value映射  
key只能是`integer`和`string`类型，value可以是任意类型

所以key会有如下强制转换：

-   包含有合法整型值的字符串会被转换为整型。例如键名 “8” 实际会被储存为 8。但是 “08” 则不会强制转换，因为其不是一个合法的十进制数值。
-   浮点数也会被转换为整型，意味着其小数部分会被舍去。例如键名 8.7 实际会被储存为 8。
-   布尔值也会被转换成整型。即键名 true 实际会被储存为 1 而键名 false 会被储存为 0。
-   Null 会被转换为空字符串，即键名 null 实际会被储存为 “”。
-   数组和对象不能被用为键名。坚持这么做会导致警告：Illegal offset type。

比如官方举例如下：

```php
<?php

$array = array(
  1    => "a",
  "1"  => "b",
  1.5  => "c",
  true => "d",
);
var_dump($array);
```

输出如下：

```
array(1) {
  [1] =>
  string(1) "d"
}
```

会导致数组的一部分值被覆盖掉

> 上例中所有的键名都被强制转换为 1，则每一个新单元都会覆盖前一个的值，最后剩下的只有一个 “d”。

同时：

> key 为可选项。如果未指定，PHP 将自动使用之前用过的最大 integer 键名加上 1 作为新的键名。

那就会有这种结果：

```php
$array = array(
  "a",
  "b",
6 => "c",
  "d",
);
var_dump($array);
```

输出为：

```
array(4) {
  [0] =>
  string(1) "a"
  [1] =>
  string(1) "b"
  [6] =>
  string(1) "c"
  [7] =>
  string(1) "d"
}
```

### 神奇的解引用语法

```php
<?php

function getArray(){
  return array(1,2,3,4);
}

//解引用语法

$a = getArray()[0];
var_dump($a);
list(, $secondelement) = getArray();

var_dump($secondelement);
```

输出为：  

```
int(1)
int(2)
```

`list`定义为：将数组中的值赋值给变量

### 用\[\]的语法

如果有一个数组 `$arr = array(5 => 1, 12 => 2);`  
那么`$arr[] = 56`相当于`$arr[13]=56`

使用`unset`函数可以取消键值对映射比如`unset($arr[5])`,或者销毁一个数组`unset($arr)`

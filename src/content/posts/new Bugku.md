---
title: 'new Bugku'
date: 2019-08-16
updated: 2019-08-20
category: 'ctf'
tags:
  - 'php'
  - 'web'
lang: 'zh'
draft: false
---
## web26

```php
<?php 
$num=$_GET['num']; 
$str=$_GET['str']; 
show_source(__FILE__); 
if (isset($num)&&isset($str)) { 
    if (preg_match('/\d+/sD',$str)) { 
        echo "vagetable hhhh"; 
        exit(); 
    } 
    $result=is_numeric($num) and is_numeric($str); 
    if ($result) { 
        include "flag.php"; 
        echo "$flag"; 
    } 
    else{ 
        echo "vagetablessssss"; 
    } 
} 
?>
```

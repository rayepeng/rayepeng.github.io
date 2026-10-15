---
title: 'threeSumClosest'
date: 2019-08-20
updated: 2019-08-22
category: 'leetcode'
tags:
  - 'array'
  - 'search'
lang: 'zh'
draft: false
---
好久没写leetcode了，最近决定用php来写一些

threesumcloset这题要求在一个数组中找到离target最近的三个数的和

这里用到了一下双指针的思路，就是确定两个指针，一个往高走，一个往低走

```php
<?php

class threeSumClosest
{
    /**
     * @param Integer[] $nums
     * @param Integer $target
     * @return Integer
     */
    function threeSumClosest($nums, $target)
    {
       //先排序，php数组排序的函数
        sort($nums);
        //计算长度
        $len = count($nums);
        /*
         * 基本思路：通过i遍历数组，再设置两个指针
         */
        $minidistance = PHP_INT_MAX; //保存最小的距离
        $low = 1;
        $high = $len-1;
        for($i = 0; $i < $len-2; $i++){
            //要去重
            if ($i > 0 && $nums[$i] == $nums[$i-1]){
                continue;
            }
            //得到两个指针

            $sum = $nums[$low]+$nums[$high]+$nums[$i];
            $distance = $target-$sum;
            if($distance == 0){
                return $distance;
            }
            if($distance !== 0&& abs($distance) < abs($minidistance)){
                $minidistance = $sum;
            }
            //然后开始移动指针
            if($distance < 0){
                //小于0是不是可以把low调大一点，注意去重
                if($low < $high && $nums[$low] != $nums[$low-1]){
                    $low =  $low + 1;
                }
            }
            elseif ($distance > 0){
                if($low < $high && $nums[$high] != $nums[$high+1]){
                    $high = $high - 1;
                }
            }

        }
        return $minidistance;

    }
}

$a = new threeSumClosest();

$nums = [-1,2,-1,4];
$target = 1;

echo $a->threeSumClosest($nums, $target);
```

新手php代码写的还很烂，提交之后没有过

遇到了几个地方记录一下

1.  php的注释形式，需要写清楚参数的类型和返回值
    
2.  php中最大的整数是PHP\_INT\_MAX
    
3.  `if ($i > 0 && $nums[$i] == $nums[$i-1]){`由于没有加上`$i>0`，php可以倒过来取数字而不报错的
    

```
[0,0,0]
1
```

这个测试过不了

1.  去重的方式了解一下
    
2.  [php数组排序](https://www.php.net/manual/zh/array.sorting.php) 这里用sort就好，之前用asort的时候索引没有变。这种排序也是很强了
    

最后的这个报错很玄学了

![](https://i.loli.net/2019/08/20/tAsdHz8RPB9bQfi.png)

更新一下  

```php
<?php

class threeSumClosest
{
    /**
     * @param Integer[] $nums
     * @param Integer $target
     * @return Integer
     */
    function threeSumClosest1($nums, $target)
    {
       //先排序，php数组排序的函数
        sort($nums);
        //计算长度
        $len = count($nums);
        /*
         * 基本思路：通过i遍历数组，再设置两个指针
         */
        $minidistance = PHP_INT_MAX; //保存最小的距离
        $low = 1;
        $high = $len-1;
        for($i = 0; $i < $len-2; $i++){
            //要去重
            //得到两个指针
            $low = $i+1;
            $high = $len-1;

            while($low < $high){
              $sum = $nums[$i]+$nums[$low]+$nums[$high];
              $distance = $target-$sum;
              if($distance === 0){return  $distance;}
              if(abs($distance) < abs($minidistance)){$minidistance = $distance;}
              if($distance > 0){$low=$low+1;}
              if($distance < 0){$high=$high-1;}
            }

        }
        return $target - $minidistance;

    }
}

$a = new threeSumClosest();

$nums = [-1,0,1,1,55];
$target = 3;

echo $a->threeSumClosest1($nums, $target);
```

success

## 参考

[算法总结—数组相关 双指针法的常见应用。](https://blog.csdn.net/ohmygirl/article/details/7850068)  
[大师傅的代码](https://leetcode.com/problems/3sum-closest/discuss/252701/php-28-ms-\(faster-than-100.00)\-14.9-MB-(less-than-100.00))

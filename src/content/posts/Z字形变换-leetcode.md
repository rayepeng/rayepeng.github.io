---
title: 'Z字形变换-leetcode'
date: 2019-01-01
category: 'leetcode'
tags: []
lang: 'zh'
draft: true
---
比如输入字符串为 "LEETCODEISHIRING" 行数为 3 时，排列如下：

L   C   I   R
E T O E S I I G
E   D   H   N

可以用一个二维切片来模拟这个过程，先往下填入 LEE 到了最底部之后再从下往上填入TC
依次这样做

curRows = 0 -> 1 -> 2

代码如下

```go
package main
func convert(s string, numRows int) string {
    if numRows == 1{
        return s
    }
    length := len(s)
    Rows := func(a int,b int)int{
        if a > b{
            return b
        }else{
            return a
        }
    }(length,numRows)
    res := makeTwo(Rows)
    var curRow int
    var goingDown bool = false
    for _,char := range s{
        res[curRow] = append(res[curRow], string(char))
        if curRow == 0 || curRow == numRows - 1{
            goingDown = !goingDown
        }
        if goingDown{
            curRow += 1
        }else{
            curRow -= 1
        }
    }
    //res := makeTwo(math.Min(float64(length), float64(numRows)))
    var result string = ""
    for _,value := range res{
        for _,v := range value{
            result += v
        }
    }
    return  result
}
func makeTwo(length int) [][]string{
    res := make([][]string ,length)
    for i:=0;i<len(res);i++{
        res[i] = make([]string, 0)
    }
    return  res
}
func main(){
    convert("LEETCODEISHIRING", 3)
}
```

有几个地方比较难受，go虽然提供了min函数，但是只支持float64类型的，而且go的函数是不可以重载的(你说难受不难受

而且go似乎没有提供三元表达式，所以我们需要：

```go
    Rows := func(a int,b int)int{
        if a > b{
            return b
        }else{
            return a
        }
    }(length,numRows)
```

还有生成二维的切片也是需要注意的
```go
func makeTwo(length int) [][]string{
    res := make([][]string ,length)
    for i:=0;i<len(res);i++{
        res[i] = make([]string, 0)
    }
    return  res
}
```

程序的主逻辑

```go
    for _,char := range s{
        res[curRow] = append(res[curRow], string(char))
        if curRow == 0 || curRow == numRows - 1{
            goingDown = !goingDown
        }
        if goingDown{
            curRow += 1
        }else{
            curRow -= 1
        }
    }
```

尤其注意：
```go
        if curRow == 0 || curRow == numRows - 1{
            goingDown = !goingDown
        }
```

如果当前行为0，或者马上就要到下一行了

需要立即调整方向

当然我这样做肯定是很费时间的，可以看到速度比java实现的还慢了一点，但是内存占用是真的小

![](https://upload-images.jianshu.io/upload_images/10651191-657855d3438c42e5.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

其实完全没必要用二维的切片，一维的即可

同时代码逻辑也可以优化

观赏一下代码：核心思路就是每两个一组

```go
func convert(s string, numRows int) string {
    	if numRows == 1 {
		return s
	}
	b := numRows - 1
	strArr := make([]string, numRows)
	for k, v := range s {
		if (k/b)%2 == 0 {
			strArr[k%b] += string(v)
		} else {
			strArr[b-(k%b)] += string(v)
		}
	}
	return strings.Join(strArr,"")
}
```
这种方法实现的只需要8ms
![](https://upload-images.jianshu.io/upload_images/10651191-8378659275dd332c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

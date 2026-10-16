---
title: 'go并发编程'
date: 2019-01-01
category: 'gogogo'
tags: []
lang: 'zh'
draft: true
---
最近挖了个坑开始学习go语言，打断把其中遇到的坑都记录下来

go学习的过程中最为惊叹的就是并发编程了，我可以少掉好多根头发23333

比如要实现两个切片交互打印，在其他的语言中，比如java感觉写起来还是很痛苦的，但是用go就不一样了。给一个通道，然后两个goroutine之间就通过这个通道进行同步和互斥

代码如下：

```go
package main
import (
   "fmt"
)
func main() {
   a := []int{2,4,6,8}
   b := []int{1,3,5,7}
   c := make(chan int)  //设置一个通道
   go func() {
      for i,value := range a{
         c <- i   //往通道传入一个数
         //time.Sleep(2)
         fmt.Println((value)) //打印数组，然后通道传值
         <- c    
      }
   }()
   for i,value := range b{
      //等待匿名通道
      <-c
      fmt.Println((value))
      c <- i
   }
}
```

go 就会开启一个goroutine

然后我们的主进程继续运行，到达 `<-c` 的时候就会自动阻塞

这时候goroutine先执行， `c<-i` 往通道写一个数据(随便啥都行)
goroutine执行到 `<-c` 的时候又阻塞了，等待下一个主进程

所以这就很明白了，打印的结果

```
输出 2 1 4 3 6 5 7 8
```
但是这种方式还是有点小问题，比如我加一个 time.Sleep(2)
输出的结果就是 12 3 4 5 6 7 8

但是这样不会出问题

```
package main
import (
   "fmt"
   "time"
)
func main() {
   a := []int{2,4,6,8}
   b := []int{1,3,5,7}
   c := make(chan int)
   go func() {
      for i,value := range a{
         c <- i
         fmt.Println((value))
         <- c
      }
   }()
   for i,value := range b{
      //等待匿名通道
      <-c
      time.Sleep(100) //会不会存在 前一个goroutine自产自销呢？但是是不可能的
      fmt.Println((value))
      c <- i
   }
}
```
也就是通道不会自产自销，它往里面放数据之后就必须等待其他的goroutine从里面读数据

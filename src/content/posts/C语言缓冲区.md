---
title: 'C语言缓冲区'
date: 2019-07-30
updated: 2019-08-20
category: 'note'
tags:
  - 'C'
  - '缓冲区'
  - 'getchar'
  - 'x86'
lang: 'zh'
draft: false
---
# 调试一下c语言程序

自我感觉很久没写C语言了

## getchar函数

```c
   char a = getchar();
printf("a is %c\n", a);
char b = getchar();
printf("b is %c\n", b);
char c = getchar();
printf("c is %c\n", c);
return 0;
```

getchar函数是依次从缓冲区中取出字符来，会取走的！！

```
nihao
a is n
b is i
c is h
```

这一行  

```c
for (; scanf("%d", &nums[i]) != 0 && getchar() == ' '; ++i)
	nums = (int*)realloc(nums, sizeof(int) * (i + 1)); //数组为非降序排列
```

这里会要求用户输入数据，用户输入的数据就是会存放在缓冲区内，然后之后scanf每次读一个数字，getchar紧随其后读一个字符，所以我们输入的时候必须是一个数字一个空格

```
while (getchar() == '\n' || getchar() == EOF || getchar() == '\0');
```

之后把缓冲区的字符读干净

测试一下，如果我输入`12 21\n`

那么scanf读完21之后，getchar函数读`\n`

```
00D52466  je          main+0DEh (0D524AEh)  
00D52468  mov         esi,esp  
00D5246A  call        dword ptr [__imp__getchar (0D5F220h)]   ;函数返回值存放在eax中，十进制10，代表LF
00D52470  cmp         esi,esp  
00D52472  call        __RTC_CheckEsp (0D51357h)  
00D52477  cmp         eax,20h  
00D5247A  jne         main+0DEh (0D524AEh)
```

关键是这两条指令：

```
00D52472  call        __RTC_CheckEsp (0D51357h)  
00D52477  cmp         eax,20h
```

所以之后比较`cmp eax 20h`就会跳出循环

之后进入那个while循环

```
while (getchar() == '\n' || getchar() == EOF || getchar() == '\0');
00D524AE  mov         esi,esp  
00D524B0  call        dword ptr [__imp__getchar (0D5F220h)]  
00D524B6  cmp         esi,esp  
00D524B8  call        __RTC_CheckEsp (0D51357h)  
00D524BD  cmp         eax,0Ah  
00D524C0  je          main+119h (0D524E9h)
```

此时缓冲区已经是空的了，所以会要求用户继续输入数据  
我此时输入了 `1\n`  
所以调用完`getchar`函数之后eax存放了十六进制的49

那么第二个调用`getchar`读取的结果就是`0Ah`

```
00D524C2  mov         esi,esp  
00D524C4  call        dword ptr [__imp__getchar (0D5F220h)]  
00D524CA  cmp         esi,esp  
00D524CC  call        __RTC_CheckEsp (0D51357h)  
00D524D1  cmp         eax,0FFFFFFFFh
```

继续。此时缓冲区已经空了

那么会要求用户继续输入  
我又输入了一个换行符，很明显此时读取的结果非空，所以跳出while循环

```
00D524D8  call        dword ptr [__imp__getchar (0D5F220h)]  
00D524DE  cmp         esi,esp  
00D524E0  call        __RTC_CheckEsp (0D51357h)  
00D524E5  test        eax,eax   ;检查eax是否为空
00D524E7  jne         main+11Bh (0D524EBh)  
00D524E9  jmp         main+0DEh (0D524AEh)
```

![eax](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/c0.png)

## 遇到的尴尬

如果要程序的健壮性，那么用户多输入一个空格就会出错，因为多输入一个空格程序就不知道后面那个是什么了，同时还涉及到`getchar`函数清空缓冲区，那个while循环的写法确实很经典，但是就没有考虑过如果缓冲区本身就是空的呢？

我修改了一下原有的代码，加入了`cin.peek`函数来帮助判断

```c
while (1)
{

	nums = (int*)realloc(nums, sizeof(int) * (i + 1));
	scanf("%d", &nums[i]);
	i++;
	char ch = getchar();
	if (ch == ' ')
	{
		if (isdigit(cin.peek()))
		{
			continue;
		}
		else
		{
			break;
		}
	}
	if (ch == '\n')
	{
		break;
	}
}
//    for(;scanf("%d", &nums[i]) != 0 && getchar() == '\n'; i++)
//    {
//        nums = (int *)realloc(nums, sizeof(int)*(i+1));
//    }
fflush(stdin);
```

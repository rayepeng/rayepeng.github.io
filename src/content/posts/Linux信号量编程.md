---
title: 'Linux信号量编程'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
# 信号量头文件
#include <semaphore.h>

# 信号量函数
## sem_init函数

> int sem_init(sem_t *sem, int pshared， unsigned int value);

pshared控制信号量的类型，如果其值为0，就表示这个信号量是当前进程的局部信号量，否则信号量就可以在多个进程之间共享，value为sem的初始值。调用成功时返回0，失败返回-1.

## sem_wait函数

> int sem_wait(sem_t *sem);

也就是我们在上课的时候学到的P操作

## sem_post函数

> int sem_post(sem_t *sem);

也就是我们在上课的时候学到的V操作
## sem_destroy函数

> int sem_destroy(sem_t *sem);

# 使用信号量来同步线程

我们来分析一个实际的例子
[来源](https://blog.csdn.net/ljianhui/article/details/10813469)

线程
```
void* thread_func(void *msg)
{
	//把信号量减1
	sem_wait(&sem);
	char *ptr = msg;
	while(strcmp("end\n", msg) != 0)
	{
		int i = 0;
		//把小写字母变成大写
		for(; ptr[i] != '\0'; ++i)
		{
			if(ptr[i] >= 'a' && ptr[i] <= 'z')
			{
				ptr[i] -= 'a' - 'A';
			}
		}
		printf("You input %d characters\n", i-1);
		printf("To Uppercase: %s\n", ptr);
		//把信号量减1
		sem_wait(&sem);
	}
	//退出线程
	pthread_exit(NULL);
}

```
这个函数的功能比较简单，就是将小写字母转化为大写字母。
每次在进入函数之前，我们需要将信号量sem的值减去1，也就是说如果此时用户不输入， 那么这个线程就无法执行， 而如果用户输入了数据，那么main线程中肯定是要将sem的值+1的， 这个时候该线程就得到执行， 但是在每次循环结束之后还是需要将sem的值减去1， 

main线程如下

```

int main()
{
	int res = -1;
	pthread_t thread;
	void *thread_result = NULL;
	char msg[MSG_SIZE];
	//初始化信号量，其初值为0
	sem_init(&sem, 0, 0);
	//创建线程，并把msg作为线程函数的参数
	pthread_create(&thread, NULL, thread_func, msg);
	//输入信息，以输入end结束，由于fgets会把回车（\n）也读入，所以判断时就变成了“end\n”
	printf("Input some text. Enter 'end'to finish...\n");
	while(strcmp("end\n", msg) != 0)
	{
		fgets(msg, MSG_SIZE, stdin);
		//把信号量加1
		sem_post(&sem);
	}
 
	printf("Waiting for thread to finish...\n");
	//等待子线程结束
	pthread_join(thread, &thread_result);
	printf("Thread joined\n");
	//清理信号量
	sem_destroy(&sem);
	exit(EXIT_SUCCESS);
}
 
```

也就是一个挺简单的生产者消费者问题

结果如下
![](https://upload-images.jianshu.io/upload_images/10651191-2d9673483afb9a5f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#gdb 如何调试多线程

使用info threads查看线程

![info threads](https://upload-images.jianshu.io/upload_images/10651191-89db7f682552cc96.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 读者写者问题第一种情况

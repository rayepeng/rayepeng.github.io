---
title: 'matlab音频信号处理'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
## 首先来认识一下什么是音频信号

通过matlab我们可以直接读入一个音频文件，同时直接绘图
但是此时的横坐标和纵坐标是什么呢？
```
>> [y,fs] = audioread('5num.wav');
>> plot(y)
```

不断放大信号：

得到了这样一幅图

![image](https://upload-images.jianshu.io/upload_images/10651191-5f901ea5bc8e3bd9?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这时候纵坐标我们可以理解成幅度，但是横坐标其实什么也不是
或者说就是一系列点而已，我们可以对这些点进行一定的组合，比如每160个点作为一组，这就是分帧

那频率呢？
matlab在读取一个音频的时候还会返回一个频率呀，这个频率，也就是那个fs，到底是干嘛的，有什么意义呢？

不妨来计算一下：
我的这段音频是29s，

```
>> length(y)/fs
ans =
   29.4400
```
此时用点的个数除以频率fs，得到的就是时间！
这样想，频率的物理意义就是一秒钟振动的次数，8khz就是一秒钟要震动8000次，一个点震动一次，那么235520个点就要震动29.4400s!

同时可以知道这段音频是16位量化的

可是我们老是说量化量化，量化究竟代表什么含义呢?

其实就理解成每一个点用16个bit来表示

那么，235520个点，每一个点都是16位的，相当于一个点就是2byte

那么就是 235520*2 字节
等价于460KB

查看文件大小
![](https://upload-images.jianshu.io/upload_images/10651191-2bdacaee04fe3c6a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

正好是460KB！！

现在理解这几个参数的含义了吧

于是上面那幅图我们需要改进一下

```
>>t = (0:length(y)-1)/fs;
>> plot(t,y);
>> xlabel('时间(.sec)')
>> ylabel('幅度')
```
![](https://upload-images.jianshu.io/upload_images/10651191-b5824f772038f550.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这样就能得到每一个时刻对应的幅度了

## 分帧？

到底什么是分帧呢？

首先需要确定分帧的长度：

> 比如采样率是`11025`
语音信号每20ms分成一段

怎么想，一秒钟有11025个点震动，那么20ms内就是大概220个点了，于是帧长为220，帧移默认就是一半110

> 问：为什么分帧？
答：语音信号是瞬时变化的，但在10～20ms内是相对稳定的，即在一小段内是相对稳定的，分帧就是将语音分成一段一段的。
问：问什么要有帧移呢？
答：帧移后的每一帧信号都有上一帧的成分，防止两帧之间的不连续。语音信号虽然短时可以认为平稳，但是由于人说话并不是间断的，每帧之间都是相关的，加上帧移可以更好地与实际的语音相接近。

如果采样率都是8000hz，并且20ms为一帧
相当于160个点为一个帧

但是调用`enframe`函数返回的结果又是什么呢?

5885*160的矩阵

每一行，有160列

每一列，有5885行

你想啊，我是每160个点为一个帧，那么总共有多少个帧呢？

这个不难算

那么我可以单独取出其中的一个帧来看
![](https://upload-images.jianshu.io/upload_images/10651191-72ecdc95fc6350c2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

```
a = X(2000,:);
plot(a)
```

当然这里只是知道有160个点，但是对应的时间段却是不知道的

也就是说每一行其实就是一个帧的数据了
之所以这张图有点奇怪

![](https://upload-images.jianshu.io/upload_images/10651191-4e98c8b327acbb7f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
横坐标代表第多少帧，纵坐标代表振幅

因为有很多根曲线是重叠的

问题在于分帧之后，如何求自相关系数等
可不可以每一个帧求一次自相关系数呢？

> 补充一点，调用`enframe`函数如果不指定第三个参数那么帧之间就不会重叠的

## 如何求自相关系数？

首先试如何理解自相关系数

比如：

```
>> A = [1 2 3]
A =
     1     2     3
>> xcorr(A)
ans =
    3.0000    8.0000   14.0000    8.0000    3.0000
>> 
```

这个口算应该没问题的

就是求出A的自相关系数

但是这个呢？

```
>> xcorr(A,4)
ans =
  1 至 7 列
         0         0    3.0000    8.0000   14.0000    8.0000    3.0000
  8 至 9 列
         0         0
```

是不是可以理解成延展了

按照规律来说是没问题的，xcorr(A,4) 相当于两个5列的向量
得到的就是2*5 - 1= 9个

## 解读代码
先把代码放上来吧，方便你们copy

```
[y,fs] = audioread('5num.wav');

N = length(y);
t = (1:N-1)/fs;  %生成时间序列
win = hamming(N) %加窗
y = y.*win;
X = enframe(y,160); % 160个点为一帧，就没要重叠了

% 然后就可以查看某个帧了

%%
% 求出自相关
num_frame = length(X);

ms2 = floor(fs/500);
ms20 = floor(fs/50);
F0 = zeros(num_frame,1);
% 直接对每一帧进行循环
for i=1:num_frame
    % 每一帧都可以求出自相关的系数
    r = xcorr(X(i,:), 160);
    r = r(floor(length(r)/2):end);
    [maxi,idx]=max(r(ms2:ms20));
    F0(i) = fs/(ms2+idx-1);
end

figure(1);
plot(F0); %横坐标代表帧
xlabel('帧')
ylabel('基音频率')

% 经过探测我读0时候的基音位于第210帧

%% 选出第210帧的数据
figure(2)
y210 = X(211,:);
subplot(311);
plot(y210);
xlabel('点');
ylabel('振幅');
title('210帧原始信号')
ai = lpc(y210, 10);
est_x=filter([0 -ai(2:end)],1,y210);%估计信号
subplot(312);
plot(est_x);
xlabel('点');
ylabel('振幅');
title('210帧估计信号');
err = y210-est_x;
subplot(313);
plot(err);
xlabel('点');
ylabel('振幅');
title('预测误差');
%%
% 求预测增益

En=zeros(1,160);
for i=1:160
   u=err(i);%取出一样点
   u2=u.*u;%求出能量
   En(i)=sum(u2);%对每一样点累加求和
end
%计算原始能量
En1=zeros(1,160);
for i=1:160
   u=y210(i);%取出一样点
   u2=u.*u;%求出能量
   En1(i)=sum(u2);%对每一样点累加求和
end
CA=zeros(1,160);
for i=1:160
   en1=En1(i);%取出一样点
   en=En(i);
   CA(i)=abs(en1)/abs(en);
end
figure(3);
subplot(311);plot(En1);xlabel('取样点数/个');ylabel('En');title('短时能量');title('E0');
subplot(312);plot(En);xlabel('取样点数/个');ylabel('En');title('短时能量');title('Ep');
subplot(313);plot(CA);xlabel('取样点数/个');ylabel('En');title('短时能量');title('预测增益');
```

### 1. 加窗分帧

```
[y,fs] = audioread('5num.wav');

N = length(y);
t = (1:N-1)/fs;  %生成时间序列
win = hamming(N) %加窗
y = y.*win;
X = enframe(y,160); % 160个点为一帧，就没要重叠了
```

其实加窗的过程也不是很难理解，就是生成一个函数然后去乘就好了

然后通过`enframe`函数进行分帧处理

返回的是一个矩阵，行数代表了帧数，列数代表了每一帧有多少个点

### 2. 求自相关

```
num_frame = length(X);

ms2 = floor(fs/500);
ms20 = floor(fs/50);
F0 = zeros(num_frame,1);
% 直接对每一帧进行循环
for i=1:num_frame
    % 每一帧都可以求出自相关的系数
    r = xcorr(X(i,:), 160);
    r = r(floor(length(r)/2):end);
    [maxi,idx]=max(r(ms2:ms20));
    F0(i) = fs/(ms2+idx-1);
end
```

这个过程也不是很难理解

得到的图形是这样子的

![](https://upload-images.jianshu.io/upload_images/10651191-28a797dee2021bd2.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

横坐标就是每一个帧，纵坐标代表对应的基音频率

其实这个图确实有点奇怪，因为它是倒过来的

我后来仔细想了想，周围没有声音的时候，基音频率反而是最大的

然后又去翻书，发现人的声音基音频率大概也就是200~500hz左右，而且男声本来就低，所以这个图显然是没问题的

而且我总共只读了5个音，0 1 2 3 4

基本正确地反映出来了

然后通过肉眼观察，嗯，我读0的那个帧就是210帧了

### 3. 通过LPC预测信号，同时计算增益
预测增益的方法就是LPC

![](https://upload-images.jianshu.io/upload_images/10651191-a85da4900de04b4b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

增益系数我暂时不太清楚怎么求，就直接抄同学的了

![](https://upload-images.jianshu.io/upload_images/10651191-418709b11b0d89eb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
title: 'matlab根据直方图进行图片分类'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
感觉还有一些bug需要调试，不过还是先写出来吧

将一张图片由rgb转hsv空间,并进行量化

```
function [Hh,Vv,Ss] = hsv_hist(filename)
    % 将rgb转hsv

    %clear;
    clc;
    %filename = 'lena.bmp';
    Image = imread(filename);
    [M,N,O] = size(Image);
    [h,s,v] = rgb2hsv(Image); % 此处的hsv取值范围都介于0和1之间

    % 分别对hsv进行量化
    % h量化为16级，s量化为4级，v量化为4级
    h = h.*360;
    H =h;S=s;V=v;

    % 对h进行量化得到H，得到的H空间取值范围介于0~15
    for i = 1:M
        for j =1:N
            %i,j为横纵坐标
            if h(i,j)<=15||h(i,j)>345
                H(i,j) = 16;
            end
            if h(i,j)<=25&&h(i,j)>15
                H(i,j) = 1;
            end
            if h(i,j)<=45&&h(i,j)>25
                H(i,j) = 2;
            end
            if h(i,j)<=55&&h(i,j)>45
                H(i,j) = 3;
            end
            if h(i,j)<=80&&h(i,j)>55
                H(i,j) = 4;
            end
            if h(i,j)<=108&&h(i,j)>80
                H(i,j) = 5;
            end
            if h(i,j)<=140&&h(i,j)>108
                H(i,j) = 6;
            end
            if h(i,j)<=165&&h(i,j)>140
                H(i,j) = 7;
            end
            if h(i,j)<=190&&h(i,j)>165
                H(i,j) = 8;
            end
            if h(i,j)<=220&&h(i,j)>190
                H(i,j) = 9;
            end
            if h(i,j)<=255&&h(i,j)>220
                H(i,j) = 10;
            end
            if h(i,j)<=275&&h(i,j)>255
                H(i,j) = 11;
            end
            if h(i,j)<=290&&h(i,j)>275
                H(i,j) = 12;
            end
            if h(i,j)<=316&&h(i,j)>290
                H(i,j) = 13;
            end
            if h(i,j)<=330&&h(i,j)>316
                H(i,j) = 14;
            end
            if h(i,j)<=345&&h(i,j)>330
                H(i,j) = 15;
            end
        end
    end

    % 对s和v进行量化 量化空间为1~4
    for i = 1:M
        for j = 1:N
            if s(i,j)<=0.15&&s(i,j)>0
                S(i,j) = 1;
            end
            if s(i,j)<=0.4&&s(i,j)>0.15
                S(i,j) = 2;
            end
            if s(i,j)<=0.75&&s(i,j)>0.4
                S(i,j) = 3;
            end
            if s(i,j)<=1&&s(i,j)>0.75
                S(i,j) = 4;
            end
        end
    end
    for i = 1:M
        for j = 1:N
            if v(i,j)<=0.15&&v(i,j)>0
                V(i,j) = 1;
            end
            if v(i,j)<=0.4&&v(i,j)>0.15
                V(i,j) = 2;
            end
            if v(i,j)<=0.75&&v(i,j)>0.4
                V(i,j) = 3;
            end
            if v(i,j)<=1&&v(i,j)>0.75
                V(i,j) = 4;
            end
        end
    end

    Hh = zeros(16,1);

    for i=1:M
        for j =1:N
            for k = 1:16
                if H(i,j) == k
                    Hh(k,1) = Hh(k,1) + 1;
                    break;
                end
            end
        end
    end

    %至此得到了一幅图像的Hh量化矩阵

    Ss = zeros(4,1);
    for i = 1:M
        for j =1:N
            for k = 1:4
                if S(i,j) == k
                    Ss(k,1) = Ss(k,1)+1;
                    break;
                end
            end
        end
    end

    Vv = zeros(4,1);
    for i = 1:M
        for j = 1:N
            for k = 1:4
                if V(i,j) == k
                    Vv(k,1) = Vv(k,1) + 1;
                    break;
                end
            end
        end
    end
```
之后对图片进行比较

```
function result = compare(filename1, filename2)

%    clear

    %filename1 = '2416.jpg';
    %filename2 = '19.jpg';

    [h1,s1,v1] = hsv_hist(filename1);
    [h2,s2,v2] = hsv_hist(filename2);

    sub_h = sum(abs(h1-h2));
    sub_s = sum(abs(s1-s2));
    sub_v = sum(abs(v1-v2));

    result = (sub_h+sub_v+sub_s)/3;
```

测试了一下

```
% 找出100副最相近的图片

clc;
clear;
%待比较的文件
file = '2416.jpg';
directory = 'D:\2019\duomeitiqingbaochuli\homework\image.vary.jpg\image.vary.jpg\';
workspace = 'H:\workspace\matlab\imagepro';
workdir = 'H:\workspace\matlab\imagepro\img';

if exist(workdir)
    rmdir(workdir, 's'); %matlab 删除目录和目录下的文件
    mkdir(workdir);
else
    mkdir(workdir);
end

all_img = dir(directory); %返回的是一个结构体

all_img_size = size(all_img,1)-2; %计算出文件数目

result = zeros(all_img_size,1);
%还是老老实实的拼接文件名
for k = 0:all_img_size-1
    filename = [directory, num2str(k), '.jpg'];
    result(k+1) = compare(file, filename);
end

    
% for k =3+2415:all_img_size+2
%     filename = all_img(k).name;
%     result(k-2,1) = compare(file, [directory, filename]);
% end

%对result进行排序
[V,I] = sort(result);

%取出前100个图片移动到目录下
for k = 1:100
    move_file = [directory, num2str(I(k,1)), '.jpg'];
    copyfile(move_file,workdir )
end
```

分类的结果大概如下
![](https://upload-images.jianshu.io/upload_images/10651191-486c62545b102d65.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

---
title: 'matlab图像翻转'
date: 2019-01-01
category: 'matlab'
tags: []
lang: 'zh'
draft: true
---
实验1.1的代码，写的太垃圾了，毕竟不是很熟悉matlab
中间的某些部分都是直接硬编码的，将就着看一下吧
```matlab
figure

img = im2double(imread('th.jpg'));
subplot(331)
imshow(img)
img2 = (rot90(img, 1)); %翻转90度
subplot(332)
imshow(img2);
img3 = flipud(img); %从上到下翻转
subplot(333)
imshow(img3)
%img4 = fliplr(img); % 左右翻转
subplot(334)
imshow(flipud(img2))

img5 = fliplr(img); % 似乎是翻转某个维度
subplot(335)
imshow(img5)

img6 = flipud(img);
subplot(336)
imshow(img6)

imgNew = img;
for i=1:120
    for j=1:474
        imgNew(i,j,3)=0;
        imgNew(i,j,2) = 0;
        imgNew(i,j,1)=0;
    end
end

for i= 354:474
    for j=1:474
        imgNew(i,j,3)=0;
        imgNew(i,j,2) = 0;
        imgNew(i,j,1)=0;
    end
end

for i = 1:474
    for j = 1:120
        imgNew(i,j,3)=0;
        imgNew(i,j,2) = 0;
        imgNew(i,j,1)=0;
    end
end

for i=1:474
    for j=354:474
        imgNew(i,j,3)=0;
        imgNew(i,j,2)= 0;
        imgNew(i,j,1)=0;
    end
end

subplot(337)
imshow(imgNew); %第7张

%第八张
imgNew2 = img;

for i=120:354
    for j=120:354
        imgNew2(i,j,1)=1;
        imgNew2(i,j,2)=1;
        imgNew2(i,j,3)=1;
    end
end
subplot(338);
imshow(imgNew2);

%翻转一下图片，然后取下三角矩阵
img = imread('th.jpg');
imgNew = fliplr(img);
%imshow(imgNew);
r = triu(imgNew(:,:,1),0);
[m,n] = size(r);
for i=1:m
     for j=1:n
         if(r(m,n) == 0)
             r(m,n) = 0;
         end
     end
end
rNew = fliplr(r);

g = triu(imgNew(:,:,2),0);
for i=1:m
     for j=1:n
         if(g(m,n) == 0)
             g(m,n) = 0;
         end
     end
end

gNew = fliplr(g);
b = triu(imgNew(:,:,3),0);
for i=1:m
     for j=1:n
         if(b(m,n) == 0)
             b(m,n) = 0;
         end
     end
end
bNew = fliplr(b);

%imshow(bNew);

hsi = cat(3,rNew,gNew,bNew);   

subplot(339)
imshow(hsi)
```

运行效果:
![结果](https://upload-images.jianshu.io/upload_images/10651191-e2fbf10c03f9a67f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

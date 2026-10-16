---
title: 'bugku隐写'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
记录一些bugkuctf的隐写题目

 # 一张单纯的图片
![](https://upload-images.jianshu.io/upload_images/10651191-d9a1dcef9fbaae49.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

strings 走一波
![](https://upload-images.jianshu.io/upload_images/10651191-5837af28ab8ec51a.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

得到了这些：
> &#107;&#101;&#121;&#123;&#121;&#111;&#117;&#32;&#97;&#114;&#101;&#32;&#114;&#105;&#103;&#104;&#116;&#125

是unicode编码，转换一下就好了
![](https://upload-images.jianshu.io/upload_images/10651191-81cbf66672d14775.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 隐写
![](https://upload-images.jianshu.io/upload_images/10651191-8c83c0013461ba66.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

又得到一张图片
![](https://upload-images.jianshu.io/upload_images/10651191-340875c17932b0c9.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

修改图片的高度就行了，具体原理自行百度
![](https://upload-images.jianshu.io/upload_images/10651191-05c4f1335775b32b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# telnet

![](https://upload-images.jianshu.io/upload_images/10651191-8906d6df176687f7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

打开之后是一个流量包
尝试直接搜索flag字符串未果
尝试导出相关信息未果

然后跟踪TCP流

![](https://upload-images.jianshu.io/upload_images/10651191-3e4e037b388cd4c8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 眼见非实
![](https://upload-images.jianshu.io/upload_images/10651191-953c790e3b0f3412.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

下载后是一个zip

加后缀名zip
![](https://upload-images.jianshu.io/upload_images/10651191-6bc25caa35d6e954.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

word打开失败
![](https://upload-images.jianshu.io/upload_images/10651191-ffa193983eefca5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

hint 眼见非实 那就肯定不是word了

尝试添加.zip后缀名

解压后看到一堆的xml文件，一个个找就行了

# 啊da

![](https://upload-images.jianshu.io/upload_images/10651191-81c32525e6539468.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

binwalk走一波

```
pxy@LAPTOP-UBIEP4K5:/mnt/h/ctf/bugku$ binwalk ada.jpg

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
30            0x1E            TIFF image data, big-endian, offset of first image directory: 8
5236          0x1474          Copyright string: "Copyright Apple Inc., 2018"
7782          0x1E66          Unix path: /www.w3.org/1999/02/22-rdf-syntax-ns#"/></x:xmpmeta>
218773        0x35695         Zip archive data, encrypted at least v2.0 to extract, compressed size: 34, uncompressed size: 22, name: flag.txt
218935        0x35737         End of Zip archive
```

有文件

foremost走一波
```
pxy@LAPTOP-UBIEP4K5:/mnt/h/ctf/bugku$ foremost -i ada.jpg -T
Processing: ada.jpg
|foundat=flag.txt?▒n▒▒▒▒D;5jV▒▒u▒▒▒-▒Z▒ĹI▒▒▒▒
*|

```

可是有密码
![](https://upload-images.jianshu.io/upload_images/10651191-a09d8303c214091c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

查看图片属性
![](https://upload-images.jianshu.io/upload_images/10651191-8f1c327da6696f14.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

十六进制转ascii

ok得到密码
![](https://upload-images.jianshu.io/upload_images/10651191-fe16e7c2fb0f9d42.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 又一张图片

![](https://upload-images.jianshu.io/upload_images/10651191-7a5f859e40f83f47.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

继续binwalk走一波

```
pxy@LAPTOP-UBIEP4K5:/mnt/h/ctf/bugku$ binwalk 2.jpg

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, EXIF standard
12            0xC             TIFF image data, big-endian, offset of first image directory: 8
13017         0x32D9          Unix path: /www.w3.org/1999/02/22-rdf-syntax-ns#"> <rdf:Description rdf:about="" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/" xmlns
158792        0x26C48         JPEG image data, JFIF standard 1.02
158822        0x26C66         TIFF image data, big-endian, offset of first image directory: 8
159124        0x26D94         JPEG image data, JFIF standard 1.02
162196        0x27994         JPEG image data, JFIF standard 1.02
164186        0x2815A         Unix path: /www.w3.org/1999/02/22-rdf-syntax-ns#"> <rdf:Description rdf:about="" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xap="htt
168370        0x291B2         Copyright string: "Copyright (c) 1998 Hewlett-Packard Company"
```
好多文件啊
foremost走一波
![](https://upload-images.jianshu.io/upload_images/10651191-389a76fdf8a5b053.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 猜
这个Google搜图就行
![](https://upload-images.jianshu.io/upload_images/10651191-f5ef543def5e6fc6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# 隐写2

继续binwalk
```
pxy@LAPTOP-UBIEP4K5:/mnt/h/ctf/bugku$ binwalk Welcome_.jpg

DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             JPEG image data, JFIF standard 1.01
30            0x1E            TIFF image data, big-endian, offset of first image directory: 8
4444          0x115C          Unix path: /www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="uuid:faf5bdd5-ba3d-11da-ad31-d33d75182f1b" xmlns:dc="http://p
4900          0x1324          Unix path: /www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:li xml:lang="x-default">hint:</rdf:li></rdf:Alt>
52516         0xCD24          Zip archive data, at least v1.0 to extract, compressed size: 6732, uncompressed size: 6732, name: flag.rar
59264         0xE780          End of Zip archive
147852        0x2418C         End of Zip archive

```

foremost大法好

![](https://upload-images.jianshu.io/upload_images/10651191-455fd34c4c433bde.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

解压之后
![](https://upload-images.jianshu.io/upload_images/10651191-c62850c5b3689afb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

爆破就行了

# 多种方法解决

![](https://upload-images.jianshu.io/upload_images/10651191-3d745c354fff6e38.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

得到的问价不是PE文件

winhex打开之后就是一个图片的base64编码

直接在线转图片就行了

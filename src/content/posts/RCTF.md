---
title: 'RCTF'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
![](https://upload-images.jianshu.io/upload_images/10651191-980db03491a47aba.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

第二题：
打印机： 市场上新买了一台打印机昨晚，我侵入了它，我捕获到了USB流量， 
flag{0-9a-z}

现在得到了这些字符串

![](https://upload-images.jianshu.io/upload_images/10651191-af862548ba1dd142.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

wireshark 关于 usb协议的wiki[链接](https://wiki.wireshark.org/USB)

提取USB数据包

tshark.exe -r example.pcap -T fields -e usb.capdata //如果想导入usbdata.txt文件中，后面加上参数：>usbdata.txt

提取出来之后发现每个字段的长度都是八个字节

![](https://upload-images.jianshu.io/upload_images/10651191-365013a60b7e1ee4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

最关键的是第三个字节
借用脚本将其转换为字母

```python
mappings = { 0x04:"A",  0x05:"B",  0x06:"C", 0x07:"D", 0x08:"E", 0x09:"F", 0x0A:"G",  0x0B:"H", 0x0C:"I",  0x0D:"J", 0x0E:"K", 0x0F:"L", 0x10:"M", 0x11:"N",0x12:"O",  0x13:"P", 0x14:"Q", 0x15:"R", 0x16:"S", 0x17:"T", 0x18:"U",0x19:"V", 0x1A:"W", 0x1B:"X", 0x1C:"Y", 0x1D:"Z", 0x1E:"1", 0x1F:"2", 0x20:"3", 0x21:"4", 0x22:"5",  0x23:"6", 0x24:"7", 0x25:"8", 0x26:"9", 0x27:"0", 0x28:"\n", 0x2a:"[DEL]",  0X2B:"    ", 0x2C:" ",  0x2D:"-", 0x2E:"=", 0x2F:"[",  0x30:"]",  0x31:"\\", 0x32:"~", 0x33:";",  0x34:"'", 0x36:",",  0x37:"." }
nums = []
keys = open('usbdata.txt')
for line in keys:
    if line[0]!='0' or line[1]!='0' or line[3]!='0' or line[4]!='0' or line[9]!='0' or line[10]!='0' or line[12]!='0' or line[13]!='0' or line[15]!='0' or line[16]!='0' or line[18]!='0' or line[19]!='0' or line[21]!='0' or line[22]!='0':
         continue
    nums.append(int(line[6:8],16))
keys.close()
output = ""
for n in nums:
    if n == 0 :
        continue
    if n in mappings:
        output += mappings[n]
    else:
        output += '[unknown]'
print 'output :\n' + output
```

![](https://upload-images.jianshu.io/upload_images/10651191-0445ffd80584f8d6.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

得到的数据
AHDGEEFFDAANKIFGIIHEECDCB

猜测是自解码？

再借用脚本爆破一波

```python
from ngram_score import ngram_score
from pycipher import Autokey
import re
from itertools import permutations

qgram = ngram_score('quadgrams.txt')
trigram = ngram_score('trigrams.txt')

ctext = 'AHDGEEFFDAANKIFGIIHEECDCB'

ctext = re.sub(r'[^A-Z]','',ctext.upper())
# keep a list of the N best things we have seen, discard anything else

class nbest(object):
    def __init__(self,N=1000):
        self.store = []
        self.N = N

    def add(self,item):
        self.store.append(item)
        self.store.sort(reverse=True)
        self.store = self.store[:self.N]

    def __getitem__(self,k):
        return self.store[k]

    def __len__(self):
        return len(self.store)
        
#init
N=100
for KLEN in range(3,20):
    rec = nbest(N)
    for i in permutations('ABCDEFGHIJKLMNOPQRSTUVWXYZ',3):
        key = ''.join(i) + 'A'*(KLEN-len(i))
        pt = Autokey(key).decipher(ctext)
        score = 0
        for j in range(0,len(ctext),KLEN):
            score += trigram.score(pt[j:j+3])
        rec.add((score,''.join(i),pt[:30]))

    next_rec = nbest(N)
    for i in range(0,KLEN-3):
        for k in xrange(N):
            for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ':
                key = rec[k][1] + c
                fullkey = key + 'A'*(KLEN-len(key))
                pt = Autokey(fullkey).decipher(ctext)
                score = 0
                for j in range(0,len(ctext),KLEN):
                    score += qgram.score(pt[j:j+len(key)])
                next_rec.add((score,key,pt[:30]))
        rec = next_rec
        next_rec = nbest(N)
    bestkey = rec[0][1]
    pt = Autokey(bestkey).decipher(ctext)
    bestscore = qgram.score(pt)
    for i in range(N):
        pt = Autokey(rec[i][1]).decipher(ctext)
        score = qgram.score(pt)
        if score > bestscore:
            bestkey = rec[i][1]
            bestscore = score       
    print bestscore,'autokey, klen',KLEN,':"'+bestkey+'",',Autokey(bestkey).decipher(ctext)
```

结果是这些：
```
root@kali:~# python Quadgram.py 
-123.726362292 autokey, klen 3 :"HIZ", TZENFASADIAKCIVEANDERZZLC
-110.398455706 autokey, klen 4 :"TDLB", HESFXANAGANNEISTEAPLACORB
-115.97129173 autokey, klen 5 :"QPRSS", KSMOMUNTPOGARTRAIRONEUMOO
-105.161384108 autokey, klen 6 :"MGSYME", OBLISARESSINTENOAVOARODHN
-100.996708088 autokey, klen 7 :"NHDTUMX", NAANKSISDANDSANDIVEMEPAUG
-97.4439552583 autokey, klen 8 :"APVTLASN", ASINTENSDISARESOFAPENYLOW
-93.3178255517 autokey, klen 9 :"ODQNWQSBM", MENTIONEROWARARTERTIELDLI
-89.4675052542 autokey, klen 10 :"AFWYMBXKZJ", ACHISDIVERALDANDANDNERACO
-86.7560613357 autokey, klen 11 :"NOVTYNBNKWL", NTINGRESTEPARASAREPLANDLB
-84.3208200874 autokey, klen 12 :"JHMNWJBSDNXN", RARTIVENANDATIONANDREPACI
-83.6320457909 autokey, klen 13 :"SUXPAMMBOAJUD", INGRESTEPARTHASAREPLANDLI
-80.5281786018 autokey, klen 14 :"AUCCMLBQDJHGGU", ANBESTEPARTHEOFTHEPLANDLI
-78.204259175 autokey, klen 15 :"NHQDRAONPVHGGRF", NANDNERSOFTHERATIVERALLOW
-76.3650673614 autokey, klen 16 :"LHKPAPFOKTWWGQMG", PATREPARTHERESTATIONANDLI
-75.7364796567 autokey, klen 17 :"AOMCPEOMWWJJRBBOP", ATREPARTHERETHESTIONANDLI
-73.5808943139 autokey, klen 18 :"MUZPMQAMWWINXFMZEQ", ONERSOFTHESANDTHESTRALLOW
-71.9662362375 autokey, klen 19 :"XDMOQZMYZYMARBBOPBD", DERSOFTHECONTHESTHEBALLOW
```

不确认是不是自动密钥密码
先假设关键词为QUEENLY，而文本信息为 ATTACK AT DAWN则自动生成的密钥为"QUEENLYATTACKATDAWN"。之后再通过[维吉尼亚密码](https://zh.wikipedia.org/wiki/%E7%BB%B4%E5%90%89%E5%B0%BC%E4%BA%9A%E5%AF%86%E7%A0%81 "维吉尼亚密码")的表格法生成密文：

破译的方法

没有太理解解密的方法，基本上也是在猜测

web题

见过的最简洁的一道web题

```php
<?php
if (isset($_GET['a'])) {
        eval($_GET['a']);
} else {
        show_source(__FILE__);
}
```
在本地测试了一下，可以做哪些事情呢?
1. 执行系统命令
![image.png](https://upload-images.jianshu.io/upload_images/10651191-5f47443e1313a389.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
![image.png](https://upload-images.jianshu.io/upload_images/10651191-967473cd96248e7d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

2. 可以打招呼

![](https://upload-images.jianshu.io/upload_images/10651191-8b202b43164316b4.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

3. 可以包含文件

比如无限循环包含自身
![](https://upload-images.jianshu.io/upload_images/10651191-541e8e3506397776.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

4. 可以直接连接菜刀，因为这个显然是一个一句话木马

5. 也可以包含其他目录下的文件
include("../../")

6. 

但是这些系统命令都没有权限

![](https://upload-images.jianshu.io/upload_images/10651191-1297e48dec9863dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

# disk题

文件格式是VMware虚拟磁盘，但是想要用VMware安装的时候却出错了？？

![](https://upload-images.jianshu.io/upload_images/10651191-9caf4cca0476dc05.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
error了。。

![](https://upload-images.jianshu.io/upload_images/10651191-995b26b3e72d27b8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

phar协议：

什么是phar？， phar归档是将单个文件打包，提供了一种不需要从磁盘上解压也可以直接运行的方式。同时支持命令行和web服务器使用

使用phar文件
```php
<?php
 include 'phar:///path/to/myphar.phar/file.php';
 ?>
```

`file_get_contents()`函数
```php
<?php
$file = 'people.txt';
// Open the file to get existing content
$current = file_get_contents($file);
// Append a new person to the file
$current .= "John Smith\n";
// Write the contents back to the file
file_put_contents($file, $current);
?>
```

使用flag
```php
<?php
$file = 'people.txt';
// The new person to add to the file
$person = "John Smith\n";
// Write the contents to the file, 
// using the FILE_APPEND flag to append the content to the end of the file
// and the LOCK_EX flag to prevent anyone else writing to the file at the same time
file_put_contents($file, $person, FILE_APPEND | LOCK_EX);
?>
```

`include_once`
```php
$result = include_once 'fakefile.php';  // $result = false
$result = include_once 'fakefile.php'   // $result is still false
```
连续两次包含文件
```php
<?php
var_dump(include_once 'fakefile.ext'); // bool(false)
var_dump(include_once 'fakefile.ext'); // bool(true)
?>
```

魔术常量

__LINE__ 行号
__FILE__ 文件的完整路径和文件名
__DIR__ 文件所在的目录
__FUNCITON__ 函数名称
__CLASS__ 类名
_TRAIT__ 
\__NAMESPACE\_\_ 命名空间

![](https://upload-images.jianshu.io/upload_images/10651191-ae5e59b96d313765.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

可是菜刀就是连不上去
![](https://upload-images.jianshu.io/upload_images/10651191-ed4ddf69280b511b.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

浏览当前目录下的文件
![](https://upload-images.jianshu.io/upload_images/10651191-55d685f5e0397148.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

preload.php也无法打开

无法浏览上一级目录
![](https://upload-images.jianshu.io/upload_images/10651191-affc403e2a4019fc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

> [http://nextphp.2019.rctf.rois.io/index.php?a=file:///var/www/html/index.php;](http://nextphp.2019.rctf.rois.io/index.php?a=file:///var/www/html/index.php;)

`unlink`删除文件
`unlink(string $filename)`

不对变量导致用户恶意删除文件
```php
<?php
// 从用户目录中删除指定的文件
$username = $_POST['user_submitted_name'];
$userfile = $_POST['user_submitted_filename'];
$homedir = "/home/$username";
unlink ("$homedir/$userfile");
echo "The file has been deleted!";
?>
```

用户可以通过控制参数来删除文件

更安全的检查
```php
<?php
$username = $_SERVER['REMOTE_USER']; // 使用认证机制
$userfile     = $_POST['user_submitted_filename'];
$homedir = "/home/$username";

$filepath     = "$homedir/$userfile";
if (!ctype_alnum($username) || !preg_match('/^(?:[a-z0-9_-]|\.(?!\.))+$/iD', $userfile)) {
    die("Bad username/filename");
}
//后略……
?>
```

正则表达式: 
\b 空格 \bweb\b 表示只有 " web " 而不是 "webpage"

分隔符 // 和 ##和~~

^ 是开头
? 匹配前面的子表达式零次或者一次比如 ab(ce)? ab 或者abce

(?:pattern) 匹配 pattern 但不获取匹配结果，也就是说这是一个非获取匹配，不进行存储供以后使用。这在使用 "或" 字符 (|) 来组合一个模式的各个部分是很有用。例如， 'industr(?:y|ies) 就是一个比 'industry|industries' 更简略的表达式。

(?!pattern)正向否定预查(negative assert)，在任何不匹配pattern的字符串开始处匹配查找字符串。这是一个非获取匹配，也就是说，该匹配不需要获取供以后使用。例如"Windows(?!95|98|NT|2000)"能匹配"Windows3.1"中的"Windows"，但不能匹配"Windows2000"中的"Windows"。预查不消耗字符，也就是说，在一个匹配发生后，在最后一次匹配之后立即开始下一次匹配的搜索，而不是从包含预查的字符之后开始。

[https://hackfun.org/2017/02/22/CTF%E4%B8%AD%E9%82%A3%E4%BA%9B%E8%84%91%E6%B4%9E%E5%A4%A7%E5%BC%80%E7%9A%84%E7%BC%96%E7%A0%81%E5%92%8C%E5%8A%A0%E5%AF%86/](https://hackfun.org/2017/02/22/CTF%E4%B8%AD%E9%82%A3%E4%BA%9B%E8%84%91%E6%B4%9E%E5%A4%A7%E5%BC%80%E7%9A%84%E7%BC%96%E7%A0%81%E5%92%8C%E5%8A%A0%E5%AF%86/)

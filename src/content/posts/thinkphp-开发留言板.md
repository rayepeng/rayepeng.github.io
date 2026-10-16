---
title: 'thinkphp-开发留言板'
date: 2019-01-01
category: 'PHP'
tags: []
lang: 'zh'
draft: true
---
看到女朋友一直在写留言板，然后就把她的前端页面都搬过来了，用tp二次开发了一下

thinkphp的文档来回看了几次了，还是要结合实际开发才能更好地掌握下来

## 路由

路由是我一开始折腾最多的，而且thinkphp每个版本的路由文件位置还不一样

为什么一开始就先搞路由呢，首先是路由在tp的开发文档中靠前，并且路由也相当于是一个大纲了，把这些定下来之后就方便后续的跳转了

路由配置文件

```php
Route::get('think', function () {
    return 'hello,ThinkPHP5!';
});

//Route::get('hello/:name', 'index/hello');

 Route::get('/', 'index/index');

Route::post('login', 'login/login');  //不用带 /

Route::get('home', 'index/home'); //添加留言的主页面

Route::post('addMsg', 'Message/addMsg');

//Route::miss('/');

Route::get('delMsg/:id', 'Message/delMsg');

Route::get('mod/:id', 'index/modiMsg');
Route::post("modiMsg/:id", 'Message/modiMsg');
```

路由配置好之后，将网站的根目录设置在 public下，然后在该目录下添加一个.htaccess 文件

这是为了隐藏入口文件，将 index.php 隐藏掉，方便直接使用 localhost 来访问
```
<IfModule mod_rewrite.c>
  Options +FollowSymlinks -Multiviews
  RewriteEngine On

  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule ^(.*)$ index.php?/$1 [QSA,PT,L]
</IfModule>
```

## 首页
首页需要将数据库中存储的留言读取出来，然后呈现到页面上

![](https://upload-images.jianshu.io/upload_images/10651191-b051aa58d28d979e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为了方便，我用index模块下的index控制器来负责呈现页面的操作
结合之前的路由配置， `/` 路由被映射到 `index/index` 也就是 index控制器下的index方法

```php
    public function index()
    {
        $res = Db::connect()->table('content')->select();
        $this->assign('res', $res);
        if (Session::has("username")) {
        //如果已经登陆
        $username = Session::get("username");
        $this->assign("username", $username);
    }
        return $this->fetch('index');
    }
```

建立数据库连接，取出数据之后直接将其传递给 `index.html` 

```html
    <div class="card" style="text-align: center">
        <?php
       foreach($res as $key => $value) {
        ?>
            <div class="header">
                <p>
                    <?php
                    echo $res[$key]['username'], "&nbsp;&nbsp;发布时间： ", $res[$key]['date_time'], "&nbsp;&nbsp;";
                    if (isset($username)) {
                        ?>
                    <a href="/mod/<?php echo $res[$key]['id']?>">修改留言</a>
                    <a href="/delMsg/<?php echo $res[$key]['id']?>">删除留言</a>
                        <?php
                    }
                    ?>
                </p>
            </div>
            <div class="container">
                <?php
                    echo $res[$key]['messages'];
                ?>
            </div>
        <?php 
    } 
    ?>
```

## 登陆页面

用户会点击首页的添加留言，这里的逻辑应该是要跳转到添加留言的页面的，也就是 `/home` 路由

但是要校验是否登陆，

```php
    public function home()
    {
        //如果已经登陆了，就直接跳转到留言页面
        if($this->login->checkLogin()){
            return $this->fetch("addMsg");
        }else{
            //否则跳转到登陆页面
            return $this->fetch("login");
        }
    }
```
没有登陆返回的就是登陆的页面了

![](https://upload-images.jianshu.io/upload_images/10651191-305d23ea0558eb71.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

登陆功能的实现：

新建了一个 Login 的控制器，

```php
	public function login()
    {
		$username = $this->request->param("username");
		$password = $this->request->param("password");

		$res = Db::connect()->table("user")->where("username", $username)->find();
		if($res['password'] !== md5($password)){
            $this->error("密码错误");
        }
        $auth = md5($res['username'] . $res['password'] . $this->salt) . ":" . $res['id'];
		Session::set("username", $username);
		Session::set("auth", $auth);
		$this->success("登陆成功！", "/home");
	}
```

从用户的表单中获取到用户名和密码进行校验，如果密码错误则弹出提示信息，如果密码正确则跳转到 `/home` 路由

![](https://upload-images.jianshu.io/upload_images/10651191-339420678b28f080.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 添加留言

![](https://upload-images.jianshu.io/upload_images/10651191-b2b9c317aa9029a7.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这里的表单是向 `Message` 控制器的 `addMsg` 方法发送数据

```php
    public function addMsg()
    {
        //接收发送过来的留言
        $messages = $this->request->param("messages");
        $username = \session("username"); //使用助手函数
        $date_time = date("Y-m-d H:i:s");

        $data = ['username' => $username, 'messages' => $messages, 'date_time' => $date_time];
        $res = Db::name('content')->insert($data);
        if ($res) {
            $this->success("添加成功", "/");
        }
    }
```

添加成功则返回到首页

## 删除留言

登录之后，结合之前index控制器下的index方法的验证，此时的首页

![](https://upload-images.jianshu.io/upload_images/10651191-41fb8db390bbe283.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

这个只需要向 Message 类的 `delMsg` 方法发送请求即可

```php
    public function delMsg($id)
    {
        $res = Db::table("content")->delete($id);
        if ($res) {
            $this->success("删除成功", "/");
        } else {
            $this->error("删除失败");
        }
    }
```

## 修改留言

用户点击修改留言，这种情况下我觉得我设计的比较冗余，

```php
Route::get('mod/:id', 'index/modiMsg');
```

请求会发送到 index 控制器下的 `modiMsg` 方法

取出数据库中原来的留言，然后返回一个修改留言的页面

```php
    public function modiMsg($id)
    {
        $res = Db::connect()->table("content")->where("id", $id)->find();
        $this->assign("id", $id);
        $this->assign("messages", $res['messages']);
        return $this->fetch("modiMsg");
    }
```

![](https://upload-images.jianshu.io/upload_images/10651191-07c12c1832afbfcb.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

填写好表单之后，向 `Message` 控制器下的 `modiMsg` 方法发送请求

```php
    public function modiMsg($id)
    {
        $new_messages = $this->request->param("new_messages");
        $date_time = date("Y-m-d H:i:s");
        $res = Db::name('content')->where('id', $id)->update(['messages' => $new_messages, 'date_time' => $date_time]);
        if ($res) {
            $this->success("更新成功", "/");
        }
    }
```

ok基本的逻辑就是这些了，在编写代码的过程中还是遇到了一些坑的，最大的坑就是路由了，主要还是对于框架的不熟悉导致的

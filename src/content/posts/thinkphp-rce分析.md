---
title: 'thinkphp-rce分析'
date: 2019-09-24
category: '未分类'
tags: []
lang: 'zh'
draft: false
---
太惭愧了，今年一月份大火的thinkphp漏洞根本没关注，现在回过头来仔细分析下

## 开启debug模式

先放截图：  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/thinkphp.png)

然后开始一步步来搞

`php-storm`如何调试就不细说了

`thinkphp`从这里开始启动，有机会一定要分析下`thinkphp`是如何运行的  
![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/thinkphp0.png)

这里`F8`一下先进入了一个`autoload`函数，具体作用不是很清楚

进入`run`函数之后，会先实例化一个`$request`  
之后进行一些模块绑定的操作，之后进入`self::routerCheck`函数，进行URL路由检测

而`self::routerCheck`函数又会调用`Route::check`函数

`Route::check`函数中：  

```php
$url = str_replace($depr, '|', $url);

if (strpos($url, '|') && isset(self::$rules['alias'][strstr($url, '|', true)])) {
    // 检测路由别名
    $result = self::checkRouteAlias($request, $url, $depr);
    if (false !== $result) {
        return $result;
    }
}
$method = strtolower($request->method());
// 获取当前请求类型的路由规则
$rules = self::$rules[$method];
// 检测域名部署
if ($checkDomain) {
    self::checkDomain($request, $rules, $method);
}
```

这里最关键的就是`$method = strtolower($request->method());`

转过头来分析这个函数

```php
   /**
     * 当前的请求类型
     * @access public
     * @param bool $method  true 获取原始请求类型
     * @return string
     */   
public function method($method = false)
    {
        if (true === $method) {
            // 获取原始请求类型
            return IS_CLI ? 'GET' : (isset($this->server['REQUEST_METHOD']) ? $this->server['REQUEST_METHOD'] : $_SERVER['REQUEST_METHOD']);
        } elseif (!$this->method) {
            if (isset($_POST[Config::get('var_method')])) {
                $this->method = strtoupper($_POST[Config::get('var_method')]);
                $this->{$this->method}($_POST);
            } elseif (isset($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE'])) {
                $this->method = strtoupper($_SERVER['HTTP_X_HTTP_METHOD_OVERRIDE']);
            } else {
                $this->method = IS_CLI ? 'GET' : (isset($this->server['REQUEST_METHOD']) ? $this->server['REQUEST_METHOD'] : $_SERVER['REQUEST_METHOD']);
            }
        }
        return $this->method;
    }
```

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/thinkphp1.png)

此时我们看到调用了`__construct`方法

![](https://raw.githubusercontent.com/xinyongpeng/gitpic/master/thinkphp2.png)

```php
/**
 * 架构函数
 * @access protected
 * @param array $options 参数
 */
protected function __construct($options = [])
{
    foreach ($options as $name => $item) {
        if (property_exists($this, $name)) {
            $this->$name = $item;
        }
    }
    if (is_null($this->filter)) {
        $this->filter = Config::get('default_filter');
    }
    // 保存 php://input
    $this->input = file_get_contents('php://input');
}
```

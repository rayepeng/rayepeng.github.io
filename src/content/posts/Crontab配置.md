---
title: 'Crontab配置'
date: 2019-01-01
category: '操作系统'
tags: []
lang: 'zh'
draft: true
---
## crontab任务编辑

进入crontab编辑界面，奇怪的是，这个是自动编辑了一个 /tmp 目录下的脚本

```python

crontab -e

```

列出当前用户的crontab任务

```python

crontab -l

```

具体详情请参考

## crontab 记录日志

可以手动把日志导入到一个文件中

```bash

# 每分钟执行一次

* * * * * /home/rayepeng/workspace/ipy-nb/examples/mnist/start.sh >> $HOME/for_crontab/mylog.log 2>&1

```

## crontab 常用示例

时间分为 **`分、时、日、月、周`**

- **`*`** 取值范围内的所有数字

- **`/**` 每过多少个数字

- **** `-` 从X到Z

- **`，`**散列数字

- 每分钟执行一次

```bash

* * * * * myCommand

```

- ****每小时的第3和第15分钟执行****

```bash

3,15 * * * * myCommand

```

- ****在上午8点到11点的第3和第15分钟执行****

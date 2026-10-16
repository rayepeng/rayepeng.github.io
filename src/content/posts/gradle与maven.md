---
title: 'gradle与maven'
date: 2019-01-01
category: 'java'
tags: []
lang: 'zh'
draft: true
---
## gradle

近来开始研究java安全，gradle和maven这两个包管理工具是必不可少的要了解的

简要看了一下gradle的用法，`gradle tasks`列出可以进行的任务
`gradle build`就是build一个项目

其实和maven很相似，需要的依赖，打包的形式等等

`build.gradle`的写法
```
apply plugin: 'java'
apply plugin: 'eclipse'
apply plugin: 'application'

mainClassName = 'hello.HelloWorld'

// tag::repositories[]
repositories { 
	 maven {
        url 'http://maven.aliyun.com/nexus/content/groups/public/'
    }
    mavenCentral() 
}
// end::repositories[]

// tag::jar[]
jar {
    baseName = 'gs-gradle'
    version =  '0.1.0'
}
// end::jar[]

// tag::dependencies[]
sourceCompatibility = 1.8
targetCompatibility = 1.8

dependencies {
    compile "joda-time:joda-time:2.2"
    testCompile "junit:junit:4.12"
}
// end::dependencies[]

// tag::wrapper[]
// end::wrapper[]
```

IDEA中配置gradle

![](https://upload-images.jianshu.io/upload_images/10651191-b148aaf5865f8f34.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

为了避免占用C盘空间，选择gradle home为另一个目录下
同时新建了`init.gradle`配置了镜像源
```
allprojects{
    repositories {
        def REPOSITORY_URL = 'http://maven.aliyun.com/nexus/content/groups/public/'
        all { ArtifactRepository repo ->
            if(repo instanceof MavenArtifactRepository){
                def url = repo.url.toString()
                if (url.startsWith('https://repo1.maven.org/maven2') || url.startsWith('https://jcenter.bintray.com/')) {
                    project.logger.lifecycle "Repository ${repo.url} replaced by $REPOSITORY_URL."
                    remove repo
                }
            }
        }
        maven {
            url REPOSITORY_URL
        }
    }
}
```

这样就能很方便的管理了

![](https://upload-images.jianshu.io/upload_images/10651191-6fceb8074208c855.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 参考
[gradle本地、远程仓库配置](https://blog.csdn.net/x_iya/article/details/75040806)
[gradle配置国内镜像](https://blog.csdn.net/lj402159806/article/details/78422953)
示例项目[https://github.com/spring-guides/gs-gradle/tree/master/complete](https://github.com/spring-guides/gs-gradle/tree/master/complete)
[使用 Gradle 构建 Java 项目](https://www.cnblogs.com/heart-king/p/5872892.html)

<!DOCTYPE html>
<html lang="en">
<head>
		<#include "core/core.ftl"/>
		<#include "./test/test.ftl"/>
    <meta charset="UTF-8">
    <title>Hello World</title>
		<#-- 动态变量不替换 -->
		<img src="aa/{{test}}" alt="">
		<img src="aa/${test}" alt="">
		<#assign loading1=[  "./test/test.ftl", "./img/hi.jpg"]/>
		<#assign loading=[  "./img/hi.jpg",   "./test/test.ftl"]/>
</head>
<body>
</body>
</html>

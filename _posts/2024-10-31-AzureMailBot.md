---
layout: post
title:  "监控某项Azure服务或其他业务并发送邮件的方法"
date:   2024-10-31 14:06:05
categories: Azure
tags: Powershell Azure Scripts APP KEY
excerpt: 本文例子为监控应用注册客户端密钥有效期的Powershell脚本
---

* content
{:toc}

## 问题背景

需要监控应用注册客户端密钥有效期。该脚本可修改配合其他客户需求进行使用。

### 问题调查

× 目前Outlook邮箱2024年9月起无法使用旧式基本身份验证，仅支持OAuth，遂排除  
× 163邮箱应用密码有效期180天，排除  
× 国外的API调用的方式考虑不稳定，排除  
√ 仅QQ托管的qq.com和FoxMail.com邮箱可行，应用密码仅在修改QQ密码后失效

---

## 方案脚本示例

### 登录Azure账户, 本地使用
```
Connect-AzAccount -Environment AzureChinaCloud
```

# 登录Azure账户，自动化帐户调用托管标识使用
```
Connect-AzAccount -EnvironmentName azurechinacloud -Identity
```

# 定义参数和脚本主体
```
$appId = "ad43de94-a2a1-xxxxxxxx"# 指定应用的对象ID
$daysBeforeExpiryStartSending = 30 # 提前多少天开始发送提醒
$smtpServer = "smtp.qq.com" # SMTP服务器地址
$smtpPort = 587 # SMTP端口
$smtpUser = "xxxxx@foxmail.com" # 你的电子邮件地址
$smtpPassword = "" # 你的SMTP应用密码
$smtpFrom = "xxxxxxx@foxmail.com" # 发件人邮箱
$smtpTo = "feng.nanrui@oe.21vianet.com" # 收件人邮箱
 
# 获取当前时间
$currentDate = Get-Date
 
# 获取指定的应用程序
$app = Get-AzADApplication -ObjectId $appId
 
if ($app) {
    # 获取应用程序的所有凭据
    $credentials = Get-AzADAppCredential -ObjectId $appId
 
    foreach ($credential in $credentials) {
        # 计算剩余天数
        $expiryDate = [datetime]::Parse($credential.EndDateTime)
        $daysRemaining = ($expiryDate - $currentDate).Days
 
        # 如果密码将在接下来的30天内到期或已经过期
        if ($daysRemaining -le $daysBeforeExpiryStartSending -or $daysRemaining -lt 0) {
            # 构建邮件内容
            $subject = "Azure AppReg Credential Expiry Reminder"
            $body = @"
Dear Administrator,
 
The credential with Key ID '{0}' for the application with object ID '{1}' (Name: {2}) will expire or has expired.
There are {3} days remaining until the expiration date, which is on {4}.
Please update the credential to avoid any disruptions.
 
Best regards,
Your Azure Team.
"@ -f $credential.KeyId, $appId, $app.DisplayName, [math]::Max($daysRemaining, 0), $expiryDate.ToString("yyyy-MM-dd")
 
            # 创建SMTP客户端凭据
            $securePassword = ConvertTo-SecureString $smtpPassword -AsPlainText -Force
            $smtpCredential = New-Object System.Management.Automation.PSCredential ($smtpUser, $securePassword)
 
            # 创建SmtpClient实例，并设置超时时间
            $smtpClient = New-Object Net.Mail.SmtpClient($smtpServer, $smtpPort)
            $smtpClient.EnableSsl = $true
            $smtpClient.DeliveryMethod = [Net.Mail.SmtpDeliveryMethod]::Network
            $smtpClient.UseDefaultCredentials = $false
            $smtpClient.Credentials = $smtpCredential
            $smtpClient.Timeout = 300000 # 设置超时时间为5分钟（300秒）
 
            # 添加调试输出
            Write-Host "Connecting to SMTP server..."
            try {
                # 创建一个邮件消息对象
                $message = New-Object Net.Mail.MailMessage($smtpFrom, $smtpTo, $subject, $body)
                $message.IsBodyHtml = $false
                $message.Priority = [Net.Mail.MailPriority]::High
 
                # 发送邮件
                $smtpClient.Send($message)
                Write-Host "Email sent successfully."
            } catch {
                Write-Host "Failed to send email: $_"
                Write-Host "SMTP Server Error Details:"
                Write-Host $_.Exception.Message
            }
        }
    }
} else {
    Write-Host "Application with object ID '$appId' not found."
}

```
---

## 参考资料

* [Microsoft：Azure Powershell](https://learn.microsoft.com/zh-cn/powershell/azure/?view=azps-12.4.0&viewFallbackFrom=azps-9.5.0)

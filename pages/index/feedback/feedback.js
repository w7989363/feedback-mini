// pages/feedback/feedback.js

//获取应用实例
const app = getApp()

var util = require('../../../utils/util.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: {},
        hasUserInfo: false,
        hasLogin: false,
        // 登录api
        loginurl: "https://feedback.visionwbz.top/api.php/login/login",
        // 添加反馈问题api
        url: "https://feedback.visionwbz.top/api.php/feedback/addFeedback",
        tags: app.globalData.tags,
        btn: {
            loading: false,
            disabled: false
        }
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo: app.globalData.userInfo,
            hasUserInfo: app.globalData.hasUserInfo,
            hasLogin: app.globalData.hasLogin
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '校园问题反馈',
            path: '/pages/index/index'
        }
    },

    // 点击了某个tag
    tagTap: function (e) {
        var tags = this.data.tags
        var id = e.target.id
        for (var i = 0, len = tags.length; i < len; i++) {
            if (tags[i].id == id) {
                tags[i].selected = !tags[i].selected
            }
        }
        this.setData({
            tags: tags
        })
    },

    // 提交反馈按钮被点击
    submitTap: function (e) {  
        var that = this
        var form = e.detail.value
        var tagsArray = this.data.tags
        // 删除空格
        form.title = util.trim(form.title)
        form.detail = util.trim(form.detail)
        form.stu_name = util.trim(form.stu_name)
        form.tel = util.trim(form.tel)
        // 填写信息不完整
        if(form.title == "" || form.detail == "" || form.stu_name == "" || form.tel == ""){
            wx.showToast({
                title: "请填写完整信息",
                icon: "none"
            })
            return
        }
        // 表单验证：手机号11位
        if(form.tel.length != 11){
            wx.showToast({
                title: "请输入正确的手机号码",
                icon: "none"
            })
            return
        }
        // tags统计
        var count = 0
        var tags = ""
        for (var i = 0, len = tagsArray.length; i < len; i++){
            if (tagsArray[i].selected){
                count++
                // 拼接字符串
                tags = tags + tagsArray[i].id + ","
            }
        }
        // 未选择tags问题分类
        if(!count){
            wx.showToast({
                title: "至少选择一个分类",
                icon: "none"
            })
            return
        }
        // 去掉最后一个逗号
        tags = tags.substring(0, tags.length - 1)
        // 防止重复提交
        that.setData({
            btn: {
                loading: true,
                disabled: true
            }
        })
        // 完整填写请求参数对象
        form.tags = tags
        form.userid = wx.getStorageSync("userid")
        // 发送请求，回调函数（失败要解除更改btn状态，成功要跳转到成功页面）
        this.addFeedback(form)
        
    },

    // 提交反馈信息到api
    addFeedback: function (data, callback) {
        var that = this
        wx.request({
            url: that.data.url,
            method: "POST",
            data: data,
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    wx.showToast({
                        title: "反馈成功",
                        icon: ""
                    })
                    // 跳转到成功页面
                    setTimeout(function () {
                        wx.redirectTo({
                            url: "../content/content?id=" + res.id
                        })
                    }, 1500)
                }
                // 提交不成功，btn恢复
                else {
                    wx.showToast({
                        title: "出错了",
                        icon: "none"
                    })
                    that.setData({
                        btn: {
                            loading: false,
                            disabled: false
                        }
                    })
                }
                // 调用自定义回调函数
                if(typeof callback == "function"){
                    callback(res)
                }
            }
        })
    },

    // 登录
    login: function (resUser) {
        if (wx.getStorageSync("userid") != "") {
            app.globalData.hasLogin = true
            this.setData({
                hasLogin: true
            })
        }
        var that = this
        // 存储用户信息
        app.globalData.userInfo = resUser.detail.userInfo
        app.globalData.hasUserInfo = true
        that.data.userInfo = resUser.detail.userInfo
        that.data.hasUserInfo = true
        // 获取code
        wx.login({
            success: function (resLogin) {
                if (resLogin.code) {
                    // 向后台发送code和用户信息以获取自定义登录态userid
                    wx.request({
                        url: that.data.loginurl,
                        header: {
                            'Content-Type': 'application/json'
                        },
                        data: {
                            code: resLogin.code,
                            wx_name: that.data.userInfo.nickName,
                            avatar_url: that.data.userInfo.avatarUrl
                        },
                        success: function (res) {
                            res = res.data
                            if (res.status == 1) {
                                console.log(res)
                                // 同步存储
                                wx.setStorageSync("userid", res.userid)
                                app.globalData.hasLogin = true
                                that.setData({
                                    hasLogin: that.data.hasLogin = true
                                })

                            }
                            else {
                                console.log(res.msg)
                            }
                        }
                    })
                } else {
                    console.log(res.errMsg)
                }
            }
        })
    }



})
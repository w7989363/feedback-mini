// pages/index/content/content.js

//获取应用实例
const app = getApp()

var util = require('../../../utils/util.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        empty: "",
        userInfo: {},
        hasUserInfo: false,
        hasLogin: false,
        // 控制点赞重复点击
        disabled: false,
        // 绿三角
        greenTri: "/image/green_tri.png",
        // 灰三角
        grayTri: "/image/gray_tri.png",
        // 登录api
        loginUrl: "https://feedback.visionwbz.top/api.php/login/login",
        // content获取api
        getUrl: "https://feedback.visionwbz.top/api.php/feedback/getcontent",
        // 点赞api
        supportUrl: "https://feedback.visionwbz.top/api.php/feedback/support",
        id: 0,
        btn: {
            loading: false,
            disabled: false
        },
        feedback: {},
        comments: [],
        
    },

    // 获取content的request
    getContent: function (callback) {
        var that = this
        wx.request({
            url: that.data.getUrl,
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                id: that.data.id,
                userid: wx.getStorageSync("userid")
            },
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    that.setData({
                        feedback: res.data.feedback,
                        comments: res.data.comments
                    })
                }
                else {
                    wx.showToast({
                        title: "出错了",
                        icon: "none"
                    })
                }
                // 调用自定义回调函数
                if (typeof callback == "function") {
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
                        url: that.data.loginUrl,
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
    },

    // 点赞或取消赞
    // mode: 1点赞，0取消赞
    support: function (id, mode, callback) {
        var that = this
        wx.request({
            url: that.data.supportUrl,
            header: {
                'Content-Type': 'application/json'
            },
            data: {
                fb_id: id,
                userid: wx.getStorageSync("userid"),
                mode: mode
            },
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    var fb = that.data.feedback
                    // 点赞
                    if (mode) {
                        fb.support++
                        fb.my_support = true
                        that.setData({
                            feedback: fb
                        })
                    }
                    else {
                        fb.support--
                        fb.my_support = false
                        that.setData({
                            feedback: fb
                        })
                    }
                }
                // 调用自定义回调函数
                if (typeof callback == "function") {
                    callback(res)
                }
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            id: options.id,
            userInfo: app.globalData.userInfo,
            hasUserInfo: app.globalData.hasUserInfo,
            hasLogin: (wx.getStorageSync("userid") != "")
        })
        var that = this
        // 发送request获取反馈信息和评论信息
        this.getContent()
        
    },
    // 下拉刷新
    onPullDownRefresh: function () {
        var that = this
        console.log("刷新")
        this.getContent(function (res) {
            // 停止刷新
            wx.stopPullDownRefresh()
            // 清空comment
            that.setData({
                empty: "",
            })
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: this.data.feedback.title,
            path: "/pages/index/content/content?id=" + this.data.id
        }
    },

    // 点赞或取消赞
    supportTap: function () {
        if (this.data.disabled) {
            return
        }
        // 判断登录
        var that = this
        if (!this.data.hasLogin) {
            wx.showModal({
                title: "登录",
                content: "请先登录",
                confirmText: "登录",
                success: function (res) {
                    if (res.confirm) {
                        that.login()
                    }
                    else {
                        return
                    }
                }
            })
            return
        }
        this.data.disabled = true
        // 根据my_support提交请求
        this.support(this.data.id, this.data.feedback.my_support?0:1, function(res){
            that.data.disabled = false
        })
    }
})
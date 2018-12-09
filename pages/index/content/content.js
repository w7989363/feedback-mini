// pages/index/content/content.js

//获取应用实例
const app = getApp()

var util = require('../../../utils/util.js')

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null,
        hasUserInfo: false,
        hasLogin: false,
        // 控制点赞重复点击
        disabled: false,
        // 绿三角
        greenTri: "/image/green_tri.png",
        // 灰三角
        grayTri: "/image/gray_tri.png",
        // content获取api
        getUrl: "https://feedback.wentianlin.cn/api.php/feedback/getcontent",
        // 点赞api
        supportUrl: "https://feedback.wentianlin.cn/api.php/feedback/support",
        id: 0,
        feedback: {},
        comments: []
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
                else{
                    wx.showToast({
                        title: res.msg,
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

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.data.id = options.id
        this.data.userInfo = app.globalData.userInfo
        this.data.hasUserInfo = app.globalData.hasUserInfo
        this.data.hasLogin = app.globalData.hasLogin

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
        })
    },

    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {
    //     return {
    //         title: this.data.feedback.title,
    //         path: "/pages/index/content/content?id=" + this.data.id
    //     }
    // },

    // 点赞或取消赞
    supportTap: function () {
        if (this.data.disabled) {
            return
        }
        
        var that = this
        this.data.disabled = true
        // 根据my_support提交请求
        this.support(this.data.id, this.data.feedback.my_support ? 0 : 1, function (res) {
            that.data.disabled = false
        })
    },

    // 点击图片放大预览
    imgTap: function () {
        var that = this
        wx.previewImage({
            current: that.data.feedback.img_url,
            urls: [that.data.feedback.img_url]
        })
    },

    // 添加一条评论
    addComment: function (comment, callback) {
        var that = this
        wx.request({
            url: this.data.postUrl,
            method: "POST",
            data: {
                fb_id: this.data.id,
                userid: wx.getStorageSync("userid"),
                comment: comment
            },
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    wx.showToast({
                        title: "评论成功",
                        icon: ""
                    })
                    that.onPullDownRefresh()
                } else {
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
})

// pages/feedback/feedback.js

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
        // 添加反馈问题api
        url: "https://feedback.wentianlin.cn/api.php/feedback/addFeedback",
        // 上传图片api
        uploadUrl: "https://feedback.wentianlin.cn/api.php/feedback/uploadimg",
        // 删除某条反馈
        deleteUrl: "https://feedback.wentianlin.cn/api.php/feedback/deleteFeedback",
        tags: [],
        btn: {
            loading: false,
            disabled: false
        },
        // 是否已经上传图片
        hasUploadImg: false,
        // 上传图片
        uploadImg: "/image/add_pic.png",
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    onShow: function () {
        this.data.userInfo = app.globalData.userInfo
        this.data.hasUserInfo = app.globalData.hasUserInfo
        this.data.hasLogin = app.globalData.hasLogin
        app.getTags(this)

    },

    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
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

    // 点击选择图片
    chooseImgTap: function () {
        var that = this
        wx.chooseImage({
            count: 1,	// 默认为9
            sizeType: ['compress'],	// 指定原图或者压缩图
            sourceType: ['album', 'camera'],	// 指定图片来源
            success: function(res) {
                var tempFilePaths = res.tempFilePaths
                that.setData({
                    uploadImg: tempFilePaths[0],
                    hasUploadImg: true
                })
            }
        })
    },

    // 提交反馈按钮被点击
    submitTap: function (e) {
        if (this.data.btn.disabled) {
            return
        }

        var that = this

        // this.data.disabled = true
        var that = this
        var form = e.detail.value
        var tagsArray = this.data.tags
        // 删除空格
        form.title = util.trim(form.title)
        form.detail = util.trim(form.detail)
        // 填写信息不完整
        if(form.title == "" || form.detail == ""){
            wx.showToast({
                title: "请填写完整信息",
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
        wx.showToast({
            title: "正在提交...",
            icon: "loading",
            mask: true,
            duration: 10000
        })
        var that = this
        wx.request({
            url: that.data.url,
            method: "POST",
            data: data,
            success: function (res) {
                wx.hideToast()
                res = res.data
                if (res.status == 1) {

                    // 不需要上传图片，直接跳转
                    if(!that.data.hasUploadImg){
                        wx.redirectTo({
                            url: "../content/content?id=" + res.id
                        })
                        return
                    }
                    // 上传图片
                    that.upload(res.id)

                }
                // 提交不成功，btn恢复
                else {
                    wx.showToast({
                        title: "提交失败",
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

    // 上传图片请求
    upload: function (fbid, callback) {
        wx.showToast({
            title: "正在上传图片...",
            icon: "loading",
            mask: true,
            duration: 10000
        })
        var that = this
        wx.uploadFile({
            url: that.data.uploadUrl,
            filePath: that.data.uploadImg,
            name: "image",
            formData: {
                "userid": wx.getStorageSync("userid"),
                "fb_id": fbid
            },
            success: function (res) {
                wx.hideToast()
                // 这个接口data返回的是字符串，坑
                res = JSON.parse(res.data)
                if (res.status == 1) {
                    // 跳转到反馈详情
                    wx.redirectTo({
                        url: "../content/content?id=" + fbid
                    })
                    return
                }
                else {
                    // 图像上传失败，通知后台删除该条反馈
                    that.deleteFeedback(fbid)
                    wx.showToast({
                        title: "上传图片失败",
                        icon: "none",
                        duration: 2000
                    })
                    that.setData({
                        btn: {
                            loading: false,
                            disabled: false
                        }
                    })
                }

                // 自定义回调函数
                if (typeof callback == "function") {
                    callback(res)
                }
            }
        })
    },

    // 删除某条反馈请求
    deleteFeedback: function (fbid, callback) {
        var that = this
        wx.request({
            url: that.data.deleteUrl,
            method: "POST",
            data: {
                "userid": wx.getStorageSync("userid"),
                "fb_id": fbid
            },
            success: function(res) {
                res = res.data

                // 自定义回调函数
                if(typeof callback == "function"){
                    callback(res)
                }
            }
        })
    }


})

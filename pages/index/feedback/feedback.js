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
        url: "https://feedback.visionwbz.top/api.php/feedback/addFeedback",
        tags: [],
        btn: {
            loading: false,
            disabled: false
        }
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

    // 提交反馈按钮被点击
    submitTap: function (e) {  
        if (this.data.btn.disabled) {
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
                        app.login(that)
                    }
                    else {
                        return
                    }
                }
            })
            return
        }
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


})
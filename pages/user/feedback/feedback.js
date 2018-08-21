// pages/user/myFeedback/myFeedback.js
// 获取应用实例
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        // 1我提交的反馈，0我支持的反馈
        mode: 1,
        // 绿三角
        greenTri: "/image/green_tri.png",
        // 灰三角
        grayTri: "/image/gray_tri.png",
        // 控制support重复点击
        disabled: false,
        // 获取反馈pai
        getFeedbackUrl: "",
        // 点赞api
        supportUrl: "https://feedback.visionwbz.top/api.php/feedback/support",
        feedbackArray: {},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            mode: options.mode
        })
        if(options.mode == 1){
            this.data.getFeedbackUrl = "https://feedback.visionwbz.top/api.php/feedback/getfeedbackbyuser?id="
        }
        else if(options.mode == 0){
            this.data.getFeedbackUrl = "https://feedback.visionwbz.top/api.php/feedback/getfeedbackbysupport?id="
        }

        this.getFeedback()
    },


    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    // 获取反馈
    getFeedback: function (callback){
        var that = this
        wx.request({
            url: that.data.getFeedbackUrl + wx.getStorageSync("userid"),
            header: {
                'Content-Type': 'application/json'
            },
            success: function(res) {
                res = res.data
                if(res.status == 1){
                    that.setData({
                        feedbackArray: res.data
                    })
                }
                else{
                    wx.showToast({
                        title: res.msg,
                        icon: "none"
                    })
                }
                // 自定义回调函数
                if(typeof callback == "function"){
                    callback(res)
                }
            }
        })
    },

    // 点赞或取消赞请求
    // id: fb_id
    // mode: 1点赞 0取消赞
    support: function (id, mode, callback) {
        var that = this
        // 发送请求
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
                    var array = that.data.feedbackArray
                    // 点赞或取消赞成功，在feedbackArray中找到该feedback，support++/--，my_support=true/false
                    for (var i = 0, len = array.length; i < len; i++) {
                        if (array[i].id == id) {
                            // 点赞
                            if (mode) {
                                array[i].support++
                                array[i].my_support = true
                            }
                            else {
                                array[i].support--
                                array[i].my_support = false
                            }
                            break
                        }
                    }
                    that.setData({
                        feedbackArray: array,
                    })
                    // 根据order对hotArray newArray赋值，并清空另一个array和start
                    if (that.data.order == 1) {
                        that.data.newFeedbackArray = array
                        that.data.hotFeedbackArray = []
                        that.data.hotStart = 0
                    }
                    else {
                        that.data.hotFeedbackArray = array
                        that.data.newFeedbackArray = []
                        that.data.newStart = 0
                    }
                }
                else {
                    wx.showToast({
                        title: res.msg,
                        icon: "none"
                    })
                }
                // 自定义回调函数
                if (typeof callback == "function") {
                    callback(res)
                }
            }
        })
    },

    // 点击赞或取消赞
    supportTap: function (e) {
        if (this.data.disabled) {
            return
        }

        var that = this
        // fb_id
        var data = e.currentTarget.dataset
        // 判断是点赞还是取消赞
        that.data.disabled = true
        this.support(data.id, data.mysupport ? 0 : 1, function (res) {
            that.data.disabled = false
        })

    },

    // 进入某个具体问题
    feedbackTap: function (e) {
        var id = e.currentTarget.id
        wx.navigateTo({
            url: "../../index/content/content?id=" + id
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.getFeedback(function () {
            wx.stopPullDownRefresh()
        })
    },



})

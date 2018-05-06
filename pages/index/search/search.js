// pages/index/search/search.js

const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo: null,
        hasUserInfo: false,
        hasLogin: false,
        // 控制support重复点击
        disabled: false,
        empty: "",
        clearImg: "/image/xx.png",
        searchImg: "/image/search.png",
        // 绿三角
        greenTri: "/image/green_tri.png",
        // 灰三角
        grayTri: "/image/gray_tri.png",
        // 搜索api
        searchUrl: "https://feedback.visionwbz.top/api.php/search/search",
        // 点赞api
        supportUrl: "https://feedback.visionwbz.top/api.php/feedback/support",
        // tags的id、selected、name
        tags: [],
        // feedback展示数组
        feedbackArray: []
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

    // 发送search请求
    search: function (data, callback) {
        var that = this
        wx.request({
            url: that.data.searchUrl,
            header: {
                'Content-Type': 'application/json'
            },
            data: data,
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    that.setData({
                        feedbackArray: res.data
                    })
                }
                else{
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

    /**
     * 用户点击右上角分享
     */
    // onShareAppMessage: function () {
    //     return {
    //         title: '校园问题反馈平台',
    //         path: '/pages/index/index'
    //     }
    // },
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

    // 发起搜索
    searchTap: function (e) {
        // 拼接查询内容
        var tagsArray = this.data.tags
        var input = e.detail.value.split(" ")
        var search = ""
        for (var i = 0, len = input.length; i < len; i++) {
            if (input[i] != "") {
                search = search + input[i] + ","
            }
        }
        // 去掉最后一个逗号
        search = search.substring(0, search.length - 1)
        // 拼接标签选择情况
        var tags = ""
        for (var i = 0, len = tagsArray.length; i < len; i++) {
            if (tagsArray[i].selected) {
                tags = tags + tagsArray[i].id + ","
            }
        }
        // 去掉最后一个逗号
        tags = tags.substring(0, tags.length - 1)
        // 搜索内容不能为空
        if (search == "" && tags == "") {
            wx.showToast({
                title: "搜索内容不能为空",
                icon: "none"
            })
            return
        }
        
        // 发送request查询
        var data = {
            search: search,
            tags: tags,
            userid: wx.getStorageSync("userid")
        }
        this.search(data, function (res) {

        })

    },

    // 清空搜索栏
    clearTap: function (e) {
        this.setData({
            empty: ""
        })
    },

    // 点击赞或取消赞
    supportTap: function (e) {
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
                        app.login(that)
                    }
                    else {
                        return
                    }
                }
            })
            return
        }
        // fb_id
        var data = e.currentTarget.dataset
        // 判断是点赞还是取消赞
        this.data.disabled = true
        this.support(data.id, data.mysupport ? 0 : 1, function (res) {
            that.data.disabled = false
        })

    },

    // 进入某个具体问题
    feedbackTap: function (e) {
        var id = e.currentTarget.id
        wx.navigateTo({
            url: "../content/content?id=" + id
        })
    }


})
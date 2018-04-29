//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        hasLogin: false,
        // 控制support重复点击
        disabled: false,
        // 顶部图标
        addFeedbackImg: "/image/plus.png",
        searchImg: "/image/search.png",
        // 绿三角
        greenTri: "/image/green_tri.png",
        // 灰三角
        grayTri: "/image/gray_tri.png",
        // 底部“加载更多”是否显示，并且控制上滑刷新
        isHideLoadMore: false,
        // 获取反馈列表的api
        getFeedbackUrl: "https://feedback.visionwbz.top/api.php/feedback/getfeedback",
        // 登录api
        loginUrl: "https://feedback.visionwbz.top/api.php/login/login",
        // 点赞api
        supportUrl: "https://feedback.visionwbz.top/api.php/feedback/support",
        // 1为最新，0为最热
        order: 1,
        // 下次请求开始的index
        newStart: 0,
        hotStart: 0,
        // 每次请求的返回长度
        // length: 8,
        // 渲染模板用数组
        feedbackArray: [],
        // “最新”数组
        newFeedbackArray: [],
        // “最热”数组
        hotFeedbackArray: []
    },

    // 封装get请求，回调函数自定义
    getFeedback: function (start, order, callback) {
        var that = this
        wx.request({
            url: this.data.getFeedbackUrl,
            header: {
                'Content-Type': 'application/json'
            },
            method: "GET",
            data: {
                start: start,
                order: order,
                userid: wx.getStorageSync("userid")
            },
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    // 最新
                    if (order) {
                        that.setData({
                            newFeedbackArray: that.data.newFeedbackArray.concat(res.data),
                            feedbackArray: that.data.newFeedbackArray.concat(res.data),
                            newStart: that.data.newStart + res.data.length,
                            isHideLoadMore: res.data.length ? false : true
                        })
                    }
                    // 最热
                    else {
                        that.setData({
                            hotFeedbackArray: that.data.hotFeedbackArray.concat(res.data),
                            feedbackArray: that.data.hotFeedbackArray.concat(res.data),
                            hotStart: that.data.hotStart + res.data.length,
                            isHideLoadMore: res.data.length ? false : true
                        })
                    }
                }
                else {
                    wx.showToast({
                        title: "出错了",
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

    // 登录
    login: function () {
        if (wx.getStorageSync("userid") != "") {
            app.globalData.hasLogin = true
            this.setData({
                hasLogin: true
            })
        }
        var that = this
        wx.getUserInfo({
            success: function (resUser) {
                console.log(resUser)
                app.globalData.userInfo = resUser.userInfo
                app.globalData.hasUserInfo = true
                that.data.userInfo = resUser.userInfo
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
    },

    // 点赞或取消赞请求
    // id: fb_id
    // mode: 1点赞 0取消赞
    support: function (id, mode, callback){
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
                            if(mode){
                                array[i].support++
                                array[i].my_support = true
                            }
                            else{
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
                // 自定义回调函数
                if (typeof callback == "function") {
                    callback(res)
                }
            }
        })
    },

    // 页面加载获取用户信息
    onLoad: function (options) {
        this.data.userInfo = app.globalData.userInfo
        this.data.hasUserInfo = app.globalData.hasUserInfo
        this.data.hasLogin = (wx.getStorageSync("userid") != "")
        // 已登录获取数据
        var order = this.data.order
        var start = order ? this.data.newStart : this.data.hotStart
        this.getFeedback(start, order)
        
        
    },

    // 上滑到底部加载更多
    onReachBottom: function () {
        if (this.data.isHideLoadMore) {
            return
        }
        var that = this
        console.log("加载更多");
        // 判断当前标签
        var order = this.data.order
        var start = order ? this.data.newStart : this.data.hotStart
        this.getFeedback(start, order)
    },

    // 下拉刷新
    onPullDownRefresh: function () {
        console.log("刷新")
        var order = this.data.order
        if (order) {
            // 清空数组、start，显示“加载更多”
            this.setData({
                newStart: 0,
                newFeedbackArray: [],
                feedbackArray: [],
                isHideLoadMore: false
            })
        }
        else {
            this.setData({
                hotStart: 0,
                hotFeedbackArray: [],
                feedbackArray: [],
                isHideLoadMore: false
            })
        }
        // 发送一次与onLoad中一样的请求
        this.getFeedback(0, order, function (res) {
            wx.stopPullDownRefresh()
        })
    },
    
    // 转发
    onShareAppMessage: function () {
        return {
            title: '校园问题反馈',
            path: '/pages/index/index'
        }
    },

    // 搜索按钮响应函数
    searchTap: function (e) {
        wx.navigateTo({
            url: "search/search"
        })
    },

    // 添加反馈按钮响应函数
    addFeedbackTap: function (e) {
        wx.navigateTo({
            url: "feedback/feedback"
        })
    },

    // 点击了“最新”tab
    newTap: function (e) {
        // 只有当前标签不是最新时才做响应
        if (this.data.order == 0) {
            // 改变标签样式，渲染数组赋值，并且显示加载更多
            this.setData({
                order: 1,
                isHideLoadMore: false,
                feedbackArray: this.data.newFeedbackArray
            })
            // 如果newStart为0，需要发送一次请求
            if (this.data.newStart == 0) {
                this.getFeedback(0, 1)
            }
        }
    },

    // 点击了“最热”tap
    hotTap: function (e) {
        // 只有当前标签不是最新时才做响应
        if (this.data.order == 1) {
            // 改变标签样式，渲染数组赋值，并且显示加载更多
            this.setData({
                order: 0,
                isHideLoadMore: false,
                feedbackArray: this.data.hotFeedbackArray
            })
            // 如果hotStart为0，需要发送一次请求
            if (this.data.hotStart == 0) {
                this.getFeedback(0, 0)
            }
        }
    },

    // 点击赞或取消赞
    supportTap: function (e) {
        if(this.data.disabled){
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
        // fb_id
        var data = e.currentTarget.dataset
        // 判断是点赞还是取消赞
        that.data.disabled = true
        this.support(data.id, data.mysupport?0:1, function(res){
            that.data.disabled = false
        })
        
        console.log(data)
        
    },

    // 进入某个具体问题
    feedbackTap: function (e) {
        var id = e.currentTarget.id
        wx.navigateTo({
            url: "content/content?id=" + id
        })
    }

})

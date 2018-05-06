//app.js
App({
    globalData: {
        userInfo: null,
        sspkuInfo: null,
        hasUserInfo: false,
        hasLogin: false,
        uid: null,
        loginUrl: "https://feedback.visionwbz.top/api.php/login/login",
        tagsUrl: "https://feedback.visionwbz.top/api.php/feedback/gettags",
        tags: [],
        tagsDebug: [
            {
                id: 0,
                selected: false,
                name: "宿舍问题"
            },
            {
                id: 1,
                selected: false,
                name: "网络问题"
            },
            {
                id: 2,
                selected: false,
                name: "教学楼问题"
            },
            {
                id: 3,
                selected: false,
                name: "图书馆问题"
            },
            {
                id: 4,
                selected: false,
                name: "食堂问题"
            },
            {
                id: 5,
                selected: false,
                name: "教务问题"
            },
            {
                id: 6,
                selected: false,
                name: "其他问题"
            }
        ]
    },
    onLaunch: function (options) {
        // var that = this
        // wx.setStorageSync("userid", "")
        this.getTags()
    },
    // 公共函数，绑定登录按钮回调

    // 获取问题分类数组
    /*
    [
        {
            id:xx,
            selected:false,
            name:"xx问题"
        },
        {
            id:xx,
            selected:false,
            name:"xx问题"
        }
    ]
    */
    getTags: function (obj) {
        var that = this
        if (this.globalData.tags.length != 0 && obj) {
            obj.setData({
                tags: that.globalData.tags
            })
            return
        }

        wx.request({
            url: that.globalData.tagsUrl,
            success: function (res) {
                res = res.data
                if (res.status == 1) {
                    that.globalData.tags = res.tags
                    if (obj) {
                        obj.setData({
                            tags: res.tags
                        })
                    }
                }
                else {
                    wx.showToast({
                        title: "初始化失败",
                        icon: "none"
                    })
                }
            }
        })
    },


    // 登录
    login: function (obj, callback) {
        var that = this
        // if (that.globalData.uid != null) {
        //     that.globalData.hasLogin = true
        //     obj.data.hasLogin = true
        //     return 
        // }
        wx.getUserInfo({
            success: function (resUser) {
                // console.log(resUser)
                that.globalData.userInfo = resUser.userInfo
                that.globalData.hasUserInfo = true
                obj.data.userInfo = resUser.userInfo
                obj.data.hasUserInfo = true
                // 获取code
                wx.login({
                    success: function (resLogin) {
                        if (resLogin.code) {
                            // 向后台发送code和用户信息以获取自定义登录态userid
                            wx.request({
                                url: that.globalData.loginUrl,
                                header: {
                                    'Content-Type': 'application/json'
                                },
                                data: {
                                    code: resLogin.code,
                                    wx_name: that.globalData.userInfo.nickName,
                                    avatar_url: that.globalData.userInfo.avatarUrl,
                                    uid: that.globalData.uid
                                },
                                success: function (res) {
                                    res = res.data
                                    if (res.status == 1) {
                                        console.log(res)
                                        // 同步存储
                                        wx.setStorageSync("userid", res.userid)
                                        that.globalData.hasLogin = true
                                        that.globalData.sspkuInfo = res.sspkuInfo
                                        obj.data.hasLogin = true
                                        obj.data.sspkuInfo = res.sspkuInfo
                                        wx.showToast({
                                            title: "登录成功",
                                            icon: "success"
                                        })
                                    }
                                    else {
                                        console.log(res.msg)
                                        wx.showToast({
                                            title: "登录失败",
                                            icon: "none"
                                        })
                                    }
                                    // 执行自定义回调函数
                                    if (typeof callback == "function") {
                                        callback(res)
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


})
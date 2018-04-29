//app.js
App({
    globalData: {
        userInfo: null,
        hasUserInfo: false,
        hasLogin: false,
        tags: [
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
    onLaunch: function () {
        var that = this
        // 获取用户信息
        wx.getUserInfo({
            success: function (resUser) {
                // 存储用户信息
                that.globalData.userInfo = resUser.userInfo
                that.globalData.hasUserInfo = true
                // 获取code
                wx.login({
                    success: function (resLogin) {
                        if (resLogin.code) {
                            // 向后台发送code和用户信息以获取自定义登录态userid
                            wx.request({
                                url: "https://feedback.visionwbz.top/api.php/login/login",
                                header: {
                                    'Content-Type': 'application/json'
                                },
                                data: {
                                    code: resLogin.code,
                                    wx_name: resUser.userInfo.nickName,
                                    avatar_url: resUser.userInfo.avatarUrl
                                },
                                success: function (res) {
                                    res = res.data
                                    if (res.status == 1) {
                                        // 同步存储
                                        wx.setStorageSync("userid", res.userid)
                                        that.globalData.hasLogin = true
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
    // 公共函数，绑定登录按钮回调
    

})
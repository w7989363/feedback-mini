//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        hasLogin: false,
        sspkuInfo: {},
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        // login url
        loginUrl: "https://feedback.visionwbz.top/api.php/login/login",
        // 顶部图标
        addFeedbackImg: "/image/plus.png",
        searchImg: "/image/search.png",
        // 我的反馈
        myFeedbackImg: "/image/my_feedback.png",
        // 我支持的
        mySupportImg: "/image/my_support.png",
    },

    onLoad: function () {
        // 判断登录
        if(app.globalData.hasLogin){
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: app.globalData.hasUserInfo,
                hasLogin: app.globalData.hasLogin,
                sspkuInfo: app.globalData.sspkuInfo,
            })
        }
    },

    onShow: function () {
        if(!app.globalData.hasLogin) {
            wx.showToast({
                title: "请先登录",
                icon: "none",
            })
        }
    },

    login: function (res) {
        res = res.detail
        if(!res.userInfo) {
            // 授权用户信息失败
            wx.showToast({
                title: "登录失败",
                icon: "none",
            })
            return
        }
        // 保存用户信息到globalData
        app.globalData.userInfo = res.userInfo
        app.globalData.hasUserInfo = true


        const that = this
        const p = new Promise((resolve, reject) => {
            // 获取login code
            wx.login({
                success: function(resLogin) {
                    // success
                    if(resLogin.code){
                        resolve(resLogin.code)
                    }
                    else{
                        reject(resLogin.errMsg)
                    }
                },
                fail: function() {
                    // fail
                    reject()
                },
            })
        }).then(function(code) {
            // login resolve回调
            // 向后台发送code和userInfo以获取自定义登录态userid
            return new Promise((resolve, reject) => {
                wx.request({
                    url: that.data.loginUrl,
                    header: {
                        'Content-Type': 'application/json'
                    },
                    data: {
                        code: code,
                        wx_name: app.globalData.userInfo.nickName,
                        avatar_url: app.globalData.userInfo.avatarUrl,
                        uid: app.globalData.uid,
                        // uid: wx.getStorageSync('userid'),
                    },
                    success: function (resRequest) {
                        if(resRequest.data.status === '1') {
                            resolve(resRequest.data)
                        } else {
                            reject()
                        }

                    },
                    fail: function(err) {
                        reject(err);
                    }
                })
            })
        }, function(err) {
            // login reject回调
            console.log(err)
            wx.showToast({
                title: "登录失败，请尝试从微信校园卡进入",
                icon: "none",
            })
        }).then(function(data){
            app.globalData.hasLogin = true
            app.globalData.sspkuInfo = data.sspkuInfo
            that.setData({
                userInfo : app.globalData.userInfo,
                hasUserInfo : true,
                sspkuInfo : app.globalData.sspkuInfo,
                hasLogin : true,
            })

        }, function(err) {
            console.log(err)
            // request reject回调
            wx.showToast({
                title: "登录失败，请尝试从微信校园卡进入",
                icon: "none",
            })
        })

    },

    // 下拉刷新
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },

    // 搜索按钮响应函数
    searchTap: function (e) {
        wx.navigateTo({
            url: "../index/search/search"
        })
    },

    // 添加反馈按钮响应函数
    addFeedbackTap: function (e) {
        wx.navigateTo({
            url: "../index/feedback/feedback"
        })
    },

    // 我提交的反馈
    myFeedbackTap: function () {
        wx.navigateTo({
            url: "feedback/feedback?mode=1"
        })
    },

    // 我支持的反馈
    mySupportTap: function () {
        wx.navigateTo({
            url: "feedback/feedback?mode=0"
        })
    },

})

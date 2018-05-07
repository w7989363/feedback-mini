//index.js
//获取应用实例
const app = getApp()

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        hasLogin: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        // 顶部图标
        addFeedbackImg: "/image/plus.png",
        searchImg: "/image/search.png",
    },

    onLoad: function (options) {
        // 调试*******************
        if (options.scene) {
            app.globalData.uid = decodeURIComponent(options.scene)
        }
        else {
            app.globalData.uid = wx.getStorageSync("userid")
        }
        
        // 判断登录
        var that = this
        if(app.globalData.hasLogin){
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: app.globalData.hasUserInfo,
                hasLogin: app.globalData.hasLogin

            })
        }
        else{
            app.login(that, function () {
                that.setData({
                    userInfo: app.globalData.userInfo,
                    hasUserInfo: app.globalData.hasUserInfo,
                    hasLogin: app.globalData.hasLogin,
                })
            })
        }
    },

    onShow: function () {
        
    },

    login: function () {
        var that = this
        app.login(this, function () {
            that.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: app.globalData.hasUserInfo,
                hasLogin: app.globalData.hasLogin,
            })
        })
    },
})

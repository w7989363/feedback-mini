App({
    globalData: {
        userInfo: null,
        sspkuInfo: null,
        hasUserInfo: false,
        hasLogin: false,
        uid: null,
        tagsUrl: "https://feedback.visionwbz.top/api.php/feedback/gettags",
        tags: [],
    },
    onLaunch: function () {
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
        const that = this
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
                        title: "初始化标签失败",
                        icon: "none"
                    })
                }
            }
        })
    },


})

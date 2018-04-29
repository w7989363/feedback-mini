// pages/feedback/feedback.js

Page({

    /**
     * 页面的初始数据
     */
    data: {
        
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '校园问题反馈',
            path: '/pages/index/index'
        }
    },
    confirmTap: function (e) {  
        // wx.navigateBack({
        //     delta: 2
        // })
        wx.switchTab({
            url: "/pages/index/index"
        })
    }
})
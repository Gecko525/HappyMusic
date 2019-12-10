//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    banners: ['/static/images/banner.jpg', '/static/images/banner1.jpg', '/static/images/banner2.jpg'],
    musicInfo: null,
    player: {
      show: false,
      showSmall: true,
      loop: false,
      paused: true,
      name: '',
      author: '',
      lyric: '',
      img: '',
      playIcon: '',
      currentIndex: 0
    },
    audioCtx: null
  },
  onLoad: function () {
    this.getMusicInfo();
    this.data.audioCtx = wx.createInnerAudioContext();
    this.data.audioCtx.onPlay(() => {
      
    });
    this.data.audioCtx.onError((res) => {
      console.log(res.errMsg, res.errCode);
    });
    console.log(this.audioCtx);
  },
  getMusicInfo: function (groupId) {
    groupId = groupId || '8888';
    const musicInfo = require('../../data/musicList/' + groupId + '.json');
    console.log(musicInfo);
    this.setData({
      musicInfo
    });
  },
  startPlayer: function (e, next) {
    if (!this.data.audioCtx.paused) {
      this.data.audioCtx.stop();
    }
    let song,cindex;
    if (e) {
      song = e.currentTarget.dataset.song;
      cindex = e.currentTarget.dataset.index;
    } else {
      if (next) {
        // 下一首
        cindex = this.data.player.currentIndex == (this.data.musicInfo.songs.list.length - 1) ? 0 : (this.data.player.currentIndex + 1);
      } else {
        // 上一首
        cindex = this.data.player.currentIndex == 0 ? (this.data.musicInfo.songs.list.length - 1) : (this.data.player.currentIndex - 1);
      }
      song = this.data.musicInfo.songs.list[cindex];
    }
    console.log(song);
    this.data.audioCtx.autoplay = true;
    this.data.audioCtx.src = song.play_url;
    this.setPlayerStatus({
      show: true,
      img: song.img,
      name: song.song_name,
      author: song.author_name,
      lyric: song.lyrics,
      playIcon: 'url(/static/images/pause_icon.png)',
      currentIndex: cindex,
      paused: false
    });
  },
  setPlayerStatus: function(player) {
    // player.playIcon = 'url(/static/images/' + (this.audioCtx.paused ? 'play' : 'pause') + '_icon.png)';
    this.setData({
      player: {
        ...this.data.player,
        ...player
      }
    });
  },
  playOrPause: function(e) {
    console.log(this.data.audioCtx.paused);
    if (this.data.audioCtx.paused) {
      this.data.audioCtx.play();
    } else {
      this.data.audioCtx.pause();
    }
    console.log(this.data.audioCtx.paused);
    this.setPlayerStatus({
      playIcon: 'url(/static/images/' + (!this.data.audioCtx.paused ? 'play' : 'pause') + '_icon.png)',
      paused: !this.data.audioCtx.paused
    });
  },
  playPre: function(e) {
    this.startPlayer(null, false);
  },
  playNext: function(e) {
    this.startPlayer(null,true);
  },
  showBigPlayer: function() {
    this.setPlayerStatus({
      showSmall: false
    });
  },
  goBack: function() {
    this.setPlayerStatus({
      showSmall: true
    });
  }
})

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
      lyrics: [],
      img: '',
      playIcon: '',
      currentIndex: 0,
      hash: '',
      timer: null,
      timeStart: 0,
      scrollTop: 0,
      lyricIndex: 0
    },
    audioCtx: null
  },
  onLoad: function () {
    this.getMusicInfo();
    this.data.audioCtx = wx.createInnerAudioContext();
    this.data.audioCtx.onPlay(() => {
      console.log('音乐开始播放')
      this.setPlayerStatus({
        playIcon: 'url(/static/images/' + (this.data.audioCtx.paused ? 'play' : 'pause') + '_icon.png)',
        paused: this.data.audioCtx.paused
      });
      this.setLyric()
    });
    this.data.audioCtx.onPause(() => {
      console.log('暂停播放', this.data.audioCtx.paused)
      this.setPlayerStatus({
        playIcon: 'url(/static/images/' + (this.data.audioCtx.paused ? 'play' : 'pause') + '_icon.png)',
        paused: this.data.audioCtx.paused
      });
    })
    this.data.audioCtx.onError((res) => {
      console.log(res.errMsg, res.errCode);
      wx.showToast({
        title: '播放失败，请重试',
        icon: 'none'
      })
    });
    // console.log(this.audioCtx);
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
    clearTimeout(this.data.player.timer)
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
    if (song.hash && song.hash === this.data.player.hash) return
    if (!this.data.audioCtx.paused) {
      this.data.audioCtx.stop();
    }
    console.log('状态', this.data.audioCtx.paused)
    this.data.audioCtx.autoplay = true;
    this.data.audioCtx.src = song.play_url;
    this.setPlayerStatus({
      show: true,
      img: song.img,
      name: song.song_name,
      author: song.author_name,
      lyrics: song.lyrics.split('\r\n').map((p) => {
        const regex = /^\[\S+\]/
        const time = p.match(regex)[0]
        const text = p.replace(regex, '')
        return { time, text, activated: false}
      }),
      playIcon: 'url(/static/images/play_icon.png)',
      currentIndex: cindex,
      hash: song.hash,
      timer: null,
      timeStart: 0,
      scrollTop: 0,
      lyricIndex: 0
    });
  },
  setPlayerStatus: function(player) {
    this.setData({
      player: {
        ...this.data.player,
        ...player
      }
    });
  },
  setLyric: function () {
    const self = this
    let { lyrics, lyricIndex, timeDiff, timeStart, timer } = this.data.player,
        timeStr,
        time = 0,
        scrollTop
    function setActivated() {
      // 设置当前歌词的样式
      if (lyricIndex >= lyrics.length - 1) return
      if (lyricIndex > 0) {
        lyrics[lyricIndex - 1].activated = false
      }
      lyrics[lyricIndex].activated = true
      // 计算滚动高度
      scrollTop = 21 * lyricIndex < 63 ? 0 : 21 * (lyricIndex - 2)
      self.setPlayerStatus({lyrics, scrollTop})
      // 获取定时时间
      timeStr = lyrics[++lyricIndex].time.slice(1, -1).split(':') // [00,00.00]
      time = (parseFloat(timeStr[0]) * 60 + parseFloat(timeStr[1])) - timeStart
      timeStart += time
      self.setPlayerStatus({
        time,
        timeStart,
        lyricIndex
      })
      console.log(lyrics[lyricIndex], time, timeStart)

      timer = setTimeout(() => {
        setActivated()
      }, time * 1000)
      self.setPlayerStatus({timer})
    }
    timer = setTimeout(() => {
      setActivated()
    }, time * 1000)
  },
  playOrPause: function(e) {
    if (this.data.audioCtx.paused) {
      this.data.audioCtx.play()
    } else {
      this.data.audioCtx.pause()
      clearTimeout(this.data.player.timer)
    }
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

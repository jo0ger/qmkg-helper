<template>
  <div id="app">
    <div class="uid-page" v-if="!this.uid">
      <div class="form">
        <input type="text" placeholder="用户ID" v-model.trim="input">
        <span class="submit">
          <button @click="submit"><span>确认</span></button>
        </span>
      </div>
    </div>
    <div class="detail" v-else>
      <div class="user-info" v-if="userInfo">
        <div class="avatar">
          <img :src="userInfo.head_img_url" alt="">
        </div>
        <div class="info">
          <div class="nickname">{{ userInfo.nickname }}</div>
          <div class="levelname">{{ userInfo.levelname }}</div>
        </div>
        <div class="exit">
          <button @click="exit"><span>退出</span></button>
        </div>
      </div>
      <div class="ugc-list">
        <div class="ugc-item" v-for="(ugc, index) in ugcList" :key="index">
          <div class="thumb">
            <img :src="ugc.avatar" alt="">
          </div>
          <div class="info">
            <div class="title">{{ ugc.title }}</div>
            <div class="meta">
              <div class="meta-item play-count">
                <i class="iconfont icon-play"></i>
                <span class="count">{{ ugc.play_count }}</span>
              </div>
              <div class="meta-item comment-count">
                <i class="iconfont icon-comment"></i>
                <span class="count">{{ ugc.coment_count }}</span>
              </div>
              <div class="meta-item gift-count">
                <i class="iconfont icon-gift"></i>
                <span class="count">{{ ugc.gift_count }}</span>
              </div>
            </div>
          </div>
          <button @click="download(ugc)"><span>下载</span></button>
        </div>
        <div class="loadmore" v-if="hasMore">
          <a @click="loadmore">加载更多</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api, { fetcher } from '@/api'

export default {
  name: 'App',
  data () {
    return {
      uidKey: 'qmkg_uid',
      uid: '',
      loading: false,
      userInfo: null,
      ugcList: [],
      hasMore: false,
      total: 0,
      page: 1,
      input: '',
      downloading: false
    }
  },
  watch: {
    uid (val) {
      if (val) {
        this.getUserInfo()
        this.getUgcList()
      } else {
        this.userInfo = null
        this.ugcList = []
        this.hasMore = false
        this.total = 0
        this.page = 1
        this.input = ''
      }
    }
  },
  created () {
    const uid = this.getUid()
    if (uid) {
      this.uid = uid
    }
  },
  methods: {
    setUid (uid = '') {
      window.localStorage && window.localStorage.setItem(this.uidKey, uid)
    },
    clearUid () {
      window.localStorage && window.localStorage.removeItem(this.uidKey)
    },
    getUid () {
      return window.localStorage && window.localStorage.getItem(this.uidKey)
    },
    getUserInfo () {
      api.getUserInfo({
        share_uid: this.uid
      }).then(res => {
        if (!res.code) {
          this.userInfo = res.data
          this.setUid(this.uid)
        }
      })
    },
    getUgcList () {
      api.getPlaylist({
        start: this.page,
        share_uid: this.uid
      }).then(res => {
        if (!res.code) {
          this.total = res.data.ugc_total_count
          this.ugcList = this.ugcList.concat(res.data.ugclist)
          this.hasMore = !!res.data.has_more
        }
      })
    },
    submit () {
      if (!this.input) return
      this.uid = this.input
      this.input = ''
    },
    download (ugc) {
      this.downloading = true
      fetcher.get(`/play?s=${ugc.shareid}&g_f=personal`, {
        baseURL: '/',
        responseType: 'document'
      }).then(res => {
        this.downloading = false
        if (!res) {
          return alert('下载失败')
        }
        const scripts = res.scripts
        for (let i = 0; i < scripts.length; i++) {
          const script = scripts[i]
          let content = script.innerText.trim()
          const prefix = 'window.__DATA__'
          if (content.indexOf(prefix) > -1) {
            content = content.replace(prefix, 'this.data')
            let result = {}
            const func = Function(content)
            func.call(result)
            this.downloadFile(result.data.detail.playurl)
            break
          }
        }
      })
    },
    downloadFile (url) {
      try {
        const elemIF = document.createElement('iframe')
        elemIF.src = url
        elemIF.style.display = 'none'
        document.body.appendChild(elemIF)
      } catch (e) {
        console.error(e)
        alert('下载失败')
      }
    },
    loadmore () {
      if (this.hasMore) {
        this.page++
        this.getUgcList()
      }
    },
    exit () {
      this.uid = ''
      this.clearUid()
    }
  }
}
</script>

<style lang="stylus" scoped>
  @import '~@/assets/stylus/_var'

  button {
    outline none
    cursor pointer
  }

  .uid-page {
    position fixed
    top 0
    right 0
    bottom 0
    left 0
    display flex
    justify-content center
    align-items center
    background $body-bg-color

    .form {
      position relative
      box-shadow 0 1px 10px 0 rgba($base-color, .3)
      input {
        min-width 320px
        height 40px
        padding 6px 72px 6px 12px
        background #e9e9e9
        border none
        outline none
      }

      .submit {
        position absolute
        top 50%
        right 0
        transform translateY(-50%)

        button {
          height 40px
          padding 0 16px
          background-color $base-color
          border-color $base-color
          color $white
        }
      }
    }
  }

  .detail {
    position fixed
    top 0
    right 0
    bottom 0
    left 0
    overflow auto
    .user-info {
      display flex
      justify-content space-between
      align-items  center
      height 150px
      padding 0 36px
      background $base-color
      color $white

      .avatar {
        width 80px
        height @width
        overflow hidden
        border-radius 100%
        border 2px solid $grey

        img {
          width 100%
          height @width
        }
      }

      .info {
        flex 1 0
        margin-left 16px

        .nickname {
          font-size 20px
        }

        .levelname {
          opacity .8
        }
      }

      .exit {
        button {
          padding 6px 12px
          border none
        }
      }

    }

    .ugc-list {

      .ugc-item {
        display flex
        justify-content space-between
        align-items item
        padding 24px 36px
        border-bottom 1px dashed #E6EBF5
        transition all .3s ease

        &:hover {
          background-color #e9e9e9

          .action {
            display block
          }
        }

        .thumb {
          flex 0 0 50px
          width 50px
          height @width
          overflow hidden

          img {
            width 100%
            height @width
          }
        }

        .info {
          flex 1 0
          display flex
          flex-direction column
          justify-content space-between
          margin 0 16px

          .title {
            font-size 18px
          }

          .meta {
            .meta-item {
              display inline-block
              margin-right 12px
              font-size 12px
              opacity .8

              .iconfont {
                font-size 12px
              }
            }
          }
        }

        button {
          height 32px
          padding 6px 12px
          background-color $base-color
          border-color $base-color
          color $white
        }
      }

      .loadmore {
        padding 12px 0
        text-align center
        cursor pointer
      }
    }
  }
</style>

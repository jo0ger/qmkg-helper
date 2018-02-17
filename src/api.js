/**
 * @desc api
 * @author Jooger <iamjooger@gmail.com>
 * @date 17 Feb 2018
 */

'use strict'

import axios from 'axios'

export const fetcher = axios.create({
  url: '/',
  method: 'get',
  baseURL: '/cgi/fcgi-bin',
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
    'Accept': 'application/json'
  },
  timeout: 6000,
  responseType: 'json'
})

fetcher.interceptors.request.use(config => config, err => Promise.reject(err))

fetcher.interceptors.response.use(response => {
  if (!response || !response.data) {
    return Promise.reject(new Error('服务器异常'))
  }
  return response.data
}, err => Promise.reject(err))

export default {
  getUserInfo (params = {}) {
    return fetcher.get('/kg_ugc_get_homepage', {
      params: {
        type: 'get_uinfo',
        _: new Date().getTime(),
        outCharset: 'utf-8',
        format: 'json',
        ...params
      }
    })
  },
  getPlaylist (params = {}) {
    return fetcher.get('/kg_ugc_get_homepage', {
      params: {
        type: 'get_ugc',
        start: 1,
        num: 10,
        _: new Date().getTime(),
        outCharset: 'utf-8',
        format: 'json',
        ...params
      }
    })
  }
}

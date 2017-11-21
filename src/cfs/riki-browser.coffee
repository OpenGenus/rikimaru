###
# riki-browser.coffee
# @author Sidharth Mishra
# @description Adding browser support to rikimaru
# @created Mon Nov 20 2017 20:46:05 GMT-0800 (PST)
# @last-modified Mon Nov 20 2017 20:46:05 GMT-0800 (PST)
###

import { app, BrowserWindow } from 'electron'

export createWindow = (url) ->
  do(win = undefined) ->
    win = new BrowserWindow {width: 800, height: 600}
    win.on 'closed', -> win = null
    if url? then (win.loadURL url) else new Error("No URL was passed to open")

export appInit = ->
  app.on 'activate', -> createWindow() unless win?
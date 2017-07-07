import { Wechaty, Room, Message, MediaMessage } from 'wechaty'
import axios from 'axios'

const download = require('image-downloader')
const Simsimi = require('simsimi')

const simsimi = new Simsimi({
  // key: 'dad3eae1-b2d3-425b-8103-be84b6612a61'
  key: 'c78c58f4-1740-46c2-88a1-176cbe65e91d',
})

const bot = Wechaty.instance()

bot
  .on('scan', (url, code) => {
    let loginUrl = url.replace('qrcode', 'l')
    require('qrcode-terminal').generate(loginUrl)
    console.log(url)
  })
  .on('login', (user) => {
    console.info(`${user} login`)
  })
  .on('friend', async function (contact, request) {
    if (request) {
      await request.accept()
      console.info(`Contact: ${contact.name()} send request ${request.hello}`)
    }
  })
  .on('message', async function (msg: Message) {
    const contact = msg.from()
    const content = msg.content()
    const room = msg.room()

    if (room) {
      console.log(`Room: ${room.topic()} Contact: ${contact.name()} Content: ${msg.type()} type, ${content}`)
      // if (room.topic() === '七大皆' || room.topic() === '鸡疯贱蚝菜dj') {
      if (room.topic() === '七大皆' || room.topic() === '非官方-Nimble秘密基地' || room.topic() === '鸡疯贱壕DJ') {
        console.log(`${room.topic()} Contact: ${contact.name()} Content: ${content}`)

        if (msg.self()) {
          return
        }

        console.info(msg.type())
        const msgType = msg.type().toString()

        if (content.toString().indexOf('view it on mobile') > -1 || msgType === '3') {
          msg.say(`@${contact}, 敢不敢斗图发表情？`)
        }

        if (msgType === '47') {
          const regex = /cdnurl = "(.*?)"/g
          const arr = regex.exec(content)

          await axios.get(`https://image.baidu.com/n/similar?queryImageUrl=${arr && arr[1]}`)
            .then(res => {
              const imageUrl = res.data.data[0].LargeThumbnailImageUrl

              return download.image({
                url: imageUrl,
                dest: './doutu',
              })
            })
            .then(({ filename }) => {
              msg.say(new MediaMessage(`./${filename}`))
            })
            .catch(e => console.error(e))
        }

        if (msgType === '1') {
          await simsimi.listen(content, (err, res) => {
            if (err) return console.error(err)
            console.log('simsimi say:', res)

            if (['羡慕', '嫉妒'].indexOf(content) > -1) {
              room.say(`@${contact}, 滚开!`)
            }

            room.say(`@${contact}, ${res}`)
          })
        }

        // await room.say(`Hey, ${contact}, 你说的是「${content}」, 我就是不回你你咋地？`)
      }
    } else {
      console.log(`Contact: ${contact.name()} Content: ${content}`)
    }

    if (msg.self()) {
      return
    }

    if (contact.name() === 'LallalaoO') {
      if (/hello/.test(content)) {
        msg.say('hello!')
      }
      if (/爱你/.test(content)) {
        msg.say('Love you!')
      }
      if (/.*/.test(content)) {
        simsimi.listen(content, (err, res) => {
          if (err) return console.error(err)
          console.log('simsimi say:', res)
          msg.say(`@${contact}, ${res}`)
        })
      }
    }

    if (/room/.test(content)) {
      let keyroom = await Room.find({ topic: 'test' })
      if (keyroom) {
        await keyroom.add(contact)
        await keyroom.say('welcome!', contact)
      }
    }
    if (/out/.test(content)) {
      let keyroom = await Room.find({ topic: 'test' })
      if (keyroom) {
        await keyroom.say('remove!', contact)
        await keyroom.del(contact)
      }
    }
  })
  .init()
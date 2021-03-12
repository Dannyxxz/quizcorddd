const Discord = require('discord.js')
const client = new Discord.Client()

const path = require('path')
const fs = require('fs')
const config = require('./config.json')
const command = require('./command')
const privateMessage = require('./private-message')
const mongo = require('./mongo')

client.on('ready', async () => {
  console.log('The client is ready!')

  privateMessage(client, 'ping', 'Pong!')

  await mongo().then((mongoose) => {
    try {
      console.log('Connected to mongo!')
    } finally {
      mongoose.connection.close()
    }
  })

  command(client, ['ping', 'Ping'], (message) => {
    message.channel.send('Pong!')
  })

  command(client, 'servers', (message) => {
    client.guilds.cache.forEach((guild) => {
      message.channel.send(
        `${guild.name} has a total of ${guild.memberCount} members`
      )
    })
  })

  command(client, 'status', (message) => {
    const content = message.content.replace('!status ', '')
    // "!status hello world" -> "hello world"
    // const Discord = require("discord.js")

    client.user.setPresence({
      activity: {
        name: content,
        type: 0,
      },
    })
  })

  const baseFile = 'command-base.js'
  const commandBase = require(`./commands/${baseFile}`)

  const readCommands = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir))
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file))
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file))
      } else if (file !== baseFile) {
        const option = require(path.join(__dirname, dir, file))
        commandBase(client, option)
      }
    }
  }

  readCommands('commands')
})

client.login(config.token)
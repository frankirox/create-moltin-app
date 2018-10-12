#!/usr/bin/env node

const meow = require('meow')
const chalk = require('chalk')
const prompts = require('prompts')
const download = require('download-github-repo')
const ora = require('ora')
const fs = require('fs')
const path = require('path')

// Make this a call in the future to github/moltin-boilerplates or something...
const choices = require('./boilerplates')

async function main() {
  const cli = meow(`Usage: npm init moltin-app my-store-name`)

  let [directory] = cli.input

  prompts.inject({ directory })

  const { repo, ...other } = await prompts([
    {
      type: 'select',
      name: 'repo',
      message: 'Select a boilerplate',
      choices
    },
    {
      type: 'text',
      name: 'directory',
      message: 'What should we call this app?',
      initial: (_, values) => values.repo.split('/')[1]
    }
  ])

  if (!repo) {
    console.log(chalk.red('You need to select a boilerplate to clone'))
    process.exit(1)
  }

  if (other.directory) {
    directory = other.directory
  }

  const destination = path.join(process.cwd(), directory)
  const dirExists = await fs.existsSync(destination)

  if (dirExists) {
    console.log(
      chalk.red(
        `The directory ${destination} already exists. Please choose another name for your project.`
      )
    )
    return
  }

  const spinner = ora(
    `Downloading ${chalk.magenta(repo)} to ${chalk.dim(directory)}`
  ).start()

  try {
    await new Promise((resolve, reject) => {
      download(repo, destination, err => {
        if (err) return reject(err)

        spinner.succeed(
          `Successfully downloaded to ${chalk.magenta(destination)}`
        )

        return resolve
      })
    })
  } catch (err) {
    spinner.fail(chalk.red('Unable to clone boilerplate'))
  }
}

main().catch(err => console.log(err))

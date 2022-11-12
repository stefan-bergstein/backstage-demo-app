#!/usr/bin/env node
/* eslint-disable import/no-extraneous-dependencies */
const path = require('path');
const fs = require('fs-extra');
const fetch = require('node-fetch')

async function getBackstageVersion() {
  const rootPath = path.resolve(__dirname, '../backstage.json');
  return fs.readJson(rootPath).then(_ => _.version);
}

async function getLatestRelease() {
  const response = await fetch('https://api.github.com/repos/backstage/backstage/releases/latest')
  const json = await response.json();
  return json
}

async function getLatestPreRelease() {
  const response = await fetch('https://api.github.com/repos/backstage/backstage/releases')
  const json = await response.json();

  const preReleasesOnly = json.filter(release => {
    return release.prerelease === true
  })
  
  const latestPreRelease = preReleasesOnly.sort((a,b) => {return new Date(b.published_at) - new Date(a.published_at)})[0];

  return latestPreRelease
}

async function main() {
  
  // Get the current Backstage version from the backstage.json file
  const backstageVersion = await getBackstageVersion()
  // Get the latest Backstage Release from the GitHub API
  const latestRelease = await getLatestRelease()
  // Get the latest Backstage Pre-release from the GitHub API
  const latestPreRelease = await getLatestPreRelease()

  console.log(`Current Backstage version is: v${backstageVersion}`)
  console.log(`Latest Release version is: ${latestRelease.name}, published on: ${latestRelease.published_at}`)
  console.log(`Latest Pre-release version is: ${latestPreRelease.name}, published on: ${latestPreRelease.published_at}`)
  console.log()

  if (Date(latestRelease.published_at) > Date(latestPreRelease.published_at)){
    console.log(`Latest Release is newer than latest Pre-release, using Latest Release name ${latestRelease.name}`)
    console.log()
    // TODO: Update this with whatever the solution is in: https://github.com/backstage/backstage/pull/14376
    console.log(`::set-output name=release_version::${latestRelease.name.substring(1)}`)
  }
  else {
    console.log(`Latest Release is older than latest Pre-release, using Latest Pre-release name ${latestPreRelease.name}`)
    console.log()
    // TODO: Update this with whatever the solution is in: https://github.com/backstage/backstage/pull/14376
    console.log(`::set-output name=release_version::${latestPreRelease.name.substring(1)}`)
  }
}

main().catch(error => {
  console.error(error.stack);
  process.exit(1);
});
